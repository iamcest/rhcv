import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class FhirCodingPipe {
    transform(value, args) {
        if (value && value.code && value.code.coding && value.code.coding.length > 0) {
            return value.code.coding[0].display;
        }
        return '';
    }
}
FhirCodingPipe.ɵfac = function FhirCodingPipe_Factory(t) { return new (t || FhirCodingPipe)(); };
FhirCodingPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "fhirCoding", type: FhirCodingPipe, pure: true });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FhirCodingPipe, [{
        type: Pipe,
        args: [{
                name: 'fhirCoding'
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmhpci1jb2RpbmcucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvcGlwZXMvZmhpci1jb2RpbmcucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQzs7QUFLcEQsTUFBTSxPQUFPLGNBQWM7SUFFekIsU0FBUyxDQUFDLEtBQW1DLEVBQUUsSUFBVTtRQUN2RCxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDckM7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7OzRFQVBVLGNBQWM7bUVBQWQsY0FBYztrREFBZCxjQUFjO2NBSDFCLElBQUk7ZUFBQztnQkFDSixJQUFJLEVBQUUsWUFBWTthQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQFBpcGUoe1xuICBuYW1lOiAnZmhpckNvZGluZydcbn0pXG5leHBvcnQgY2xhc3MgRmhpckNvZGluZ1BpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICB0cmFuc2Zvcm0odmFsdWU6IHtjb2RlOiBmaGlyLkNvZGVhYmxlQ29uY2VwdH0sIGFyZ3M/OiBhbnkpOiBhbnkge1xuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb2RlICYmIHZhbHVlLmNvZGUuY29kaW5nICYmIHZhbHVlLmNvZGUuY29kaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWx1ZS5jb2RlLmNvZGluZ1swXS5kaXNwbGF5O1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxufVxuIl19