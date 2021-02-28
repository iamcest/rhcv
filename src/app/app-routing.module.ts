import { PatientDetailIdentifyComponent } from './home/patient-detail/patient-detail-identify/patient-detail-identify.component';
import { from } from 'rxjs';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { PatientListComponent } from './home/patient-list/patient-list.component';
import { PatientDetailModule } from './home/patient-detail/patient-detail.module';
import { PatientDetailComponent } from './home/patient-detail/patient-detail.component';
import { PatientDeliveryComponent } from './home/patient-detail/delivery/patient-delivery.component';
import { DesignComponent } from './home/patient-detail/design/design.component';
import { PatientResolverGuard } from './guards/patient-resolver.guard';
import { CarePlanResolverGuard } from './guards/careplan-resolver.guard';
import { LoginComponent } from './home/login/login.component';
import { GuardsModule } from './guards/guards.module';
import { RootComponent } from './root/root.component';
import { RegionConfigGuard } from './guards/region-config.guard';
import { OriginComponent } from './origin/origin.component';
import { ReportsComponent } from './home/reports/reports.component';
import { PatientDischargeComponent } from './home/patient-detail/discharge/patient-discharge.component';

const routes: Routes = [
  { path: '', component: RootComponent},
  { path: 'login', component: LoginComponent },
  {
    path: ':origin', component: OriginComponent, canActivate: [RegionConfigGuard],
      children: [
        { path: '', redirectTo: 'home', pathMatch: 'full'},
        { path: 'home', component: HomeComponent, canActivate: [AuthGuard],
          children: [
            { path: '', redirectTo: 'patients', pathMatch: 'full'},
            { path: 'patients', component: PatientListComponent},
            { path: 'reports', component: ReportsComponent},
            { path: 'patient/:patientId', component: PatientDetailComponent,
              resolve: {
                patient: PatientResolverGuard,
                carePlan: CarePlanResolverGuard
              },
              children: [
                { path: 'design', component: DesignComponent },
                { path: 'delivery', component: PatientDeliveryComponent },
                { path: 'discharge', component: PatientDischargeComponent }
              ],
            },
          ]
        }
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    GuardsModule,
    PatientDetailModule
  ],
  exports: [
      RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
