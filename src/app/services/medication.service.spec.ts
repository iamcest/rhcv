import { TestBed } from '@angular/core/testing';

import { MedicationService } from './medication.service';
import { PatientService } from './patient.service';
import { patientServiceStub, carePlanServiceStub, fhirServiceStub, practitionerServiceStub, amplifyServiceStub, regionalConfigServiceStub } from '../../test';
import { CarePlanService } from './care-plan.service';
import { FhirService } from './fhir.service';
import { PractitionerService } from './practitioner.service';
import { AmplifyService } from 'aws-amplify-angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegionalConfigService } from '@cardihab/angular-fhir';

describe('MedicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      MedicationService,
      {provide: PatientService, useValue: patientServiceStub},
      {provide: FhirService, useValue: fhirServiceStub},
      {provide: CarePlanService, useValue: carePlanServiceStub},
      {provide: PractitionerService, useValue: practitionerServiceStub},
      {provide: AmplifyService, useValue: amplifyServiceStub},
      {provide: RegionalConfigService, useValue: regionalConfigServiceStub}

    ]
  }));

  it('should be created', () => {
    const service: MedicationService = TestBed.inject(MedicationService);
    expect(service).toBeTruthy();
  });
});
