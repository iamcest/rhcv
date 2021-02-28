import { isInteger, isNaN, isNumber } from 'lodash';
import { Component, OnInit, Input, SecurityContext, ViewChild, ElementRef } from '@angular/core';
import { CarePlanUtils, IPatientAdherenceRow, ANSWER_CHOICE } from '../../../services/care-plan-utils';
import { ActivatedRoute } from '@angular/router';
import { CarePlanService, IQuestionnairesWithAnswers } from '../../../services/care-plan.service';
import { PatientService } from '../../../services/patient.service';
import { FhirService } from '../../../services/fhir.service';
import { formatAddress, formatDOB, toValueString, formatFhirName } from '../../../utils';
import { MedicationService } from '../../../services/medication.service';
import { IOrganisationAttributes } from '../../home.component';
import { AdherenceService, IOverallAdherence } from '../../../services/adherence.service';
import { LoaderService } from '@cardihab/angular-fhir';
import { combineLatest } from 'rxjs';
import { PractitionerService } from '../../../services/practitioner.service';
import { saveAs } from 'file-saver';
import * as Sentry from '@sentry/browser';
import pdfTemplate from '../../../../assets/pdf/report-template';
import dischargeReportStyle from './discharge-report.style';
import { ReportService } from '../../../services/report.service';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';

interface IWeeklyReviewReportNote {
  author: fhir.Practitioner;
  date: string;
  text: string;
}

export interface IRiskFactorAttributes {
  dischargeSummary?: boolean;
}


interface IWeeklyReviewReport {
  no: string;
  start: string;
  topics?: string[];
  notes?: IWeeklyReviewReportNote[];
}

const HEADER_BACKGROUND = '#003c5b',
  HEADER_TEXT = '#fff',
  TABLE_HEADER_BACKGROUND = '#d8eef9';


@Component({
  selector: 'app-discharge-report',
  templateUrl: './discharge-report.component.html',
  styleUrls: ['./discharge-report.component.scss']
})
export class DischargeReportComponent implements OnInit {
  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;
  @Input()
  isProgress: boolean;

  @ViewChild('contentToConvert')
  contentToConvert: ElementRef<any>;

  initialAssessmentAnswers: IQuestionnairesWithAnswers;
  finalAssessmentAnswers: IQuestionnairesWithAnswers;

  conditions: string;
  diagnosisDate: string;
  outcome: string;
  weeklyReviews: IWeeklyReviewReport[] = [];
  currentMedications: IPatientAdherenceRow[] = [];
  overallMedicationAdherence: IOverallAdherence = {};
  formatDOB = formatDOB;
  riskFactors: any[] = [];
  iaOtherFactors: string;
  faOtherFactors: string;

  formatAddress = formatAddress;
  organisation: fhir.Organization;
  urn: string;
  urnLabel: string;


  constructor(
    private route: ActivatedRoute, private carePlanService: CarePlanService,
    private patientService: PatientService, private fhirService: FhirService,
    private medicationService: MedicationService, private adherenceService: AdherenceService,
    private loader: LoaderService,
    private sanitizer: DomSanitizer,
    private practitionerService: PractitionerService,
    private reportService: ReportService,
    private snackbar: MatSnackBar

  ) { }

