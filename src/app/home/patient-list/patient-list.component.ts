import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PractitionerService } from '../../services/practitioner.service';
import { IFhirSearchParams, FhirService } from '../../services/fhir.service';
import { Subject, Observable, zip, of, combineLatest, ReplaySubject, BehaviorSubject } from 'rxjs';
import { PatientService } from '../../services/patient.service';
import { map, mergeMap } from 'rxjs/operators';
import { CarePlanService } from '../../services/care-plan.service';
import * as moment from 'moment';
import { CarePlanUtils } from '../../services/care-plan-utils';
import { HttpErrorResponse } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StorageService } from '../../services/storage-service';
import { IOrganisationAttributes } from '../../home/home.component';

interface IProgram {
  name: string;
  value: string;
}

export const FILTERS_LOCALSTORAGE_KEY = 'patientListFilters';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(PendingRegistrationsComponent) pendingRegistrations: PendingRegistrationsComponent;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(['(max-width: 1025px)'])
    .pipe(
      map(result => result.matches)
    );

  selected = [];
  loading: boolean;
  sites: Observable<fhir.Organization[]>;
  urnLabel$: Observable<any>;
  genders: Observable<any> = of(this.practitionService.genders());

  statuses = [
    { name: 'Design', value: 'draft' },
    { name: 'Delivery', value: 'active' },
    { name: 'Discharged', value: 'completed,suspended,cancelled,entered-in-error' }
  ];
  programs: Observable<IProgram[]> = of(this.statuses);

  allConditions: Observable<fhir.QuestionnaireItemOption[]>;

  rows: Subject<{
    patient: fhir.Patient;
    status?: string;
    site?: Observable<fhir.Organization>;
    conditions?: Observable<fhir.Condition[]>;
    plan?: Observable<fhir.CarePlan>;
  }[]> = new ReplaySubject(1);

  filters = {
    program: '_has:CarePlan:patient:status',
    site: '_has:EpisodeOfCare:patient:organization',
    condition: '_has:Condition:patient:code'
  };

  birthDateFilter: moment.Moment = void 0;
  programFilter: string[] = this.statuses.slice(0, 2).map(item => item.value);
  conditionFilter: string[] = [];

  options: IFhirSearchParams = {
    _count: '10',
    _sort: 'family',
    'active:not': 'false',
    [this.filters.program]: this.programFilter.join(','),
    [this.filters.site]: undefined
  };

  page = {
    limit: 10,
    offset: 0,
    total: 0
  };

  displayedColumns: string[] = ['familyName', 'givenName', 'birthDate', 'gender', 'conditions', 'plan', 'urn'];

  optionChanges: Subject<IFhirSearchParams> = new ReplaySubject(1);
  org$: BehaviorSubject<string> = new BehaviorSubject(void 0);

  allSites = true;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private practitionService: PractitionerService,
    private patientService: PatientService,
    private fhirService: FhirService,
    private carePlanService: CarePlanService,
    private storageService: StorageService,
    private regionConfig: RegionalConfigService) { }

  ngOnInit() {
    this.loading = true;

    // Restore and remove filters from localstorage
    this.unpackFilters();

    this.allConditions = this.carePlanService.conditions();
    this.sites = this.practitionService.sites();

    this.urnLabel$ = this.practitionService.managingOrganization().pipe(map(org => {
      const orgAttributes: IOrganisationAttributes =
      FhirService.flattenExtension<IOrganisationAttributes>((org.extension || [])
        .find(ext => ext.url === FhirService.EXTENSIONS.ORGANIZATION_ATTRIBUTES) || { url: '' });
      return orgAttributes && orgAttributes.urnLabel ? orgAttributes.urnLabel : 'URN';
    }));

  }

  ngOnDestroy(): void {
    // Save patient list filters to local storage when navigating to another page
    this.packFilters();
  }

  ngAfterViewInit(): void {
    // Default sort for the table
    // this.table.sorts.push({dir: 'desc', prop: 'patient.family'});
    this.sort.sortChange.subscribe((x) => this.onSort(x));
    this.paginator.page.subscribe(x => this.setPage(x));

    this.pendingRegistrations.approval$.subscribe((result: fhir.Bundle) => {
      // we need to refresh the list of patients immediately, and turn the cache off
      if (result) {
        delete this.options.nextUrl;
        this.options.noCache = 'true';
        const newPatient = ((result.entry || []).find(e => e.resource && e.resource.resourceType === 'Patient') || {}).resource;
        // Go straight to the new patient's page
        if (newPatient) {
          this.selectPatient(newPatient.id);
        } else {
          this.optionChanges.next(this.options);
        }
      }
    });

    combineLatest([
      this.optionChanges,
      this.practitionService.managingOrganization(),
      this.practitionService.currentRoleOrganization(),
      this.practitionService.roles()
    ]).subscribe(([options, managingOrganization, currentRoleOrg, allRoles]) => {
      // if (this.org && managingOrganization.id !== this.org) {
      //   delete options.nextUrl;
      // }

      // Do this check to prevent excessive calls from the appointments component
      if (!options[this.filters.site]) {
        this.org$.next(managingOrganization.id);
      } else {
        this.org$.next(options[this.filters.site] as string);
      }

      // Just use it one time and delete immediately
      const noCache: boolean = !!this.options.noCache;
      delete this.options.noCache;

      // if the currentRole is not for tenant root org, always limit all-sites query
      if (currentRoleOrg.partOf?.reference) {
        this.allSites = false;

        // if multiple roles, switch to the role that matches the filter
        if (managingOrganization.id !== currentRoleOrg.id && // it isn't a root role
            currentRoleOrg.id !== options[this.filters.site]) { // you selected a different site
            // switch to the role that matches the site (if you have it)
            const matchingRole = allRoles.find(role => role.organization?.reference === `Organization/${options[this.filters.site]}`);
            if (matchingRole) {
              this.practitionService.setCurrentRole(matchingRole);
              // this will cause this subsciption to be re-triggered, so whatever we do next will be overridden
            } else {
              options[this.filters.site] = currentRoleOrg.id;
            }
        } else {
          options[this.filters.site] = currentRoleOrg.id;
        }
      } else {
        this.allSites = true;
        if (!options[this.filters.site]) {
          delete options[this.filters.site];
        }
      }

      this.practitionService.patients({ ...options }, noCache)
        .subscribe({
          error: (err: HttpErrorResponse) => {
            if (err.status === 410) {
              console.log('Paginated result expired');
              delete this.options.nextUrl;
              this.optionChanges.next(this.options);
            }
            console.error(err);
          },
          next: patientsResponse => {

            this.packFilters();

            this.loading = false;

            this.page.total = patientsResponse.total;

            const foundNext = (patientsResponse.link.find(l => l.relation === 'next') || {} as any).url;

            const foundPrevious = (patientsResponse.link.find(l => l.relation === 'previous') || {} as any).url;

            if (foundPrevious) {
              this.options.nextUrl = foundPrevious;
            }

            if (foundNext) {
              this.options.nextUrl = foundNext;
            }

            this.rows.next(
              ((patientsResponse.entry || []).map(e => {
                const currentPlan$ = new ReplaySubject<fhir.CarePlan>(1);

                this.patientService.patientCarePlans(e.resource)
                  .pipe(
                    map(p => CarePlanUtils.findCurrent((p.entry || []).map(entry => entry.resource)))
                  ).subscribe(currentPlan$);

                const planConditions$ = currentPlan$.pipe(
                  mergeMap(currentPlan => {
                    if (currentPlan) {
                      return zip(...(currentPlan.addresses || []).map(condition => this.fhirService.reference(condition, currentPlan)));
                    } else {
                      return of([]);
                    }
                  }),
                  map(conditions => {
                    return conditions as fhir.Condition[];
                  })
                );

                const planSite = currentPlan$.pipe(
                  mergeMap(plan =>
                    this.carePlanService.planSite(plan))
                );

                const patient = Object.assign({}, e.resource, {
                  given: e.resource.name,
                  family: e.resource.name
                });

                return {
                  patient: patient,
                  site: planSite,
                  conditions: planConditions$,
                  plan: currentPlan$
                };
              })
              )
            );
          }
        });
    });
    this.optionChanges.next(this.options);
    this.paginator.firstPage();
    this.sort.start = 'asc';
  }

  packFilters() {
    const filters = {
      options: this.options,
      birthDateFilter: this.birthDateFilter,
      programFilter: this.programFilter,
      conditionFilter: this.conditionFilter
    };

    this.storageService.set({ key: FILTERS_LOCALSTORAGE_KEY, value: JSON.stringify(filters) });
  }

  unpackFilters() {
    const filters = JSON.parse(this.storageService.get({ key: FILTERS_LOCALSTORAGE_KEY }));
    if (!filters) {
      return;
    }

    Object.assign(this, filters);
    if (filters.birthDateFilter) {
      this.birthDateFilter = moment(filters.birthDateFilter);
    }

    this.storageService.remove({ key: FILTERS_LOCALSTORAGE_KEY });
  }

  getGenders() {
    this.genders = this.practitionService.genders();
  }


  filterByGender(event) {
    delete this.options.nextUrl;
    this.options.gender = event.value;
    this.optionChanges.next(this.options);
  }

  filterByProgram(event) {
    delete this.options.nextUrl;
    if (event.value.length) {
      this.options[this.filters.program] = this.programFilter.join(',');
    } else {
      delete this.options[this.filters.program];
    }
    this.optionChanges.next(this.options);
  }

  filterByCondition(event) {
    delete this.options.nextUrl;
    this.options[this.filters.condition] = event.value.join(',');
    this.optionChanges.next(this.options);
  }

  filterBySite(event) {
    delete this.options.nextUrl;
    if (event.value?.length > 0) {
      this.options[this.filters.site] = event.value;
    } else {
      delete this.options[this.filters.site];
    }
    this.optionChanges.next(this.options);
  }

  onSort({ active, direction }) {

    switch (active) {
      case 'birthDate':
        direction === 'desc' ? this.options._sort = 'birthdate' : this.options._sort = '-birthdate';
        break;
      case 'familyName':
        direction === 'desc' ? this.options._sort = 'family' : this.options._sort = '-family';
        break;
      case 'givenName':
        direction === 'desc' ? this.options._sort = 'given' : this.options._sort = '-given';
        break;
      case 'gender':
        direction === 'desc' ? this.options._sort = 'gender' : this.options._sort = '-gender';
    }

    this.loading = true;
    delete this.options.nextUrl;
    this.options._getpagesoffset = '0';
    this.optionChanges.next(this.options);
  }

  setPage({ pageIndex, pageSize, length }) {
    this.page.offset = pageIndex;
    this.options._getpagesoffset = String(this.page.offset * pageSize);
    this.options._count = pageSize;
    this.optionChanges.next(this.options);
  }

  // TODO setup a pipe
  showGivenName(name) {
    return name.map(n => {
      return n.given.join(', ');
    });
  }

  // TODO setup a pipe
  showFamilyName(name) {
    return name.map((n: fhir.HumanName) => {
      return n.family.toUpperCase();
    });
  }


  filter($event) {

    delete this.options.nextUrl;
    if (this.options.family === '') {
      delete this.options.family;
    }

    if (this.options.given === '') {
      delete this.options.given;
    }

    if (this.options.birthDate === '') {
      this.birthDateFilter = void 0;
      delete this.options.birthDate;
    } else if (this.birthDateFilter) {
      this.options.birthdate = this.birthDateFilter.format('YYYY-MM-DD');
    }

    if (this.options.identifier === '') {
      delete this.options.identifier;
    }
    this.optionChanges.next(this.options);
  }

  patientAge(date) {
    return moment().diff(date, 'years');
  }

  onSelect(row) {
    if (row) {
      this.selectPatient(row.patient.id);
    }
  }

  selectPatient(id) {
    this.router.navigate([`/${this.regionConfig.region}/home`, 'patient', id]);
  }

  mapStatus(status) {
    switch (status) {
      case 'draft':
        return 'Design';
      case 'active':
        return 'Delivery';
      case 'entered-in-error':
        return 'Deleted';
      case 'completed':
        return 'Discharged';
      case 'cancelled':
        return 'Discharged';
      default:
        return '';
    }
  }

  resetFilter(filter) {
    delete this.options.nextUrl;
    delete this.options[filter];

    if (filter === 'birthdate') {
      this.birthDateFilter = void 0;
    }

    this.optionChanges.next(this.options);
  }

  getURN(row) {
    return (this.patientService.urn(row.patient) || {}).value;
  }
}
