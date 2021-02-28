import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FhirService} from './fhir.service';
import { PatientService } from './patient.service';
import { PractitionerService } from './practitioner.service';
import { practitionerServiceStub, carePlanServiceStub } from '../../test';
import { CarePlanService } from './care-plan.service';

const fhirServiceStub: Partial<FhirService> = {
};

describe('PatientService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PatientService,
        { provide: FhirService, useValue: fhirServiceStub},
        {provide: PractitionerService, useValue: practitionerServiceStub},
        {provide: CarePlanService, useValue: carePlanServiceStub}
      ]
    });
  });

  it('should be created', inject([PatientService], (service: PatientService) => {
    expect(service).toBeTruthy();
  }));
});
