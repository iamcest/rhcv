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
    var ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵtextInterpolate(ctx_r0.message);
} }
export var CONTAINER_DATA = new InjectionToken('CONTAINER_DATA');
var LoaderComponent = /** @class */ (function () {
    function LoaderComponent(componentData) {
        this.componentData = componentData;
        this.message = this.componentData && this.componentData.message
            ? this.componentData.message : '';
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
    return LoaderComponent;
}());
export { LoaderComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvbG9hZGVyL2xvYWRlci5jb21wb25lbnQudHMiLCJsaWIvbG9hZGVyL2xvYWRlci5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7OztJQ1kxRSxvQkFBNEM7SUFBNUMsNkJBQTRDO0lBQUEsWUFBYTtJQUFBLGlCQUFLOzs7SUFBbEIsZUFBYTtJQUFiLG9DQUFhOztBRFYzRCxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQU0sZ0JBQWdCLENBQUMsQ0FBQztBQUN4RTtJQVNFLHlCQUF3RCxhQUFrQjtRQUFsQixrQkFBYSxHQUFiLGFBQWEsQ0FBSztRQUN4RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQzdELENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3RDLENBQUM7a0ZBUFUsZUFBZSx1QkFJTSxjQUFjO3dEQUpuQyxlQUFlO1lDUjVCLDJCQUNFO1lBQUEsbUJBRUU7WUFGRiw4QkFFRTtZQUFBLDRCQUNFO1lBQUEsK0JBRUU7WUFBQSxzQ0FFeUQ7WUFDM0QsaUJBQU87WUFDVCxpQkFBSTtZQUNOLGlCQUFNO1lBQ04sOERBQTRDO1lBQzlDLGlCQUFNOztZQUR3QixlQUFlO1lBQWYsa0NBQWU7OzBCRFo3QztDQWlCQyxBQWRELElBY0M7U0FUWSxlQUFlO2tEQUFmLGVBQWU7Y0FMM0IsU0FBUztlQUFDO2dCQUNULFFBQVEsRUFBRSxZQUFZO2dCQUN0QixXQUFXLEVBQUUseUJBQXlCO2dCQUN0QyxTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQzthQUN2Qzs7c0JBS2MsUUFBUTs7c0JBQUksTUFBTTt1QkFBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIE9wdGlvbmFsLCBJbmplY3Rpb25Ub2tlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY29uc3QgQ09OVEFJTkVSX0RBVEEgPSBuZXcgSW5qZWN0aW9uVG9rZW48YW55PignQ09OVEFJTkVSX0RBVEEnKTtcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1sb2FkZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vbG9hZGVyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vbG9hZGVyLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgTG9hZGVyQ29tcG9uZW50IHtcblxuICBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQEluamVjdChDT05UQUlORVJfREFUQSkgcHJpdmF0ZSBjb21wb25lbnREYXRhOiBhbnkpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSB0aGlzLmNvbXBvbmVudERhdGEgJiYgdGhpcy5jb21wb25lbnREYXRhLm1lc3NhZ2VcbiAgICAgID8gdGhpcy5jb21wb25lbnREYXRhLm1lc3NhZ2UgOiAnJztcbiAgfVxuXG59XG4iLCI8ZGl2PlxuICA8c3ZnIHdpZHRoPVwiMjAwcHhcIiBoZWlnaHQ9XCIyMDBweFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWRcIlxuICAgIGNsYXNzPVwibGRzLWhlYXJ0XCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lO1wiPlxuICAgIDxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSg1MCA1MClcIj5cbiAgICAgIDxwYXRoIGQ9XCJNNDAuNy0zNC4zYy05LjgtOS44LTI1LjYtOS44LTM1LjQsMEwwLTI5bC01LjMtNS4zYy05LjgtOS44LTI1LjYtOS44LTM1LjQsMGwwLDBjLTkuOCw5LjgtOS44LDI1LjYsMCwzNS40bDUuMyw1LjNMLTIzLDE4LjdsMjMsMjNsMjMtMjNMMzUuNCw2LjNMNDAuNywxQzUwLjQtOC44LDUwLjQtMjQuNiw0MC43LTM0LjN6XCJcbiAgICAgICAgZmlsbD1cIiNkZjEzMTdcIiB0cmFuc2Zvcm09XCJzY2FsZSgwLjcyMTU3NSAwLjcyMTU3NSlcIj5cbiAgICAgICAgPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT1cInRyYW5zZm9ybVwiIHR5cGU9XCJzY2FsZVwiIGNhbGNNb2RlPVwic3BsaW5lXCIgdmFsdWVzPVwiMC42ODswLjg7MC42MDAwMDAwMDAwMDAwMDAxOzAuNzIwMDAwMDAwMDAwMDAwMTswLjY4OzAuNjQwMDAwMDAwMDAwMDAwMVwiXG4gICAgICAgICAga2V5VGltZXM9XCIwOzAuMDU7MC4zOTswLjQ1OzAuNjsxXCIgZHVyPVwiMS41c1wiIGtleVNwbGluZXM9XCIwLjIxNSAwLjYxLDAuMzU1IDE7MC4yMTUgMC42MSwwLjM1NSAxOzAuMjE1IDAuNjEsMC4zNTUgMTswLjIxNSAwLjYxLDAuMzU1IDE7MC4yMTUgMC42MSwwLjM1NSAxXCJcbiAgICAgICAgICBiZWdpbj1cIjBzXCIgcmVwZWF0Q291bnQ9XCJpbmRlZmluaXRlXCI+PC9hbmltYXRlVHJhbnNmb3JtPlxuICAgICAgPC9wYXRoPlxuICAgIDwvZz5cbiAgPC9zdmc+XG4gIDxoMiBjbGFzcz1cImxvYWRpbmctbWVzc2FnZVwiICpuZ0lmPVwibWVzc2FnZVwiPnt7IG1lc3NhZ2UgfX08L2gyPlxuPC9kaXY+XG4iXX0=