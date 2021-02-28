import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { PatientService } from '../../../../services/patient.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CarePlanUtils } from '../../../../services/care-plan-utils';
import { DischargeReportComponent } from '../../discharge-report/discharge-report.component';
import { TransitionOption, DischargeConfirmationComponent } from '../../discharge/discharge-confirmation/discharge-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '@cardihab/angular-fhir';
import { UserRegistrationsService } from 'src/app/services/user-registrations.service';
import { FhirService } from 'src/app/services/fhir.service';
import { CarePlanService } from 'src/app/services/care-plan.service';

@Component({
  selector: 'app-plan-history',
  templateUrl: './plan-history.component.html',
  styleUrls: ['./plan-history.component.scss']
})
export class PlanHistoryComponent implements OnInit {
  @Input()
  patient: fhir.Patient;

  plans$: Observable<fhir.CarePlan[]>;
  currentPlan: fhir.CarePlan;

  @ViewChildren(DischargeReportComponent)
  dischargeReports: QueryList<DischargeReportComponent>;

  constructor(
    private patientService: PatientService,
    public dialog: MatDialog,
    private loader: LoaderService,
    private userRegistration: UserRegistrationsService,
    private fhirService: FhirService,
    private carePlanService: CarePlanService,
  ) { }

  ngOnInit() {
    this.plans$ = this.patientService.patientCarePlans(this.patient)
    .pipe(
      map(response => {
        return response.total > 0 ? response.entry.map(e => e.resource) : [];
      }),
      tap(plans => {
        this.currentPlan = CarePlanUtils.findCurrent(plans);
      })
    );
  }

  downloadDischargeReport(reportIndex: number) {
    this.dischargeReports.toArray()[reportIndex].download();
  }

  async transitionPlan() {
    // confirmation dialog pop up
    const dischargeDialogRef = this.dialog.open(DischargeConfirmationComponent, {
      data: {
        patient: this.patient,
        carePlan: this.currentPlan,
        action: 'Start New Plan',
        defaultTransition: 'plan'
        // finalAssessments: this.finalAssessmentResponses
      } // confirmation dialog closed
    });

    dischargeDialogRef.afterClosed()
    .subscribe({
      next: async (result?: {transition: TransitionOption, transitionTo, unregister: boolean}) => {
        if (result) {
          // discharge the patient
          this.loader.start('Starting New Plan');
          try {
            const identifier = this.patient.identifier.find(id => id.system === 'urn:uuid');
            if (identifier && identifier.value) {
              if (result.transition === TransitionOption.archive) {
                if (result.unregister) {
                  this.userRegistration.rejectRegistration(identifier.value);
                } else {
                  this.userRegistration.archive(identifier.value, this.fhirService.tenancy);
                }
              } else if (result.transition === TransitionOption.plan) {
                const eoc = await this.fhirService.reference(this.currentPlan.context, this.currentPlan).toPromise() as fhir.EpisodeOfCare;
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
            location.reload();
          }
        }
      }
    });
  }

}
