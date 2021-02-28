import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { UserRegistrationsService } from '../../../../services/user-registrations.service';
import { PatientService } from '../../../../services/patient.service';
import { FhirService } from '../../../../services/fhir.service';
import { PractitionerService } from '../../../../services/practitioner.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DialogHeaderComponent } from '../../../../components/dialog-header/dialog-header.component';
import { LoaderService } from '@cardihab/angular-fhir';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pending-registration-modal',
  templateUrl: './pending-registration-modal.component.html',
  styleUrls: ['./pending-registration-modal.component.scss']
})
export class PendingRegistrationModalComponent extends DialogHeaderComponent implements OnInit {
  patient: fhir.Patient;
  site: Observable<fhir.Organization>;
  siteCode: string;
  registrationDate: any;
  selectedPlan: fhir.CarePlan;
  plans$: Observable<fhir.BundleEntry[]>;
  approvalForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PendingRegistrationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public userData: { user: CognitoIdentityServiceProvider.Types.UserType, title: string, approval$: BehaviorSubject<any> },
    private userRegistration: UserRegistrationsService,
    private patientService: PatientService,
    private fhirService: FhirService,
    private practitionerService: PractitionerService,
    private snackbar: MatSnackBar,
    private loader: LoaderService,
    private formBuilder: FormBuilder
  ) {
    super(userData);
    this.approvalForm = this.formBuilder.group({
      selected: [null, Validators.required]
    });
  }

  async ngOnInit() {
    this.patient = this.toPatient(this.userData.user);
    const siteCodeAttr = this.userData.user.Attributes.find(attr => attr.Name === 'custom:sitecode');
    if (!(siteCodeAttr && siteCodeAttr.Value)) {
      alert(`Registration does not contain site code. This shouldn't happen`);
      return;
    } else {
      this.siteCode = siteCodeAttr.Value;
    }

    this.registrationDate = this.userData.user.UserCreateDate;
    this.site = this.practitionerService.sites()
    .pipe(
      map(sites => sites.find(o => this.siteCode === this.practitionerService.siteCodeOf(o)))
    );
    this.plans$ = this.practitionerService.groupCarePlans()
    .pipe(
      map(response => (response.entry || [])),
      tap(plans => {
        if (plans.length === 1) {
          this.approvalForm.reset({selected: plans[0]});
        }
      })
    );
  }

  async setApproval(approved: boolean) {
    this.loader.start(approved ? 'Approving...' : 'Rejecting...');

    try {
      // Trying to approve or reject first

      if (approved) {
        const result = this.userRegistration.approveRegistration(this.userData.user.Username, this.fhirService.tenancy);
        if (!environment.production) {
          console.log('approval', result);
        }
          // If approved successfully, create a patient and refresh the patient list
        const referencePlan: fhir.CarePlan = this.approvalForm.value.selected;
        const managingOrganization = await this.practitionerService.managingOrganization().pipe(take(1)).toPromise();
        const bundle = await this.patientService.createPatient(managingOrganization, this.siteCode, this.toPatient(this.userData.user), this.userData.user.Username, referencePlan as any);
        await this.fhirService.save<fhir.Bundle>(bundle).toPromise();
        this.practitionerService.refresh.next(true);
        this.userData.approval$.next(bundle);
      } else {
        const result = this.userRegistration.rejectRegistration(this.userData.user.Username);
        this.userData.approval$.next(result);
      }

      this.snackbar.open(approved ? 'Approved' : 'Rejected', '', {
        duration: 2000,
      });
    } catch (err) {
      if (!environment.production) {
        console.error(err);
      }
      // Make sure the patient is back to the public cognito group after an error has occurred
      await this.userRegistration.revertApproval(this.userData.user.Username, this.fhirService.tenancy);
      this.snackbar.open(`Could not ${approved ? 'approve' : 'reject'}`, '', {
        duration: 2000,
      });
    } finally {
      this.dialogRef.close(approved);
      this.loader.stop();
    }
  }

  toPatient(user: CognitoIdentityServiceProvider.Types.UserType): Partial<fhir.Patient> {
    const patient: Partial<fhir.Patient> = {};
    patient.name = [{}];
    user.Attributes.forEach(attr => {
      switch (attr.Name) {
        case 'family_name':
          patient.name[0].family = attr.Value;
          break;
        case 'given_name':
          patient.name[0].given = (attr.Value || '').split(' ');
          break;
        case 'gender':
          patient.gender = (attr.Value || '').toLocaleLowerCase() as any;
          break;
        case 'birthdate':
          patient.birthDate = attr.Value;
          break;
        case 'phone_number':
          patient.telecom = patient.telecom || [];
          patient.telecom.push({
            use: 'mobile',
            system: 'phone',
            value: attr.Value
          });
          break;
        case 'email':
          patient.telecom = patient.telecom || [];
          patient.telecom.push({
            system: 'email',
            value: attr.Value
          });
        break;
      }
    });
    return patient;
  }

  get mobilePhone(): fhir.ContactPoint | undefined {
    if (!this.patient) { return; }
    return (this.patient.telecom || []).find(telecom => {
      return telecom.system === 'phone' && telecom.use === 'mobile';
    });
  }

  get email(): fhir.ContactPoint | undefined {
    if (!this.patient) { return; }
    return (this.patient.telecom || []).find(telecom => {
      return telecom.system === 'email';
    });
  }
}
