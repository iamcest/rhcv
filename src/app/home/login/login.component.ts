import { Component } from '@angular/core';
import { RegionalConfigService } from '@cardihab/angular-fhir';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  origin = 'au';
  isComputerShared = false;

  constructor(private region: RegionalConfigService)  { }

  async login() {
    sessionStorage.setItem('isShared', JSON.stringify(this.isComputerShared));
    await this.region.load(this.origin);
    // tslint:disable-next-line:max-line-length
    window.location.assign(`https://${this.region.get('Auth').oauth.domain}/login?response_type=code&client_id=${this.region.get('aws_user_pools_web_client_id')}&redirect_uri=${location.protocol}//${location.host}/${this.origin}`);
  }

}
