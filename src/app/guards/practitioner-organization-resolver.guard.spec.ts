import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { PractitionerOrganizationResolverGuard } from './practitioner-organization-resolver.guard';
import { PractitionerService } from '../services/practitioner.service';
import { practitionerServiceStub, TestingModule, fhirServiceStub } from '../../test';
import { FhirService } from '../services/fhir.service';

describe('PractitionerOrganizationResolverGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      providers: [
        PractitionerOrganizationResolverGuard
      ]
    });
  });

  it('should ...', inject([PractitionerOrganizationResolverGuard], (guard: PractitionerOrganizationResolverGuard) => {
    expect(guard).toBeTruthy();
  }));
});
