import { Component, OnInit, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DemographicsComponent } from './demographics/demographics.component';
import { FhirService } from '../../../services/fhir.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarePlanService } from '../../../services/care-plan.service';
import { PatientService } from '../../../services/patient.service';
import { CarePlanUtils } from '../../../services/care-plan-utils';
import { ConfirmationDialogComponent } from '../../../components/confirmation-dialog/confirmation-dialog.component';
import { DialogData } from '../../../components/dialog-header/dialog-header.component';
import { ReplaySubject } from 'rxjs';
import { cloneDeep } from 'lodash';
import { RegionalConfigService, LoaderService } from '@cardihab/angular-fhir';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ReviewScheduleComponent } from './review-schedule/review-schedule.component';
import { MatStepper } from '@angular/material/stepper';
import { QuestionnaireComponent } from '../questionnaire/questionnaire.component';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent implements OnInit, AfterViewInit {
  static STEPS = ['history', 'identification', 'schedule', 'initialAssessment', 'customisation'];

  statusDisplayNames = {
    draft: 'Design',
    active: 'Delivery',
    'entered-in-error': 'Deleted',
    completed: 'Discharged',
    cancelled: 'Discharged'
  };

  expanded = DesignComponent.STEPS[1];

  patient: fhir.Patient;
  backupPatient: fhir.Patient;

  carePlan: fhir.CarePlan;
  episodeOfCare: fhir.EpisodeOfCare | fhir.Encounter;
  editingDemographics = false;

  @ViewChild(DemographicsComponent)
  demographics: DemographicsComponent;

  @ViewChild(ReviewScheduleComponent)
  schedule: ReviewScheduleComponent;

  @ViewChildren(QuestionnaireComponent)
  questionnaireComponents: QueryList<QuestionnaireComponent>;


  @ViewChild(MatStepper)
  designStepper: MatStepper;

  finalAssessmentResponses: {
    [key: string]: fhir.QuestionnaireResponse[];
  } = {};

  demographicValid = true;

  initialAssesmentQuestionnaires$ = new ReplaySubject<{
    questionnaire: fhir.Questionnaire;
    response: fhir.QuestionnaireResponse[];
  }[]>(1);

  initialAssessment = {
    valid: false,
    edit: false,
    loading: false,
    status: undefined
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fhirService: FhirService,
    private patientService: PatientService,
    private carePlanService: CarePlanService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
    private loader: LoaderService,
    private regionConfig: RegionalConfigService) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  async ngOnInit() {
    this.patient = this.route.parent.snapshot.data['patient'];
    const carePlans: fhir.CarePlan[] = this.route.parent.snapshot.data['carePlan'];
    this.carePlan = CarePlanUtils.findCurrent(carePlans);
    if (!this.patient) {
      this.editingDemographics = true;
    } else {
      if (this.carePlan) {
        this.episodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare | fhir.Encounter>(this.carePlan.context, this.carePlan).toPromise();
        this.onCarePlanChange();
      }
    }
  }

  ngAfterViewInit() {
    if (this.carePlan && this.carePlan.status === 'active') {
      this.designStepper.steps.toArray()[2].completed = true;
    }
  }

  private async onCarePlanChange() {
    this.initialAssessment.edit = this.carePlan.status === 'draft' || this.carePlan.status === 'active';
    const iaActivities = (this.carePlan.activity || []).filter(activity => CarePlanUtils.isInitialAssessment(activity) && activity.detail.definition);
    try {
      const qAndA = await this.carePlanService.findQuestionsAndAnswers(iaActivities, this.patient, this.carePlan.context);
      const answerModel = [];
      for (const questionnaire of qAndA.questionnaires) {
        answerModel.push({
          questionnaire,
          response: await this.responseFor(questionnaire, qAndA.responses)
        });
      }
      this.initialAssesmentQuestionnaires$.next(answerModel);
    } finally {
      this.initialAssessment.loading = false;
    }
  }



  async onAnswersChange(event: { questionnaire: fhir.Questionnaire, answer: fhir.QuestionnaireResponse }) {
    // Only update goals if the program hasn't started yet
    if (this.carePlan.status === 'draft') {
      this.carePlanService.updateGoalStatus(this.patient, this.carePlan, event.questionnaire, event.answer);
    }

    if (this.carePlan.status === 'active') {
      this.carePlanService.updateAddresses(this.patient, this.carePlan, event.questionnaire, event.answer);
    }
  }

  async responseFor(questionnaire: fhir.Questionnaire, responses): Promise<fhir.QuestionnaireResponse[]> {
    const ref = `${this.fhirService.getContextBaseUrl(questionnaire)}/Questionnaire/${questionnaire.id}`;
    if (!responses[ref]) {
      const createdResponse = await this.fhirService.save<fhir.QuestionnaireResponse>(this.patientService.createResponse(this.patient, questionnaire, this.carePlan.context)).toPromise();
      return [createdResponse];
    }
    return responses[ref];
  }


  async activatePlan() {
    // confirmation dialog pop up
    this.dialog.open(ConfirmationDialogComponent, {
      data: <DialogData>{
        text: `Are you sure you want to start this care plan? You will not be able to modify the start date after it's started.`
      } // confirmation dialog closed
    }).afterClosed().subscribe(async result => {
      if (result) {
        this.loader.start('Starting');
        // This is to reload careplan and make sure activities' references are correct
        // Will be fixed as a part of PAM-117
        this.carePlan = await this.fhirService.get<fhir.CarePlan>('CarePlan', this.carePlan.id).toPromise();
        const activationResult = await this.carePlanService.activate(this.carePlan);
        this.snackbar.open('Saved', '', {
          duration: 2000,
        });
        // reload this page with the updated careplan in it
        if (activationResult.total > 0 && activationResult.entry[0].response.status === '200 OK' || activationResult.entry[0].response.status === '201 Created') {
          location.reload();
        }
        this.loader.stop();
      }
    });
  }

  async cancelPlan() {
    // confirmation dialog pop up
    this.dialog.open(ConfirmationDialogComponent, {
      data: <DialogData>{
        text: 'Are you sure you want to delete this patient and their care plan?'
      } // confirmation dialog closed
    }).afterClosed().subscribe(result => {
      if (result) {
        // cancel current program and deactivate the patient
        this.carePlanService.cancelProgram(this.carePlan, this.patient).then(() => {
          // go back to the patient list
          this.router.navigate([`/${this.regionConfig.region}/home`, 'patients'], { skipLocationChange: true });

        });
      }
    });
  }


  editDemographics() {
    this.backupPatient = cloneDeep(this.patient);
    this.editingDemographics = true;
  }

  reset() {
    this.editingDemographics = false;
    this.demographics.resetForm(this.backupPatient);

    if (!this.patient) {
      // go back to the patient list
      this.router.navigate([`/${this.regionConfig.region}/home`, 'patients'], { skipLocationChange: true });
    }
  }

  onStepperSelectionChange($event: StepperSelectionEvent) {
    this.expanded = DesignComponent.STEPS[$event.selectedIndex];
  }

  onDemographicStatusChange($event) {
    this.demographicValid = $event === 'DISABLED' || $event === 'VALID';
  }

  onAssessmentStatusChange($event) {
    setTimeout(() => {
      this.initialAssessment.status = $event;
    });
  }

  get canStart() {
    if (this.carePlan) {
      return this.initialAssessment.status === 'VALID' && (this.carePlan.status === 'draft' || this.carePlan.status === 'suspended') &&
        (this.carePlan.activity || []).some(activity => activity.reference && activity.reference.reference);
    }
    return false;
  }
}

