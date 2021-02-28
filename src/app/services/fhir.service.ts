import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, throwError, ReplaySubject, of, forkJoin } from 'rxjs';
import { map, tap, reduce, concatAll, mergeMap } from 'rxjs/operators';
import { ServicesModule } from './services.module';
import * as url from 'url';
import * as Sentry from '@sentry/browser';
import { RegionalConfigService } from '@cardihab/angular-fhir';

export interface IFhirResponse<T extends fhir.Resource> {
  resourceType?: string;
  id?: string;
  meta?: {
    lastUpdated?: string;
  };
  type?: string;
  total?: number;
  link?: {
      relation: string,
      url: string;
    }[];
  entry: {
    fullUrl?: string;
    resource: T;
    search?: {
      mode?: 'match' | 'include' | 'outcome';
    };
  }[];
}

export interface IFhirSearchParams {
  nextUrl?: string;
  _count?: string;
  _sort?: string;
  _getpagesoffset?: string;
  [param: string]: string | string[];
}

const REF_REGEX = /^(?:https\:\/\/.*\/)?(.*)\/(.*)$/;

@Injectable({
  providedIn: ServicesModule
})
export class FhirService {

  static EXTENSIONS = {
    TASK_ENABLE_WHEN: 'https://fhir-registry.cardihab.com/StructureDefiniton/TaskEnableWhen',
    EDUCATION_TASK: 'https://fhir-registry.cardihab.com/StructureDefiniton/EducationTask',
    ADHERENCE: 'https://fhir-registry.cardihab.com/StructureDefiniton/Adherence',
    RECURRING_TASK: 'https://fhir-registry.cardihab.com/StructureDefiniton/RecurringTask',
    BASED_ON_GOAL: 'https://fhir-registry.cardihab.com/StructureDefiniton/BasedOnGoal',
    PATIENT_SPECIFIC_REMINDER: 'https://fhir-registry.cardihab.com/StructureDefiniton/PatientSpecificReminder',
    ORGANIZATION_ATTRIBUTES: 'https://fhir-registry.cardihab.com/StructureDefiniton/OrganizationAttributes'
  };

  static IDENTIFIER_SYSTEMS = {
    SITECODE: 'urn:sitecode',
    FHIR_IDENTIFIER_TYPE: 'http://hl7.org/fhir/identifier-type',
    SNOMED: 'http://snomed.info/sct',
    GOAL_CATEGORY: 'http://hl7.org/fhir/goal-category',
    SYMPTOM_CATEGORY: 'http://hl7.org/fhir/symptom-category',
    ACTIVITY_CATEGORY: 'http://hl7.org/fhir/activity-category',
    OBSERVATION_CATEGORY: 'http://hl7.org/fhir/observation-category',
    TENANCY_SECURITY_SYSTEM: 'Tenancy'
  };


  // set by auth guard. Fixme cleaner separation would be nice
  public base = this.regionService.get('api').fhir;
  // public fhir = 'default';
  public tenancy = 'baseDstu3';

  private refCache = new Map<string, any>();

  static hasCoding(concept: fhir.CodeableConcept, codes) {
    if (concept && concept.coding && codes) {
      for (const code of concept.coding) {
        if (code.code && codes.find(ia => ia.system === code.system && ia.code === code.code) != null) {
          return true;
        }
      }
    }
    return false;
  }


  static referenceToId(reference: fhir.Reference): {resourceType: string, id: string} {
    if (reference && reference.reference) {
      const matched = reference.reference.match(REF_REGEX);
      if (matched) {
        const [, resourceType, id] = matched;
        return {
          resourceType,
          id
        };
      }
    }
    return null;
  }

  static flattenExtension<T>(extension: fhir.Extension): T | any {
    const obj = {};
    if (!extension) {
      return undefined;
    }
    if (extension.extension) {
      extension.extension.forEach(ext => {
        obj[ext.url] = FhirService.flattenExtension(ext);
      });
    } else {
      return extension.valueString ? extension.valueString :
        extension.valueReference ? extension.valueReference :
        extension.valueCoding ? extension.valueCoding :
        extension.valueUri ? extension.valueUri :
        extension.valueBoolean ? extension.valueBoolean :
        extension.valueAddress ? extension.valueAddress :
        extension.valueAge ? extension.valueAge :
        extension.valueAnnotation ? extension.valueAnnotation :
        extension.valueAttachment ? extension.valueAttachment :
        extension.valueBase64Binary ? extension.valueBase64Binary :
        extension.valueCode ? extension.valueCode :
        extension.valueCodeableConcept ? extension.valueCodeableConcept :
        extension.valueContactPoint ? extension.valueContactPoint :
        extension.valueCount ? extension.valueCount :
        extension.valueDate ? extension.valueDate :
        extension.valueDecimal ? extension.valueDecimal :
        extension.valueDuration ? extension.valueDuration :
        extension.valueHumanName ? extension.valueHumanName :
        extension.valueId ? extension.valueId :
        extension.valueDateTime ? extension.valueDateTime :
        extension.valueDistance ? extension.valueDistance :
        extension.valueInteger ? extension.valueInteger :
        // todo add additional value[x] types
        null;
    }
    return obj;
  }

  constructor(private regionService: RegionalConfigService, private http: HttpClient) {}

  getUrl(tenancyOverride?: string): string {
    return `${this.base}/${tenancyOverride ? tenancyOverride : this.tenancy}`;
  }

  setUrl(newUrl: string) {
    this.base = newUrl;
  }

  options(): HttpHeaders {
    return new HttpHeaders({ 'Accept': 'application/json' });
  }

  nextPage<T>(response: IFhirResponse<T>): Observable<IFhirResponse<T>> {
    if (response) {
      const nextLink = (response.link || []).find(l => l.relation === 'next');
      if (nextLink) {
        return this.http.get<IFhirResponse<T>>(nextLink.url);
      }
    }

    return throwError(new Error('No next link to follow'));
  }

  reference<T>(ref: fhir.Reference, context: fhir.DomainResource): Observable<T> {
    if (ref && ref.reference) {
      const absoluteUri = this.referenceToAbsoluteUrl(ref, context);
      let ref$ = this.refCache.get(absoluteUri);

      // TODO handle contained resource references
      if (absoluteUri.startsWith('#')) {
        const contained = context.contained.find(c => c.id === absoluteUri.substring(1));
        return of(contained as T);

      } else {
        if (!ref$) {
          ref$ = new ReplaySubject<T>(1);
          this.http.get<T>(absoluteUri)
          .subscribe(ref$);
          this.refCache.set(absoluteUri, ref$);
        }
        return ref$;
      }
    } else {
      return throwError(new Error('Invalid reference'));
    }
  }

  invalidate(ref: fhir.Reference, context: fhir.DomainResource) {
    if (ref && ref.reference) {
      const absoluteUri = this.referenceToAbsoluteUrl(ref, context);
      this.refCache.delete(absoluteUri);
    }
  }

  get<T extends fhir.Resource>(resourceType: string, id: string, tenancy?: string): Observable<T> {
    if (id === 'new') {
      return of(null);
    } else {
      return this.http.get<T>(`${this.getUrl(tenancy)}/${resourceType}/${id}`);
    }
  }

  search<T extends fhir.Resource>(resourceType: string, params: any, options?: { tenancy?: string, headers?: any}, pagination: boolean = false): Observable<IFhirResponse<T>> {
    const requestOptions: {params: any, headers?: any} = {
      params: params
    };
    if (options && options.headers) {
      requestOptions.headers = options.headers;
    }

    const request = this.http.get<IFhirResponse<T>>(`${this.getUrl((options || {}).tenancy)}/${resourceType}`, requestOptions);

    if (pagination) {
      return request;
    } else {
      return request
        .pipe(
          mergeMap((res: IFhirResponse<T>) => {
            let foundNext;
            if (res.link) {
              foundNext = (res.link.find(l => l.relation === 'next') || {} as any).url;
            }
            if (foundNext) {
              return this.parallelExpand(foundNext, res.total).pipe(
                map(pages => {
                  if (res.entry && pages.entry) {
                    res.entry.splice(-1, 0, ...pages.entry as any);
                  }
                  return res;
                })
              );
            } else {
              return of(res);
            }
          })
        );
    }
  }
  private parallelExpand<T extends fhir.Resource>(nextLink, total): Observable<IFhirResponse<T>> {
    const nexUrl = url.parse(nextLink, true);
    const numberOfPages = Math.ceil((total - Number(nexUrl.query._getpagesoffset)) / Number(nexUrl.query._count));
    const pageParams = [];
    for (let n = 1; n <= numberOfPages; n++) {
      const pageNUrl = { ...nexUrl};
      pageNUrl.query = {...nexUrl.query};
      pageNUrl.query._getpagesoffset = String(Number(nexUrl.query._count) * n);
      delete pageNUrl.search;
      pageParams.push(pageNUrl);
    }
    return forkJoin(pageParams.map(params => this.http.get<IFhirResponse<T>>(url.format(params))))
    .pipe(
      concatAll(),
      reduce((acc: IFhirResponse<T>, value: IFhirResponse<T>) => {
        if (acc.entry && value.entry) {
          acc.entry = acc.entry.concat(value.entry);
        }
        return acc;
      })
    );
  }

