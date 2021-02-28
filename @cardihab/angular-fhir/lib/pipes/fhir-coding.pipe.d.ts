/// <reference types="fhir" />
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class FhirCodingPipe implements PipeTransform {
    transform(value: {
        code: fhir.CodeableConcept;
    }, args?: any): any;
    static ɵfac: i0.ɵɵFactoryDef<FhirCodingPipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<FhirCodingPipe, "fhirCoding">;
}
