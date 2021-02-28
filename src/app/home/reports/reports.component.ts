import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FhirService } from '../../services/fhir.service';
import { ReplaySubject, combineLatest } from 'rxjs';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ExportDataComponent } from '../../components/export-data/export-data.component';
import { PractitionerService } from '../../services/practitioner.service';
import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { StorageService } from '../../services/storage-service';

const REPORT_SITE_KEY = 'reporting.sites';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, AfterViewInit {

  planStats = [];
  genderStats = [];
  ageStats = [];
  conditionStats = [];
  ictRole = new ReplaySubject<boolean>(1);

  sites$ = new ReplaySubject(1);

  sitesForm = this.fb.group({
    sites: null
  });

  constructor(
    private fhirService: FhirService,
    private practitionerService: PractitionerService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private storageService: StorageService
  ) { }

  ngOnInit() {

    this.practitionerService.sites().subscribe(this.sites$);

    this.practitionerService.currentRole()
      .pipe(
        map((role: fhir.PractitionerRole) => {
          return (role.code || []).some(roleCoding => (roleCoding.coding || []).some(roleCode => roleCode.code === 'ict'));
        })
      ).subscribe(this.ictRole);
  }

  async ngAfterViewInit() {
    this.sitesForm.valueChanges
      .pipe(
        tap(formValue => {
          this.storageService.set({key: REPORT_SITE_KEY, value: JSON.stringify(formValue.sites)});
        }),
        mergeMap(formValue => {
          const planSiteFilter: any = {};
          if (formValue.sites.length > 0) {
            planSiteFilter['context.organization'] = formValue.sites.join(',');

          }
          const planData$ = combineLatest([
            this.fhirService.search('CarePlan', {
              _summary: 'count',
              status: 'draft',
              ...planSiteFilter
            }),
            this.fhirService.search('CarePlan', {
              _summary: 'count',
              status: 'active',
              ...planSiteFilter
            }),
            this.fhirService.search('CarePlan', {
              _summary: 'count',
              status: 'completed',
              ...planSiteFilter
            }),
            this.fhirService.search('CarePlan', {
              _summary: 'count',
              status: 'cancelled',
              ...planSiteFilter
            }),
            this.fhirService.search('CarePlan', {
              _summary: 'count',
              status: 'entered-in-error',
              ...planSiteFilter
            }),
          ]).pipe(
            map(([draft, active, completed, cancelled, enteredInError]) => {
              return [{
                name: 'Design',
                value: draft.total
              }, {
                name: 'Delivery',
                value: active.total
              }, {
                name: 'Completed',
                value: completed.total
              }, {
                name: 'Cancelled',
                value: cancelled.total
              }, {
                name: 'Entered in error',
                value: enteredInError.total
              }];
            })
          );

          const patientSiteFilter: any = {};
          if (formValue.sites.length > 0) {
            patientSiteFilter['_has:EpisodeOfCare:patient:organization'] = formValue.sites.join(',');
          }

          const conditionData$ = this.practitionerService.conditions().pipe(
            mergeMap(allcond => combineLatest(
              allcond.map(cond => {
                return this.fhirService.search('Patient', {
                  _summary: 'count',
                  // TODO: is this necessary for production?
                  // '_has:EpisodeOfCare:patient:organization.type:not': 'test',
                  '_has:Condition:patient:code': cond.valueCoding.code,
                  ...patientSiteFilter
                }, ).pipe(
                  map(res => ({ name: cond.valueCoding.display, value: res.total }))
                );
              }))
            ),
          );

          const genderData$ = combineLatest([
            this.fhirService.search('Patient', {
              _summary: 'count',
              gender: 'male',
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              gender: 'female',
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              gender: 'other,unkown',
              ...patientSiteFilter
            })
          ]).pipe(
            map(([male, female, other]) => {
              return [{
                name: 'Male',
                value: male.total
              }, {
                name: 'Female',
                value: female.total
              }, {
                name: 'Other',
                value: other.total
              }];
            })
          );

          const lessThan30 = moment().subtract(30, 'years');
          const lessThan40 = moment().subtract(40, 'years');
          const lessThan50 = moment().subtract(50, 'years');
          const lessThan60 = moment().subtract(60, 'years');
          const lessThan70 = moment().subtract(70, 'years');
          const lessThan80 = moment().subtract(80, 'years');
          const lessThan90 = moment().subtract(90, 'years');

          const ageData$ = combineLatest([
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: `ge${lessThan30.format('YYYY-MM-DD')}`,
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: [
                `lt${lessThan30.format('YYYY-MM-DD')}`,
                `ge${lessThan40.format('YYYY-MM-DD')}`,
              ],
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: [
                `lt${lessThan40.format('YYYY-MM-DD')}`,
                `ge${lessThan50.format('YYYY-MM-DD')}`,
              ],
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: [
                `lt${lessThan50.format('YYYY-MM-DD')}`,
                `ge${lessThan60.format('YYYY-MM-DD')}`,
              ],
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: [
                `lt${lessThan60.format('YYYY-MM-DD')}`,
                `ge${lessThan70.format('YYYY-MM-DD')}`,
              ],
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: [
                `lt${lessThan70.format('YYYY-MM-DD')}`,
                `ge${lessThan80.format('YYYY-MM-DD')}`,
              ],
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: [
                `lt${lessThan80.format('YYYY-MM-DD')}`,
                `ge${lessThan90.format('YYYY-MM-DD')}`,
              ],
              ...patientSiteFilter
            }),
            this.fhirService.search('Patient', {
              _summary: 'count',
              birthdate: `lt${lessThan90.format('YYYY-MM-DD')}`,
              ...patientSiteFilter
            })
          ]).pipe(
            map(([lt30, gt30lt40, gt40lt50, gt50lt60, gt60lt70, gt70lt80, gt80lt90, gt90]) => {
              return [{
                name: '< 30',
                value: lt30.total
              }, {
                name: '30-40',
                value: gt30lt40.total
              }, {
                name: '40-50',
                value: gt40lt50.total
              }, {
                name: '50-60',
                value: gt50lt60.total
              }, {
                name: '60-70',
                value: gt60lt70.total
              }, {
                name: '70-80',
                value: gt70lt80.total
              }, {
                name: '80-90',
                value: gt80lt90.total
              }, {
                name: '> 90',
                value: gt90.total
              }].reverse();
            })
          );

          return combineLatest([planData$, conditionData$, genderData$, ageData$]);
        })

      ).subscribe(([plan, condition, gender, age]) => {
        this.planStats = plan;
        this.genderStats = gender;
        this.ageStats = age;
        this.conditionStats = condition;
      });



    await this.practitionerService.currentRole().toPromise();
    const siteFilterStr = this.storageService.get({key: REPORT_SITE_KEY}) || '[]';
    this.sitesForm.reset({
      sites: JSON.parse(siteFilterStr)
    });
  }

  downloadReports() {
    this.dialog.open(ExportDataComponent);
  }

}
