import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { Component, Input, OnChanges, SimpleChanges, ViewChild, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { PractitionerService } from '../../../../services/practitioner.service';
import { IAppUser } from '../../../../services/user-registrations.service';
import { FhirService } from '../../../../services/fhir.service';
import * as moment from 'moment';
import { take } from 'rxjs/operators';
import { PatientService } from '../../../../services/patient.service';
import { IOrganisationAttributes } from '../../../home.component';

export const GENDERS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const PLACEHOLDERS = {
  title: 'Title',
  given: 'Given Names',
  last: 'Last Name',
  gender: 'Gender',
  dob: 'Date Of Birth',
  urn: 'URN',
  mobile: 'Mobile Number',
  landline: 'Landline Number',
  email: 'Email',
  type: 'Patient Type',
  site: 'Site',
  contact: {
    name: 'Full Name Including Title',
    relationship: 'Relationship to patient',
    landline: 'Landline Number',
    mobile: 'Mobile Number',
    email: 'Email'
  }
};

@Component({
  selector: 'app-demographics',
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss'],
})
export class DemographicsComponent implements OnInit, OnDestroy {
  @Input()
  patient: fhir.Patient;

  @Input()
  episodeOfCare: fhir.EpisodeOfCare;

  edit: boolean;

  @Output()
  statusChanges = new EventEmitter();

  @ViewChild('mobile', { read: NgxMatIntlTelInputComponent })
  mobileInput: NgxMatIntlTelInputComponent;

  @ViewChild('landline', { read: NgxMatIntlTelInputComponent })
  landlineInput: NgxMatIntlTelInputComponent;

  sites: Observable<fhir.Organization[]>;
  organisation: fhir.Organization;

  demographicsForm: FormGroup;
  readonly genders = GENDERS;
  readonly placeholders = PLACEHOLDERS;

  subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private practitionerService: PractitionerService,
    private fhirService: FhirService,
    private patientService: PatientService
  ) {
    this.demographicsForm = this.fb.group({
      name: this.fb.array([
        this.fb.group({
          prefix: [''],
          family: ['', [Validators.required]],
          given: ['', [Validators.required]]
        })
      ]),
      gender: [this.genders[0].value],
      birthDate: ['', [Validators.required]],
      mobile: ['', [Validators.required]],
      landline: ['', [Validators.required]],
      email: ['', Validators.email],
      urn: [''],
      type: 'cardiac-rehab',
      site: { id: '' },
      contact: this.fb.group({
        name: ['', [Validators.required]],
        relationship: ['', [Validators.required]],
        landline: ['', [Validators.required]],
        mobile: ['', [Validators.required]],
        email: ['', Validators.email]
      })
    });
    this.sites = this.practitionerService.sites().pipe(take(1));
  }

  initForm() {
    // reset the form
    if (!this.patient) {
      this.patient = {};
    }

    this.resetForm();
  }

  ngOnInit() {
    this.subscription = this.demographicsForm.statusChanges.subscribe(s => this.statusChanges.emit(s));
    this.initForm();
    this.demographicsForm.disable();

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get names() {
    if (this.demographicsForm) {
      return this.demographicsForm.get('name') as FormArray;
    }
  }

  mobilePhone(patient: fhir.Patient = this.patient): fhir.ContactPoint | undefined {
    if (!patient) { return; }
    return (patient.telecom || []).find(telecom => {
      return telecom.system === 'phone' && telecom.use === 'mobile';
    });
  }
  landlineNumber(patient: fhir.Patient = this.patient): fhir.ContactPoint | undefined {
    if (!patient) { return; }
    return (patient.telecom || []).find(telecom => {
      return telecom.system === 'phone' && telecom.use === 'home';
    });
  }
  email(patient: fhir.Patient = this.patient): fhir.ContactPoint | undefined {
    if (!patient) { return; }
    return (patient.telecom || []).find(telecom => {
      return telecom.system === 'email';
    });
  }


  toPatient(): fhir.Patient {
    if (!this.demographicsForm.valid) {
      throw this.demographicsForm.errors;
    }
    const patientDemographics = this.demographicsForm.value;
    this.patient.name = patientDemographics.name.map(humanName => {
      const patientName = { ...humanName };
      patientName.given = humanName.given.split(' ');
      patientName.prefix = humanName.prefix.split(' ');
      return patientName;
    });
    this.patient.gender = patientDemographics.gender;
    this.patient.birthDate = patientDemographics.birthDate;

    this.patient.telecom = this.patient.telecom || [];
    let mobileTelecom = this.mobilePhone();
    if (!mobileTelecom) {
      mobileTelecom = {
        system: 'phone',
        use: 'mobile',
      };
      this.patient.telecom.push(mobileTelecom);
    }
    mobileTelecom.value = this.demographicsForm.value.mobile;

    let landlineTelecom = this.landlineNumber();
    if (!landlineTelecom) {
      landlineTelecom = {
        system: 'phone',
        use: 'home',
      };
      this.patient.telecom.push(landlineTelecom);
    }
    landlineTelecom.value = this.demographicsForm.value.landline;

    let emailTelecom = this.email();
    if (!emailTelecom) {
      emailTelecom = {
        system: 'email',
      };
      this.patient.telecom.push(emailTelecom);
    }
    emailTelecom.value = patientDemographics.email;

    let patientUrn = this.patientService.urn(this.patient);

    if (!patientUrn) {
      this.patient.identifier = this.patient.identifier || [];
      patientUrn = {
        type: {
          coding: [
            {
              system: 'http://hl7.org/fhir/identifier-type',
              code: 'MR'
            }
          ]
        }
      };
      this.patient.identifier.push(patientUrn);
    }
    patientUrn.value = patientDemographics.urn;
    this.toContact(this.patient, patientDemographics); // Binding all necessary Emergency Contact Details
    return this.patient;
  }

  /*Construct Patient Emergency contacts to post data to fhir under contact tree*/
  toContact(patient: fhir.Patient, patientDemographics: { contact: any; }): void {
    const formContact = patientDemographics.contact;
    if (!patient.contact) {
      patient.contact = [];
    }

    let temp: fhir.PatientContact = patient.contact?.find(contact => contact.relationship?.some(cc => cc.coding?.some(c => c.code === 'C' && c.system === 'http://hl7.org/fhir/v2/0131')));
    if (!temp) {
      temp = {
        relationship: [{ coding: [{code: 'C', system: 'http://hl7.org/fhir/v2/0131'}] }]
      };
      patient.contact.push(temp);
    }

    temp.relationship[0].text = formContact.relationship;
    temp.name = { text: formContact.name };
    formContact.telecom = (formContact.telecom || []);
    temp.telecom = formContact.telecom;

    let mobileTelecom = formContact.telecom.find((telecom: { system: string; use: string; }) => {
      return telecom.system === 'phone' && telecom.use === 'mobile';
    });

    mobileTelecom = {
      system: 'phone',
      use: 'mobile',
      value: mobileTelecom?.value || formContact.mobile
    };

    let landlineTelecom = formContact.telecom.find((telecom: { system: string; use: string; }) => {
      return telecom.system === 'phone' && telecom.use === 'home';
    });

    landlineTelecom = {
      system: 'phone',
      use: 'home',
      value: landlineTelecom?.value || formContact.landline
    };

    let emailTelecom = formContact.telecom.find((telecom: { system: string; }) => {
      return telecom.system === 'email';
    });
    emailTelecom = {
      system: 'email',
      value: emailTelecom?.value || formContact.email
    };

    temp.telecom.push(...[mobileTelecom, landlineTelecom, emailTelecom]);
  }

  /*Construct Patient Emergency contacts for formbuilder to bind data into the User Interface*/
  bindEmergencyContact(patient: fhir.Patient) {
    const emergencyContact = patient.contact?.find(contact => contact.relationship?.some(cc => cc.coding?.some(c => c.code === 'C' && c.system === 'http://hl7.org/fhir/v2/0131')));
    return {
      name: emergencyContact?.name?.text,
      relationship: emergencyContact?.relationship?.find(cc => cc.coding?.some(c => c.code === 'C' && c.system === 'http://hl7.org/fhir/v2/0131'))?.text,
      landline: emergencyContact?.telecom?.find(telecom => telecom.system === 'phone' && telecom.use === 'home')?.value,
      mobile: emergencyContact?.telecom?.find(telecom => telecom.system === 'phone' && telecom.use === 'mobile')?.value,
      email: emergencyContact?.telecom?.find(telecom => telecom.system === 'email')?.value
    };
  }

  async resetForm(patient: fhir.Patient = this.patient) {
    if (!this.episodeOfCare) {
      this.reset();
      return;
    }


    this.organisation = await this.fhirService.reference(this.episodeOfCare.managingOrganization, this.episodeOfCare).toPromise();
    const orgAttributes: IOrganisationAttributes = FhirService.flattenExtension<IOrganisationAttributes>((this.organisation.extension || [])
      .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || { url: '' });

    if (orgAttributes) {
      this.placeholders.urn = orgAttributes.urnLabel || this.placeholders.urn;
    }

    this.demographicsForm.reset({
      name: (patient.name || [{}]).map(name => {
        return {
          prefix: (name.prefix || []).join(' '),
          family: name.family,
          given: (name.given || []).join(' ')
        };
      }),
      gender: (this.genders.find(g => g.value === patient.gender) || this.genders[0]).value,
      birthDate: patient.birthDate || moment().subtract(55, 'years'),
      mobile: (this.mobilePhone(patient) || {}).value,
      landline: (this.landlineNumber(patient) || {}).value,
      email: (this.email(patient) || {}).value,
      urn: (this.patientService.urn(patient) || {}).value,
      type: 'cardiac-rehab',
      site: this.episodeOfCare.managingOrganization ? this.episodeOfCare.managingOrganization.reference.split('/')[1] : '',
      contact: this.bindEmergencyContact(patient)
    });
  }


  async getSideCode(siteRef): Promise<string> {
    let sitecode;
    if (siteRef) {
      const organisations = await this.sites.toPromise();
      const managing = organisations.find(o => o.id === siteRef);
      if (managing) {
        sitecode = this.practitionerService.siteCodeOf(managing);
      }
    }
    return sitecode;
  }

  saveDemographics() {
    this.edit = false;
    try {
      this.fhirService.save<fhir.Patient>(this.toPatient()).toPromise();
      this.demographicsForm.disable();
    } catch (err) {
      console.error(err);
    }
  }

  enableEdit() {
    this.edit = true;
    this.demographicsForm.enable();
  }

  reset() {
    this.demographicsForm.reset();
    this.edit = false;
    this.demographicsForm.disable();
  }

  get valid() {
    return this.demographicsForm.valid;
  }
}
