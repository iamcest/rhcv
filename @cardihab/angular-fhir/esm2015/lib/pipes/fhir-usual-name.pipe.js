import { Pipe } from '@angular/core';
import { formatFhirName } from '../utils/format';
import * as i0 from "@angular/core";
export class FhirUsualNamePipe {
    transform(value, args) {
        return formatFhirName(value, args);
    }
}
FhirUsualNamePipe.ɵfac = function FhirUsualNamePipe_Factory(t) { return new (t || FhirUsualNamePipe)(); };
FhirUsualNamePipe.ɵpipe = i0.ɵɵdefinePipe({ name: "fhirUsualName", type: FhirUsualNamePipe, pure: true });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FhirUsualNamePipe, [{
        type: Pipe,
        args: [{
                name: 'fhirUsualName'
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmhpci11c3VhbC1uYW1lLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY2FyZGloYWIvYW5ndWxhci1maGlyLyIsInNvdXJjZXMiOlsibGliL3BpcGVzL2ZoaXItdXN1YWwtbmFtZS5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQzs7QUFLakQsTUFBTSxPQUFPLGlCQUFpQjtJQUU1QixTQUFTLENBQUMsS0FBdUIsRUFBRSxJQUFVO1FBQzNDLE9BQU8sY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDOztrRkFKVSxpQkFBaUI7eUVBQWpCLGlCQUFpQjtrREFBakIsaUJBQWlCO2NBSDdCLElBQUk7ZUFBQztnQkFDSixJQUFJLEVBQUUsZUFBZTthQUN0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGZvcm1hdEZoaXJOYW1lIH0gZnJvbSAnLi4vdXRpbHMvZm9ybWF0JztcblxuQFBpcGUoe1xuICBuYW1lOiAnZmhpclVzdWFsTmFtZSdcbn0pXG5leHBvcnQgY2xhc3MgRmhpclVzdWFsTmFtZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICB0cmFuc2Zvcm0odmFsdWU6IGZoaXIuSHVtYW5OYW1lW10sIGFyZ3M/OiBhbnkpOiBhbnkge1xuICAgIHJldHVybiBmb3JtYXRGaGlyTmFtZSh2YWx1ZSwgYXJncyk7XG4gIH1cblxufVxuIl19