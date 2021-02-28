import { __awaiter, __generator } from "tslib";
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var RegionalConfigService = /** @class */ (function () {
    function RegionalConfigService() {
    }
    RegionalConfigService.prototype.load = function (region) {
        return __awaiter(this, void 0, void 0, function () {
            var configResponse, config;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("./assets/environment-" + region + ".json")];
                    case 1:
                        configResponse = _a.sent();
                        return [4 /*yield*/, configResponse.json()];
                    case 2:
                        config = _a.sent();
                        Object.keys(config).forEach(function (key) {
                            if (!_this.hasOwnProperty(key)) {
                                Object.defineProperty(_this, key, {
                                    get: function () { return config[key]; }
                                });
                            }
                        });
                        this.region = region;
                        return [2 /*return*/, config];
                }
            });
        });
    };
    RegionalConfigService.prototype.get = function (key) {
        return this[key];
    };
    RegionalConfigService.ɵfac = function RegionalConfigService_Factory(t) { return new (t || RegionalConfigService)(); };
    RegionalConfigService.ɵprov = i0.ɵɵdefineInjectable({ token: RegionalConfigService, factory: RegionalConfigService.ɵfac });
    return RegionalConfigService;
}());
export { RegionalConfigService };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(RegionalConfigService, [{
        type: Injectable
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaW9uYWwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BjYXJkaWhhYi9hbmd1bGFyLWZoaXIvIiwic291cmNlcyI6WyJsaWIvc2VydmljZXMvcmVnaW9uYWwuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFNM0M7SUFBQTtLQXdCQztJQXBCTyxvQ0FBSSxHQUFWLFVBQVcsTUFBTTs7Ozs7OzRCQUdRLHFCQUFNLEtBQUssQ0FBQywwQkFBd0IsTUFBTSxVQUFPLENBQUMsRUFBQTs7d0JBQW5FLGNBQWMsR0FBRyxTQUFrRDt3QkFDckQscUJBQU0sY0FBYyxDQUFDLElBQUksRUFBRSxFQUFBOzt3QkFBekMsTUFBTSxHQUFRLFNBQTJCO3dCQUUvQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7NEJBQzdCLElBQUksQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dDQUM3QixNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSxHQUFHLEVBQUU7b0NBQy9CLEdBQUcsRUFBRSxjQUFNLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFYLENBQVc7aUNBQ3ZCLENBQUMsQ0FBQzs2QkFDSjt3QkFDSCxDQUFDLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzt3QkFDckIsc0JBQU8sTUFBTSxFQUFDOzs7O0tBQ2Y7SUFFRCxtQ0FBRyxHQUFILFVBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7OEZBdEJVLHFCQUFxQjtpRUFBckIscUJBQXFCLFdBQXJCLHFCQUFxQjtnQ0FQbEM7Q0E4QkMsQUF4QkQsSUF3QkM7U0F2QlkscUJBQXFCO2tEQUFyQixxQkFBcUI7Y0FEakMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBBbnlDb25maWcge1xuICAgIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlZ2lvbmFsQ29uZmlnU2VydmljZSBpbXBsZW1lbnRzIEFueUNvbmZpZyB7XG4gIHJlZ2lvbjogc3RyaW5nO1xuXG4gIGFzeW5jIGxvYWQocmVnaW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBhc3NlcnQgdGhhdCByZWdpb24gaXMgb25lIG9mIFsnYXUnLCAnZGUnLCAndXMnXVxuXG4gICAgY29uc3QgY29uZmlnUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgLi9hc3NldHMvZW52aXJvbm1lbnQtJHtyZWdpb259Lmpzb25gKTtcbiAgICBjb25zdCBjb25maWc6IGFueSA9IGF3YWl0IGNvbmZpZ1Jlc3BvbnNlLmpzb24oKTtcblxuICAgIE9iamVjdC5rZXlzKGNvbmZpZykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xuICAgICAgICAgIGdldDogKCkgPT4gY29uZmlnW2tleV1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5yZWdpb24gPSByZWdpb247XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIGdldChrZXkpIHtcbiAgICByZXR1cm4gdGhpc1trZXldO1xuICB9XG59XG5cbiJdfQ==