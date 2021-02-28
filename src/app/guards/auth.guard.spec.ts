import { TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AmplifyService } from 'aws-amplify-angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FhirService } from '../services/fhir.service';
import { fhirServiceStub } from 'src/test';
import { AngularFhirModule } from '@cardihab/angular-fhir';
import { OverlayModule } from '@angular/cdk/overlay';

describe('AuthGuard', () => {
  const amplifyServiceStub: Partial<AmplifyService> = jasmine.createSpyObj('AmplifyService', ['auth']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AngularFhirModule, OverlayModule],
      providers: [
        AuthGuard,
        { provide: AmplifyService, useValue: amplifyServiceStub},
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate'])},
        { provide: FhirService, useValue: fhirServiceStub}
      ]
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
