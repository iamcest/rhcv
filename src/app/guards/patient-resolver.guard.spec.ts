import { TestBed, inject } from '@angular/core/testing';

import { PatientResolverGuard } from './patient-resolver.guard';
import { PatientService} from '../services/patient.service';
import { PractitionerService } from '../services/practitioner.service';
import { practitionerServiceStub, carePlanServiceStub, fhirServiceStub } from '../../test';
import { CarePlanService } from '../services/care-plan.service';
import { FhirService } from '../services/fhir.service';

const patientServiceStub: Partial<PatientService> = {
};

describe('PatientResolverGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientResolverGuard,
        { provide: FhirService, useValue: fhirServiceStub },
        { provide: PractitionerService, useValue: practitionerServiceStub},
        { provide: CarePlanService, useValue: carePlanServiceStub}
      ]
    });
  });

  it('should ...', inject([PatientResolverGuard], (guard: PatientResolverGuard) => {
    expect(guard).toBeTruthy();
  }));
});
