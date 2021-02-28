import { Pipe } from '@angular/core';
import { FhirCodingPipe } from './fhir-coding.pipe';
import { toValueString } from '../utils/format';
import * as i0 from "@angular/core";
var ObservationValuePipe = /** @class */ (function () {
    function ObservationValuePipe() {
    }
    ObservationValuePipe.prototype.transform = function (observation, args) {
        var multi = (observation.component || []).length > 1;
        return (observation.component || [])
            .map(function (component) {
            return "" + (multi ? new FhirCodingPipe().transform(component) + ':' : '') + toValueString(component);
        }).join(', ');
    };
    ObservationValuePipe.ɵfac = function ObservationValuePipe_Factory(t) { return new (t || ObservationValuePipe)(); };
    ObservationValuePipe.ɵpipe = i0.ɵɵdefinePipe({ name: "observationValue", type: ObservationValuePipe, pure: true });
    return ObservationValuePipe;
}());
export { ObservationValuePipe };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(ObservationValuePipe, [{
        type: Pipe,
        args: [{
                name: 'observationValue'
            }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YXRpb24tdmFsdWUucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvcGlwZXMvb2JzZXJ2YXRpb24tdmFsdWUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUNwRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDOztBQUVoRDtJQUlFO0lBQWUsQ0FBQztJQUVoQix3Q0FBUyxHQUFULFVBQVUsV0FBNkIsRUFBRSxJQUFVO1FBQ2pELElBQU0sS0FBSyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQzthQUNuQyxHQUFHLENBQUMsVUFBQSxTQUFTO1lBQ1osT0FBTyxNQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBRyxDQUFDO1FBQ3RHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQixDQUFDOzRGQVRVLG9CQUFvQjttRkFBcEIsb0JBQW9COytCQVBqQztDQWlCQyxBQWJELElBYUM7U0FWWSxvQkFBb0I7a0RBQXBCLG9CQUFvQjtjQUhoQyxJQUFJO2VBQUM7Z0JBQ0osSUFBSSxFQUFFLGtCQUFrQjthQUN6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZoaXJDb2RpbmdQaXBlIH0gZnJvbSAnLi9maGlyLWNvZGluZy5waXBlJztcbmltcG9ydCB7IHRvVmFsdWVTdHJpbmcgfSBmcm9tICcuLi91dGlscy9mb3JtYXQnO1xuXG5AUGlwZSh7XG4gIG5hbWU6ICdvYnNlcnZhdGlvblZhbHVlJ1xufSlcbmV4cG9ydCBjbGFzcyBPYnNlcnZhdGlvblZhbHVlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgdHJhbnNmb3JtKG9ic2VydmF0aW9uOiBmaGlyLk9ic2VydmF0aW9uLCBhcmdzPzogYW55KTogYW55IHtcbiAgICBjb25zdCBtdWx0aSA9IChvYnNlcnZhdGlvbi5jb21wb25lbnQgfHwgW10pLmxlbmd0aCA+IDE7XG4gICAgcmV0dXJuIChvYnNlcnZhdGlvbi5jb21wb25lbnQgfHwgW10pXG4gICAgLm1hcChjb21wb25lbnQgPT4ge1xuICAgICAgcmV0dXJuIGAke211bHRpID8gbmV3IEZoaXJDb2RpbmdQaXBlKCkudHJhbnNmb3JtKGNvbXBvbmVudCkgKyAnOicgOiAnJ30ke3RvVmFsdWVTdHJpbmcoY29tcG9uZW50KX1gO1xuICAgIH0pLmpvaW4oJywgJyk7XG4gIH1cbn1cbiJdfQ==