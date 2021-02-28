import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PractitionerService } from '../../../../services/practitioner.service';
import { map } from 'rxjs/operators';
import { PatientService } from '../../../../services/patient.service';
import { FhirService } from '../../../../services/fhir.service';
import { IOrganisationAttributes } from '../../../home.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export enum TransitionOption {
  archive = 'archive',
  plan = 'plan'
}

@Component({
  selector: 'app-discharge-confirmation',
  templateUrl: './discharge-confirmation.component.html',
  styleUrls: ['./discharge-confirmation.component.scss']
})
export class DischargeConfirmationComponent implements OnInit {

  transitionPlans: Observable<any[]>;

  completionStatus: string;
  conditions: Observable<fhir.Condition[]>;
  dischargeForm: FormGroup;

  allowedTransitions = [];
  allowUnregister = false;

   constructor(
    private dialogRef: MatDialogRef<DischargeConfirmationComponent>,
    private practitionerService: PractitionerService,
    private patientService: PatientService,
    private fhirService: FhirService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: {
      patient: fhir.Patient,
      carePlan: fhir.CarePlan,
      action?: string,
      defaultTransition?: string,
      finalAssessments?: fhir.QuestionnaireResponse[]}
  ) {
    this.dischargeForm = fb.group({
      transition: [data.defaultTransition || '', [Validators.required]],
      transitionTo: null,
      unregister: false
    });
    this.transitionPlans = this.practitionerService.groupCarePlans()
    .pipe(
      map(bundle => (bundle.entry || []))
    );
  }

  async ngOnInit() {

    this.conditions = this.fhirService.resolveReferences<fhir.Condition>(this.data.carePlan.addresses, this.data.carePlan)
    .pipe(
      map(r => (r.entry || []).map(e => e.resource))
    );

    const eoc: fhir.EpisodeOfCare = await this.fhirService.reference<fhir.EpisodeOfCare>(this.data.carePlan.context, this.data.carePlan).toPromise();
    if (eoc) {
      const org =  await this.fhirService.reference<fhir.Organization>(eoc.managingOrganization, eoc).toPromise();
      const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>(
        (org.extension || []).find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES));
      if (orgAttributes) {
        this.allowedTransitions = ((orgAttributes.discharge || {}).allowTransitions || '').split(',');
        if (this.data.carePlan.status === 'active') {
          this.allowedTransitions = this.allowedTransitions.filter(a => a !== 'plan');
        }
        if (this.allowedTransitions.length > 0) {
          if (this.allowedTransitions.indexOf(this.data.defaultTransition) === -1) {
            this.dischargeForm.get('transition').reset(this.allowedTransitions[0]);
          } else {
            this.dischargeForm.get('transition').reset(this.data.defaultTransition);
          }
        }
        this.allowUnregister = (orgAttributes.discharge || {}).allowUnregister;
      }
    }
  }


  discharge() {
    this.dialogRef.close(this.dischargeForm.value);
  }
}
