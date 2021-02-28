import { Injectable } from '@angular/core';
import { ServicesModule } from './services.module';
import { FhirService } from './fhir.service';
import { CarePlanService } from './care-plan.service';
import { isEqual, cloneDeep } from 'lodash';
import { SCORING_FUNCTIONS } from '../utils/score-functions';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: ServicesModule
})
export class QuestionnaireService {
  constructor(private fhirService: FhirService,
              private carePlanService: CarePlanService,
              ) { }

  private deepSearchAnswers(items: fhir.QuestionnaireResponseItem[], linkId: string): fhir.QuestionnaireResponseItem {
    for (const item of items) {
      if (item.linkId === linkId) {
        return item;
      } else {
        if (item.item && item.item.length > 0) {
          const foundItem = this.deepSearchAnswers(item.item, linkId);
          if (foundItem) {
            return foundItem;
          }
        }
      }
    }
    return null;
  }

  getItemAnswer(linkId: string, answer: fhir.QuestionnaireResponse): fhir.QuestionnaireResponseItem | null {
    // for (const answer of (answers || [])) {
    if (answer && answer.item && answer.item.length > 0) {
      const foundItem = this.deepSearchAnswers(answer.item, linkId);
      if (foundItem) {
        return foundItem;
      }
    }
    // }
    return null;
  }

  isConditionallyDisabled(sourceQuestionnaire: fhir.Questionnaire, question: fhir.QuestionnaireItem, answer: fhir.QuestionnaireResponse, context: fhir.EpisodeOfCare | fhir.Encounter): boolean {
    if (!question.enableWhen) { return void 0; }

    let result = false;

    for (let i = 0; i < question.enableWhen.length; i++) {
      const item = question.enableWhen[i];

      let questionId = item.question;
      // Check if we need to fetch another questionnaire
      if (item.question.indexOf('/') > -1) {
        const split = item.question.split('/');
        // Ignore whatever is between the first and the last portion
        const questionnaireId = split[0];
        questionId = split[split.length - 1];

      //   if (this.answers[questionnaireId]) {
      //     // Use already existing answers
      //     answers = this.answers[questionnaireId];
      //   } else {
      //     // Fetch a new set of answers if we don't have it
      //     // FIXME questionnaires are going to be /public tenant
      //     const questionnaire: fhir.Questionnaire = await this.fhirService.reference<fhir.Questionnaire>({reference: `Questionnaire/${questionnaireId}`}, sourceQuestionnaire).toPromise();
      //     const qAnswers = await this.carePlanService.patientQuestionnaireResponses(localStorage.getItem('patient.id'), questionnaire, context).toPromise();
      //     answers = (qAnswers.entry || []).map(e => e.resource);
      //     this.answers[questionnaireId] = answers;
      //   }
      }

      const answerItem = this.getItemAnswer(questionId, answer);

      if (!answerItem || !answerItem.answer) {
        // If there's no answer we assume it's disabled
        result = true;
      } else {
        // If they match, it's enabled, and we're returning disabled, hence the '!'
        result = result || !this.isAnswerEqual(item, answerItem);
      }
    }

    return result;
  }

  // Find an answer and check if its value matches the required value in enableWhen
  isAnswerEqual(item, answer): boolean {
    for (const answerKey in item) {
      if (item.hasOwnProperty(answerKey) && answerKey.startsWith('answer')) {
        const valueKey = answerKey.replace('answer', 'value');
        return !!answer.answer.find(a => isEqual(a[valueKey], item[answerKey]));
      }
    }
    return true;
  }

  equalsCode(a: fhir.CodeableConcept, b: fhir.CodeableConcept): boolean {
    return (a.coding || []).length === (b.coding || []).length &&
        (a.coding.length || []) > 0 &&
        a.coding.every(aCode => b.coding.some(bCode => aCode.system === bCode.system && aCode.code === bCode.code));
  }

  async scoreActivityQuestionnaire(patient: fhir.Reference, activity: fhir.CarePlanActivity, questionnaireResponse: fhir.QuestionnaireResponse) {
    const outcome = await this.activityOutcome(patient, activity, questionnaireResponse.context);
    const outcomeURIs = (outcome.code.coding || []).map(coding => {
      return `${coding.system}/${coding.code}`;
    });
    if (outcomeURIs && outcomeURIs.length > 0 && SCORING_FUNCTIONS[outcomeURIs[0]]) {
      const scorer = SCORING_FUNCTIONS[outcomeURIs[0]];
      const components = this.calculateScore(questionnaireResponse, scorer.scoreFunction, cloneDeep(scorer.initial));
      outcome.component = components;
    }
    return outcome;
  }

  private async activityOutcome(subject: fhir.Reference, activity: fhir.CarePlanActivity, context: fhir.Reference): Promise<fhir.Observation> {
    let outcome: fhir.Observation;
    const outcomeRef = (activity.outcomeReference || []).find(o => o.reference.startsWith('Observation'));
    if (!outcomeRef) { // this is a newly achieve task
      const observationUUID = uuid();
      outcome = {
        resourceType: 'Observation',
        identifier: [{
            system: 'urn:uuid',
            value: observationUUID
        }],
        status: 'final',
        code: activity.detail.code,
        category: [{
            coding: [
                {
                    system: 'http://hl7.org/fhir/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                }
            ]
        }],
        subject: subject,
        performer: [subject],
        context,
        effectiveDateTime: new Date().toISOString()
      };
      activity.outcomeReference = activity.outcomeReference || [];
      activity.outcomeReference.push({
        reference: `urn:uuid:${observationUUID}`
      });
    } else {
      outcome = await this.fhirService.reference<fhir.Observation>(outcomeRef, subject).toPromise();
    }

    return outcome;
  }

  private calculateScore(
    response: fhir.QuestionnaireResponse,
    scorerFn: (item: fhir.QuestionnaireResponseItem, score?: fhir.ObservationComponent[]) => fhir.ObservationComponent[],
    initialComponents: fhir.ObservationComponent[]
  ) {
    const reducer = (tally: fhir.ObservationComponent[], item: fhir.QuestionnaireResponseItem) => {
        const itemScoreComponents = scorerFn(item, tally);
        itemScoreComponents.forEach(component => {
            const scoreComponent = tally.find(tallyComponent => this.equalsCode(component.code, tallyComponent.code));
            if (scoreComponent) {
              if (scoreComponent.valueQuantity) {
                scoreComponent.valueQuantity.value += component.valueQuantity.value;
              } else if (scoreComponent.valueCodeableConcept) {
                scoreComponent.valueCodeableConcept = component.valueCodeableConcept;
              }
            }
        });
        if (item.item) {
            return item.item.reduce(reducer, tally);
        } else {
            return tally;
        }
    };

    return (response.item || []).reduce(reducer, initialComponents);
  }
}
