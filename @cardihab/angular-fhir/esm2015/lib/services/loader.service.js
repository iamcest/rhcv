import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { LoaderComponent, CONTAINER_DATA } from '../loader/loader.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/overlay";
export class LoaderService {
    constructor(overlay, injector) {
        this.overlay = overlay;
        this.injector = injector;
        this.overlayConfig = new OverlayConfig();
        this.overlayConfig.positionStrategy = this.overlay.position()
            .global()
            .centerHorizontally()
            .centerVertically();
        this.overlayConfig.hasBackdrop = true;
    }
    start(message = '') {
        this.overlayRef = this.overlay.create(this.overlayConfig);
        const containerPortal = new ComponentPortal(LoaderComponent, null, this.createInjector({
            message
        }));
        this.overlayRef.attach(containerPortal);
    }
    stop() {
        this.overlayRef.dispose();
    }
    createInjector(dataToPass) {
        const injectorTokens = new WeakMap();
        injectorTokens.set(CONTAINER_DATA, dataToPass);
        return new PortalInjector(this.injector, injectorTokens);
    }
}
LoaderService.ɵfac = function LoaderService_Factory(t) { return new (t || LoaderService)(i0.ɵɵinject(i1.Overlay), i0.ɵɵinject(i0.Injector)); };
LoaderService.ɵprov = i0.ɵɵdefineInjectable({ token: LoaderService, factory: LoaderService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(LoaderService, [{
        type: Injectable
    }], function () { return [{ type: i1.Overlay }, { type: i0.Injector }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY2FyZGloYWIvYW5ndWxhci1maGlyLyIsInNvdXJjZXMiOlsibGliL3NlcnZpY2VzL2xvYWRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFjLE1BQU0sc0JBQXNCLENBQUM7QUFDMUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDOzs7QUFHN0UsTUFBTSxPQUFPLGFBQWE7SUFLeEIsWUFBb0IsT0FBZ0IsRUFBVSxRQUFrQjtRQUE1QyxZQUFPLEdBQVAsT0FBTyxDQUFTO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUZoRSxrQkFBYSxHQUFrQixJQUFJLGFBQWEsRUFBRSxDQUFDO1FBR2pELElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7YUFDMUQsTUFBTSxFQUFFO2FBQ1Isa0JBQWtCLEVBQUU7YUFDcEIsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDeEMsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFrQixFQUFFO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFELE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNyRixPQUFPO1NBQ1IsQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsSUFBSTtRQUNGLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVPLGNBQWMsQ0FBQyxVQUFjO1FBQ25DLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7UUFDckMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0MsT0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzNELENBQUM7OzBFQTdCVSxhQUFhO3FEQUFiLGFBQWEsV0FBYixhQUFhO2tEQUFiLGFBQWE7Y0FEekIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPdmVybGF5LCBPdmVybGF5Q29uZmlnLCBPdmVybGF5UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL292ZXJsYXknO1xuaW1wb3J0IHsgQ29tcG9uZW50UG9ydGFsLCBQb3J0YWxJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHsgTG9hZGVyQ29tcG9uZW50LCBDT05UQUlORVJfREFUQSB9IGZyb20gJy4uL2xvYWRlci9sb2FkZXIuY29tcG9uZW50JztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvYWRlclNlcnZpY2Uge1xuXG4gIG92ZXJsYXlSZWY6IE92ZXJsYXlSZWY7XG4gIG92ZXJsYXlDb25maWc6IE92ZXJsYXlDb25maWcgPSBuZXcgT3ZlcmxheUNvbmZpZygpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb3ZlcmxheTogT3ZlcmxheSwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLm92ZXJsYXlDb25maWcucG9zaXRpb25TdHJhdGVneSA9IHRoaXMub3ZlcmxheS5wb3NpdGlvbigpXG4gICAgICAuZ2xvYmFsKClcbiAgICAgIC5jZW50ZXJIb3Jpem9udGFsbHkoKVxuICAgICAgLmNlbnRlclZlcnRpY2FsbHkoKTtcbiAgICB0aGlzLm92ZXJsYXlDb25maWcuaGFzQmFja2Ryb3AgPSB0cnVlO1xuICB9XG5cbiAgc3RhcnQobWVzc2FnZTogc3RyaW5nID0gJycpIHtcbiAgICB0aGlzLm92ZXJsYXlSZWYgPSB0aGlzLm92ZXJsYXkuY3JlYXRlKHRoaXMub3ZlcmxheUNvbmZpZyk7XG4gICAgY29uc3QgY29udGFpbmVyUG9ydGFsID0gbmV3IENvbXBvbmVudFBvcnRhbChMb2FkZXJDb21wb25lbnQsIG51bGwsIHRoaXMuY3JlYXRlSW5qZWN0b3Ioe1xuICAgICAgbWVzc2FnZVxuICAgIH0pKTtcbiAgICB0aGlzLm92ZXJsYXlSZWYuYXR0YWNoKGNvbnRhaW5lclBvcnRhbCk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMub3ZlcmxheVJlZi5kaXNwb3NlKCk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUluamVjdG9yKGRhdGFUb1Bhc3M6IHt9KTogUG9ydGFsSW5qZWN0b3Ige1xuICAgIGNvbnN0IGluamVjdG9yVG9rZW5zID0gbmV3IFdlYWtNYXAoKTtcbiAgICBpbmplY3RvclRva2Vucy5zZXQoQ09OVEFJTkVSX0RBVEEsIGRhdGFUb1Bhc3MpO1xuICAgIHJldHVybiBuZXcgUG9ydGFsSW5qZWN0b3IodGhpcy5pbmplY3RvciwgaW5qZWN0b3JUb2tlbnMpO1xuICB9XG59XG4iXX0=