  async ngOnInit() {
    this.patient = this.patient || this.route.parent.snapshot.data['patient'];
    this.organisation = await this.carePlanService.planSite(this.carePlan).toPromise();

    if (this.patient && this.carePlan) {
      this.urn = (this.patientService.urn(this.patient) || {}).value;
      const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((this.organisation.extension || [])
        .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || { url: '' });
      this.urnLabel = orgAttributes && orgAttributes.urnLabel ? orgAttributes.urnLabel : 'URN';

      const finalAssessments: fhir.CarePlanActivity[] = this.carePlan.activity.filter(act => CarePlanUtils.isFinalAssessment(act));
      const initialAssessments: fhir.CarePlanActivity[] = this.carePlan.activity.filter(act => CarePlanUtils.isInitialAssessment(act));


      this.finalAssessmentAnswers = await this.carePlanService.findQuestionsAndAnswers(finalAssessments, this.patient, this.carePlan.context);
      this.initialAssessmentAnswers = await this.carePlanService.findQuestionsAndAnswers(initialAssessments, this.patient, this.carePlan.context);
      const listOfSelectedQuestions: { numericFactors: fhir.QuestionnaireItem[], otherFactors: fhir.QuestionnaireItem[] } = { numericFactors: [], otherFactors: [] };

      if (this.initialAssessmentAnswers?.questionnaires?.length > 0) {

        const selectQuestions = (question: fhir.QuestionnaireItem, currentState: { numericFactors: fhir.QuestionnaireItem[], otherFactors: fhir.QuestionnaireItem[] }): { numericFactors: fhir.QuestionnaireItem[], otherFactors: fhir.QuestionnaireItem[] } => {
          const selectedQuestionsJsonObject: IRiskFactorAttributes = FhirService.flattenExtension<IRiskFactorAttributes>((question.extension || []).find(ext => ext.url === 'https://fhir-registry.cardihab.com/StructureDefiniton/QuestionnaireItemAttributes'));
          if (selectedQuestionsJsonObject?.dischargeSummary) {
            if (['integer', 'decimal', 'quantity'].indexOf(question.type) !== -1) {
              currentState.numericFactors.push(question);
            } else if (question.type === 'boolean' || question.type === 'choice') {
              currentState.otherFactors.push(question);

            }

          }
          return currentState;

        };
        this.initialAssessmentAnswers.questionnaires.forEach((quest) => {
          this.recursiveReduce<{ numericFactors: fhir.QuestionnaireItem[], otherFactors: fhir.QuestionnaireItem[] }>(quest, selectQuestions, listOfSelectedQuestions);
        });
      }

      this.riskFactors = (listOfSelectedQuestions?.numericFactors || []).map(row => {
        return {
          initial: void 0,
          final: void 0,
          id: row.linkId,
          display: row.text,
          code: (row?.code) ? row?.code : '',
          unit: row.type
        };
      });

      this.riskFactors.forEach((item) => {
        const initial = this.carePlanService.searchQuestionAnswers(this.initialAssessmentAnswers, (q) => FhirService.hasCoding({ coding: q.code }, item.code));
        const final = this.carePlanService.searchQuestionAnswers(this.finalAssessmentAnswers, (q) => FhirService.hasCoding({ coding: q.code }, item.code));
        const question = initial ? this.carePlanService.findQuestion(this.initialAssessmentAnswers.questionnaires[0], (q) => q.linkId === initial.linkId) : void 0;

        item.initial = initial && initial.answer ? toValueString(initial.answer[0]) : void 0;
        item.final = final && final.answer ? toValueString(final.answer[0]) : void 0;
        item.display = initial ? initial.text : item.display;
        item.unit = question?.initialQuantity?.unit || item.unit;

        //   case 'BMI': {
        //     const height = this.carePlanService.searchQuestionAnswers(this.initialAssessmentAnswers, (question) => FhirService.hasCoding({ coding: question.code }, CarePlanUtils.VITAL_SIGNAL_CODE['STANDING_HEIGHT']));
        //     const initialWeight = this.carePlanService.searchQuestionAnswers(this.initialAssessmentAnswers, (question) => FhirService.hasCoding({ coding: question.code }, CarePlanUtils.VITAL_SIGNAL_CODE['WEIGHT']));
        //     const finalWeight = this.carePlanService.searchQuestionAnswers(this.finalAssessmentAnswers, (question) => FhirService.hasCoding({ coding: question.code }, CarePlanUtils.VITAL_SIGNAL_CODE['WEIGHT']));
        //     item.initial = this.getBMI(initialWeight && initialWeight.answer ? toValueString(initialWeight.answer[0]) : void 0, height && height.answer ? toValueString(height.answer[0]) : void 0);
        //     item.final = this.getBMI(finalWeight && finalWeight.answer ? toValueString(finalWeight.answer[0]) : void 0, height && height.answer ? toValueString(height.answer[0]) : void 0);
        //     break;
        //   }
      });

      const initialFactors = [];
      const finalFactors = [];

      (listOfSelectedQuestions.otherFactors || []).forEach(factor => {
        const initialFactor = this.carePlanService.searchQuestionAnswers(this.initialAssessmentAnswers, (question => question.linkId === factor?.linkId));
        const finalFactor = this.carePlanService.searchQuestionAnswers(this.finalAssessmentAnswers, (question => question.linkId === factor.linkId));
        if (factor.type === 'choice') {
          if (initialFactor && initialFactor.answer && toValueString(initialFactor.answer[0]) && toValueString(initialFactor.answer[0]).display) {
            initialFactors.push(toValueString(initialFactor.answer[0]).display);
          }
          if (finalFactor && finalFactor.answer && toValueString(finalFactor.answer[0]) && toValueString(finalFactor.answer[0]).display) {
            finalFactors.push(toValueString(finalFactor.answer[0]).display);
          }

        } else {
          if (initialFactor && initialFactor.answer && !!toValueString(initialFactor.answer[0])) {
            initialFactors.push(initialFactor.text);
          }
          if (finalFactor && finalFactor.answer && !!toValueString(finalFactor.answer[0])) {
            finalFactors.push(finalFactor.text);
          }
        }
        this.iaOtherFactors = initialFactors.join(', ');
        this.faOtherFactors = finalFactors.join(', ');
      });

      // Get a diagnosis date
      const diagnosisQuestion = this.carePlanService.searchQuestionAnswers(this.initialAssessmentAnswers, (question => question.linkId === 'current-event-procedure-discharge-date'));
      this.diagnosisDate = diagnosisQuestion && diagnosisQuestion.answer && diagnosisQuestion.answer.length ? diagnosisQuestion.answer[0].valueDate : void 0;

      // Get program outcome based on final assessment questionnaire answers
      this.outcome = this.getProgramOutcome(this.finalAssessmentAnswers);

      // Get all weekly reviews, make them into review reports and sort by week number
      (this.carePlan.activity || [])
        .filter(a => CarePlanUtils.isWeeklyReview(a))
        .forEach(async r => {
          this.weeklyReviews.push(<IWeeklyReviewReport>{
            no: r.detail.description,
            start: r.detail.scheduledPeriod.start,
            notes: (await Promise.all(r.progress ? r.progress.map(async item => {
              // Filter out patient specific reminders, we don't need then on the discharge report
              const isReminder = item.extension && item.extension.find(e => e.url === FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER);
              if (!isReminder) {
                return <IWeeklyReviewReportNote>{
                  text: item.text,
                  author: await this.fhirService.reference(item.authorReference, this.carePlan).toPromise(),
                  date: item.time
                };
              }
            }) : [])).filter(item => !!item),
            topics: await this.getTopics(r.detail.goal)
          });
          this.weeklyReviews.sort((a, b) => a.start.localeCompare(b.start));
        });
    }

    // Get all conditions
    if (this.carePlan) {
      this.conditions = (await Promise.all((this.carePlan.addresses || [])
        .map(c => this.fhirService.reference<fhir.Condition>(c, this.carePlan).toPromise())))
        .map(item => item.code.coding[0].display)
        .join(', ');
    }

    // Get all current medications
    this.currentMedications = await this.medicationService.medicationsToRecords(this.patient, { status: 'active' });
    this.overallMedicationAdherence = this.adherenceService.getOverallAdherence(this.currentMedications, this.carePlan, 'medicine');
  }

