import { Pipe } from '@angular/core';
import { formatFhirName } from '../utils/format';
import * as i0 from "@angular/core";
var FhirUsualNamePipe = /** @class */ (function () {
    function FhirUsualNamePipe() {
    }
    FhirUsualNamePipe.prototype.transform = function (value, args) {
        return formatFhirName(value, args);
    };
    FhirUsualNamePipe.ɵfac = function FhirUsualNamePipe_Factory(t) { return new (t || FhirUsualNamePipe)(); };
    FhirUsualNamePipe.ɵpipe = i0.ɵɵdefinePipe({ name: "fhirUsualName", type: FhirUsualNamePipe, pure: true });
    return FhirUsualNamePipe;
}());
export { FhirUsualNamePipe };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FhirUsualNamePipe, [{
        type: Pipe,
        args: [{
                name: 'fhirUsualName'
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmhpci11c3VhbC1uYW1lLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY2FyZGloYWIvYW5ndWxhci1maGlyLyIsInNvdXJjZXMiOlsibGliL3BpcGVzL2ZoaXItdXN1YWwtbmFtZS5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7QUFFakQ7SUFBQTtLQVNDO0lBSkMscUNBQVMsR0FBVCxVQUFVLEtBQXVCLEVBQUUsSUFBVTtRQUMzQyxPQUFPLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztzRkFKVSxpQkFBaUI7NkVBQWpCLGlCQUFpQjs0QkFOOUI7Q0FZQyxBQVRELElBU0M7U0FOWSxpQkFBaUI7a0RBQWpCLGlCQUFpQjtjQUg3QixJQUFJO2VBQUM7Z0JBQ0osSUFBSSxFQUFFLGVBQWU7YUFDdEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmb3JtYXRGaGlyTmFtZSB9IGZyb20gJy4uL3V0aWxzL2Zvcm1hdCc7XG5cbkBQaXBlKHtcbiAgbmFtZTogJ2ZoaXJVc3VhbE5hbWUnXG59KVxuZXhwb3J0IGNsYXNzIEZoaXJVc3VhbE5hbWVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBmaGlyLkh1bWFuTmFtZVtdLCBhcmdzPzogYW55KTogYW55IHtcbiAgICByZXR1cm4gZm9ybWF0Rmhpck5hbWUodmFsdWUsIGFyZ3MpO1xuICB9XG5cbn1cbiJdfQ==