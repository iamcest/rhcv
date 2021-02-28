import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PractitionerService } from './practitioner.service';
import { FhirService} from './fhir.service';
import { AmplifyService } from 'aws-amplify-angular';
import { TestingModule, amplifyServiceStub, fhirServiceStub} from '../../test';

const ac = {
  currentSession: () => (Promise.resolve({
    getIdToken: () => ({
      decodePayload: () => ({})
    }),
  } as any))
};

describe('PractitionerService', () => {
  beforeEach(() => {
    spyOn(amplifyServiceStub, 'auth').and.returnValue(ac);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TestingModule],
      providers: [
        PractitionerService,
        { provide: FhirService, useValue: fhirServiceStub },
        { provide: AmplifyService, useValue: amplifyServiceStub}
      ]
    });
  });

  it('should be created', inject([PractitionerService], (service: PractitionerService) => {
    expect(service).toBeTruthy();
  }));
});
