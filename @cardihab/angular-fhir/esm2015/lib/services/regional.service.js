import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class RegionalConfigService {
    load(region) {
        return __awaiter(this, void 0, void 0, function* () {
            // assert that region is one of ['au', 'de', 'us']
            const configResponse = yield fetch(`./assets/environment-${region}.json`);
            const config = yield configResponse.json();
            Object.keys(config).forEach(key => {
                if (!this.hasOwnProperty(key)) {
                    Object.defineProperty(this, key, {
                        get: () => config[key]
                    });
                }
            });
            this.region = region;
            return config;
        });
    }
    get(key) {
        return this[key];
    }
}
RegionalConfigService.ɵfac = function RegionalConfigService_Factory(t) { return new (t || RegionalConfigService)(); };
RegionalConfigService.ɵprov = i0.ɵɵdefineInjectable({ token: RegionalConfigService, factory: RegionalConfigService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RegionalConfigService, [{
        type: Injectable
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaW9uYWwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvc2VydmljZXMvcmVnaW9uYWwuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFPM0MsTUFBTSxPQUFPLHFCQUFxQjtJQUcxQixJQUFJLENBQUMsTUFBTTs7WUFDZixrREFBa0Q7WUFFbEQsTUFBTSxjQUFjLEdBQUcsTUFBTSxLQUFLLENBQUMsd0JBQXdCLE1BQU0sT0FBTyxDQUFDLENBQUM7WUFDMUUsTUFBTSxNQUFNLEdBQVEsTUFBTSxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUM3QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7d0JBQy9CLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUN2QixDQUFDLENBQUM7aUJBQ0o7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVELEdBQUcsQ0FBQyxHQUFHO1FBQ0wsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQzs7MEZBdEJVLHFCQUFxQjs2REFBckIscUJBQXFCLFdBQXJCLHFCQUFxQjtrREFBckIscUJBQXFCO2NBRGpDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW55Q29uZmlnIHtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZWdpb25hbENvbmZpZ1NlcnZpY2UgaW1wbGVtZW50cyBBbnlDb25maWcge1xuICByZWdpb246IHN0cmluZztcblxuICBhc3luYyBsb2FkKHJlZ2lvbik6IFByb21pc2U8YW55PiB7XG4gICAgLy8gYXNzZXJ0IHRoYXQgcmVnaW9uIGlzIG9uZSBvZiBbJ2F1JywgJ2RlJywgJ3VzJ11cblxuICAgIGNvbnN0IGNvbmZpZ1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goYC4vYXNzZXRzL2Vudmlyb25tZW50LSR7cmVnaW9ufS5qc29uYCk7XG4gICAgY29uc3QgY29uZmlnOiBhbnkgPSBhd2FpdCBjb25maWdSZXNwb25zZS5qc29uKCk7XG5cbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcbiAgICAgICAgICBnZXQ6ICgpID0+IGNvbmZpZ1trZXldXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMucmVnaW9uID0gcmVnaW9uO1xuICAgIHJldHVybiBjb25maWc7XG4gIH1cblxuICBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXNba2V5XTtcbiAgfVxufVxuXG4iXX0=