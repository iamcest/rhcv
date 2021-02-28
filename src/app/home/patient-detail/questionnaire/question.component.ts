import { Input, Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { isEqual } from 'lodash';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  @Input()
  group: FormGroup;

  @Input()
  readonly disabled: boolean; // Comes from the parent, cannot be changed

  conditionallyDisabled = false; // Determined by enableWhen extension if present

  @Input()
  answer: fhir.QuestionnaireResponse;

  @Input()
  questionnaire: fhir.Questionnaire;

  @Input()
  question: fhir.QuestionnaireItem;

  @Input()
  context: fhir.EpisodeOfCare | fhir.Encounter;

  @ViewChildren(QuestionComponent)
  questions: QueryList<QuestionComponent>;

  hh = '00';
  mm = '00';

  constructor(private fb: FormBuilder, private questionnaireService: QuestionnaireService) { }

  ngOnInit(): void {
  }

  public hasValueCoding(linkId: string, value: { system: string, code: any, display: string }): boolean {
    const arrayValues = this.group.get(linkId).value;
    // todo assert that this is an array
    return arrayValues.find(v => v.system === value.system && v.code === value.code) != null;
  }

  public onValueCodingChange($event, option?) {
    if (this.question.repeats) {
      const newValue = this.group.get(this.question.linkId).value.filter(v => v.code !== option.code);
      const fArray = this.group.get(this.question.linkId) as FormArray;
      if ($event.checked) {
        fArray.push(this.fb.group(option));
        newValue.push(option);
      } else {
        fArray.removeAt(fArray.length - 1);
      }
      this.group.get(this.question.linkId).setValue(newValue);
    } else {
      let selectedOption = {};
      if ($event.value === 'otherOption') {
        selectedOption = {
          code: 'otherOption',
          display: '',
          system: '',
          otherOptionText: this.group.get(this.question.linkId).get('otherOptionText').value || '',
        };
      } else {
        selectedOption = this.question.option.find(o => o.valueCoding.code === $event.value).valueCoding ||
          {
            code: '',
            display: '',
            system: ''
          };
      }
      this.group.get(this.question.linkId).setValue(selectedOption);
    }
  }

  checkEnabled(answer: fhir.QuestionnaireResponse) {
    let mutated = false;
    if (this.question.enableWhen) {

      this.conditionallyDisabled = this.questionnaireService.isConditionallyDisabled(this.questionnaire, this.question, answer, this.context);
      if (this.conditionallyDisabled !== void 0) {
        if (this.conditionallyDisabled) {
          const resetValue = this.getInitialValue(this.question);
          if (!isEqual(this.group.get(this.question.linkId).value, resetValue)) {
            this.group.get(this.question.linkId).reset(resetValue);
            mutated = true;
          }
          this.group.get(this.question.linkId).disable({ emitEvent: false});
        } else if (!this.disabled) {
          this.group.get(this.question.linkId).enable({ emitEvent: false});
        }
      }
    }
    return mutated || (this.questions || []).some(q => q.checkEnabled(answer));
  }

  getInitialValue(question: fhir.QuestionnaireItem) {
    // this.questionsByLinkId[item.linkId] = item;
    let initialValue: any = null;
    if (question.type === 'group') {
      initialValue = {};
      (question.item || []).forEach(item => {
        initialValue[item.linkId] = this.getInitialValue(item);
      });
      // this.resetToInitialValue()
    } else if (question.type === 'choice') {
      if (question.repeats) {
        initialValue = [];
      } else {
        initialValue = {
          code: null,
          display: null,
          system: null
        };
      }
    } else if (question.type === 'open-choice') {
      initialValue = {
        code: null,
        display: null,
        system: null,
        otherOptionText: null,
      };
    } else if (question.type === 'quantity') {
      initialValue = {
        unit: question.initialQuantity.unit || '',
        value: question.initialQuantity.value || ''
      };
    } else {
      if (question.type === 'boolean') {
        initialValue = Boolean(question.initialBoolean);
      }
      if (question.type === 'integer') {
        // https://www.hl7.org/fhir/datatypes.html#integer
        // JSON number (with no decimal point)
        if (question.initialInteger) {
          initialValue = question.initialInteger;
        }
      }
      if (question.type === 'decimal') {
        // https://www.hl7.org/fhir/datatypes.html#decimal
        // A JSON number, except that exponents are not allowed
        if (question.initialDecimal) {
          initialValue = question.initialDecimal;
        }
      }
      if (question.type === 'date' && question.initialDate) {
        initialValue = question.initialDate;
      }
      if (question.type === 'dateTime' && question.initialDateTime) {
        initialValue = question.initialDateTime;
      }
      if (question.type === 'time' && question.initialTime) {
        initialValue = question.initialTime;
      }
      if ((question.type === 'string' || question.type === 'text') && question.initialString) {
        initialValue = question.initialString;
      }
      if (question.type === 'url' && question.initialUri) {
        initialValue = question.initialUri;
      }
    }
    return initialValue;
  }
}
