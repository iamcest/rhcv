/// <reference types="fhir" />
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class FhirUsualNamePipe implements PipeTransform {
    transform(value: fhir.HumanName[], args?: any): any;
    static ɵfac: i0.ɵɵFactoryDef<FhirUsualNamePipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<FhirUsualNamePipe, "fhirUsualName">;
}
