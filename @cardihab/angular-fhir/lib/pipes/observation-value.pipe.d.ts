/// <reference types="fhir" />
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class ObservationValuePipe implements PipeTransform {
    constructor();
    transform(observation: fhir.Observation, args?: any): any;
    static ɵfac: i0.ɵɵFactoryDef<ObservationValuePipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<ObservationValuePipe, "observationValue">;
}
