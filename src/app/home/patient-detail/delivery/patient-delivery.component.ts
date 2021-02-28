import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarePlanUtils } from '../../../services/care-plan-utils';
import { FhirService } from '../../../services/fhir.service';
import { Observable, Subject, Subscription, ReplaySubject } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatVerticalStepper } from '@angular/material/stepper';
import { take } from 'rxjs/operators';
import { CarePlanService } from 'src/app/services/care-plan.service';
import { QuestionnaireService } from 'src/app/services/questionnaire.service';
import { ReviewComponent } from './review/review.component';
import { SCORING_FUNCTIONS } from 'src/app/utils/score-functions';
import { DischargeReportComponent } from '../discharge-report/discharge-report.component';
import { LoaderService } from '@cardihab/angular-fhir';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  DischargeConfirmationComponent,
  TransitionOption
} from '../discharge/discharge-confirmation/discharge-confirmation.component';
import { UserRegistrationsService } from '../../../services/user-registrations.service';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';

@Component({
  selector: 'app-patient-delivery',
  templateUrl: './patient-delivery.component.html',
  styleUrls: ['./patient-delivery.component.scss']
})

export class PatientDeliveryComponent implements OnInit, OnDestroy {
  patient: fhir.Patient;
  carePlan: fhir.CarePlan;

  deliveryActivities$: Subject<{ activity: fhir.CarePlanActivity, appointment: fhir.Appointment }[]> = new ReplaySubject(1);
  selectedReview = 0;
  selectedActivity: fhir.CarePlanActivity;
  previousActivity: fhir.CarePlanActivity;
  reviewStatus$: Subject<string> = new Subject();
  appointments: { [key: string]: Observable<fhir.Appointment> } = {};
  editingReview = false;
  isProgressReport = false;

  @ViewChild(MatVerticalStepper, { static: false })
  stepper: MatVerticalStepper;

  @ViewChild(ReviewComponent)
  review: ReviewComponent;

  finalAssessments: fhir.CarePlanActivity[];

  finalAssessmentResponses: {
    [key: string]: fhir.QuestionnaireResponse[];
  } = {};

  @ViewChild(DischargeReportComponent)
  dischargeReport: DischargeReportComponent;

  routerSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private fhirService: FhirService,
    private carePlanService: CarePlanService,
    private questionnaireService: QuestionnaireService,
    private userRegistration: UserRegistrationsService,
    public dialog: MatDialog,
    private loader: LoaderService,
    private snackbar: MatSnackBar) { }

  async ngOnInit() {
    this.patient = this.route.parent.snapshot.data['patient'];
    this.carePlan = CarePlanUtils.findCurrent(this.route.parent.snapshot.data['carePlan']);
    if (this.patient && this.carePlan) {
      const promises = (this.carePlan.activity || []).
        filter(act => CarePlanUtils.isWeeklyReview(act) || CarePlanUtils.isFinalAssessment(act))
        .map(async activity => {
          const appointment = (activity && activity.reference && activity.reference.reference) ?
            await this.fhirService.reference<fhir.Appointment>(activity.reference, this.carePlan).toPromise() :
            undefined;
          return {
            activity,
            appointment
          };
        });
      const activitiesAppointments = (await Promise.all(promises) || []).filter(a => a.appointment && a.appointment.status !== 'cancelled');
      activitiesAppointments.sort((a, b) => {
        let aStartP, bStartP, aEndP, bEndP;
        if (a.appointment) {
          aStartP = a.appointment.start;
          aEndP = a.appointment.end;
        }
        if (b.appointment) {
          bStartP = b.appointment.start;
          bEndP = b.appointment.end;
        }
        const diff = aStartP && bStartP ? aStartP.localeCompare(bStartP) : 0;
        return diff === 0 ? aEndP?.localeCompare(bEndP) : diff;
      });
      this.deliveryActivities$.next(activitiesAppointments);

      const nextReview = activitiesAppointments.findIndex((activityXapp) => (activityXapp.activity.detail.status !== 'completed'));
      if (nextReview >= 0) {
        this.selectedReview = nextReview;
      }
      this.onStepperSelectionChange({ selectedIndex: this.selectedReview });
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  public async onStepperSelectionChange(event: any) {
    if (event.selectedIndex !== this.stepper?.steps.length - 1) {
      this.isProgressReport = false;
    } else {
      return;
    }
    const activities = await this.deliveryActivities$.pipe(take(1)).toPromise();
      if (activities && activities.length > event.selectedIndex) {
        this.selectedReview = event.selectedIndex;
        this.selectedActivity = activities[event.selectedIndex].activity;
        if (this.selectedReview > 0) {
          this.previousActivity = activities[this.selectedReview - 1].activity;
        }
      }
      // Keep the previous activity to be able to tell if we can start the current one or not

  }


  download() {
    this.dischargeReport.download();
  }

  onStepClick(event) {
    console.log(event);
  }

  editReview() {
    this.reviewStatus$.next('edit');
    this.editingReview = true;
  }

  startReview() {
    // confirmation dialog pop up
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        text: `Are you sure you want to start ${this.selectedActivity.detail.description}?`,
      } // confirmation dialog closed
    }).afterClosed().subscribe(result => {
      if (result) {
        this.reviewStatus$.next('start');
      }
    });
  }

  completeReview() {
    if (this.review.questionnaireComponent.valid) {
      // confirmation dialog pop up
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          text: `Are you sure you want to complete ${this.selectedActivity.detail.description}?`
        } // confirmation dialog closed
      }).afterClosed().subscribe(async result => {
        if (result) {
          this.reviewStatus$.next('complete');

          this.editingReview = false;

          const activityCodesScoring = (((this.selectedActivity.detail || {}).code || {}).coding || []).map(c => SCORING_FUNCTIONS[`${c.system}/${c.code}`]);
          const scoreFunction = activityCodesScoring.find(ac => ac);
          if (scoreFunction) {
            // score the questionnaire
            const response = this.review.questionnaireComponent.currentAnswer;
            const score = await this.questionnaireService.scoreActivityQuestionnaire(this.carePlan.subject, this.selectedActivity, response);
            await this.fhirService.saveAll([this.carePlan, score]).toPromise();
            console.log(score);
          }
        }
      });
    } else {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          title: 'Incomplete review',
          text: 'You must answer required questions'
        }
      });
    }
  }

  dischargePatient() {
    // confirmation dialog pop up
    const dischargeDialogRef = this.dialog.open(DischargeConfirmationComponent, {
      data: {
        patient: this.patient,
        carePlan: this.carePlan,
        finalAssessments: null
      } // confirmation dialog closed
    });
    dischargeDialogRef.afterClosed()
      .subscribe(async (result?: { transition: TransitionOption, transitionTo, unregister: boolean }) => {
        if (result) {
          // discharge the patient
          const satisfactoryResponse = await this.carePlanService.getSatisfactoryResponse(this.patient, this.carePlan, this.finalAssessments);
          if (satisfactoryResponse === void 0) {
            this.snackbar.open('Could not discharge', 'Close', {
              duration: 2000,
            });
          } else {
            this.loader.start('Discharging patient');
            try {
              await this.carePlanService.discharge(this.carePlan, this.patient, satisfactoryResponse);
              const identifier = this.patient.identifier.find(id => id.system === 'urn:uuid');
              if (identifier && identifier.value) {
                if (result.transition === TransitionOption.archive) {
                  if (result.unregister) {
                    this.userRegistration.rejectRegistration(identifier.value);
                  } else {
                    this.userRegistration.archive(identifier.value, this.fhirService.tenancy);
                  }
                } else if (result.transition === TransitionOption.plan) {
                  const eoc = await this.fhirService.reference(this.carePlan.context, this.carePlan).toPromise() as fhir.EpisodeOfCare;
                  const transitionBundle = await this.carePlanService.create(result.transitionTo, `Patient/${this.patient.id}`, eoc.managingOrganization.reference);
                  await this.fhirService.save({
                    resourceType: 'Bundle',
                    type: 'transaction',
                    entry: transitionBundle
                  }).toPromise();
                }
              }
            } finally {
              this.loader.stop();
            }
          }
        }
      });
  }

  progressReport() {
    this.isProgressReport = true;
    this.selectedReview = (this.stepper.steps.length - 1);
  }

  get canDischarge() {
    const fa = this.carePlan.activity.find(activity => CarePlanUtils.isFinalAssessment(activity));
    return (fa && fa.detail && fa.detail.status === 'completed');
  }
}