  getBMI(weight: number, height: number) {
    // Work out if it's in metres or centimetres
    height = height > 3 ? height / 100 : height;
    const result = Number(parseFloat(`${weight / (height * height)}`).toFixed(2));
    return isNaN(result) ? void 0 : result;
  }

  async getTopics(goals) {
    const exerciseTasks = {
      all: 0,
      achieved: 0
    };

    const allGoals = await this.fhirService.resolveReferences(goals, this.carePlan).toPromise();

    (allGoals.entry || []).forEach((entry: fhir.BundleEntry) => {
      const goal = entry.resource as fhir.Goal;

      if (CarePlanUtils.isExerciseGoal(goal)) {
        // If it's rejected, we're assuming all the tasks for this week have been rejected
        // Until we start editing goals, and this assumption no longer works
        if (goal.status === 'rejected') {
          return;
        }

        if (goal.status === 'achieved') {
          exerciseTasks.achieved++;
        }

        exerciseTasks.all++;
      }
    });

    const percentAchieved = Math.round(exerciseTasks.achieved / exerciseTasks.all * 100);

    return (allGoals.entry || []).map((entry: fhir.BundleEntry) => {
      const goal = entry.resource as fhir.Goal;

      // Filtering out SMART goals as we don't need them in the discharge report
      return (goal.status === 'rejected' || goal.status === 'cancelled'
        || CarePlanUtils.isExerciseGoal(goal) || CarePlanUtils.isSMARTGoal(goal))
        ? void 0
        : goal.description.text;
    })
      .concat(exerciseTasks.all ? `Exercise task (${exerciseTasks.achieved}/${exerciseTasks.all} - ${percentAchieved}%)` : void 0)
      .filter(item => !!item);
  }

