import { TestBed, inject } from '@angular/core/testing';

import { QuestionnaireService } from './questionnaire.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FhirService } from './fhir.service';
import { carePlanServiceStub, fhirServiceStub } from '../../test';
import { CarePlanService } from './care-plan.service';

describe('QuestionnaireService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        QuestionnaireService,
        {provide: FhirService, useValue: fhirServiceStub},
        {provide: CarePlanService, useValue: carePlanServiceStub}
        ]
    });
  });

  it('should be created', inject([QuestionnaireService], (service: QuestionnaireService) => {
    expect(service).toBeTruthy();
  }));
});
