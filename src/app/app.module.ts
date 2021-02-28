import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { PatientListComponent } from './home/patient-list/patient-list.component';
import { LoginComponent } from './home/login/login.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PendingRegistrationsComponent } from './home/patient-list/pending-registrations/pending-registrations.component';
import { ProfileComponent } from './home/profile/profile.component';
import { ChangePasswordComponent } from './home/change-password/change-password.component';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { PendingRegistrationModalComponent } from './home/patient-list/pending-registrations/pending-registration-modal/pending-registration-modal.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PipesModule } from './pipes/pipes.module';
import { ServicesModule } from './services/services.module';
import { GuardsModule } from './guards/guards.module';
import { ComponentsModule } from './components/components.module';
import { UpcomingAppointmentsComponent } from './home/patient-list/upcoming-appointments/upcoming-appointments.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { SentryErrorHandler } from './services/sentry-error-handler.service';
import { DischargeConfirmationComponent } from './home/patient-detail/discharge/discharge-confirmation/discharge-confirmation.component';
import { RootComponent } from './root/root.component';
import { AngularFhirModule, LoaderComponent } from '@cardihab/angular-fhir';
import { OriginComponent } from './origin/origin.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ReportsComponent } from './home/reports/reports.component';
import { MatTabsModule } from '@angular/material/tabs';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PatientListComponent,
    LoginComponent,
    PendingRegistrationModalComponent,
    PendingRegistrationsComponent,
    UpcomingAppointmentsComponent,
    ProfileComponent,
    ChangePasswordComponent,
    RootComponent,
    OriginComponent,
    ReportsComponent,
  ],
  entryComponents: [
    PendingRegistrationModalComponent,
    ProfileComponent,
    ChangePasswordComponent,
    DischargeConfirmationComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatDatepickerModule, MatMomentDateModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    NgxDatatableModule,
    AmplifyAngularModule,
    FormsModule,
    ReactiveFormsModule,
    NgxChartsModule,
    OverlayModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    PipesModule,
    ServicesModule,
    GuardsModule,
    ComponentsModule,
    AngularFhirModule,
    QRCodeModule
  ],
  providers: [
    AmplifyService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
