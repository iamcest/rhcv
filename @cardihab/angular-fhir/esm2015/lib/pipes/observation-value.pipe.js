import { Pipe } from '@angular/core';
import { FhirCodingPipe } from './fhir-coding.pipe';
import { toValueString } from '../utils/format';
import * as i0 from "@angular/core";
export class ObservationValuePipe {
    constructor() { }
    transform(observation, args) {
        const multi = (observation.component || []).length > 1;
        return (observation.component || [])
            .map(component => {
            return `${multi ? new FhirCodingPipe().transform(component) + ':' : ''}${toValueString(component)}`;
        }).join(', ');
    }
}
ObservationValuePipe.ɵfac = function ObservationValuePipe_Factory(t) { return new (t || ObservationValuePipe)(); };
ObservationValuePipe.ɵpipe = i0.ɵɵdefinePipe({ name: "observationValue", type: ObservationValuePipe, pure: true });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(ObservationValuePipe, [{
        type: Pipe,
        args: [{
                name: 'observationValue'
            }]
    }], function () { return []; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YXRpb24tdmFsdWUucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvcGlwZXMvb2JzZXJ2YXRpb24tdmFsdWUucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUNwRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDOztBQUtoRCxNQUFNLE9BQU8sb0JBQW9CO0lBQy9CLGdCQUFlLENBQUM7SUFFaEIsU0FBUyxDQUFDLFdBQTZCLEVBQUUsSUFBVTtRQUNqRCxNQUFNLEtBQUssR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUM7YUFDbkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2YsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxjQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDdEcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hCLENBQUM7O3dGQVRVLG9CQUFvQjsrRUFBcEIsb0JBQW9CO2tEQUFwQixvQkFBb0I7Y0FIaEMsSUFBSTtlQUFDO2dCQUNKLElBQUksRUFBRSxrQkFBa0I7YUFDekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaGlyQ29kaW5nUGlwZSB9IGZyb20gJy4vZmhpci1jb2RpbmcucGlwZSc7XG5pbXBvcnQgeyB0b1ZhbHVlU3RyaW5nIH0gZnJvbSAnLi4vdXRpbHMvZm9ybWF0JztcblxuQFBpcGUoe1xuICBuYW1lOiAnb2JzZXJ2YXRpb25WYWx1ZSdcbn0pXG5leHBvcnQgY2xhc3MgT2JzZXJ2YXRpb25WYWx1ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIHRyYW5zZm9ybShvYnNlcnZhdGlvbjogZmhpci5PYnNlcnZhdGlvbiwgYXJncz86IGFueSk6IGFueSB7XG4gICAgY29uc3QgbXVsdGkgPSAob2JzZXJ2YXRpb24uY29tcG9uZW50IHx8IFtdKS5sZW5ndGggPiAxO1xuICAgIHJldHVybiAob2JzZXJ2YXRpb24uY29tcG9uZW50IHx8IFtdKVxuICAgIC5tYXAoY29tcG9uZW50ID0+IHtcbiAgICAgIHJldHVybiBgJHttdWx0aSA/IG5ldyBGaGlyQ29kaW5nUGlwZSgpLnRyYW5zZm9ybShjb21wb25lbnQpICsgJzonIDogJyd9JHt0b1ZhbHVlU3RyaW5nKGNvbXBvbmVudCl9YDtcbiAgICB9KS5qb2luKCcsICcpO1xuICB9XG59XG4iXX0=