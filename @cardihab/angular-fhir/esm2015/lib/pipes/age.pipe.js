import { Pipe } from '@angular/core';
import moment from 'moment';
import * as i0 from "@angular/core";
export class AgePipe {
    transform(value, args) {
        if (!value || !moment(value).isValid()) {
            return void 0;
        }
        return moment().diff(value, 'years');
    }
}
AgePipe.ɵfac = function AgePipe_Factory(t) { return new (t || AgePipe)(); };
AgePipe.ɵpipe = i0.ɵɵdefinePipe({ name: "ageInYears", type: AgePipe, pure: true });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AgePipe, [{
        type: Pipe,
        args: [{
                name: 'ageInYears'
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY2FyZGloYWIvYW5ndWxhci1maGlyLyIsInNvdXJjZXMiOlsibGliL3BpcGVzL2FnZS5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQzs7QUFLNUIsTUFBTSxPQUFPLE9BQU87SUFFbEIsU0FBUyxDQUFDLEtBQVUsRUFBRSxJQUFVO1FBQzlCLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQyxDQUFDO1NBQUU7UUFDMUQsT0FBTyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7OzhEQUxVLE9BQU87NERBQVAsT0FBTztrREFBUCxPQUFPO2NBSG5CLElBQUk7ZUFBQztnQkFDSixJQUFJLEVBQUUsWUFBWTthQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcblxuQFBpcGUoe1xuICBuYW1lOiAnYWdlSW5ZZWFycydcbn0pXG5leHBvcnQgY2xhc3MgQWdlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuXG4gIHRyYW5zZm9ybSh2YWx1ZTogYW55LCBhcmdzPzogYW55KTogYW55IHtcbiAgICBpZiAoIXZhbHVlIHx8ICFtb21lbnQodmFsdWUpLmlzVmFsaWQoKSkgeyByZXR1cm4gdm9pZCAwOyB9XG4gICAgcmV0dXJuIG1vbWVudCgpLmRpZmYodmFsdWUsICd5ZWFycycpO1xuICB9XG5cbn1cbiJdfQ==