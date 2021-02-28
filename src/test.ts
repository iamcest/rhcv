
// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutModule } from '@angular/cdk/layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { APP_BASE_HREF } from '@angular/common';
import {RouterTestingModule} from '@angular/router/testing';

import { FhirService, IFhirResponse} from './app/services/fhir.service';
import { ReportService} from './app/services/report.service';
import { PractitionerService } from './app/services/practitioner.service';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { PatientService } from './app/services/patient.service';
import { CarePlanService, IQuestionnairesWithAnswers } from './app/services/care-plan.service';
import { UserRegistrationsService } from './app/services/user-registrations.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { ServicesModule } from './app/services/services.module';
import { PipesModule } from './app/pipes/pipes.module';
import { GuardsModule } from './app/guards/guards.module';
import { MedicationService } from './app/services/medication.service';
import { IPatientAdherenceRow } from './app/services/care-plan-utils';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import { MatChipsModule } from '@angular/material/chips';

declare const require: any;

export const amplifyServiceStub: Partial<AmplifyService> = {
  auth: () => ({
    currentAuthenticatedUser: () => new Promise<any>(() => true),
  }) as any
};

export const regionalConfigServiceStub: Partial<RegionalConfigService> = {
  get: (opt) => ({ fhir: ''})
};

export const fhirServiceStub: Partial<FhirService> = {
  get: () => of(null),
  getUrl: () => '',
  save: (value) => of(value),
  reference: () => of(null),
  resolveReferences: () => of({total: 0, entry: []}),
  search: () => of({total: 0, entry: []})
};


export const reportServiceStub: Partial<ReportService> = {
};


export const patientServiceStub: Partial<PatientService> = {
  patientCarePlans: (params) => of(),
  patientObservations: (params) => of(),
  isDiabetic: (params) => of(true),
  patientConditions: (patient) => of({} as any),
  urn: () => null,
  patientOrganisation: (patient) => of({} as any)
};


export const practitionerServiceStub: Partial<PractitionerService> = {
  patients: (params) => of() as Observable<IFhirResponse<fhir.Patient>>,
  groupCarePlans: (params) => of(),
  genders: () => [],
  sites: () => of([]),
  current: of(),
  roles: () => of(),
  currentRole: () => of(),
  currentRoleCodes: () => of(),
  currentRoleOrganization: () => of(),
  managingOrganization: () => of(),
  refresh: new BehaviorSubject(true)
};

export const carePlanServiceStub: Partial<CarePlanService> = {
  planGoals: (plan) => of(),
  conditions: () => of(),
  searchQuestionAnswers: (q, fn) => null,
  findQuestionsAndAnswers: (activities, patient) => Promise.resolve({ questionnaires: []} as IQuestionnairesWithAnswers),
  planSite: () => of({})
};


export const userRegistrationServiceStub: Partial<UserRegistrationsService> = {
  listPendingRegistration: (arg) => of([])
};

export const medicationServiceStub: Partial<MedicationService> = {
  medicationsToRecords: (patient: fhir.Patient) => of({} as IPatientAdherenceRow[]).toPromise(),
  compileAdherence: (patient: fhir.Patient, carePlan: fhir.CarePlan, refresh: boolean = false,
                    includeMeds: boolean = true, includeGoals: boolean = true): Observable<IPatientAdherenceRow[]> => of([])
};


// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

@Component({
  selector: 'app-test-home',
  template: ''
})
class TestHomeComponent {

}


@NgModule({
  declarations: [
    TestHomeComponent
  ],
  imports: [
    RouterTestingModule.withRoutes([{ path: 'home', component: TestHomeComponent }]),
    BrowserModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatGridListModule,
    MatDialogModule,
    MatRadioModule,
    MatStepperModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDatepickerModule, MatMomentDateModule,
    MatBottomSheetModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    OverlayModule,
    FormsModule, ReactiveFormsModule,
    NgxDatatableModule,
    AmplifyAngularModule,
    NgxChartsModule,
    ServicesModule,
    PipesModule,
    GuardsModule,
    MatTooltipModule,
    NgxMatIntlTelInputModule
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/'},
    {provide: ReportService, useValue: reportServiceStub},
    {provide: PractitionerService, useValue: practitionerServiceStub},
    {provide: FhirService, useValue: fhirServiceStub},
    {provide: AmplifyService, useValue: amplifyServiceStub},
    {provide: PatientService, useValue: patientServiceStub},
    {provide: CarePlanService, useValue: carePlanServiceStub},
    {provide: UserRegistrationsService, useValue: userRegistrationServiceStub},
    {provide: MedicationService, useValue: medicationServiceStub},
  ],
  // schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    BrowserModule,
    CommonModule,
    RouterTestingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatGridListModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule, MatMomentDateModule,
    MatCheckboxModule,
    MatMenuModule,
    MatStepperModule,
    MatIconModule,
    MatRadioModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatBottomSheetModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    OverlayModule,
    NgxDatatableModule,
    AmplifyAngularModule,
    FormsModule, ReactiveFormsModule,
    NgxChartsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    NgxMatIntlTelInputModule
  ]

})
export class TestingModule { }
