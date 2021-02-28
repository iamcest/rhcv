import { InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
export declare const CONTAINER_DATA: InjectionToken<any>;
export declare class LoaderComponent {
    private componentData;
    message: string;
    constructor(componentData: any);
    static ɵfac: i0.ɵɵFactoryDef<LoaderComponent, [{ optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<LoaderComponent, "lib-loader", never, {}, {}, never, never>;
}
