import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GENDERS } from '../design/demographics/demographics.component';
import { CarePlanUtils } from '../../../services/care-plan-utils';
import { PatientService } from '../../../services/patient.service';
import { CarePlanService } from '../../../services/care-plan.service';
import { FhirService } from '../../../services/fhir.service';
import { IOrganisationAttributes } from '../../home.component';

@Component({
  selector: 'app-patient-detail-identify',
  templateUrl: './patient-detail-identify.component.html',
  styleUrls: ['./patient-detail-identify.component.scss']
})

export class PatientDetailIdentifyComponent implements OnInit {
  patient: fhir.Patient;
  carePlan: fhir.CarePlan;
  urnLabel: string;
  organisation: fhir.Organization;

  constructor(
    private route: ActivatedRoute,
    public patientService: PatientService,
    private carePlanService: CarePlanService) { }

  ngOnInit(): void {
    this.patient = this.route.snapshot.data['patient'];

    this.carePlan = CarePlanUtils.findCurrent(this.route.snapshot.data['carePlan']);

    this.carePlanService.planSite(this.carePlan).subscribe(org => {
      this.organisation = org;
      const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((this.organisation.extension || [])
        .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || { url: '' });
      this.urnLabel = orgAttributes && orgAttributes.urnLabel ? orgAttributes.urnLabel : 'URN';
    });
  }

  getPatientGender(patient) {
    if (!patient) { return GENDERS[0]; }
    return GENDERS.find(g => g.value === patient.gender) || GENDERS[0];
  }

  getFirstName(patient) {
    if (!patient) { return ''; }
    if (patient.name && patient.name[0]) { return patient.name[0].family || ''; }
  }

  getLastName(patient) {
    if (!patient) { return ''; }
    if (patient.name && patient.name[0]) {return patient.name[0].given.join(' ') || ''; }
  }
}
