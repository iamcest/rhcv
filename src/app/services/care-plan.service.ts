import { Injectable } from '@angular/core';
import { FhirService, IFhirResponse } from './fhir.service';
import { cloneDeep } from 'lodash';
import { Observable, throwError, zip, of } from 'rxjs';
import { v4 as uuid } from 'uuid';
import * as moment from 'moment';
import { PractitionerService } from './practitioner.service';
import { mergeMap, map, shareReplay } from 'rxjs/operators';
import { flatten, compact } from 'lodash';
import { CarePlanUtils, IPatientAdherenceRow, ITaskEnableWhenExtension, ANSWER_CHOICE } from './care-plan-utils';
import { ServicesModule } from './services.module';
import * as Sentry from '@sentry/browser';

export interface IQuestionnairesWithAnswers {
  questionnaires: fhir.Questionnaire[];
  responses: { [key: string]: fhir.QuestionnaireResponse[] };
}

@Injectable({
  providedIn: ServicesModule
})
export class CarePlanService {

  goalsByCarePlan: {
    [key: string]: Observable<IPatientAdherenceRow[]>;
  } = {};


  constructor(private fhirService: FhirService,
    private practitionerService: PractitionerService
  ) { }

  public async create(basedOn: { fullUrl: string, resource: fhir.CarePlan }, patientRef: string, organisationRef: string): Promise<fhir.BundleEntry[]> {
    const clonedPlan = cloneDeep(basedOn.resource);
    delete clonedPlan.meta;

    const eocUUID = uuid();

    clonedPlan.status = 'draft';
    clonedPlan.intent = 'plan';
    clonedPlan.basedOn = [{ reference: basedOn.fullUrl }];
    clonedPlan.subject = { reference: patientRef };
    clonedPlan.context = { reference: `urn:uuid:${eocUUID}` };
    clonedPlan.identifier = [{
      system: 'urn:uuid',
      value: uuid()
    }];
    delete clonedPlan.id;

    // rewrite the plan's references to absolute URLs
    (clonedPlan.replaces || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    (clonedPlan.partOf || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    (clonedPlan.author || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    (clonedPlan.careTeam || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    (clonedPlan.addresses || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    (clonedPlan.supportingInfo || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    (clonedPlan.goal || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
    clonedPlan.activity.forEach(activity => {
      activity.reference = activity.reference ? { reference: this.fhirService.referenceToAbsoluteUrl(activity.reference, basedOn.resource) } : activity.reference;
      (activity.outcomeReference || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
      if (activity.detail) {
        activity.detail.definition = activity.detail.definition ? { reference: this.fhirService.referenceToAbsoluteUrl(activity.detail.definition, basedOn.resource) } : activity.detail.definition;
        activity.detail.location = activity.detail.location ? { reference: this.fhirService.referenceToAbsoluteUrl(activity.detail.location, basedOn.resource) } : activity.detail.location;
        activity.detail.productReference = activity.detail.productReference ? { reference: this.fhirService.referenceToAbsoluteUrl(activity.detail.productReference, basedOn.resource) } : activity.detail.productReference;
        (activity.detail.reasonReference || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
        (activity.detail.goal || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));
        (activity.detail.performer || []).forEach(or => or.reference = this.fhirService.referenceToAbsoluteUrl(or, basedOn.resource));

      }
    });

    const clonedGoals = await this.createGoals(clonedPlan);

    return [
      ...clonedGoals,
      {
        request: {
          method: 'POST',
          url: `urn:uuid:${uuid()}`
        },
        resource: {
          resourceType: 'Encounter',
          subject: {
            reference: patientRef
          },
          episodeOfCare: [
            {
              reference: `urn:uuid:${eocUUID}`
            }
          ]
        }
      },
      {
        request: {
          method: 'POST',
          url: `urn:uuid:${eocUUID}`
        },
        resource: {
          resourceType: 'EpisodeOfCare',
          patient: {
            reference: patientRef
          },
          managingOrganization: {
            reference: organisationRef
          }
        }
      },
      {
        request: {
          method: 'POST',
          url: `urn:uuid:${uuid()}`
        },
        resource: clonedPlan
      }
    ];
  }

  public async createGoals(carePlan: fhir.CarePlan): Promise<fhir.BundleEntry[]> {

    const contexts: any[] = [{ target: carePlan, goals: carePlan.goal }];
    (carePlan.activity || []).forEach(activity => {
      contexts.push({
        target: activity.detail,
        goals: activity.detail.goal
      });
    });

    const promises = contexts.map(context => {
      const planGoals$ = zip(...(context.goals || []).map(goalRef => this.fhirService.reference<fhir.Goal>(goalRef, carePlan)));
      context.target.goal = [];
      return planGoals$.pipe(
        map(basedOnGoals => {
          return basedOnGoals.map(goal => {
            const clonedGoal = cloneDeep(goal) as fhir.Goal;
            delete clonedGoal.id;
            delete clonedGoal.meta;
            clonedGoal.subject = carePlan.subject;
            clonedGoal.status = 'proposed';
            clonedGoal.statusDate = moment().format();
            const id = uuid();
            const url = `urn:uuid:${id}`;
            clonedGoal.identifier = (clonedGoal.identifier || []).filter(x => x.system !== 'urn:uuid');
            clonedGoal.identifier.push({
              system: 'urn:uuid',
              value: id
            });
            context.target.goal.push({
              reference: url
            });
            return {
              request: {
                method: 'POST',
                url: url
              },
              resource: clonedGoal
            };
          });
        })
      ).toPromise();
    });
    const goalResourcesArray = await Promise.all(promises);
    return compact(flatten(goalResourcesArray));
  }

  public conditions(): Observable<fhir.QuestionnaireItemOption[]> {
    // tslint:disable-next-line: no-console
    console.debug('Getting conditions');
    return this.practitionerService.groupCarePlans()
      .pipe(
        mergeMap(plans => {
          if (plans.total > 0) {
            const ia = plans.entry.reduce((assesments, planResource) => {
              const x = planResource.resource.activity.filter(act => CarePlanUtils.isInitialAssessment(act));
              if (x && x.length > 0) {
                assesments.push(...x);
              }
              return assesments;
            }, []);
            return zip(...ia.filter(a => a.detail.definition).map(activity => this.fhirService.reference<fhir.Questionnaire>(activity.detail.definition, plans.entry[0].resource)));
          } else {
            return [];
          }
        }),
        map(questionnaires => {
          let conditionCodes = [];
          questionnaires.some(q => {
            const currentProcQ = this.findQuestion(q, question =>
              FhirService.hasCoding({ coding: question.code } as fhir.CodeableConcept, CarePlanUtils.CURRENT_PROCEDURE_CODES));
            if (currentProcQ != null) {
              conditionCodes = currentProcQ.option;
              return true;
            }
            return false;
          });
          return conditionCodes;
        })
      );
  }

  public async activate(carePlan: fhir.CarePlan): Promise<fhir.Bundle> {
    carePlan.status = 'active';

    const initialAssessments = (carePlan.activity || []).filter(activity => CarePlanUtils.isInitialAssessment(activity));
    const iaAppoinments = await zip(...initialAssessments.map(ia => this.fhirService.reference<fhir.Appointment>(ia.reference, carePlan))).toPromise();
    (iaAppoinments || []).forEach(app => {
      if (app) { app.status = 'fulfilled'; }
    });
    const patient = await this.fhirService.reference(carePlan.subject, carePlan).toPromise() as fhir.Patient;
    const episodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare>(carePlan.context, carePlan).toPromise();

    const questionAnswers = await this.findQuestionsAndAnswers(initialAssessments, patient, carePlan.context);
    const currentProcedureAnswer: fhir.QuestionnaireResponseItem = this.searchQuestionAnswers(questionAnswers, (question) => FhirService.hasCoding({ coding: question.code } as fhir.CodeableConcept, CarePlanUtils.CURRENT_PROCEDURE_CODES));

    const conditions: { [key: string]: fhir.Condition } = {};
    if (currentProcedureAnswer && currentProcedureAnswer.answer) {
      carePlan.addresses = [];
      currentProcedureAnswer.answer.forEach(a => {
        const urn = `urn:uuid:${uuid()}`;
        conditions[urn] = {
          resourceType: 'Condition',
          subject: carePlan.subject,
          context: carePlan.context,
          code: {
            coding: [a.valueCoding]
          }
        };
        carePlan.addresses.push({
          reference: urn
        });
      });
    }

    /* We want diabetes as a patient condition, but don't want to include it as "addresses" to the current
      plan, because we're not going to treat diabetes within this careplan */
    const diabetesAnswer: fhir.QuestionnaireResponseItem = this.searchQuestionAnswers(questionAnswers, q => q.linkId === 'diabetes');
    if (diabetesAnswer && diabetesAnswer.answer) {
      diabetesAnswer.answer.forEach(a => {
        // If this answer is anything but "Not diabetic"
        if (a.valueCoding.code !== CarePlanUtils.DIABETES_CODES.NONE.code) {
          const urn = `urn:uuid:${uuid()}`;
          conditions[urn] = {
            resourceType: 'Condition',
            subject: carePlan.subject,
            context: carePlan.context,
            code: {
              coding: [a.valueCoding]
            }
          };
        }
      });
    }

    const activatedGoals = await this.activateGoals(carePlan);

    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        ...activatedGoals,
        ...(iaAppoinments || []).map(iap => {
          return {
            request: {
              method: 'PUT',
              url: `Appointment/${iap.id}`
            },
            resource: iap
          };
        }),
        ...Object.keys(conditions).map(conditionKey => {
          return {
            request: {
              method: 'POST',
              url: conditionKey
            },
            resource: conditions[conditionKey]
          };
        }),
        {
          request: {
            method: 'PUT',
            url: `CarePlan/${carePlan.id}`
          },
          resource: carePlan
        }
      ] as fhir.BundleEntry[]
    };

    // tslint:disable-next-line: no-console
    console.debug('activating');
    // tslint:disable-next-line: no-console
    console.debug(bundle);
    return this.fhirService.save<fhir.Bundle>(bundle).toPromise();
  }

  public async cancelProgram(carePlan: fhir.CarePlan, patient: fhir.Patient) {
    // deactivate care plan
    carePlan.status = 'entered-in-error';

    // deactivate plan activities
    carePlan.activity = carePlan.activity.map(activity => {
      activity.detail.status = 'cancelled';
      return activity;
    });

    // deactivate episode of care
    const episodeOfCare: fhir.EpisodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare>(carePlan.context, carePlan).toPromise();
    episodeOfCare.status = 'cancelled';

    const goals = ((await this.planGoals(carePlan, true).toPromise()) || []).map(ad => ad.goal);

    if (goals) {
      goals.map(goal => {
        goal.status = 'entered-in-error';
        return goal;
      });
    }

    // deactivate appointments
    const appointments: fhir.Appointment[] = ((await zip(...(carePlan.activity || [])
      .map(activity => activity.reference ? this.fhirService.reference<fhir.Appointment>(activity.reference, carePlan) : void 0
      ).filter(appt => !!appt)).toPromise()) || [])
      .map(appt => {
        appt.status = 'entered-in-error';
        return appt;
      });

    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        ...appointments.map(appt => {
          return {
            request: {
              method: 'PUT',
              url: `Appointment/${appt.id}`
            },
            resource: appt
          };
        }),
        ...goals.map(goal => {
          return {
            request: {
              method: 'PUT',
              url: `Goal/${goal.id}`
            },
            resource: goal
          };
        }),
        {
          request: {
            method: 'PUT',
            url: `CarePlan/${carePlan.id}`
          },
          resource: carePlan
        },
        {
          request: {
            method: 'PUT',
            url: `Patient/${patient.id}`
          },
          resource: patient
        },
        {
          request: {
            method: 'PUT',
            url: `EpisodeOfCare/${episodeOfCare.id}`
          },
          resource: episodeOfCare
        }
      ] as fhir.BundleEntry[]
    };

    return this.fhirService.save<fhir.Bundle>(bundle).toPromise();
  }

  public async discharge(carePlan: fhir.CarePlan, patient: fhir.Patient, isSatisfactory: boolean) {
    const SATISFACTORY = 'satisfactory';
    const NOT_SATISFACTORY = 'notSatisfactory';

    const key = isSatisfactory ? 'satisfactory' : 'notSatisfactory';

    const DISCHARGE_STATUSES = {
      carePlan: {
        satisfactory: 'completed',
        notSatisfactory: 'cancelled'
      },
      appointment: {
        satisfactory: 'fulfilled',
        notSatisfactory: 'cancelled'
      },
      activity: {
        satisfactory: 'completed',
        notSatisfactory: 'cancelled'
      },
      goal: {
        accepted: 'accepted',
        proposed: 'proposed',
        cancelled: 'cancelled'
      },
      episode: {
        satisfactory: 'finished',
        notSatisfactory: 'finished'
      },
      encounter: {
        satisfactory: 'finished',
        notSatisfactory: 'finished'
      }
    };

    // finalise care plan and set the end date to the current date
    carePlan.status = DISCHARGE_STATUSES.carePlan[key] as any;
    carePlan.period.end = moment().format();

    // finalise plan activities
    carePlan.activity = carePlan.activity.map(activity => {
      if (activity.detail.status !== DISCHARGE_STATUSES.activity[SATISFACTORY]) {
        activity.detail.status = DISCHARGE_STATUSES.activity[NOT_SATISFACTORY] as any;
      }
      return activity;
    });

    // finalise episode of care
    const episodeOfCare: fhir.EpisodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare>(carePlan.context, carePlan).toPromise();
    episodeOfCare.status = DISCHARGE_STATUSES.episode[key] as any;

    // get all goals from care plan activities and flatten them
    const activityGoals = flatten((carePlan.activity || [])
      .map(activity => activity && activity.detail && activity.detail.goal))
      .filter(item => !!item);

    // finalise goals
    const allGoals: IPatientAdherenceRow[] = await this.planGoals(carePlan, true).toPromise();
    const todayDate = moment().format();
    const goals = (allGoals || []).map(ad => {
      if (ad.goal.status === DISCHARGE_STATUSES.goal.accepted || ad.goal.status === DISCHARGE_STATUSES.goal.proposed) {
        ad.goal.status = 'cancelled';
        ad.goal.statusDate = todayDate;
      }
      return ad.goal;
    });

    // finalise appointments
    const appointmentReferences = (carePlan.activity || []).map(activity => activity.reference).filter(ref => !!ref);
    const appointmentsBundle = await this.fhirService.resolveReferences(appointmentReferences, carePlan).toPromise();
    const appointments = (appointmentsBundle && appointmentsBundle.entry ? appointmentsBundle.entry.map(r => r.resource as fhir.Appointment) : [])
    .map(appt => {
      if (appt.status !== DISCHARGE_STATUSES.appointment[SATISFACTORY]) {
        appt.status = 'cancelled';
      }
      return appt;
    });

    const bundle1: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        ...appointments.map(appt => {
          return {
            request: {
              method: 'PUT',
              url: `Appointment/${appt.id}`
            },
            resource: appt
          } as fhir.BundleEntry;
        }),
        {
          request: {
            method: 'PUT',
            url: `CarePlan/${carePlan.id}`
          },
          resource: carePlan
        },
        {
          request: {
            method: 'PUT',
            url: `Patient/${patient.id}`
          },
          resource: patient
        },
        {
          request: {
            method: 'PUT',
            url: `EpisodeOfCare/${episodeOfCare.id}`
          },
          resource: episodeOfCare
        }
      ]
    };

    const goalsEntries = goals.map(goal => ({
      request: {
        method: 'PUT',
        url: `Goal/${goal.id}`
      },
      resource: goal
    })
    );

    const chunks = [];
    for (let i = 0, len = goalsEntries.length; i < len; i += 100) {
      chunks.push(goalsEntries.slice(i, i + 100));
    }

    const goalBundles: fhir.Bundle[] = chunks.map(chunk => ({
      resourceType: 'Bundle',
      type: 'transaction',
      entry: chunk as fhir.BundleEntry[]
    })
    );


    await this.fhirService.save<fhir.Bundle>(bundle1).toPromise();

    for (const bundle of goalBundles) {
      await this.fhirService.save<fhir.Bundle>(bundle).toPromise();
    }
  }

  private expandGoal(row: IPatientAdherenceRow, carePlan: fhir.CarePlan, recurringExtension: fhir.Extension): fhir.BundleEntry[] {
    const activatedGoals: fhir.BundleEntry[] = [];

    const recurrence = FhirService.flattenExtension<{ timing: string }>(recurringExtension);
    const matchedTiming = (recurrence.timing || '').match(/R(\d*)\/(?:(.+)\/)?(P.+)/);
    if (matchedTiming) {
      const [, repeat, startAt, period]: string[] = matchedTiming;

      let nextStart, endMoment;
      if (row.activity === undefined) {
        nextStart = moment(carePlan.period.start).startOf('day');
        endMoment = moment(carePlan.period.end).endOf('day');
      } else {
        const activity = carePlan.activity[row.activity];
        nextStart = moment(activity.detail.scheduledPeriod.start).startOf('day');
        endMoment = moment(activity.detail.scheduledPeriod.end).endOf('day');
      }
      if (startAt) {
        if (startAt.startsWith('P')) {
          const delay = moment.duration(startAt);
          // tslint:disable-next-line: no-console
          console.debug(`startAt: ${delay.humanize()}`);
          nextStart.add(delay);
        }
      } else { // start all un-timed tasks at midday
        nextStart.add(moment.duration('PT12H'));
      }

      /* We need to make sure all edge cases are covered so that the user
         doesn't end up with pending tasks in the past
         If the careplan/activity hasn't started yet it's safe to expand
         If the careplan/activity has started some time ago and still in progress,
         we'll only expand from today until the end date
         If it's past the end date of the careplan/activity, we will not expand */

      let currentGoal;

      const today = moment().startOf('day');

      const periodDuration = moment.duration(period);
      // tslint:disable-next-line: no-console
      console.debug(`Every: ${periodDuration.humanize()}`);

      // set the static data for the cloned goal
      row.goal.target = row.goal.target || {};
      row.goal.status = 'accepted';
      row.goal.statusDate = moment().format();

      // Only set goal due dates for active careplans with locked in dates
      if (carePlan.status === 'draft') {
        // For draft careplans we want to remove goal due dates
        delete row.goal.target.dueDate;
      }

      if (carePlan.status === 'active') {
        const maxRepeat = repeat === '' ? 366 : repeat; // nobody should need more than 256 repeats
        let i = 1;
        while (nextStart.isBefore(endMoment) && i++ < maxRepeat) {
          if (nextStart.isSameOrAfter(today)) { // make sure we don't add goals before today
            if (currentGoal) {
              currentGoal = cloneDeep(row.goal);
              delete currentGoal.id;
              delete currentGoal.meta;
              const id = uuid();
              const ref = `urn:uuid:${id}`;
              currentGoal.identifier = (currentGoal.identifier || []).filter(x => x.system !== 'urn:uuid');
              currentGoal.identifier.push({
                system: 'urn:uuid',
                value: id
              });

              activatedGoals.push({
                request: {
                  method: 'POST',
                  url: ref
                },
                resource: currentGoal
              });

              carePlan.goal = carePlan.goal || [];

              if (row.activity !== undefined) {
                const activity = carePlan.activity[row.activity];
                activity.detail.goal = activity.detail.goal || [];
                activity.detail.goal.push({
                  reference: ref
                });
              } else {
                carePlan.goal.push({
                  reference: ref
                });
              }
            } else { // the first goal is the source
              currentGoal = row.goal;
            }

            currentGoal.startDate = nextStart.format();
            currentGoal.target = currentGoal.target || {};
            currentGoal.target.dueDate = nextStart.format();
          }
          nextStart.add(periodDuration);
        }
      }

      activatedGoals.push({
        request: {
          method: 'PUT',
          url: `Goal/${row.goal.id}`
        },
        resource: row.goal
      });

    } else {
      console.error(`Bad reccuring timing format: ${recurrence.timing}`);
      Sentry.captureMessage(`A goal with an invalid timing was found: ${recurrence.timing}`, Sentry.Severity.Error);

    }

    return activatedGoals;
  }

  private async activateGoals(carePlan: fhir.CarePlan): Promise<fhir.BundleEntry[]> {
    const proposedGoals = await this.planGoals(carePlan).toPromise();
    const activatedGoals: fhir.BundleEntry[] = [];
    (proposedGoals || []).forEach(row => {
      const recurringExtension = (row.goal.extension || []).find(ext => ext.url === FhirService.EXTENSIONS.RECURRING_TASK);
      if (['cancelled', 'entered-in-error', 'rejected', 'achieved'].indexOf(row.goal.status) === -1) { // should be accepted
        // tslint:disable-next-line: no-console
        console.debug(`activating goal: ${(row.goal.description || {}).text}`);
        if (recurringExtension) {
          activatedGoals.push(...this.expandGoal(row, carePlan, recurringExtension));
        } else {
          row.goal.status = 'accepted';
          row.goal.statusDate = moment().format();
          // set the timing
          if (row.activity === undefined) {
            row.goal.startDate = carePlan.period.start;
            row.goal.target = row.goal.target || {};
            row.goal.target.dueDate = carePlan.period.end;
          } else {
            const activity = carePlan.activity[row.activity];
            row.goal.startDate = activity.detail.scheduledPeriod.start;
            row.goal.target = row.goal.target || {};
            row.goal.target.dueDate = activity.detail.scheduledPeriod.end;
          }
          activatedGoals.push({
            request: {
              method: 'PUT',
              url: `Goal/${row.goal.id}`
            },
            resource: row.goal
          });
        }
      }
    });
    return activatedGoals;
  }

  public patientQuestionnaireResponses(patientId: string, questionnaire: fhir.Questionnaire | string, context: fhir.Reference): Observable<IFhirResponse<fhir.QuestionnaireResponse>> {
    return this.fhirService.search<fhir.QuestionnaireResponse>(`QuestionnaireResponse`, {
      patient: patientId,
      context: context.reference,
      _lastUpdated: `lt${moment().add(1, 'minute').format()}`,
      questionnaire: (typeof questionnaire === 'string') ? questionnaire : `${this.fhirService.getContextBaseUrl(questionnaire)}/Questionnaire/${questionnaire.id}`
    });
  }

  public answers(activity: fhir.CarePlanActivity, patient: fhir.Patient, context: fhir.Reference): Observable<IFhirResponse<fhir.QuestionnaireResponse>> {
    if (!activity.detail.definition) {
      return throwError(new Error('No activity'));
    }

    const questionnairreReferenceRegex = /^(?:#|https?:\/\/.*\/)?Questionnaire\/(.*)/;
    const questionnairreMatch = activity.detail.definition.reference.match(questionnairreReferenceRegex);

    if (questionnairreMatch == null) {
      return throwError(new Error('Not a questionnaire'));
    }

    return this.patientQuestionnaireResponses(patient.id, activity.detail.definition.reference, context);
  }

  async findQuestionsAndAnswers(activities: fhir.CarePlanActivity[], patient: fhir.Patient, context: fhir.Reference): Promise<IQuestionnairesWithAnswers> {
    const questionnaires: fhir.Questionnaire[] = [];
    const responses: { [key: string]: fhir.QuestionnaireResponse[] } = {};

    const questionnaireRefs = [];
    const responsePromises: Promise<fhir.QuestionnaireResponse[]>[] = [];

    (activities || []).forEach(activity => {
      const responseContext = activity.outcomeReference && activity.outcomeReference.length > 0 ? activity.outcomeReference[0] : context;
      if (activity.detail && activity.detail.definition) {
        questionnaireRefs.push(this.fhirService.reference(activity.detail.definition, patient).toPromise());
        responsePromises.push(
          this.patientQuestionnaireResponses(patient.id, activity.detail.definition.reference, responseContext).pipe(
            map(answerResponse => (answerResponse.entry || []).map(answerEntry => answerEntry.resource))
          ).toPromise()
        );
      }
    });

    if (questionnaireRefs.length > 0) {
      const resolvedReferences = await Promise.all(questionnaireRefs);
      (resolvedReferences || []).forEach(q => questionnaires.push(q));
    }


    const answers = await Promise.all(responsePromises);
    answers.forEach(answerArr => {
      answerArr.forEach(questionnaireResponse => {
        const questionnaireRef = this.fhirService.referenceToAbsoluteUrl(questionnaireResponse.questionnaire, questionnaireResponse);
        responses[questionnaireRef] = responses[questionnaireRef] || [];
        responses[questionnaireRef].push(questionnaireResponse);
      });
    });
    // tslint:disable-next-line: no-console
    console.debug('Finished processing answers');

    return {
      questionnaires: questionnaires,
      responses: responses
    };
  }

  public searchQuestionAnswers(questionsAndAnswers: IQuestionnairesWithAnswers, matchFn: (question: fhir.QuestionnaireItem) => boolean): fhir.QuestionnaireResponseItem {
    const recurseFindQuestionnaire = (questions, answers): fhir.QuestionnaireResponseItem => {
      let matchedAnswer = null;
      const matched: fhir.QuestionnaireItem = (questions || []).find(item => {
        if (answers && answers.item) {
          const answerItem = answers.item.find(a => a.linkId === item.linkId);
          if (item.type !== 'group') {
            if (matchFn(item)) {
              matchedAnswer = answerItem;
              return true;
            }
          } else {
            matchedAnswer = recurseFindQuestionnaire(item.item, answerItem);
            return matchedAnswer != null;
          }
        }
      });
      return matched ? matchedAnswer : null;
    };

    let answer: fhir.QuestionnaireResponseItem = null;
    (questionsAndAnswers.questionnaires || []).some(questionnaire => {
      const ref = `${this.fhirService.getContextBaseUrl(questionnaire)}/Questionnaire/${questionnaire.id}`;
      const answers = (questionsAndAnswers.responses[ref] || [])[0];
      if (answers) {
        answer = recurseFindQuestionnaire(questionnaire.item, answers);
      }
      return answer != null;
    });

    return answer;
  }

  public findQuestion(questionnaire: fhir.Questionnaire, matchFn: (question: fhir.QuestionnaireItem) => boolean): fhir.QuestionnaireItem {
    const recurseFind = (questions) => {
      let deepQuestion;

      const found = (questions || []).find(q => {
        if (q.type !== 'group') {
          if (matchFn(q)) {
            deepQuestion = q;
            return true;
          }
          return false;
        } else {
          deepQuestion = recurseFind(q.item);
          return deepQuestion != null;
        }
      });
      if (found) {
        return deepQuestion;
      }
    };

    return recurseFind(questionnaire.item);
  }

  planGoals(carePlan: fhir.CarePlan, refresh?): Observable<IPatientAdherenceRow[]> {
    if (this.goalsByCarePlan[carePlan.id] && !refresh) {
      return this.goalsByCarePlan[carePlan.id];
    }

    const planGoals = ([...carePlan.goal || []]);
    const weeklyReviews = (carePlan.activity || []);
    const activityByGoalRef: any = {};

    weeklyReviews.forEach((review, index) => {
      if (review.detail.goal) {
        const records = review.detail.goal;
        review.detail.goal.forEach(goalRef => activityByGoalRef[goalRef.reference] = index);

        Array.prototype.splice.apply(planGoals, [-1, 0, ...records]);
      }
    });

    this.goalsByCarePlan[carePlan.id] = this.fhirService.resolveReferences<fhir.Goal>(planGoals, carePlan, 100)
      .pipe(map((goals) => {
        return (goals.entry || []).map(goal => {
          const planGoal = goal.resource as fhir.Goal;
          return CarePlanUtils.goalToAdherenceRow(planGoal, activityByGoalRef[`Goal/${planGoal.id}`]);
        });
      }),
        shareReplay(1));

    return this.goalsByCarePlan[carePlan.id];
  }

  goalsToGroupedRows(goals: IPatientAdherenceRow[], carePlan: fhir.CarePlan): {} {
    /*
    {
      'education': [{}],
      'exercise': [{}],
      'observation': [{}]
    }
    */

    const groupByLabel = {};
    const groupedRows = {};

    goals.forEach(r => {
      const groupLabelString: string = CarePlanUtils.getGroupLabel(r) || r.description;
      groupByLabel[groupLabelString] = groupByLabel[groupLabelString] || [];
      groupByLabel[groupLabelString].push(r);
    });

    Object.keys(groupByLabel).forEach(label => {
      groupByLabel[label].forEach(item => {
        item.description = label;
        item.groupedRows = groupByLabel[label];
        groupedRows[item.record_type] = groupedRows[item.record_type] || [];

        // TODO grouping needs to be redesigned and refactored into something smarter than this
        if (item.record_type === 'exercise') {
          // Display just one task for exercise each week
          if (!groupedRows[item.record_type].find(i => {
            const activity = carePlan.activity[i.activity];
            const itemActivity = carePlan.activity[item.activity];
            return i.name === item.name
              && activity && itemActivity && activity.reference === itemActivity.reference;
          })) {
            groupedRows[item.record_type].push(item);
          }
        } else if (item.record_type === 'observation') {
          // Display just one task for observations
          if (!groupedRows[item.record_type].find(i => i.name === item.name)) {
            groupedRows[item.record_type].push(item);
          }
        } else {
          // Display everything for other record types
          groupedRows[item.record_type].push(item);
        }
      });
    });

    Object.keys(groupedRows).forEach(key => {
      // Sort ascending by activity index
      groupedRows[key] = groupedRows[key].sort((a, b) => a.activity - b.activity);
    });

    return groupedRows;
  }

  public async updateGoalStatus(patient: fhir.Patient, carePlan: fhir.CarePlan, questionnaire: fhir.Questionnaire, questionnaireResponse: fhir.QuestionnaireResponse) {
    const episodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare>(carePlan.context, carePlan).toPromise();
    this.planGoals(carePlan).subscribe(adherenceRows => {
      adherenceRows.forEach(async adherence => {
        const enableWhen = (adherence.goal.extension || []).find(ext => ext.url === FhirService.EXTENSIONS.TASK_ENABLE_WHEN);
        if (enableWhen) {
          let enabled = false;
          const enableMeta: ITaskEnableWhenExtension = FhirService.flattenExtension<ITaskEnableWhenExtension>(enableWhen);
          // enableMeta.questionnaire

          // FIXME the goal extension for enableWhen references a questionnaire on the source (basedOn) plan. This just arbitrarily applies this rule
          // const basedOn = await this.fhirService.reference<fhir.CarePlan>(carePlan.basedOn[0], carePlan).toPromise();
          // const questionnaire = await this.fhirService.reference<fhir.Questionnaire>(enableMeta.questionnaire, basedOn).toPromise();
          // const questionnaireResponse = await this.patientQuestionnaireResponses(patient.id, questionnaire, episodeOfCare).toPromise();
          if (enableMeta.questionnaire.reference === `Questionnaire/${questionnaire.id}`) {
            // tslint:disable-next-line: no-console
            console.debug(enableMeta);

            const qAndA: IQuestionnairesWithAnswers = {
              questionnaires: [questionnaire],
              responses: {
                [questionnaireResponse.questionnaire.reference]: [questionnaireResponse]
              }
            };

            const answer: fhir.QuestionnaireResponseItem = this.searchQuestionAnswers(qAndA, (question) => question.linkId === enableMeta.question);
            if (answer) {
              if (enableMeta.answerChoice) {
                enabled = Object.keys(enableMeta.answerChoice)
                  .some(key => {
                    const coding = enableMeta.answerChoice[key];
                    return (answer.answer || [])
                      .find(patientAnswer => patientAnswer.valueCoding ? (patientAnswer.valueCoding.code === coding.code && patientAnswer.valueCoding.system === coding.system) : false) != null;
                  });
              } else if (enableMeta.answerBoolean !== void 0) {
                enabled = (answer.answer || []).some(item => item.valueBoolean === enableMeta.answerBoolean);
              }
            }

            let dirty = false;
            if (enabled && adherence.goal.status === 'rejected') {
              adherence.goal.status = 'proposed';
              dirty = true;
            } else if (!enabled && adherence.goal.status !== 'rejected') {
              adherence.goal.status = 'rejected';
              dirty = true;
            }
            if (dirty) {
              adherence.goal.statusDate = moment().format();
              await this.fhirService.save(adherence.goal).toPromise();
            }
          }
        }
      });
    });
  }

  public async updateAddresses(patient: fhir.Patient, carePlan: fhir.CarePlan, questionnaire: fhir.Questionnaire, questionnaireResponse: fhir.QuestionnaireResponse) {
    const initialAssessments = (carePlan.activity || []).filter(activity => CarePlanUtils.isInitialAssessment(activity));
    const questionAnswers = await this.findQuestionsAndAnswers(initialAssessments, patient, carePlan.context);
    const currentProcedureAnswer: fhir.QuestionnaireResponseItem = this.searchQuestionAnswers(questionAnswers, (question) => FhirService.hasCoding({ coding: question.code } as fhir.CodeableConcept, CarePlanUtils.CURRENT_PROCEDURE_CODES));

    const conditions: { [key: string]: fhir.Condition } = {};

    const oldCarePlanConditionResponse = await this.fhirService.resolveReferences<fhir.Condition>(carePlan.addresses, carePlan).toPromise();
    const oldCarePlanConditions = (oldCarePlanConditionResponse.entry || []).map(e => e.resource);

    const newAddresses = [];
    if (currentProcedureAnswer && currentProcedureAnswer.answer) {
      currentProcedureAnswer.answer.forEach(a => {
        const existingConditionIndex = oldCarePlanConditions.findIndex(f => f.code === a.valueCoding.code);

        if (existingConditionIndex === -1) {

          const urn = `urn:uuid:${uuid()}`;
          conditions[urn] = {
            resourceType: 'Condition',
            subject: carePlan.subject,
            context: carePlan.context,
            code: {
              coding: [a.valueCoding]
            }
          };
          newAddresses.push({
            reference: urn
          });
        } else {
          const existingCondition = oldCarePlanConditions[existingConditionIndex];
          oldCarePlanConditions.splice(existingConditionIndex, 1);
          newAddresses.push({
            reference: `Condition/${existingCondition.id}`
          });
        }
      });
    }

    if (oldCarePlanConditions.length > 0 || Object.keys(conditions).length > 0) {
      carePlan.addresses = newAddresses;
      const bundle: fhir.Bundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
          ...oldCarePlanConditions.map(cond => {
            return {
              request: {
                method: 'DELETE',
                url: `Condition/${cond.id}`
              },
              resource: null
            };
          }),
          ...Object.keys(conditions).map(conditionKey => {
            return {
              request: {
                method: 'POST',
                url: conditionKey
              },
              resource: conditions[conditionKey]
            };
          }),
          {
            request: {
              method: 'PUT',
              url: `CarePlan/${carePlan.id}`
            },
            resource: carePlan
          }
        ] as fhir.BundleEntry[]
      };
      const response = await this.fhirService.save<fhir.Bundle>(bundle).toPromise();
      const updatedPlan = response.entry.find(e => e.resource && e.resource.resourceType === 'CarePlan');
      if (updatedPlan && updatedPlan.resource) {
        Object.assign(carePlan, updatedPlan.resource);
      }
    }
  }

  public planSite(carePlan: fhir.CarePlan): Observable<fhir.Organization> {
    return this.fhirService.reference(carePlan.context, carePlan)
      .pipe(
        mergeMap((care: fhir.EpisodeOfCare | fhir.Encounter) => {
          if (care) {
            const orgRef = (care.resourceType === 'EpisodeOfCare') ? care['managingOrganization'] : care['serviceProvider'];
            if (orgRef) {
              return this.fhirService.reference<fhir.Organization>(orgRef, care);
            }
          }
          return of(null) as Observable<fhir.Organization>;
        })
      );
  }

  public updateGoal(
    adherence: IPatientAdherenceRow,
    carePlan: fhir.CarePlan,
    update: { description, isEnabled: boolean, timing: string, target?: fhir.GoalTarget }
  ): Promise<fhir.Bundle> {

    const goal = adherence.goal;
    const goalsToSave = [];
    const recurringExtension = (goal.extension || []).find(ext => ext.url === FhirService.EXTENSIONS.RECURRING_TASK);
    let expandedGoals: fhir.BundleEntry[] = [];

    function setGoalStatus(g) {
      if (g.status === 'achieved') {
        return g;
      }

      // Enable/disable goals when the due date is today or after or if the program hasn't started yet
      if ((g.target && g.target.dueDate && moment(g.target.dueDate).isSameOrAfter(moment(), 'day')) || carePlan.status === 'draft') {
        if (update.isEnabled) {
          if (carePlan.status === 'draft') {
            g.status = 'proposed';
          } else if (carePlan.status === 'active') {
            g.status = 'accepted';
          }
        } else {
          g.status = 'rejected';
        }
      }

      // Update start date, target and due date in case they're missing
      if (adherence.activity !== undefined) {
        const activity = carePlan.activity[adherence.activity];
        g.startDate = g.startDate || activity.detail.scheduledPeriod.start;
        g.target = g.target || {};
        // Only update this for active careplans
        if (carePlan.status === 'active') {
          g.target.dueDate = g.target.dueDate || activity.detail.scheduledPeriod.end;
        } else {
          delete g.target.dueDate;
        }
      } else {
        g.startDate = g.startDate || carePlan.period.start;
        g.target = g.target || {};
        if (carePlan.status === 'active') {
          g.target.dueDate = g.target.dueDate || carePlan.period.end;
        } else {
          delete g.target.dueDate;
        }
      }
      if (update.target) {
        Object.assign(g.target, update.target);
      }

      if (update.description) {
        g.description = update.description;
      }
      g.statusDate = moment().format();

      return g;
    }

    if (!goal || !carePlan || update.isEnabled === void 0) {
      return Promise.resolve(void 0);
    }

    if (recurringExtension) {
      // if timing is different and task is not already started
      const timingExt = recurringExtension.extension.find(ext => ext.url === 'timing');
      if (timingExt && timingExt.valueString !== update.timing) {
        timingExt.valueString = update.timing;
      }
    }

    // This goal needs expanding if we're enabling it, it's recurring and there's only one instance
    // Only for active careplans
    if (carePlan.status === 'active' && update.isEnabled && recurringExtension && adherence.groupedRows.length === 1) {
      expandedGoals = this.expandGoal(adherence, carePlan, recurringExtension);
      adherence.groupedRows = [];
      expandedGoals.forEach(g => {
        setGoalStatus(g.resource as fhir.Goal);
        adherence.groupedRows.push(CarePlanUtils.goalToAdherenceRow(g.resource as fhir.Goal, adherence.activity));
      });
    } else if (adherence.record_type === 'exercise') {
      // Update the status of all the exercise goals for this week
      adherence.groupedRows.forEach(r => {
        if (r.activity) {
          if (carePlan.activity[r.activity].reference === carePlan.activity[adherence.activity].reference) {
            goalsToSave.push(setGoalStatus(r.goal));
          }
        }
      });
    } else if (adherence.record_type === 'observation') {
      adherence.groupedRows.forEach(r => goalsToSave.push(setGoalStatus(r.goal)));
    } else {
      goalsToSave.push(setGoalStatus(goal));
    }

    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        ...goalsToSave.map(g => {
          return {
            request: {
              method: 'PUT',
              url: `Goal/${g.id}`
            },
            resource: g
          };
        }),
        ...expandedGoals,
        {
          request: {
            method: 'PUT',
            url: `CarePlan/${carePlan.id}`
          },
          resource: carePlan
        }
      ] as fhir.BundleEntry[]
    };

    return this.fhirService.save<fhir.Bundle>(bundle).toPromise();
  }

  async getSatisfactoryResponse(patient: fhir.Patient, carePlan: fhir.CarePlan, finalAssessments: fhir.CarePlanActivity[]) {
    // const episodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare>(carePlan.context, carePlan).toPromise();
    const qa = await this.findQuestionsAndAnswers(finalAssessments, patient, carePlan.context);
    const hcpSatisfied = this.searchQuestionAnswers(qa, question => question.linkId === 'hcp-satisfied');

    if (!qa || !hcpSatisfied) {
      return true;
    }

    if (!hcpSatisfied.answer || !Array.isArray(hcpSatisfied.answer) || !hcpSatisfied.answer.length) {
      // TODO there's a task to prevent this from happening.
      // Create questionnaire response items as the user answers the questions
      return void 0;
    }

    return hcpSatisfied.answer[0].valueCoding.code === ANSWER_CHOICE.YES;
  }
}
