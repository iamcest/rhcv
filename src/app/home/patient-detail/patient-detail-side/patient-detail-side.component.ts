import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../services/report.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RecordedDataComponent } from '../recorded-data/recorded-data.component';
import { CarePlanUtils } from '../../../services/care-plan-utils';
import { formatFhirName } from '../../../utils';
import { GENDERS } from '../design/demographics/demographics.component';
import { PatientService } from '../../../services/patient.service';
import { FhirService } from '../../../services/fhir.service';
import { CarePlanService } from '../../../services/care-plan.service';
import { IOrganisationAttributes } from '../../home.component';
import { TelehealthComponent } from 'src/app/components/telehealth/telehealth.component';

@Component({
  selector: 'app-patient-detail-side',
  templateUrl: './patient-detail-side.component.html',
  styleUrls: ['./patient-detail-side.component.scss']
})
export class PatientDetailSideComponent implements OnInit {
  patient: fhir.Patient;
  carePlan: fhir.CarePlan;
  organisation: fhir.Organization;

  urnLabel: string;

  data = [
    {
      name: 'Medicinesqq',
      value: 85
    },
    {
      name: 'Tasks',
      value: 58
    },
    {
      name: 'Education',
      value: 97
    }
  ];

  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              public patientService: PatientService,
              private carePlanService: CarePlanService) { }

  ngOnInit() {
    this.patient = this.route.snapshot.data['patient'];
    this.carePlan = CarePlanUtils.findCurrent(this.route.snapshot.data['carePlan']);
    this.carePlanService.planSite(this.carePlan).subscribe(org => {
      this.organisation = org;
      const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((this.organisation.extension || [])
        .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || {url: ''});
      this.urnLabel = orgAttributes && orgAttributes.urnLabel ? orgAttributes.urnLabel : 'URN';
    });
  }

  score() {
    return '';
  }

  focusRecordedData(title: string, menuName: string) {
    this.dialog.open(RecordedDataComponent, {
      maxWidth: 'calc(100vw - 300px)',
      width: 'calc(100vw - 300px)',
      position: {top: '134px', left: '0'},
      hasBackdrop: true,
      data: {
        patient: this.patient,
        carePlan: this.carePlan,
        title: title,
        menuName: menuName
      },
      height: 'calc(100vh - 134px)'
    }).afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  getPatientGender(patient) {
    if (!patient) { return GENDERS[0]; }
    return GENDERS.find(g => g.value === patient.gender) || GENDERS[0];
  }

  startTelehealthSession() {
    this.dialog.open(TelehealthComponent, {
      data: this.patient
    });
  }

}
