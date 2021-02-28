import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { PractitionerService } from '../services/practitioner.service';
import { GuardsModule } from './guards.module';

@Injectable({
  providedIn: GuardsModule
})
export class PractitionerOrganizationResolverGuard implements Resolve<fhir.Organization> {

  constructor(private practitionerService: PractitionerService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): fhir.Organization | Observable<fhir.Organization> | Promise<fhir.Organization> {
    return this.practitionerService.managingOrganization();
  }
}