  difference(signal) {
    // Only need to convert non-integer values and zero
    function toFixed(value: number): string {
      if (!isInteger(value) || value === 0) {
        return value.toFixed(2);
      }
      return value.toString();
    }

    // TODO only works for numbers now, any additional value types will require some more work
    if (!signal.initial || !signal.final || !isNumber(signal.initial) || !isNumber(signal.final)) {
      return void 0;
    }

    const delta: number = signal.final - signal.initial;
    const percentage: number = delta / signal.initial * 100;

    // Add a '+' sign for positive numbers
    const sign: string = percentage > 0 ? '+' : '';
    return `${sign}${toFixed(delta)} (${sign}${toFixed(percentage)}%)`;
  }

  private recursiveReduce<T>(
    questionnaire: fhir.Questionnaire,
    reductionFn: (item: fhir.QuestionnaireItem, currentState?: T) => T,
    initialState: T
  ) {
    const reducer = (currentState: T, item: fhir.QuestionnaireItem) => {
      const newCurrent = reductionFn(item, currentState);
      if (item.item) {
        return item.item.reduce(reducer, newCurrent);
      } else {
        return newCurrent;
      }
    };

    return (questionnaire.item || []).reduce(reducer, initialState);
  }

  getpatientPhone(): string {
    let phone: any = void 0;

    if (this.patient && this.patient.telecom) {
      phone = this.patient.telecom.find((t) => t.system === 'phone');
    }
    return phone ? phone.value : void 0;
  }

  getProgramOutcome(finalAssessmentAnswers: IQuestionnairesWithAnswers): string {
    const POSSIBLE_OUTCOMES = [
      {
        code: ANSWER_CHOICE.YES,
        description: 'Patient completed the program to the satisfaction of the treating clinician'
      },
      {
        code: ANSWER_CHOICE.NO,
        reason: 'withdrew',
        description: 'Patient elected not to continue to be in the program'
      },
      {
        code: ANSWER_CHOICE.NO,
        reason: 'illness',
        description: 'Patient\'s illness prevented them from completing the program'
      },
      {
        code: ANSWER_CHOICE.NO,
        reason: 'moved',
        description: 'Patient moved to a location where they were not able to complete the program'
      },
      {
        code: ANSWER_CHOICE.NO,
        reason: 'unavailable',
        description: 'Patient was no longer able to be part of the program'
      },
      {
        code: ANSWER_CHOICE.NO,
        reason: 'deceased',
        description: 'Patient deceased'
      },
      {
        code: ANSWER_CHOICE.NO,
        reason: 'other',
        description: '' // TODO free text extension here
      }
    ];

    const satisfiedQuestion = this.carePlanService
      .searchQuestionAnswers(finalAssessmentAnswers, q => q.linkId === 'hcp-satisfied');
    const satisfiedAnswer = satisfiedQuestion && satisfiedQuestion.answer && satisfiedQuestion.answer.length ? satisfiedQuestion.answer[0].valueCoding : void 0;

    const reasonQuestion = this.carePlanService
      .searchQuestionAnswers(finalAssessmentAnswers, q => q.linkId === 'reason-for-unsatisfactory-completion');
    const reasonAnswer = reasonQuestion && reasonQuestion.answer && reasonQuestion.answer.length ? reasonQuestion.answer[0].valueCoding : void 0;

    const outcome = satisfiedAnswer ? POSSIBLE_OUTCOMES.find(item =>
      (item.code === satisfiedAnswer.code && (reasonAnswer ? item.reason === reasonAnswer.code : true))
    ) : undefined;

    return outcome ? outcome.description : '';
  }

