import { TestBed, inject } from '@angular/core/testing';

import { ReportService } from './report.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFhirModule } from '@cardihab/angular-fhir';

describe('ReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AngularFhirModule],
      providers: [ReportService]
    });
  });

  it('should be created', inject([ReportService], (service: ReportService) => {
    expect(service).toBeTruthy();
  }));
});
