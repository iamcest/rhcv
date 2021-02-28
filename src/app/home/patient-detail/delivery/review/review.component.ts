import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, QueryList, ViewChild, Output, EventEmitter  } from '@angular/core';
import { CarePlanService } from '../../../../services/care-plan.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { FhirService } from '../../../../services/fhir.service';
import * as moment from 'moment';
import { PatientService } from '../../../../services/patient.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PractitionerService } from '../../../../services/practitioner.service';
import { observableToReplaySubject } from '../../../../utils';
import { CarePlanUtils } from '../../../../services/care-plan-utils';
import { ErrorDialogComponent } from '../../../../components/error-dialog/error-dialog.component';
import { QuestionnaireComponent } from '../../questionnaire/questionnaire.component';
import { MatDialog } from '@angular/material/dialog';

export enum ReminderFrequency {
  Next = 'Add For Next Review',
  Remaining = 'Add For All Remaining Reviews',
}

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnChanges, OnInit, OnDestroy {
  reviewNoteText: string;

  @Output() statusChange = new EventEmitter<QueryList<QuestionnaireComponent>>();

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  activity: fhir.CarePlanActivity;

  @Input()
  activities: { activity: fhir.CarePlanActivity, appointment: fhir.Appointment }[];

  @Input()
  reviewStatus$: Subject<string>;

  reviewEncounter: fhir.Encounter | fhir.EpisodeOfCare;

  notes: fhir.Annotation[] = [];

  started = false;
  startTime: moment.Moment;
  completeTime: moment.Moment;
  practitioner: fhir.Practitioner;
  practitioners: Map<string, Observable<fhir.Practitioner>> = new Map();

  questionnaire: fhir.Questionnaire;
  answers: fhir.QuestionnaireResponse[];

  reminderText: string;
  reminderFrequency: ReminderFrequency = ReminderFrequency.Next;
  ReminderFrequency = ReminderFrequency;
  reminders: fhir.Annotation[] = [];

  reviewStatusSubscription: Subscription;
  readonly scrollCallback: () => void;

  @ViewChild(QuestionnaireComponent)
  questionnaireComponent: QuestionnaireComponent;

  constructor(
    private carePlanService: CarePlanService,
    private fhirService: FhirService,
    private patientService: PatientService,
    private practitionerService: PractitionerService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {

    // This is the way to make sure 'Add note' panel floats above everything
    // And then pops back under the footer when you scroll all the way down
    const scroller = <HTMLElement>document.getElementsByClassName('scrollable-content')[0];
    this.scrollCallback = () => this.placeAddNotePanel();
    if (scroller) {
      scroller.addEventListener('scroll', this.scrollCallback);
    }
  }

  ngOnInit() {
    this.practitionerService.current.subscribe(p => {
      this.practitioner = p;
      this.practitioners.set(`${p.resourceType}/${p.id}`, of(p));
    });

    if (this.reviewStatus$) {
      this.reviewStatusSubscription = this.reviewStatus$.subscribe(value => {
        switch (value) {
          case 'start': {
            this.startReview().then(() => {
              this.snackbar.open('Review Started', 'Close', {
                duration: 2000,
              });
            });
            break;
          }
          case 'complete': {
            this.completeReview().then(() => {
              this.snackbar.open('Review Completed', 'Close', {
                duration: 2000,
              });
            });
            break;
          }
          case 'edit': {
            this.editReview();
            this.snackbar.open(`Editing ${this.activity && this.activity.detail ? this.activity.detail.description : 'Review'}`, 'Close', {
              duration: 2000,
            });
            break;
          }
        }
      });
    }
  }

  placeAddNotePanel() {
    {
      const scroller = <HTMLElement>document.getElementsByClassName('scrollable-content')[0];
      const footer = <HTMLElement>document.getElementsByClassName('footer-container')[0];
      const noteContainer = <HTMLElement>document.getElementsByClassName('week-review-footer-wrapper')[0];
      const scrollBottom = scroller.scrollTop + scroller.offsetHeight;
      const footerTop = noteContainer ? (noteContainer.classList.contains('sticky') ? footer.offsetTop
        - noteContainer.offsetHeight : footer.offsetTop) : footer.offsetTop;

      if (noteContainer) {
        if (scrollBottom >= footerTop) {
          noteContainer.classList.add('sticky');
        } else {
          noteContainer.classList.remove('sticky');
        }
      }
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    // Reset the frequency
    this.reminderFrequency = ReminderFrequency.Next;

    if (this.patient && this.activity) {

      // Set started to the review currently in progress to enable ui controls
      this.started = this.activity.detail.status === 'in-progress';

      /* Create a collection of practitioners who left comments to fetch and display their names.
         Using ReplaySubject so that items are fetched only once */
      if (this.activity.progress) {
        this.activity.progress.forEach(item => {
          if (!this.practitioners.has(item.authorReference.reference)) {
            this.practitioners.set(item.authorReference.reference,
              observableToReplaySubject(this.fhirService.reference<fhir.Practitioner>(item.authorReference, this.carePlan)));
          }
        });
      }

      const questionnaire = await this.fhirService.reference<fhir.Questionnaire>(this.activity.detail.definition, this.carePlan).toPromise();
      let answersResponse;

      const encounterReference = (this.activity.outcomeReference || []).find(ref => ref.reference.indexOf('Encounter') === 0);
      if (encounterReference) {
        this.reviewEncounter = await this.fhirService.reference<fhir.Encounter>(encounterReference, this.carePlan).toPromise();
        answersResponse = await this.carePlanService.answers(this.activity, this.patient, encounterReference).toPromise();
      } else {
        this.reviewEncounter = await this.fhirService.reference<fhir.EpisodeOfCare>(this.carePlan.context, this.carePlan).toPromise();
        answersResponse = await this.carePlanService.answers(this.activity, this.patient, this.carePlan.context).toPromise();
      }

      const newItems: any[] = [];
      for (let i = 0; i < questionnaire.item.length; i++) {
        if (questionnaire.item[i].linkId !== 'additional-notes') {
          newItems.push(questionnaire.item[i]);
        }
      }
      questionnaire.item = newItems;
      this.questionnaire = questionnaire;
      this.answers = (answersResponse.entry || []).map(e => e.resource);

      if (this.activity && Array.isArray(this.activity.progress)) {
        this.notes = this.activity.progress.filter(item => !item.extension);
      } else {
        this.notes = [];
      }

      if (this.activity && Array.isArray(this.activity.progress)) {
        this.reminders = this.activity.progress
          .filter(item => item.extension && item.extension
            .find(ext => ext.url === FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER));
      } else {
        this.reminders = [];
      }
    }
  }

  ngOnDestroy(): void {
    if (this.reviewStatusSubscription) {
      this.reviewStatusSubscription.unsubscribe();
    }
    document.removeEventListener('scroll', this.scrollCallback);
  }

  async startReview() {
    this.started = true;
    this.activity.detail.status = 'in-progress';
    this.startTime = moment();
    this.activity.detail.scheduledPeriod = {
      start: this.startTime.format()
    };
    this.reviewEncounter = await this.fhirService.save<fhir.Encounter>(this.patientService.createResponseContext(this.patient, this.carePlan, this.activity)).toPromise();
    this.activity.outcomeReference = [{ reference: `Encounter/${this.reviewEncounter.id}` }];
    const questionnaireResponse = await this.fhirService.save<fhir.QuestionnaireResponse>(this.patientService.createResponse(this.patient, this.questionnaire, { reference: `Encounter/${this.reviewEncounter.id}` })).toPromise();
    this.answers = [questionnaireResponse];

    return this.fhirService.save<fhir.CarePlan>(this.carePlan).toPromise();
  }

  async completeReview() {
    this.started = false;
    this.completeTime = moment();
    this.answers[0].status = this.questionnaireComponent.valid ? 'completed' : 'in-progress';
    this.answers[0].authored = this.completeTime.format();
    this.questionnaireComponent.save();

    const modified: any[] = [this.carePlan];
    if (this.activity.reference) {
      const appointment = await this.fhirService.reference<fhir.Appointment>(this.activity.reference, this.carePlan).toPromise();
      appointment.status = 'fulfilled';
      modified.push(appointment);
    }
    this.activity.detail.status =  this.questionnaireComponent.valid ? 'completed' : 'in-progress';
    this.activity.detail.scheduledPeriod.end = this.completeTime.format();
    return this.fhirService.saveAll(modified).toPromise();
  }

  editReview() {
    this.started = true;
  }

  onReminderChange(value) {
    this.reminderFrequency = value;
  }

  addProgressItem(activity: fhir.CarePlanActivity, item: fhir.Annotation) {
    if (activity) {
      if (!activity.progress) {
        activity.progress = <fhir.Annotation[]>[];
      }

      activity.progress.push(item);
    }

    return activity;
  }

  addReviewNote(note: fhir.Annotation) {
    this.activity = this.addProgressItem(this.activity, note);

    this.fhirService.save(this.carePlan).toPromise().then(() => {
      this.reviewNoteText = '';
      this.snackbar.open('Note has been added and will be shown at the bottom of this page', 'Close', {
        duration: 2000,
      });
    });
  }

  addReminder() {
    if (!this.reminderText) {
      // error dialog pop up
      this.dialog.open(ErrorDialogComponent, {
        data: {
          title: 'Error adding reminder',
          text: 'Review topic cannot be empty. Please enter review topic text and try again.'
        }
      });
      return;
    }

    const reminder: fhir.Annotation = {
      text: this.reminderText,
      authorReference: { reference: `${this.practitioner.resourceType}/${this.practitioner.id}` },
      time: moment().format(),
      /* The difference between a note and a reminder is an extension
         that holds a value of the week the reminder was set up on */
      extension: [{
        url: FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER,
        valueBoolean: false
      }]
    };

    let snackBarText = 'Review topics have';
    const activityIndex = this.activities.findIndex(a => {
      return a.activity.detail && this.activity.detail &&
        a.activity.detail.description === this.activity.detail.description &&
        a.activity.detail.definition === this.activity.detail.definition &&
        a.activity.detail.scheduledPeriod === this.activity.detail.scheduledPeriod;
    });

    for (let i = activityIndex + 1; i < this.activities.length; i++) {
      this.addProgressItem(this.activities[i].activity, reminder);

      if (this.reminderFrequency === ReminderFrequency.Next) {
        snackBarText = 'Review topic has';
        // Only run for the next week and exit immediately
        break;
      }
    }

    this.reminderText = '';

    this.fhirService.save<fhir.CarePlan>(this.carePlan).toPromise().then(() => {
      this.snackbar.open(`${snackBarText} been added and will be shown at the bottom of this page`, 'Close', {
        duration: 2000,
      });
    });
  }

  updateReminderStatus($event: MatCheckboxChange, reminder: fhir.Annotation) {
    const ext = reminder.extension.find(item => item.url === FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER);
    if (ext) {
      ext.valueBoolean = $event.checked;
    }

    this.fhirService.save<fhir.CarePlan>(this.carePlan).toPromise();
  }

  getReminderCheckedStatus(reminder: fhir.Annotation) {
    const extension = reminder.extension
      .find(ext => ext.url === FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER);
    return FhirService.flattenExtension(extension);
  }

  isCarePlanIncomplete(): boolean {
    return CarePlanUtils.isCarePlanIncomplete(this.carePlan);
  }

  get addNotePlaceholderText() {
    const desc = this.activity && this.activity.detail && this.activity.detail.description ? ` ${this.activity.detail.description}` : ``;
    return `Add a${desc} note`;
  }
}
