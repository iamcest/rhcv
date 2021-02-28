import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PractitionerService } from '../../services/practitioner.service';
import { Observable, of } from 'rxjs';
import { FhirService } from '../../services/fhir.service';
import { DialogData, DialogHeaderComponent } from '../../components/dialog-header/dialog-header.component';
import { formatAddressOnly } from '../../utils/format';
import { startCase } from 'lodash';
import { StorageService } from '../../services/storage-service';
import { Auth } from 'aws-amplify';
import { AmplifyService } from 'aws-amplify-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends DialogHeaderComponent implements OnInit {
  profileForm: FormGroup;
  totpForm: FormGroup;
  public practitioner: fhir.Practitioner;
  public roles$: Observable<fhir.PractitionerRole[]>;
  public totpQrCode: string = null;
  public showTOTPSetupForm = false;
  public hasTOTPEnabled = false;
  public hasSMSEnabled = false;

  constructor(
    private snackbar: MatSnackBar,
    private amplify: AmplifyService,
    private dialogRef: MatDialogRef<ProfileComponent>,
    private practitionerService: PractitionerService,
    private fhirService: FhirService,
    private storageService: StorageService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    super(data);
    this.profileForm = this.fb.group({
      gender: [''],
      role: [''],
      address: [''],
      roles: [[]],
      name: this.fb.array([
        this.fb.group({
          family: [''],
          given: ['']
        })
      ]),
      telecom: this.fb.array([
        this.fb.group({
          comm: [''],
          value: ['']
        })
      ]),
    });
    this.profileForm.disable();

    this.totpForm = this.fb.group({
      code: ['', []]
    });
  }

  async ngOnInit() {
    this.amplify.auth().currentAuthenticatedUser().then( user => {
      if ( 'SOFTWARE_TOKEN_MFA'.indexOf(user.preferredMFA) > -1 ) {
        this.hasTOTPEnabled = true;
      } else if ( 'SMS_MFA'.indexOf(user.preferredMFA) > -1 ) {
        this.hasSMSEnabled = true;
      }
    });

    this.practitionerService.current.subscribe(p =>  {
      this.practitioner = p;
      this.initForm();
    });

    this.practitionerService.currentRoleCodes()
    .subscribe(currentRoleCodes => {
      this.profileForm.get('roles').setValue(currentRoleCodes);
    });

    const roleId = this.storageService.get({ key: 'practitionerRole.selected' });
    this.practitionerService.currentRole().subscribe(cr => {
      this.profileForm.get('role').enable();
      if (roleId) {
        this.profileForm.get('role').setValue(roleId);
      } else {
        this.profileForm.get('role').setValue(`${cr.resourceType}/${cr.id}`);
      }
    });
    this.roles$ = this.practitionerService.roles();

  }

  get names() {
    if (this.profileForm) {
      return this.profileForm.get('name') as FormArray;
    }
  }

  get telecoms() {
    if (this.profileForm) {
      return this.profileForm.get('telecom') as FormArray;
    }
  }

  initForm() {
    this.profileForm.reset({
      gender: this.practitioner.gender,
      address: formatAddressOnly(this.practitioner.address || [{}]),
    });

    this.profileForm.setControl('name', this.fb.array(
      (this.practitioner.name || [{}]).map(name => {
        return this.fb.group({
          family: name.family,
          given: name.given.map(g => g).join(' '),
          prefix: (name.prefix || []).map(p => p),
          use: name.use,
        });
      })
    ));

    this.profileForm.setControl('telecom', this.fb.array(
      (this.practitioner.telecom || [{}]).map(telecom => {
      return this.fb.group({
        comm: startCase(`${telecom.use ? telecom.use + ' ' : ''}${telecom.system ? telecom.system + ' ' : ''}`),
        value: telecom.value
      });
    })));

    this.profileForm.disable();
  }

  close() {
    this.dialogRef.close();
  }

  organizationRole(role: fhir.PractitionerRole): Observable<fhir.Organization> {
    if (role && role.organization) {
      return this.fhirService.reference(role.organization, role);
    } else {
      return of();
    }
  }

  switchRole() {
    this.roles$.subscribe(roles => {
      const roleId = this.profileForm.value.role;
      const targetRole = roles.find(r => `${r.resourceType}/${r.id}` === roleId );
      if (targetRole) {
        this.practitionerService.setCurrentRole(targetRole);
        this.storageService.set({ key: 'practitionerRole.selected', value: `${targetRole.resourceType}/${targetRole.id}` });
        location.reload();
      }
    });
  }

  verifyTOTPSetup() {
    const challengeAnswer = this.totpForm.value.code;
    this.amplify.auth().currentAuthenticatedUser().then( user => {
      Auth.verifyTotpToken(user, challengeAnswer).then(async () => {
        await Auth.setPreferredMFA(user, 'TOTP');
        this.snackbar.open('TOTP 2FA setup successful!', '', { duration: 5000 });
        this.showTOTPSetupForm = false;
        this.hasTOTPEnabled = true;
      }).catch( e => {
        this.snackbar.open('Error setting up TOTP 2FA!', '', { duration: 5000 });
      });
    });
  }

  toggleTOTPSetup(mfa) {
    this.amplify.auth().currentAuthenticatedUser().then( user => {
      switch (mfa) {
        case 'totp':
          if ( this.hasTOTPEnabled ) {
            Auth.setPreferredMFA( user , 'NOMFA' ).then(() => {
              this.snackbar.open('TOTP 2FA removed!', '', { duration: 5000 });
              this.hasTOTPEnabled = false;
            });
          } else {
            Auth.setupTOTP(user).then((code) => {
              this.totpQrCode = `otpauth://totp/${user.attributes.email}?secret=${code}&issuer=Cardihab-PAM`;
              this.showTOTPSetupForm = true;
              this.hasSMSEnabled = false;
            });
          }
          break;
        case 'sms':
          if ( this.hasSMSEnabled ) {
            Auth.setPreferredMFA( user , 'NOMFA' ).then(() => {
              this.snackbar.open('SMS 2FA removed!', '', { duration: 5000 });
              this.hasSMSEnabled = false;
            });
          } else {
            Auth.setPreferredMFA( user , 'SMS' ).then(() => {
              this.hasSMSEnabled = true;
              this.hasTOTPEnabled = false;
            });
          }
          break;
      }
    });
  }
}
