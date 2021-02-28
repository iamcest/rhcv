import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChildren, QueryList, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import * as moment from 'moment';
import { capitalize } from 'lodash';
import { Subscription } from 'rxjs';
import { FhirService } from '../../../services/fhir.service';
import { toValueString } from '../../../utils';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionComponent } from './question.component';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
  viewProviders: [QuestionnaireService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionnaireComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  questionnaire: fhir.Questionnaire;

  @Input()
  context: fhir.EpisodeOfCare | fhir.Encounter;

  @Input()
  isReviewing: boolean;

  @Input()
  answers: fhir.QuestionnaireResponse[];

  @Input()
  activity: fhir.CarePlanActivity;

  @Input()
  editable = false;

  @Output()
  changesSaved: EventEmitter<{questionnaire: fhir.Questionnaire, answer: fhir.QuestionnaireResponse}> = new EventEmitter();

  @Output()
  statusChanges: EventEmitter<string> = new EventEmitter();


  @ViewChildren(QuestionComponent)
  questions: QueryList<QuestionComponent>;

  currentAnswer: fhir.QuestionnaireResponse;
  questionnaireForm: FormGroup;

  private questionsByLinkId: {
    [key: string]: fhir.QuestionnaireItem
  } = {};

  private arrayFormsByLinkId: {
    [key: string]: FormArray
  } = {};

  private changesSubscription: Subscription;
  private statusSub: Subscription;

  private _valid = false;

  constructor(
    private fb: FormBuilder,
    private fhirService: FhirService,
    private questionnaireService: QuestionnaireService,
    private snackbar: MatSnackBar,
    private changeDetection: ChangeDetectorRef
  ) {
    this.questionnaireForm = this.fb.group({});
  }

  ngOnInit() {
    console.log('QuestionnaireComponent ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges) {
    // tslint:disable-next-line:forin
    for (const propName in changes) {
      switch (propName) {
        case 'questionnaire':
          if (this.questionnaire != null) {
            console.log('questionnaire ngOnChanges');
            this.onQuestionnaireChange();
          }
          break;
        case 'editable':
          this.disableForm(this.editable);
          break;
        case 'answers':
          if (this.answers == null) {
            this.answers = [];
          }
          this.onAnswersChanged();
      }
    }
  }

  ngOnDestroy() {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  private disableForm(flag) {
    if (flag) {
      this.questionnaireForm.enable({ emitEvent: false});
    } else {
      this.questionnaireForm.disable({ emitEvent: false});
    }
  }

  onQuestionnaireChange() {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }

    this.questionnaireForm = this.fb.group(this.getQuestionnaireFormControls(this.questionnaire.item), { updateOn: 'blur'});

    this.statusSub = this.questionnaireForm.statusChanges.subscribe(change => {
      this._valid = change === 'VALID';
      this.statusChanges.emit(change);
      this.changeDetection.detectChanges();
    });

    this.changesSubscription = this.questionnaireForm.valueChanges
    // .pipe(debounceTime(250))
    .subscribe(() => {
      if (this.context && this.currentAnswer) {
        this.toQuestionnaireResponse(this.questionnaire.item, this.questionnaireForm, this.currentAnswer);
        if (!this.questions.some(q => q.checkEnabled(this.currentAnswer))) {
          this.save();
        }
        console.log('finished checking conditionals(q)');
      }
    });

    console.group(`Form structure:`);
    // tslint:disable-next-line:no-console
    console.debug(this.questionnaireForm.value);
    console.groupEnd();

    if (!this.editable) {
      this.questionnaireForm.disable({ emitEvent: false});
    }
    this.changeDetection.detectChanges();
  }

  getQuestionnaireFormControls(items: fhir.QuestionnaireItem[]): {[key: string]: any} {
    const controls: any = {};
    (items || []).forEach(item => {
      this.questionsByLinkId[item.linkId] = item;
      if (item.type === 'group') {
        controls[item.linkId] = this.fb.group(this.getQuestionnaireFormControls(item.item));
      } else if (item.type === 'choice') {
        if (item.repeats) {
          controls[item.linkId] = this.fb.array([]);
          this.arrayFormsByLinkId[item.linkId] = controls[item.linkId];
        } else {
          controls[item.linkId] = this.fb.group({
            code: '',
            display: '',
            system: ''
          });
        }
      } else if (item.type === 'open-choice') {
        controls[item.linkId] = this.fb.group({
          code: '',
          display: '',
          system: '',
          otherOptionText: '',
        });
      } else if (item.type === 'quantity') {
        controls[item.linkId] = this.fb.group({
          unit: item.initialQuantity.unit || '',
          value: item.initialQuantity.value || ''
        });
      } else if (item.type === 'time') {
        const hhmm = (item.initialTime || '00:00').match(/(\d\d)\:(\d\d)/);
        const [, hh, mm] = hhmm || ['', '00', '00'];

        controls[item.linkId] = this.fb.group({
          hh,
          mm
        });
      } else {
        const validators = [];
        let initialValue: any = '';
        if (item.required) {
          validators.push(Validators.required);
        }
        if (item.maxLength) {
          validators.push(Validators.maxLength(item.maxLength));
        }
        if (item.type === 'boolean') {
          initialValue = Boolean(item.initialBoolean);
        }
        if (item.type === 'integer') {
          // https://www.hl7.org/fhir/datatypes.html#integer
          // JSON number (with no decimal point)
          validators.push(Validators.pattern('^[-+]?[0-9]+$'));
          if (item.initialInteger) {
            initialValue = item.initialInteger;
          }
        }
        if (item.type === 'decimal') {
          // https://www.hl7.org/fhir/datatypes.html#decimal
          // A JSON number, except that exponents are not allowed
          validators.push(Validators.pattern('^[0-9]+([.]?[0-9]+)?$'));
          if (item.initialDecimal) {
            initialValue = item.initialDecimal;
          }
        }
        if (item.type === 'date' && item.initialDate) {
          initialValue = item.initialDate;
        }
        if (item.type === 'dateTime' && item.initialDateTime) {
          initialValue = item.initialDateTime;
        }
        if ((item.type === 'string' || item.type === 'text') && item.initialString) {
          initialValue = item.initialString;
        }
        if (item.type === 'url' && item.initialUri) {
          initialValue = item.initialUri;
        }
        controls[item.linkId] = [initialValue, validators];
      }
    });
    return controls;
  }

  private recurseAnswers(items: fhir.QuestionnaireResponseItem[], value: any) {
    (items || []).forEach(item => {
      const question = this.questionsByLinkId[item.linkId];
      if (question) {
        if (question.item && question.item.length > 0) {
          value[item.linkId] = value[item.linkId] || {};
          this.recurseAnswers(item.item, value[item.linkId]);
        } else {
          let responseValue = this.answerValue(item, question);
          if (question.type === 'time') {
            const hhmm = (responseValue || '00:00').match(/(\d?\d)\:(\d?\d)/);
            const [, hh, mm] = hhmm || ['', '00', '00'];
            responseValue = {
              hh, mm
            };
          }
          value[item.linkId] = value[item.linkId] || responseValue;
          if (question.repeats) {
            const arr = this.arrayFormsByLinkId[item.linkId];
            for (let i = arr.length - 1; i >= 0; i--) { arr.removeAt(i); }
            if (arr.length !== value[item.linkId].length) {
              for (let i = 0; i < value[item.linkId].length; i++) {
                arr.controls.push(this.fb.group({
                  code: '',
                  display: '',
                  system: ''
                }));
              }
            }
          }
        }
      }
    });
    return value;
  }

  onAnswersChanged() {
    this.currentAnswer = (this.answers || []).reduce((prev: fhir.QuestionnaireResponse, current: fhir.QuestionnaireResponse) => {
      if (!prev || current.meta.lastUpdated > prev.meta.lastUpdated) {
        return current;
      }
      return prev;
    }, null);

    const formValue: any = {};
    this.recurseAnswers(this.currentAnswer ? this.currentAnswer.item : [], formValue);
    console.log('finished updating answers');

    this.questionnaireForm.reset(formValue, { emitEvent: false} );
    if (this.questions) {
      this.questions.forEach(q => q.checkEnabled(this.currentAnswer));
    }
    console.log('finished checking conditionals(a)');

    this.changeDetection.detectChanges();
    this.questionnaireForm.updateValueAndValidity();
  }

  async save() {
    console.log('Saving responses');
    if (this.questionnaire) {
      try {
        await this.fhirService.save(this.currentAnswer).toPromise();
        console.log('Saved');
        this.changesSaved.emit({ questionnaire: this.questionnaire, answer: this.currentAnswer});

        // Allow a timeout so other notifications suppress this one if needed.
        setTimeout(() => {
          if (!this.snackbar._openedSnackBarRef) {
            this.snackbar.open('Changes Saved', 'Close', {
              duration: 2000,
            });
          }
        }, 400);
      } catch (err) {
        console.error(err);
      }
    }
  }

  get valid() {
    return this._valid;
  }

  private toQuestionnaireResponse(items: fhir.QuestionnaireItem[], group: FormGroup, responseGroup?: fhir.QuestionnaireResponseItem | fhir.QuestionnaireResponse) {
    (items || []).forEach(item => {
      let answerItem = this.questionnaireService.getItemAnswer(item.linkId, this.currentAnswer);
      if (!answerItem) {
        answerItem = {
          linkId: item.linkId,
          definition: item.definition,
          text: item.text,
        };
        responseGroup.item = responseGroup.item || [];
        responseGroup.item.push(answerItem);
      }
      if (item.type === 'group') {
        this.toQuestionnaireResponse(item.item, group.get(item.linkId) as FormGroup, answerItem);
      } else {
        if (item.linkId) {
          const answerValue = group.get(item.linkId).value;
          if (answerItem) {
            switch (item.type) {
              case 'string':
              case 'text':
                answerItem.answer = [{
                  valueString:  answerValue ? String(answerValue) : null
                }];
                break;
              case 'boolean':
                answerItem.answer = [{
                  valueBoolean: Boolean(answerValue)
                }];
                break;
              case 'integer':
                answerItem.answer = [{
                  valueInteger: Number(answerValue)
                }];
                break;
              case 'decimal':
                answerItem.answer = [{
                  valueDecimal: Number(answerValue)
                }];
                break;
              case 'date':
                answerItem.answer = [{
                  valueDate:  answerValue ? moment(answerValue).toISOString() : null
                }];
              break;
              case 'dateTime':
              answerItem.answer = [{
                valueDateTime: answerValue ? moment(answerValue).toISOString() : null
              }];
              break;
              case 'time':
              answerItem.answer = [{
                valueTime:  answerValue ? `${answerValue.hh}:${answerValue.mm}` : null
              }];
              break;
              case 'choice':
                if (item.repeats) {
                  answerItem.answer = answerValue.map(v => {
                    return {
                      valueCoding: v
                    };
                  });
                } else {
                  answerItem.answer = [{
                    valueCoding: answerValue
                  }];
                }
              break;
              case 'open-choice':
                if (item.repeats) {
                  answerItem.answer = answerValue.map(v => {
                    return {
                      valueCoding: v
                    };
                  });
                } else {
                  if (answerValue.code === 'otherOption') {
                    answerItem.answer = [{
                      valueString: answerValue.otherOptionText
                    }];
                  } else {
                    answerItem.answer = [{
                      valueCoding: answerValue
                    }];
                  }
                }
              break;
              case 'quantity':
                answerItem.answer = [{
                  valueQuantity: answerValue,
                }];
              break;
            }
          }
        }
      }
    });
  }

  private answerValue(item: fhir.QuestionnaireResponseItem, question: fhir.QuestionnaireItem): any {
    const initialValue = question[`initial${capitalize(question.type)}`] || question[`initialString`];
    if (!item.answer || item.answer.length === 0) {
      if (initialValue) {
        return initialValue;
      }
      if (question.repeats) {
        return [];
      } else {
        if (question.type === 'choice' || question.type === 'open-choice') {
          return {};
        } else {
          return null;
        }
      }
    } else {
      // return the first valueXXX
      // todo, deal with multi valued answers
      if (question.repeats) {
        return item.answer.map(a => toValueString(a));
      } else {
        const value = toValueString(item.answer[0]);
        if (initialValue && typeof initialValue === 'object') {
          return Object.assign(initialValue, value);
        } else {
          return value;
        }
      }
    }
  }

}
