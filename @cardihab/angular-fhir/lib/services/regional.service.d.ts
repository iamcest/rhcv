import * as i0 from "@angular/core";
export interface AnyConfig {
    [key: string]: any;
}
export declare class RegionalConfigService implements AnyConfig {
    region: string;
    load(region: any): Promise<any>;
    get(key: any): any;
    static ɵfac: i0.ɵɵFactoryDef<RegionalConfigService, never>;
    static ɵprov: i0.ɵɵInjectableDef<RegionalConfigService>;
}
