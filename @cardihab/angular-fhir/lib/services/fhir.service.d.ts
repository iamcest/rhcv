/// <reference types="fhir" />
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegionalConfigService } from './regional.service';
import * as i0 from "@angular/core";
export interface IFhirResponse<T extends fhir.Resource> {
    resourceType: string;
    id: string;
    meta: {
        lastUpdated: string;
    };
    type: string;
    total: number;
    link: {
        relation: string;
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
export declare class FhirService {
    private http;
    private config;
    static EXTENSIONS: {
        TASK_ENABLE_WHEN: string;
        EDUCATION_TASK: string;
        ADHERENCE: string;
        RECURRING_TASK: string;
        BASED_ON_GOAL: string;
        PATIENT_SPECIFIC_REMINDER: string;
        ORGANIZATION_ATTRIBUTES: string;
    };
    static IDENTIFIER_SYSTEMS: {
        SITECODE: string;
        FHIR_IDENTIFIER_TYPE: string;
        SNOMED: string;
        GOAL_CATEGORY: string;
        TENANCY_SECURITY_SYSTEM: string;
    };
    base: any;
    tenancy: string;
    private refCache;
    static hasCoding(concept: fhir.CodeableConcept, codes: any): boolean;
    static referenceToId(reference: fhir.Reference): {
        resourceType: string;
        id: string;
    };
    static flattenExtension<T>(extension: fhir.Extension): T | any;
    constructor(http: HttpClient, config: RegionalConfigService);
    getUrl(tenancyOverride?: string): string;
    setUrl(newUrl: string): void;
    options(): HttpHeaders;
    nextPage<T>(response: IFhirResponse<T>): Observable<IFhirResponse<T>>;
    reference<T>(ref: fhir.Reference, context: fhir.DomainResource): Observable<T>;
    get<T extends fhir.Resource>(resourceType: string, id: string, tenancy?: string): Observable<T>;
    search<T extends fhir.Resource>(resourceType: string, params: any, options?: {
        tenancy?: string;
        headers?: any;
    }, pagination?: boolean): Observable<IFhirResponse<T>>;
    patch(resourceUrl: any, cmd: any, options?: {
        tenancy?: string;
        headers?: any;
    }): Observable<any>;
    delete(resourceType: any, id: any, options?: {
        tenancy?: string;
        headers?: any;
    }): Observable<Object>;
    save<T extends fhir.Resource>(bundle: T, options?: {
        tenancy?: string;
        headers?: any;
    }): Observable<T>;
    saveAll(resources: fhir.Resource[], options?: {
        tenancy?: string;
        headers?: any;
    }): Observable<fhir.Bundle>;
    resolveReferences<T extends fhir.DomainResource>(references: fhir.Reference[], context: fhir.DomainResource, count?: number): Observable<fhir.Bundle>;
    referenceToAbsoluteUrl(ref: fhir.Reference, context: fhir.Resource): string;
    getContextBaseUrl(context?: fhir.Resource): string;
    static ɵfac: i0.ɵɵFactoryDef<FhirService, never>;
    static ɵprov: i0.ɵɵInjectableDef<FhirService>;
}
