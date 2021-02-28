import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, of, BehaviorSubject, from, zip, combineLatest, EMPTY } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FhirService, IFhirResponse, IFhirSearchParams } from './fhir.service';
import { map, mergeMap, catchError, distinctUntilChanged } from 'rxjs/operators';
import * as url from 'url';
import { ServicesModule } from './services.module';
import { AuthInterceptor } from './auth-interceptor.service';
import { ReportService } from './report.service';
import { StorageService } from '../services/storage-service';

@Injectable({
  providedIn: ServicesModule
})
export class PractitionerService {

  public tenants: string[];

  private practitioner$ = new ReplaySubject<fhir.Practitioner>(1);
  private practitionerOrg$ = new ReplaySubject<fhir.Organization>(1);
  private practitionerRoles$ = new ReplaySubject<fhir.PractitionerRole[]>(1);
  private currentRole$ = new ReplaySubject<fhir.PractitionerRole>(1);

  refresh = new BehaviorSubject<boolean>(true);

  constructor(private fhirService: FhirService,
    private http: HttpClient,
    private auth: AuthInterceptor,
    private storageService: StorageService
  ) {

    from(this.auth.getCachedUserSession())
      .pipe(
        map(session => session.getIdToken().decodePayload()),
        mergeMap(jwt => {
          this.tenants = jwt['cognito:groups'];
          return zip(...(this.tenants || []).map(tenantName =>
            // FIXME: query params with '+' in the value will be incorrectly URI encoded by angular so can't use fhirService.search(...)
            this.http.get<IFhirResponse<fhir.PractitionerRole>>(`${this.fhirService.getUrl(tenantName)}/PractitionerRole?practitioner.active=true&practitioner.email=${encodeURIComponent(jwt.email)}`)
              .pipe(
                catchError(() => of({ total: 0 } as IFhirResponse<fhir.PractitionerRole>))
              )
          ));
        }),
        map(arrayOfRoleResponses => {
          const bundle: Partial<fhir.Bundle> = {
            total: 0,
            entry: []
          };
          arrayOfRoleResponses.forEach(b => {
            if (b.total > 0) {
              bundle.entry.splice(-1, 0, ...b.entry);
              bundle.total += b.total;
            }
          });
          return bundle;
        }),
        map(roles => {
          this.practitionerRoles$.next((roles.entry || []).map(e => e.resource as fhir.PractitionerRole));
          const preferredRoleRef = this.storageService.get({key: 'practitionerRole.selected'});
          if (roles.total > 0) {
            const preferredRole = roles.entry.find(r => r.fullUrl.includes(preferredRoleRef));
            return preferredRole ? preferredRole.resource : roles.entry[0].resource as fhir.PractitionerRole;
          }
          return null;
        })
      ).subscribe((selected: fhir.PractitionerRole) => {
        if (selected) {
          this.currentRole$.next(selected);
        }
      });

    this.currentRole$
      .pipe(
        mergeMap(currentRole => {
          if (currentRole) {
            return this.fhirService.reference<fhir.Practitioner>(currentRole.practitioner, currentRole);
          }
        })
      ).subscribe(this.practitioner$);

    this.currentRole$
      .pipe(
        mergeMap(currentRole => {
          if (currentRole) {
            return this.fhirService.reference(currentRole.organization, currentRole);
          }
        })
      ).subscribe(this.practitionerOrg$);

    this.currentRole$.subscribe(context => {
      if (context) {
        if (context && context.meta && context.meta.security) {
          const tenancyTag = context.meta.security.find(sec => sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM);
          if (tenancyTag) {
            this.fhirService.tenancy = tenancyTag.display;
          }
        }
      }
    });
  }

  get current(): Observable<fhir.Practitioner> {
    return this.practitioner$;
  }

  currentRole(): Observable<fhir.PractitionerRole> {
    return this.currentRole$;
  }

  currentRoleOrganization(): Observable<fhir.Organization> {
    return this.practitionerOrg$;
  }

  setCurrentRole(role: fhir.PractitionerRole) {
    if (role) {
      this.currentRole$.next(role);
    }
  }

  managingOrganization(): Observable<fhir.Organization> {
    return this.practitionerOrg$
    .pipe(
      distinctUntilChanged(),
      mergeMap(org => {
        if (org?.partOf?.reference) {
          return this.fhirService.reference<fhir.Organization>(org.partOf, org);
        } else {
          return of(org);
        }
      })
    );
  }

  roles(): Observable<fhir.PractitionerRole[]> {
    return this.practitionerRoles$;
  }

  currentRoleCodes(): Observable<string[]> {
    return this.currentRole$
    .pipe(
      map(current => {
        const roleCodes = [];
        (current.code || []).forEach(cc => {
          cc.coding.forEach(coding => {
            if (roleCodes.indexOf(coding.code) === -1) {
              roleCodes.push(coding.code);
            }
          });
        });
        return roleCodes;
      })
    );
  }

  sites(): Observable<fhir.Organization[]> {
    return this.currentRole().pipe(
      mergeMap(() => combineLatest([this.roles(), this.managingOrganization()])),
      mergeMap(([allRoles, managingOrganization]) => {
        return this.fhirService.search<fhir.Organization>(`Organization`, {})
        .pipe(
          map(allOrgs => {
            const sites = (allOrgs.entry || [])
            .map(e => e.resource)
            .filter(site => {
              return (site?.identifier || []).some(identifier => identifier.system === FhirService.IDENTIFIER_SYSTEMS.SITECODE && identifier.value);
            });

            if (allRoles.some(r => r.organization?.reference === `Organization/${managingOrganization.id}`)) {
              return sites;
            } else {
              // site should be one of the roles
              return sites.filter(s => allRoles.some(r => `Organization/${s.id}` === r.organization?.reference));
            }
          })
        );
      })
    );
  }