  isCarePlanIncomplete(): boolean {
    return CarePlanUtils.isCarePlanIncomplete(this.carePlan);
  }

  getReportFileName() {
    return `${formatFhirName(this.patient.name, { noTitle: true })}_${formatDOB(this.patient.birthDate)}`
      .replace(',', '')
      .replace(' ', '_');
  }

  download() {
    this.loader.start('Downloading...');

    const element = this.contentToConvert.nativeElement;
    combineLatest([this.practitionerService.current, this.practitionerService.managingOrganization()])
      .subscribe(async ([practitioner, org]) => {
        const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((org.extension || [])
          .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || { url: '' });
        let body = this.sanitizer.sanitize(SecurityContext.HTML, element.innerHTML);

        // Applying company logo
        const imgMatch = body.match(/<img.*?class="cardihab-logo.*?>/);
        if (imgMatch && imgMatch.length === 1) {
          if (orgAttributes && orgAttributes.companyLogo) {
            const logo = this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(orgAttributes.companyLogo));
            body = body.replace(imgMatch[0], `<img class="cardihab-logo" src="${logo}">`);
          } else {
            body = body.replace(imgMatch[0], imgMatch[0].replace('src="/assets/', `src="${location.origin}/assets/`));
          }
        }

        const roleCodes = await this.practitionerService.currentRoleCodes().pipe(take(1)).toPromise();
        // Applying custom colours
        const style = dischargeReportStyle
          .replace('#headerBackground', orgAttributes && orgAttributes.headerBackground ? orgAttributes.headerBackground : HEADER_BACKGROUND)
          .replace('#headerText', orgAttributes && orgAttributes.headerText ? orgAttributes.headerText : HEADER_TEXT)
          .replace('#tableHeaderBackground', orgAttributes && orgAttributes.tableHeaderBackground ? orgAttributes.tableHeaderBackground : TABLE_HEADER_BACKGROUND);

        // Putting it all together
        const html = pdfTemplate
          .replace('#style', style)
          .replace('#title', this.getReportFileName())
          .replace('#body', body);

        this.reportService.createReport(html,
          {
            height: '10mm',
            contents: `<div style="text-align: left; font-size: 10px;">Patient: ${formatFhirName(this.patient.name, { noTitle: true })} ${formatDOB(this.patient.birthDate, false, true)}</div>`
          },
          {
            height: '15mm',
            contents: {
              default: `
                <div style="font-size: 10px;">
                  <span style="float: left;">
                    <span>Printed by: ${formatFhirName(practitioner.name)} ${(roleCodes || []).join(',')} on ${moment().format('DD/MM/YYYY HH:mm')}</span>
                    </span>
                  <span style="float: right;">
                    <span>Page {{page}}</span> of <span>{{pages}}</span>
                  </span>
                </div>`
            }
          })
          .subscribe(sub => {
            saveAs(sub, this.getReportFileName());
          }, error => {
            this.loader.stop();
            this.snackbar.open('Could not download. Please try again later', 'Close', {
              duration: 2000,
            });
            Sentry.captureMessage(`Error downloading report: ${error.message}`, Sentry.Severity.Error);
          }, () => {
            this.loader.stop();
          });
      });
  }
}
