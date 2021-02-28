import { Component, Inject, Optional, InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
function LoaderComponent_h2_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(0, "h2", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r0.message);
} }
export const CONTAINER_DATA = new InjectionToken('CONTAINER_DATA');
export class LoaderComponent {
    constructor(componentData) {
        this.componentData = componentData;
        this.message = this.componentData && this.componentData.message
            ? this.componentData.message : '';
    }
}
LoaderComponent.ɵfac = function LoaderComponent_Factory(t) { return new (t || LoaderComponent)(i0.ɵɵdirectiveInject(CONTAINER_DATA, 8)); };
LoaderComponent.ɵcmp = i0.ɵɵdefineComponent({ type: LoaderComponent, selectors: [["lib-loader"]], decls: 6, vars: 1, consts: [["width", "200px", "height", "200px", "xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 100 100", "preserveAspectRatio", "xMidYMid", 1, "lds-heart", 2, "background", "none"], ["transform", "translate(50 50)"], ["d", "M40.7-34.3c-9.8-9.8-25.6-9.8-35.4,0L0-29l-5.3-5.3c-9.8-9.8-25.6-9.8-35.4,0l0,0c-9.8,9.8-9.8,25.6,0,35.4l5.3,5.3L-23,18.7l23,23l23-23L35.4,6.3L40.7,1C50.4-8.8,50.4-24.6,40.7-34.3z", "fill", "#df1317", "transform", "scale(0.721575 0.721575)"], ["attributeName", "transform", "type", "scale", "calcMode", "spline", "values", "0.68;0.8;0.6000000000000001;0.7200000000000001;0.68;0.6400000000000001", "keyTimes", "0;0.05;0.39;0.45;0.6;1", "dur", "1.5s", "keySplines", "0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1", "begin", "0s", "repeatCount", "indefinite"], ["class", "loading-message", 4, "ngIf"], [1, "loading-message"]], template: function LoaderComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵnamespaceSVG();
        i0.ɵɵelementStart(1, "svg", 0);
        i0.ɵɵelementStart(2, "g", 1);
        i0.ɵɵelementStart(3, "path", 2);
        i0.ɵɵelement(4, "animateTransform", 3);
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵtemplate(5, LoaderComponent_h2_5_Template, 2, 1, "h2", 4);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(5);
        i0.ɵɵproperty("ngIf", ctx.message);
    } }, directives: [i1.NgIf], styles: [".loading-message[_ngcontent-%COMP%]{text-align:center;margin-top:20px;background:#dedede;border-radius:20px}"] });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LoaderComponent, [{
        type: Component,
        args: [{
                selector: 'lib-loader',
                templateUrl: './loader.component.html',
                styleUrls: ['./loader.component.scss']
            }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Optional
            }, {
                type: Inject,
                args: [CONTAINER_DATA]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvbG9hZGVyL2xvYWRlci5jb21wb25lbnQudHMiLCJsaWIvbG9hZGVyL2xvYWRlci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7OztJQ1kxRSxvQkFBNEM7SUFBNUMsNkJBQTRDO0lBQUEsWUFBYTtJQUFBLGlCQUFLOzs7SUFBbEIsZUFBYTtJQUFiLG9DQUFhOztBRFYzRCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQU0sZ0JBQWdCLENBQUMsQ0FBQztBQU14RSxNQUFNLE9BQU8sZUFBZTtJQUkxQixZQUF3RCxhQUFrQjtRQUFsQixrQkFBYSxHQUFiLGFBQWEsQ0FBSztRQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQzdELENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3RDLENBQUM7OzhFQVBVLGVBQWUsdUJBSU0sY0FBYztvREFKbkMsZUFBZTtRQ1I1QiwyQkFDRTtRQUFBLG1CQUVFO1FBRkYsOEJBRUU7UUFBQSw0QkFDRTtRQUFBLCtCQUVFO1FBQUEsc0NBRXlEO1FBQzNELGlCQUFPO1FBQ1QsaUJBQUk7UUFDTixpQkFBTTtRQUNOLDhEQUE0QztRQUM5QyxpQkFBTTs7UUFEd0IsZUFBZTtRQUFmLGtDQUFlOztrRERKaEMsZUFBZTtjQUwzQixTQUFTO2VBQUM7Z0JBQ1QsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLFdBQVcsRUFBRSx5QkFBeUI7Z0JBQ3RDLFNBQVMsRUFBRSxDQUFDLHlCQUF5QixDQUFDO2FBQ3ZDOztzQkFLYyxRQUFROztzQkFBSSxNQUFNO3VCQUFDLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdCwgT3B0aW9uYWwsIEluamVjdGlvblRva2VuIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBjb25zdCBDT05UQUlORVJfREFUQSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxhbnk+KCdDT05UQUlORVJfREFUQScpO1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLWxvYWRlcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9sb2FkZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9sb2FkZXIuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBMb2FkZXJDb21wb25lbnQge1xuXG4gIG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBASW5qZWN0KENPTlRBSU5FUl9EQVRBKSBwcml2YXRlIGNvbXBvbmVudERhdGE6IGFueSkge1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29tcG9uZW50RGF0YSAmJiB0aGlzLmNvbXBvbmVudERhdGEubWVzc2FnZVxuICAgICAgPyB0aGlzLmNvbXBvbmVudERhdGEubWVzc2FnZSA6ICcnO1xuICB9XG5cbn1cbiIsIjxkaXY+XG4gIDxzdmcgd2lkdGg9XCIyMDBweFwiIGhlaWdodD1cIjIwMHB4XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiIHByZXNlcnZlQXNwZWN0UmF0aW89XCJ4TWlkWU1pZFwiXG4gICAgY2xhc3M9XCJsZHMtaGVhcnRcIiBzdHlsZT1cImJhY2tncm91bmQ6IG5vbmU7XCI+XG4gICAgPGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKDUwIDUwKVwiPlxuICAgICAgPHBhdGggZD1cIk00MC43LTM0LjNjLTkuOC05LjgtMjUuNi05LjgtMzUuNCwwTDAtMjlsLTUuMy01LjNjLTkuOC05LjgtMjUuNi05LjgtMzUuNCwwbDAsMGMtOS44LDkuOC05LjgsMjUuNiwwLDM1LjRsNS4zLDUuM0wtMjMsMTguN2wyMywyM2wyMy0yM0wzNS40LDYuM0w0MC43LDFDNTAuNC04LjgsNTAuNC0yNC42LDQwLjctMzQuM3pcIlxuICAgICAgICBmaWxsPVwiI2RmMTMxN1wiIHRyYW5zZm9ybT1cInNjYWxlKDAuNzIxNTc1IDAuNzIxNTc1KVwiPlxuICAgICAgICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPVwidHJhbnNmb3JtXCIgdHlwZT1cInNjYWxlXCIgY2FsY01vZGU9XCJzcGxpbmVcIiB2YWx1ZXM9XCIwLjY4OzAuODswLjYwMDAwMDAwMDAwMDAwMDE7MC43MjAwMDAwMDAwMDAwMDAxOzAuNjg7MC42NDAwMDAwMDAwMDAwMDAxXCJcbiAgICAgICAgICBrZXlUaW1lcz1cIjA7MC4wNTswLjM5OzAuNDU7MC42OzFcIiBkdXI9XCIxLjVzXCIga2V5U3BsaW5lcz1cIjAuMjE1IDAuNjEsMC4zNTUgMTswLjIxNSAwLjYxLDAuMzU1IDE7MC4yMTUgMC42MSwwLjM1NSAxOzAuMjE1IDAuNjEsMC4zNTUgMTswLjIxNSAwLjYxLDAuMzU1IDFcIlxuICAgICAgICAgIGJlZ2luPVwiMHNcIiByZXBlYXRDb3VudD1cImluZGVmaW5pdGVcIj48L2FuaW1hdGVUcmFuc2Zvcm0+XG4gICAgICA8L3BhdGg+XG4gICAgPC9nPlxuICA8L3N2Zz5cbiAgPGgyIGNsYXNzPVwibG9hZGluZy1tZXNzYWdlXCIgKm5nSWY9XCJtZXNzYWdlXCI+e3sgbWVzc2FnZSB9fTwvaDI+XG48L2Rpdj5cbiJdfQ==