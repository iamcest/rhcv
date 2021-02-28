import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarePlanService } from '../../../services/care-plan.service';
import { PatientService } from '../../../services/patient.service';
import { CarePlanUtils } from '../../../services/care-plan-utils';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FhirService } from '../../../services/fhir.service';
import {
  DischargeConfirmationComponent,
  TransitionOption
} from './discharge-confirmation/discharge-confirmation.component';
import { UserRegistrationsService } from '../../../services/user-registrations.service';
import { LoaderService } from '@cardihab/angular-fhir';
import { QuestionnaireComponent } from '../questionnaire/questionnaire.component';
import { DischargeReportComponent } from '../discharge-report/discharge-report.component';



@Component({
  selector: 'app-patient-discharge',
  templateUrl: './patient-discharge.component.html',
  styleUrls: ['./patient-discharge.component.scss']
})
export class PatientDischargeComponent implements OnInit {
  patient: fhir.Patient;
  carePlan: fhir.CarePlan;

  finalAssessments: fhir.CarePlanActivity[];
  finalAssessmentQuestionnaires: fhir.Questionnaire[];
  finalAssessmentResponses: {
    [key: string]: fhir.QuestionnaireResponse[];
  } = {};

  @ViewChildren(QuestionnaireComponent)
  questionnaireComponents: QueryList<QuestionnaireComponent>;

  @ViewChild(DischargeReportComponent)
  dischargeReport: DischargeReportComponent;

  expanded = {
    assessment: false,
    report: false
  };

  private _isValid = false;

  constructor(private route: ActivatedRoute,
    private carePlanService: CarePlanService,
    private patientService: PatientService,
    private fhirService: FhirService,
    private userRegistration: UserRegistrationsService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private loader: LoaderService
  ) { }

  async ngOnInit() {
    this.patient = this.route.parent.snapshot.data['patient'];
    this.carePlan = CarePlanUtils.findCurrent(this.route.parent.snapshot.data['carePlan']);
    this.expanded.assessment = this.isCarePlanIncomplete();
    this.expanded.report = !this.isCarePlanIncomplete();

    if (this.patient && this.carePlan) {
      this.finalAssessments = this.carePlan.activity.filter(act => CarePlanUtils.isFinalAssessment(act));
      if (this.finalAssessments.length > 0) {
        try {
          const qa = await this.carePlanService.findQuestionsAndAnswers(this.finalAssessments, this.patient, this.carePlan.context);
          this.finalAssessmentQuestionnaires = qa.questionnaires;
          this.finalAssessmentResponses = qa.responses;
          this._isValid = !this.questionnaireComponents.some(q => !q.valid);
        } catch (err) {
          console.error(err);
        }
      } else {
        this._isValid = true;
      }
    }
  }

  get valid() {
    return this._isValid;
  }

  async onAnswersChange(event: { questionnaire: fhir.Questionnaire, answer: fhir.QuestionnaireResponse }) {

    setTimeout(() => {
      this._isValid = !this.questionnaireComponents.some(q => !q.valid);
    });
  }

  responseFor(questionnaire: fhir.Questionnaire) {
    const ref = `${this.fhirService.getContextBaseUrl(questionnaire)}/Questionnaire/${questionnaire.id}`;
    if (!this.finalAssessmentResponses[ref]) {
      this.finalAssessmentResponses[ref] = [this.patientService.createResponse(this.patient, questionnaire, this.carePlan.context)];
    }
    return this.finalAssessmentResponses[ref];
  }


  dischargePatient() {
    // confirmation dialog pop up
    const dischargeDialogRef = this.dialog.open(DischargeConfirmationComponent, {
      data: {
        patient: this.patient,
        carePlan: this.carePlan,
        finalAssessments: this.finalAssessmentResponses,
        type: 'REPORT'
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

  isCarePlanIncomplete(): boolean {
    return CarePlanUtils.isCarePlanIncomplete(this.carePlan);
  }

  download() {
    this.dischargeReport.download();
  }
}
