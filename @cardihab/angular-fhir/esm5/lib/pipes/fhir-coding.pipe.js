import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
var FhirCodingPipe = /** @class */ (function () {
    function FhirCodingPipe() {
    }
    FhirCodingPipe.prototype.transform = function (value, args) {
        if (value && value.code && value.code.coding && value.code.coding.length > 0) {
            return value.code.coding[0].display;
        }
        return '';
    };
    FhirCodingPipe.ɵfac = function FhirCodingPipe_Factory(t) { return new (t || FhirCodingPipe)(); };
    FhirCodingPipe.ɵpipe = i0.ɵɵdefinePipe({ name: "fhirCoding", type: FhirCodingPipe, pure: true });
    return FhirCodingPipe;
}());
export { FhirCodingPipe };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FhirCodingPipe, [{
        type: Pipe,
        args: [{
                name: 'fhirCoding'
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmhpci1jb2RpbmcucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvcGlwZXMvZmhpci1jb2RpbmcucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQzs7QUFFcEQ7SUFBQTtLQVlDO0lBUEMsa0NBQVMsR0FBVCxVQUFVLEtBQW1DLEVBQUUsSUFBVTtRQUN2RCxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7U0FDckM7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7Z0ZBUFUsY0FBYzt1RUFBZCxjQUFjO3lCQUwzQjtDQWNDLEFBWkQsSUFZQztTQVRZLGNBQWM7a0RBQWQsY0FBYztjQUgxQixJQUFJO2VBQUM7Z0JBQ0osSUFBSSxFQUFFLFlBQVk7YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBQaXBlKHtcbiAgbmFtZTogJ2ZoaXJDb2RpbmcnXG59KVxuZXhwb3J0IGNsYXNzIEZoaXJDb2RpbmdQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiB7Y29kZTogZmhpci5Db2RlYWJsZUNvbmNlcHR9LCBhcmdzPzogYW55KTogYW55IHtcbiAgICBpZiAodmFsdWUgJiYgdmFsdWUuY29kZSAmJiB2YWx1ZS5jb2RlLmNvZGluZyAmJiB2YWx1ZS5jb2RlLmNvZGluZy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsdWUuY29kZS5jb2RpbmdbMF0uZGlzcGxheTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbn1cbiJdfQ==