import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, throwError, ReplaySubject, of } from 'rxjs';
import { map, tap, expand, reduce } from 'rxjs/operators';
import * as url from 'url';
import { RegionalConfigService } from './regional.service';
import { LRUMap } from './lru';

export interface IFhirResponse<T extends fhir.Resource> {
  resourceType: string;
  id: string;
  meta: {
    lastUpdated: string;
  };
  type: string;
  total: number;
  link: {
    relation: string,
    url: string;
  }[];
  entry: {
    fullUrl: string;
    resource: T;
    search: {
      mode: string;
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

@Injectable()
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
    TENANCY_SECURITY_SYSTEM: 'Tenancy'
  };


  // set by auth guard. Fixme cleaner separation would be nice
  public base = this.config.get('fhir');
  public tenancy = 'baseDstu3';

  private refCache = new LRUMap(100);

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

  static referenceToId(reference: fhir.Reference): { resourceType: string, id: string } {
    const [resourceType, id] = (reference || { reference: '' }).reference.split('/');
    return {
      resourceType,
      id
    };
  }

  static flattenExtension<T>(extension: fhir.Extension): T | any {
    const obj = {};
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

  constructor(private http: HttpClient, private config: RegionalConfigService) { }

  getUrl(tenancyOverride?: string): string {
    return `${this.base}/${tenancyOverride ? tenancyOverride : this.tenancy}`;
  }

  setUrl(newUrl: string) {
    this.base = newUrl;
  }

  options(): HttpHeaders {
    return new HttpHeaders({ Accept: 'application/json' });
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
        return throwError(new Error(`Don't yet support contained references`));

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

  get<T extends fhir.Resource>(resourceType: string, id: string, tenancy?: string): Observable<T> {
    if (id === 'new') {
      return of(null);
    } else {
      return this.http.get<T>(`${this.getUrl(tenancy)}/${resourceType}/${id}`);
    }
  }


  search<T extends fhir.Resource>(
    resourceType: string,
    params: any,
    options?: { tenancy?: string, headers?: any},
    pagination: boolean = false
  ): Observable<IFhirResponse<T>> {
    const requestOptions: {params: any, headers?: any} = {
      params
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
          expand((res) => {
            const foundNext = ((res.link || []).find(l => l.relation === 'next') || {} as any).url;
            if (foundNext) {
              return this.http.get<IFhirResponse<T>>(url.format(url.parse(foundNext, true)));
            }
            return of();
          }),
          reduce((acc: IFhirResponse<T>, value: IFhirResponse<T>) => {
            if (acc.entry && value.entry) {
              acc.entry = acc.entry.concat(value.entry);
            }
            return acc;
          })
        );
    }
  }

  patch(resourceUrl, cmd, options?: { tenancy?: string, headers?: any }): Observable<any> {
    const requestOptions: { params?: any, headers?: any } = {
      headers: {
        'content-type': 'application/json-patch+json'
      }
    };
    if (options && options.headers) {
      Object.assign(requestOptions.headers, options.headers);
    }
    return this.http.patch(resourceUrl, cmd, requestOptions);
  }

  delete(resourceType, id, options?: {tenancy?: string, headers?: any}) {
    const requestOptions: { params?: any, headers?: any } = { };
    if (options && options.headers) {
      requestOptions.headers = options.headers;
    }
    return this.http.delete(`${this.getUrl((options || {}).tenancy)}/${resourceType}/${id}`, requestOptions);
  }

  save<T extends fhir.Resource>(bundle: T, options?: { tenancy?: string, headers?: any }): Observable<T> {
    if (bundle.resourceType === 'Bundle') {
      return this.http.post<T>(`${this.getUrl((options || {}).tenancy)}`, bundle, {
        headers: {
          'content-type': 'application/fhir+json',
          Prefer: 'return=representation'
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
      return this.saveAll([bundle], options)
        .pipe(
          map(bundleResponse => bundleResponse.entry[0].resource as T)
        );
    }
  }

  saveAll(resources: fhir.Resource[], options?: { tenancy?: string, headers?: any }): Observable<fhir.Bundle> {

    const bundleEntries = resources.map(p => {
      return {
        request: {
          method: p.id ? 'PUT' : 'POST',
          // tslint:disable-next-line:no-string-literal
          url: p.id ? `${p.resourceType}/${p.id}` : (p['identifier'] || [])[0] ? `urn:uuid:${p['identifier'][0].value}` : p.resourceType
        },
        resource: p
      };
    });

    return this.save<fhir.Bundle>({
      resourceType: 'Bundle',
      type: 'transaction',
      entry: bundleEntries
    }, options);
  }

  resolveReferences<T extends fhir.DomainResource>(
    references: fhir.Reference[],
    context: fhir.DomainResource,
    count: number = 500
  ): Observable<fhir.Bundle> {
    if (!references || !Array.isArray(references) || !references.length) {
      return of({} as fhir.Bundle);
    }

    const { resourceType } = FhirService.referenceToId(references[0]);
    const ids = references.map(ref => FhirService.referenceToId(ref).id);

    return this.http.post<IFhirResponse<T>>(`${this.getContextBaseUrl(context)}/${resourceType}/_search`,
      `_id=${ids.join(',')}&_count=${count}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .pipe(
        expand((res) => {
          const foundNext = ((res.link || []).find(l => l.relation === 'next') || {} as any).url;
          if (foundNext) {
            return this.http.get<IFhirResponse<fhir.Bundle>>(url.format(url.parse(foundNext, true)));
          }
          return of();
        }),
        reduce((acc: fhir.Bundle, value: fhir.Bundle) => {
          if (acc.entry && value.entry) {
            acc.entry = acc.entry.concat(value.entry);
          }
          return acc;
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

  getContextBaseUrl(context?: fhir.Resource) {
    let base = this.getUrl();
    if (context && context.meta && context.meta.security) {
      const tenancyTag = context.meta.security.find(sec => sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM);
      if (tenancyTag) {
        base = this.getUrl(tenancyTag.display);
      }
    }
    return base;
  }
}
