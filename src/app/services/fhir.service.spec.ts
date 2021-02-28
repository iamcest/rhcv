import { TestBed, inject } from '@angular/core/testing';

import { FhirService } from './fhir.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import { regionalConfigServiceStub } from 'src/test';

describe('FhirService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FhirService,
        { provide: RegionalConfigService, useValue: regionalConfigServiceStub}
      ]
    });
  });

  it('should be created', inject([FhirService], (service: FhirService) => {
    expect(service).toBeTruthy();
  }));
});
