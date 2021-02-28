import { Pipe } from '@angular/core';
import moment from 'moment';
import * as i0 from "@angular/core";
var AgePipe = /** @class */ (function () {
    function AgePipe() {
    }
    AgePipe.prototype.transform = function (value, args) {
        if (!value || !moment(value).isValid()) {
            return void 0;
        }
        return moment().diff(value, 'years');
    };
    AgePipe.ɵfac = function AgePipe_Factory(t) { return new (t || AgePipe)(); };
    AgePipe.ɵpipe = i0.ɵɵdefinePipe({ name: "ageInYears", type: AgePipe, pure: true });
    return AgePipe;
}());
export { AgePipe };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AgePipe, [{
        type: Pipe,
        args: [{
                name: 'ageInYears'
            }]
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlLnBpcGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY2FyZGloYWIvYW5ndWxhci1maGlyLyIsInNvdXJjZXMiOlsibGliL3BpcGVzL2FnZS5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQzs7QUFFNUI7SUFBQTtLQVVDO0lBTEMsMkJBQVMsR0FBVCxVQUFVLEtBQVUsRUFBRSxJQUFVO1FBQzlCLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQyxDQUFDO1NBQUU7UUFDMUQsT0FBTyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7a0VBTFUsT0FBTztnRUFBUCxPQUFPO2tCQU5wQjtDQWFDLEFBVkQsSUFVQztTQVBZLE9BQU87a0RBQVAsT0FBTztjQUhuQixJQUFJO2VBQUM7Z0JBQ0osSUFBSSxFQUFFLFlBQVk7YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG5cbkBQaXBlKHtcbiAgbmFtZTogJ2FnZUluWWVhcnMnXG59KVxuZXhwb3J0IGNsYXNzIEFnZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgYXJncz86IGFueSk6IGFueSB7XG4gICAgaWYgKCF2YWx1ZSB8fCAhbW9tZW50KHZhbHVlKS5pc1ZhbGlkKCkpIHsgcmV0dXJuIHZvaWQgMDsgfVxuICAgIHJldHVybiBtb21lbnQoKS5kaWZmKHZhbHVlLCAneWVhcnMnKTtcbiAgfVxuXG59XG4iXX0=