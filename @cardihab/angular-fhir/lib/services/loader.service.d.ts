import { Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import * as i0 from "@angular/core";
export declare class LoaderService {
    private overlay;
    private injector;
    overlayRef: OverlayRef;
    overlayConfig: OverlayConfig;
    constructor(overlay: Overlay, injector: Injector);
    start(message?: string): void;
    stop(): void;
    private createInjector;
    static ɵfac: i0.ɵɵFactoryDef<LoaderService, never>;
    static ɵprov: i0.ɵɵInjectableDef<LoaderService>;
}