  private dedupe(items: fhir.BundleEntry[]): fhir.BundleEntry[] {
    const uniques: fhir.BundleEntry[] = [];
    const dupes: fhir.BundleEntry[] = [];
    items.forEach((item) => {
      if (item.request.method !== 'DELETE' && !uniques.find(r => r.resource.resourceType === item.resource.resourceType && r.resource.id && r.resource.id === item.resource.id)) {
        uniques.push(item);
      } else {dupes.push(item); }
    });

    // Log in Sentry
    if (dupes.length) {
      const str = dupes.filter(e => e.resource).map(i => `${i.resource.resourceType}:${i.resource.id}`).join(',');
      Sentry.captureMessage(`Duplicate resources detected and removed: ${str}`, Sentry.Severity.Error);
    }

    return uniques;
  }

  save<T extends fhir.Resource>(bundle: T): Observable<T> {
    if (bundle.resourceType === 'Bundle') {
      (bundle as fhir.Bundle).entry = this.dedupe((bundle as fhir.Bundle).entry);
      return this.http.post<T>(`${this.getUrl()}`, bundle, {
        headers: {
          'content-type': 'application/fhir+json',
          'Prefer': 'return=representation'
        }
      }).pipe(
        tap(bundleResponse => {
          ((bundleResponse as fhir.Bundle).entry || []).forEach((v: fhir.BundleEntry, k) => {
            if ((bundle as fhir.Bundle).entry[k]) {
              (bundle as fhir.Bundle).entry[k].resource.id = v.resource.id;
            }
          });
        })
      );
    } else {
      return this.saveAll([bundle])
      .pipe(
        map(bundleResponse => bundleResponse.entry[0].resource as T)
      );
    }
  }

  saveAll(resources: fhir.Resource[]): Observable<fhir.Bundle> {

    const bundleEntries = resources.map(p => {
      return {
        request: {
          method: p.id ? 'PUT' : 'POST',
          url: p.id ? `${p.resourceType}/${p.id}` : (p['identifier'] || [])[0] ? `urn:uuid:${p['identifier'][0].value}` : p.resourceType
        },
        resource: p
      } as fhir.BundleEntry;
    });

    return this.save<fhir.Bundle>({
      resourceType: 'Bundle',
      type: 'transaction',
      entry: bundleEntries
    });
  }

  resolveReferences<T extends fhir.Resource>(references: fhir.Reference[], context: fhir.DomainResource, count: number = 500): Observable<IFhirResponse<T>> {
    if (!references || !Array.isArray(references) || !references.length) {
      return of({} as IFhirResponse<T>);
    }

    const {resourceType} = FhirService.referenceToId(references[0]);
    const ids = references.map(ref => FhirService.referenceToId(ref).id);

    return this.http.post<IFhirResponse<T>>(
      `${this.getContextBaseUrl(context)}/${resourceType}/_search`,
      `_id=${ids.join(',')}&_count=${count}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).pipe(
      mergeMap((res: IFhirResponse<T>) => {
        let foundNext;
        if (res.link) {
          foundNext = (res.link.find(l => l.relation === 'next') || {} as any).url;
        }
        if (foundNext) {
          return this.parallelExpand(foundNext, res.total).pipe(
            map(pages => {
              if (res.entry && pages.entry) {
                res.entry.splice(-1, 0, ...pages.entry as any);
              }
              return res;
            })
          );
        } else {
          return of(res);
        }
      })
    );
  }

  referenceToAbsoluteUrl(ref: fhir.Reference, context: fhir.Resource): string {
    const refUrl = url.parse(ref.reference);
    if (refUrl.hash && !refUrl.protocol) { // don't touch contained resource references
      return ref.reference;
    }
    const base = this.getContextBaseUrl(context);
    return url.resolve(`${base}/`, ref.reference);
  }

  getContextBaseUrl(context?: fhir.Resource): string {
    let base = this.getUrl();
    if (context && context.meta && context.meta.security) {
      const tenancyTag = context.meta.security.find(sec => sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM);
      if (tenancyTag) {
        base = this.getUrl(tenancyTag.display);
      }
    }
    return base;
  }

  getContextTenancy(context: fhir.Resource): string {
    if (context && context.meta && context.meta.security) {
      const tenancyTag = context.meta.security.find(sec => sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM);
      if (tenancyTag) {
        return tenancyTag.display;
      }
    }
  }
}
