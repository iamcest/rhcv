import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { CarePlanResolverGuard } from './careplan-resolver.guard';
import { PatientService } from '../services/patient.service';
import { patientServiceStub, practitionerServiceStub } from '../../test';
import { PractitionerService } from '../services/practitioner.service';

describe('CareplanResolverGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CarePlanResolverGuard,
        {provide: PatientService, useValue: patientServiceStub},
        {provide: PractitionerService, useValue: practitionerServiceStub}
      ]
    });
  });

  it('should ...', inject([CarePlanResolverGuard], (guard: CarePlanResolverGuard) => {
    expect(guard).toBeTruthy();
  }));
});
