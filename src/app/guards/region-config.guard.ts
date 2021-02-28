import { string } from '@amcharts/amcharts4/core';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import Amplify, {Auth} from 'aws-amplify';
import { StorageService } from '../services/storage-service';

@Injectable({
  providedIn: 'root'
})
export class RegionConfigGuard implements CanActivate {

  constructor(private router: Router, private regionService: RegionalConfigService, private storageService: StorageService) {}

  async canActivate(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (childRoute.params.origin) {
      const localConfig = await this.regionService.load(childRoute.params.origin);
      // Callback URL
      localConfig.Auth.oauth.redirectSignIn = `${location.protocol}//${location.host}/${childRoute.params.origin}`;
      // Sign out URL
      localConfig.Auth.oauth.redirectSignOut = `${location.protocol}//${location.host}`;
      this.storageService.set({key: 'preferred.region', value: childRoute.params.origin});

      if (JSON.parse(sessionStorage.getItem('isShared'))) {
        localConfig.Auth.storage = window.sessionStorage;
      } else {
        localConfig.Auth.storage = window.localStorage;
      }

      Amplify.configure(localConfig);
      Auth.configure(localConfig);
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
