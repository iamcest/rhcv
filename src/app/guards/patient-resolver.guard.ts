import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { GuardsModule } from './guards.module';
import { FhirService } from '../services/fhir.service';
import { PractitionerService } from '../services/practitioner.service';
import { take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: GuardsModule
})
export class PatientResolverGuard implements Resolve<fhir.Patient> {

  constructor(
    private fhirService: FhirService,
    private practitionerService: PractitionerService
  ) { }

  resolve(route: ActivatedRouteSnapshot): fhir.Patient | Observable<fhir.Patient> | Promise<fhir.Patient> {
    const patientId = route.params['patientId'];

    return this.practitionerService.currentRole().pipe(
      take(1),
      switchMap(() => this.fhirService.get<fhir.Patient>('Patient', patientId))
    );
  }

}
