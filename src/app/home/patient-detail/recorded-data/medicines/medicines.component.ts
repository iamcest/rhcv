import { Component, Input, OnInit } from '@angular/core';
import { IPatientAdherenceRow } from '../../../../services/care-plan-utils';
import { HeatMapComponent } from '@swimlane/ngx-charts';
import { BehaviorSubject, Observable } from 'rxjs';
import { FhirService } from '@cardihab/angular-fhir';
import { IOrganisationAttributes } from '../../../home.component';
import { CarePlanService } from '../../../../services/care-plan.service';

export const STATUSES = [
  {name: 'Active', value: 'active'},
  {name: 'Cancelled', value: 'cancelled'}
];

@Component({
  selector: 'app-medicines',
  templateUrl: './medicines.component.html',
  styleUrls: ['./medicines.component.scss'],
  providers: [HeatMapComponent]
})
export class MedicinesComponent implements OnInit {
  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  tablet$: Observable<boolean>;

  selectedMedicine$: BehaviorSubject<IPatientAdherenceRow> = new BehaviorSubject(void 0);
  allowEditing = false;

  constructor(private fhirService: FhirService, private carePlanService: CarePlanService) {
  }

  async ngOnInit() {
    const org: fhir.Organization = await this.carePlanService.planSite(this.carePlan).toPromise();
    const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((org.extension || [])
      .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || {url: ''});

    if (orgAttributes) {
      this.allowEditing = (orgAttributes.allowEditingMedications || this.allowEditing) && this.carePlan.status === 'active';
    }
  }
}
