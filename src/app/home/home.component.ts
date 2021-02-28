import { Component, OnDestroy, OnInit } from '@angular/core';
import { PractitionerService } from '../services/practitioner.service';
import { AmplifyService } from 'aws-amplify-angular';
import { ProfileComponent } from './profile/profile.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { environment } from '../../environments/environment';
import { formatFhirName } from '../utils/format';
import { UserRegistrationsService } from '../services/user-registrations.service';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import { StorageService } from '../services/storage-service';
import * as Sentry from '@sentry/browser';
import { FILTERS_LOCALSTORAGE_KEY } from './patient-list/patient-list.component';

export interface IOrganisationAttributes {
  urnLabel?: string;
  allowEditingMedications: boolean;
  enableTelehealth: boolean;
  discharge?: {
    allowTransitions?: string;
    allowUnregister?: boolean;
  };
  companyLogo?: string;
  companyLogoFilename?: string;
  headerBackground?: string;
  headerText?: string;
  tableHeaderBackground?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  auth: any;
  public practitioner: fhir.Practitioner;
  token: string;
  tokenInterval: any;
  // Set token refresh interval interval to 2 minutes 58 seconds
  readonly tokenTimeout: number = 178 * 1000;

  constructor(
    private practitionerService: PractitionerService,
    private userRegistration: UserRegistrationsService,
    private amplifyService: AmplifyService,
    private storageService: StorageService,
    public regionConfig: RegionalConfigService,
    public dialog: MatDialog,

  ) {
    this.amplifyService = amplifyService;
  }

  logout() {
    this.storageService.clear();
    this.storageService.remove({key: FILTERS_LOCALSTORAGE_KEY});
    this.amplifyService.auth().signOut();

    location.reload();
  }

  changePassword() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.height = '325px';
    dialogConfig.width = '400px';

    const changePassword = this.dialog.open(ChangePasswordComponent, dialogConfig);

  }

  openProfile() {
    this.dialog.open(ProfileComponent, {
      height: '700px',
      width: '1000px',
    });
  }

  openHelp() {
    window.open(environment.zendesk.redirect + this.token, '_blank');
    // Have to regenerate the token every time the user clicks the link to keep Zendesk happy
    this.createZendeskToken();
  }

  ngOnInit() {
    this.practitionerService.current.subscribe(async p => {
      this.practitioner = p;

      if (!environment || !environment.zendesk || !environment.zendesk.redirect) {
        return;
      }

      this.createZendeskToken();

      this.tokenInterval = setInterval(async () => {
        this.createZendeskToken();
      }, this.tokenTimeout);
    });
  }

  async createZendeskToken() {
    this.token = '';
    const name = formatFhirName(this.practitioner.name);
    const email = this.practitioner.telecom ? this.practitioner.telecom.find(item => item.system === 'email').value : '';
    try {
      this.token = (await this.userRegistration.createZendeskToken(name, email)).token;
    } catch (error) {
      if (navigator.onLine) {
        Sentry.captureException(error);
      }
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.tokenInterval);
  }
}
