import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDetailComponent } from './patient-detail.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientDeliveryComponent } from './delivery/patient-delivery.component';
import { PatientDischargeComponent } from './discharge/patient-discharge.component';
import { RouterModule } from '@angular/router';
import { PatientDetailSideComponent } from './patient-detail-side/patient-detail-side.component';
import { ReviewComponent } from './delivery/review/review.component';
import { DesignComponent } from './design/design.component';
import { MatMomentDateModule, MomentDateAdapter, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { RecordedDataComponent } from './recorded-data/recorded-data.component';
import { DemographicsComponent } from './design/demographics/demographics.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { QuestionComponent } from './questionnaire/question.component';
import { AdherenceComponent } from './recorded-data/adherence/adherence.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsComponent } from './recorded-data/charts/charts.component';
import { ComboSeriesVerticalComponent } from './recorded-data/combo-chart/combo-series-vertical.component';
import { ComboChartComponent } from './recorded-data/combo-chart/combo-chart.component';
import { GoalsComponent } from './design/goals/goals.component';
import { ReviewScheduleComponent } from './design/review-schedule/review-schedule.component';
import { JournalComponent } from './recorded-data/journal/journal.component';
import { MedicinesComponent } from './recorded-data/medicines/medicines.component';
import { DischargeReportComponent } from './discharge-report/discharge-report.component';
import { PipesModule } from '../../pipes/pipes.module';
import { ServicesModule } from '../../services/services.module';
import { EditGoalModalComponent } from './design/goals/edit-goal-modal/edit-goal-modal.component';
import { ComponentsModule } from '../../components/components.module';
import { AdherenceTableComponent } from './recorded-data/adherence-table/adherence-table.component';
import { DischargeConfirmationComponent } from './discharge/discharge-confirmation/discharge-confirmation.component';
import { SmartGoalDetailComponent } from './recorded-data/smart-goals/smart-goal-detail/smart-goal-detail.component';
import { SmartGoalListComponent } from './recorded-data/smart-goals/smart-goal-list/smart-goal-list.component';
import { SmartGoalsComponent } from './recorded-data/smart-goals/smart-goals.component';
import { AdherenceTabsComponent } from './recorded-data/adherence-tabs/adherence-tabs.component';
import { MedicinesListComponent } from './recorded-data/medicines/medicines-list/medicines-list.component';
import { MedicinesDetailComponent } from './recorded-data/medicines/medicines-detail/medicines-detail.component';
import { PlanHistoryComponent } from './design/plan-history/plan-history.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import listPlugin from '@fullcalendar/list';
import { AppointmentDetailComponent } from './design/review-schedule/appointment-detail/appointment-detail.component';
import { PatientDetailIdentifyComponent } from './patient-detail-identify/patient-detail-identify.component'; // a plugin
import { NgxMatIntlTelInputModule } from 'ngx-mat-intl-tel-input';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  listPlugin
]);

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatStepperModule,
    MatExpansionModule,
    MatSelectModule,
    MatDatepickerModule, MatMomentDateModule,
    MatTabsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatListModule,
    MatChipsModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule, ReactiveFormsModule,
    NgxChartsModule,
    NgxDatatableModule,
    PipesModule,
    ServicesModule,
    ComponentsModule,
    MatTooltipModule,
    MatAutocompleteModule,
    FullCalendarModule,
    NgxMatIntlTelInputModule
  ],
  declarations: [
    PatientDetailComponent,
    PatientDeliveryComponent,
    PatientDischargeComponent,
    PatientDetailSideComponent,
    ReviewComponent,
    DesignComponent,
    RecordedDataComponent,
    DemographicsComponent,
    ReviewScheduleComponent,
    ChartsComponent,
    ComboSeriesVerticalComponent,
    ComboChartComponent,
    QuestionnaireComponent, QuestionComponent,
    AdherenceComponent,
    GoalsComponent,
    JournalComponent,
    DischargeReportComponent,
    EditGoalModalComponent,
    AdherenceTableComponent,
    DischargeConfirmationComponent,
    SmartGoalsComponent,
    SmartGoalDetailComponent,
    SmartGoalListComponent,
    MedicinesComponent,
    MedicinesListComponent,
    MedicinesDetailComponent,
    AdherenceTabsComponent,
    PlanHistoryComponent,
    AppointmentDetailComponent,
    PatientDetailIdentifyComponent
  ],
  entryComponents: [
    RecordedDataComponent,
    EditGoalModalComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }
  ]
})
export class PatientDetailModule { }
