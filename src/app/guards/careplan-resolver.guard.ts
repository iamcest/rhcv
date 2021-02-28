import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PatientService } from '../services/patient.service';
import { map, switchMap, take } from 'rxjs/operators';
import { GuardsModule } from './guards.module';
import { PractitionerService } from '../services/practitioner.service';

@Injectable({
  providedIn: GuardsModule
})
export class CarePlanResolverGuard implements Resolve<fhir.CarePlan[]> {

  constructor(
    private patientService: PatientService,
    private practitionerService: PractitionerService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): fhir.CarePlan[] | Observable<fhir.CarePlan[]> | Promise<fhir.CarePlan[]> {
    const patientId = route.params['patientId'];
    if (patientId === 'new') {
      return of(null);
    }
    return this.practitionerService.currentRole()
    .pipe(
      take(1),
      switchMap((role) => this.patientService.patientCarePlans({id: patientId})),
      map(patientCarePlansResponse => {
        if (patientCarePlansResponse.total > 0) {
          return patientCarePlansResponse.entry.map(cpr => cpr.resource);
        } else {
          return null;
        }
      })
    );
  }

}