  genders(): any {
    return [
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: '', name: 'None' }
    ];
  }

  patients(params?: IFhirSearchParams, noCache: boolean = false): Observable<IFhirResponse<fhir.Patient>> {
    let headers: HttpHeaders = new HttpHeaders();

    if (noCache) {
      headers = headers.set('Cache-Control', 'no-cache');
    }

    if (params && params.nextUrl) {
      const parsedNext = url.parse(params.nextUrl, true);
      const nextParams = parsedNext.query;
      nextParams._getpagesoffset = params._getpagesoffset;
      parsedNext.search = undefined;

      return this.http.get<IFhirResponse<fhir.Patient>>(url.format(parsedNext));
    } else {
      return this.fhirService.search<fhir.Patient>(`Patient`, params, { headers }, true);
    }
  }

  groups(params?: IFhirSearchParams): Observable<IFhirResponse<fhir.Group>> {
    return this.current.pipe(
      mergeMap(clinician => {
        if (params && params.nextUrl) {
          const parsedNext = url.parse(params.nextUrl, true);
          const nextParams = parsedNext.query;
          nextParams._getpagesoffset = params._getpagesoffset;
          parsedNext.search = undefined;
          return this.http.get<IFhirResponse<fhir.Group>>(url.format(parsedNext));
        } else {
          return combineLatest([
            this.fhirService.search<fhir.Group>(`Group`, { member: clinician.id }),
            this.fhirService.search<fhir.Group>(`Group`, { member: `${this.fhirService.getContextBaseUrl(clinician)}/Practitioner/${clinician.id}` }, { tenancy: 'public' })
          ]).pipe(
            map(([tenantGroups, publicGroups]) => {
              return {
                resourceType: 'Bundle',
                entry: [...tenantGroups.entry || [], ...publicGroups.entry || []],
                total: tenantGroups.total + publicGroups.total
              };
            })
          );
        }
      })
    );
  }

  groupCarePlans(params?: IFhirSearchParams): Observable<IFhirResponse<fhir.CarePlan>> {
    if (params && params.nextUrl) {
      const parsedNext = url.parse(params.nextUrl, true);
      const nextParams = parsedNext.query;
      nextParams._getpagesoffset = params._getpagesoffset;
      parsedNext.search = undefined;
      return this.http.get<IFhirResponse<fhir.CarePlan>>(url.format(parsedNext));
    } else {
      return this.groups().pipe(
        mergeMap(groupsResponse => {
          if (groupsResponse.total > 0) {
            // groups may be across tenancies
            const planRequests = groupsResponse.entry.map((groupEntry: fhir.BundleEntry) => {
              const tenancy = this.fhirService.getContextTenancy(groupEntry.resource);
              const planSearchParams = {
                patient: groupEntry.resource.id,
                status: 'active'
              };
              return this.fhirService.search<fhir.CarePlan>(`CarePlan`, planSearchParams, { tenancy });
            });
            return zip(...planRequests)
              .pipe(
                map(arrayOfPlanResponses => {
                  const bundle: IFhirResponse<fhir.CarePlan> = {
                    resourceType: 'bundle',
                    total: 0,
                    entry: []
                  };
                  arrayOfPlanResponses.forEach(b => {
                    if (b.total > 0) {
                      bundle.entry.splice(-1, 0, ...b.entry);
                      bundle.total += b.total;
                    }
                  });
                  return bundle;
                })
              );

          } else {
            return EMPTY;
          }
        })
      );
    }

  }

  siteCodeOf(org: fhir.Organization) {
    const siteId = (org.identifier || []).find(id => id.system === FhirService.IDENTIFIER_SYSTEMS.SITECODE);
    if (siteId) {
      return siteId.value;
    }
    return org.id;
  }

  findQuestion(questionnaire: fhir.Questionnaire, matchFn: (question: fhir.QuestionnaireItem) => boolean): fhir.QuestionnaireItem {
    const recurseFind = (questions) => {
      let deepQuestion;

      const found = (questions || []).find(q => {
        if (q.type !== 'group') {
          if (matchFn(q)) {
            deepQuestion = q;
            return true;
          }
          return false;
        } else {
          deepQuestion = recurseFind(q.item);
          return deepQuestion != null;
        }
      });
      if (found) {
        return deepQuestion;
      }
    };

    return recurseFind(questionnaire.item);
  }

  conditions(): Observable<fhir.QuestionnaireItemOption[]> {
    // tslint:disable-next-line: no-console
    console.debug('Getting conditions');
    return this.fhirService.search<fhir.CarePlan>(`CarePlan`, { status: 'active' }, { tenancy: 'public' })
      .pipe(
        mergeMap(plans => {
          if (plans.total > 0) {
            const ia = plans.entry.reduce((assesments, planResource) => {
              const x = planResource.resource.activity.filter(act => ReportService.isInitialAssessment(act));
              if (x && x.length > 0) {
                assesments.push(...x);
              }
              return assesments;
            }, []);
            return zip(...ia.filter(a => a.detail.definition).map(activity => this.fhirService.reference<fhir.Questionnaire>(activity.detail.definition, plans.entry[0].resource)));
          } else {
            return [];
          }
        }),
        map(questionnaires => {
          let conditionCodes = [];
          questionnaires.some(q => {
            const currentProcQ = this.findQuestion(q, question =>
              FhirService.hasCoding({ coding: question.code } as fhir.CodeableConcept, ReportService.CURRENT_PROCEDURE_CODES));
            if (currentProcQ != null) {
              conditionCodes = currentProcQ.option;
              return true;
            }
            return false;
          });
          return conditionCodes;
        })
      );
  }
}
