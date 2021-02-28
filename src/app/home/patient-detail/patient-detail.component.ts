import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CarePlanUtils } from '../../services/care-plan-utils';
import { Observable } from 'rxjs';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import { StorageService } from 'src/app/services/storage-service';
import { IOrganisationAttributes } from '../home.component';
import { FhirService } from 'src/app/services/fhir.service';
import { PatientService } from 'src/app/services/patient.service';

export interface INameValue {
  name: string;
  value: string | boolean;
}

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit, OnDestroy {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.HandsetPortrait, '(max-width: 1025px)'])
    .pipe(
      map(result => result.matches)
    );


  patient: fhir.Patient;
  carePlan: fhir.CarePlan;
  organisation: fhir.Organization;
  enableTelehealth = false;
  isCarePlanCompleted = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private regionConfig: RegionalConfigService,
    private patientService: PatientService) {}

  async ngOnInit() {
    this.patient = this.route.snapshot.data['patient'];
    if (this.patient) {
      this.storageService.set({key: 'patient.id', value: this.patient.id});
    }
    const carePlans = this.route.snapshot.data['carePlan'];
    this.carePlan = CarePlanUtils.findCurrent(carePlans);
    if (!this.route.snapshot.children || this.route.snapshot.children.length === 0) {
      // navigated to the parent component, decide which child to route to.
      this.router.navigate([`/${this.regionConfig.region}/home`, 'patient', this.route.snapshot.params.patientId, CarePlanUtils.progress(this.carePlan)], {skipLocationChange: true});
    }
    this.organisation = await this.patientService.patientOrganisation(this.patient).toPromise();
    const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((this.organisation.extension || [])
        .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || {url: ''});

    this.enableTelehealth = orgAttributes?.enableTelehealth;

    this.isCarePlanCompleted = this.isCarePlanIncomplete();
  }

  isCarePlanIncomplete(): boolean {
    return CarePlanUtils.isCarePlanIncomplete(this.carePlan);
  }

  ngOnDestroy(): void {
    this.storageService.remove({key: 'patient.id'});
  }
}
