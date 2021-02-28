import { __read, __values } from "tslib";
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { throwError, ReplaySubject, of } from 'rxjs';
import { map, tap, expand, reduce } from 'rxjs/operators';
import * as url from 'url';
import { RegionalConfigService } from './regional.service';
import { LRUMap } from './lru';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./regional.service";
var FhirService = /** @class */ (function () {
    function FhirService(http, config) {
        this.http = http;
        this.config = config;
        // set by auth guard. Fixme cleaner separation would be nice
        this.base = this.config.get('fhir');
        this.tenancy = 'baseDstu3';
        this.refCache = new LRUMap(100);
    }
    FhirService.hasCoding = function (concept, codes) {
        var e_1, _a;
        if (concept && concept.coding && codes) {
            var _loop_1 = function (code) {
                if (code.code && codes.find(function (ia) { return ia.system === code.system && ia.code === code.code; }) != null) {
                    return { value: true };
                }
            };
            try {
                for (var _b = __values(concept.coding), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var code = _c.value;
                    var state_1 = _loop_1(code);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return false;
    };
    FhirService.referenceToId = function (reference) {
        var _a = __read((reference || { reference: '' }).reference.split('/'), 2), resourceType = _a[0], id = _a[1];
        return {
            resourceType: resourceType,
            id: id
        };
    };
    FhirService.flattenExtension = function (extension) {
        var obj = {};
        if (extension.extension) {
            extension.extension.forEach(function (ext) {
                obj[ext.url] = FhirService.flattenExtension(ext);
            });
        }
        else {
            return extension.valueString ? extension.valueString :
                extension.valueReference ? extension.valueReference :
                    extension.valueCoding ? extension.valueCoding :
                        extension.valueUri ? extension.valueUri :
                            extension.valueBoolean ? extension.valueBoolean :
                                extension.valueAddress ? extension.valueAddress :
                                    extension.valueAge ? extension.valueAge :
                                        extension.valueAnnotation ? extension.valueAnnotation :
                                            extension.valueAttachment ? extension.valueAttachment :
                                                extension.valueBase64Binary ? extension.valueBase64Binary :
                                                    extension.valueCode ? extension.valueCode :
                                                        extension.valueCodeableConcept ? extension.valueCodeableConcept :
                                                            extension.valueContactPoint ? extension.valueContactPoint :
                                                                extension.valueCount ? extension.valueCount :
                                                                    extension.valueDate ? extension.valueDate :
                                                                        extension.valueDecimal ? extension.valueDecimal :
                                                                            extension.valueDuration ? extension.valueDuration :
                                                                                extension.valueHumanName ? extension.valueHumanName :
                                                                                    extension.valueId ? extension.valueId :
                                                                                        extension.valueDateTime ? extension.valueDateTime :
                                                                                            extension.valueDistance ? extension.valueDistance :
                                                                                                extension.valueInteger ? extension.valueInteger :
                                                                                                    // todo add additional value[x] types
                                                                                                    null;
        }
        return obj;
    };
    FhirService.prototype.getUrl = function (tenancyOverride) {
        return this.base + "/" + (tenancyOverride ? tenancyOverride : this.tenancy);
    };
    FhirService.prototype.setUrl = function (newUrl) {
        this.base = newUrl;
    };
    FhirService.prototype.options = function () {
        return new HttpHeaders({ Accept: 'application/json' });
    };
    FhirService.prototype.nextPage = function (response) {
        if (response) {
            var nextLink = (response.link || []).find(function (l) { return l.relation === 'next'; });
            if (nextLink) {
                return this.http.get(nextLink.url);
            }
        }
        return throwError(new Error('No next link to follow'));
    };
    FhirService.prototype.reference = function (ref, context) {
        if (ref && ref.reference) {
            var absoluteUri = this.referenceToAbsoluteUrl(ref, context);
            var ref$ = this.refCache.get(absoluteUri);
            // TODO handle contained resource references
            if (absoluteUri.startsWith('#')) {
                return throwError(new Error("Don't yet support contained references"));
            }
            else {
                if (!ref$) {
                    ref$ = new ReplaySubject(1);
                    this.http.get(absoluteUri)
                        .subscribe(ref$);
                    this.refCache.set(absoluteUri, ref$);
                }
                return ref$;
            }
        }
        else {
            return throwError(new Error('Invalid reference'));
        }
    };
    FhirService.prototype.get = function (resourceType, id, tenancy) {
        if (id === 'new') {
            return of(null);
        }
        else {
            return this.http.get(this.getUrl(tenancy) + "/" + resourceType + "/" + id);
        }
    };
    FhirService.prototype.search = function (resourceType, params, options, pagination) {
        var _this = this;
        if (pagination === void 0) { pagination = false; }
        var requestOptions = {
            params: params
        };
        if (options && options.headers) {
            requestOptions.headers = options.headers;
        }
        var request = this.http.get(this.getUrl((options || {}).tenancy) + "/" + resourceType, requestOptions);
        if (pagination) {
            return request;
        }
        else {
            return request
                .pipe(expand(function (res) {
                var foundNext = ((res.link || []).find(function (l) { return l.relation === 'next'; }) || {}).url;
                if (foundNext) {
                    return _this.http.get(url.format(url.parse(foundNext, true)));
                }
                return of();
            }), reduce(function (acc, value) {
                if (acc.entry && value.entry) {
                    acc.entry = acc.entry.concat(value.entry);
                }
                return acc;
            }));
        }
    };
    FhirService.prototype.patch = function (resourceUrl, cmd, options) {
        var requestOptions = {
            headers: {
                'content-type': 'application/json-patch+json'
            }
        };
        if (options && options.headers) {
            Object.assign(requestOptions.headers, options.headers);
        }
        return this.http.patch(resourceUrl, cmd, requestOptions);
    };
    FhirService.prototype.delete = function (resourceType, id, options) {
        var requestOptions = {};
        if (options && options.headers) {
            requestOptions.headers = options.headers;
        }
        return this.http.delete(this.getUrl((options || {}).tenancy) + "/" + resourceType + "/" + id, requestOptions);
    };
    FhirService.prototype.save = function (bundle, options) {
        if (bundle.resourceType === 'Bundle') {
            return this.http.post("" + this.getUrl((options || {}).tenancy), bundle, {
                headers: {
                    'content-type': 'application/fhir+json',
                    Prefer: 'return=representation'
                }
            }).pipe(tap(function (bundleResponse) {
                (bundleResponse.entry || []).forEach(function (v, k) {
                    if (bundle.entry[k]) {
                        bundle.entry[k].resource.id = v.resource.id;
                    }
                });
            }));
        }
        else {
            return this.saveAll([bundle], options)
                .pipe(map(function (bundleResponse) { return bundleResponse.entry[0].resource; }));
        }
    };
    FhirService.prototype.saveAll = function (resources, options) {
        var bundleEntries = resources.map(function (p) {
            return {
                request: {
                    method: p.id ? 'PUT' : 'POST',
                    // tslint:disable-next-line:no-string-literal
                    url: p.id ? p.resourceType + "/" + p.id : (p['identifier'] || [])[0] ? "urn:uuid:" + p['identifier'][0].value : p.resourceType
                },
                resource: p
            };
        });
        return this.save({
            resourceType: 'Bundle',
            type: 'transaction',
            entry: bundleEntries
        }, options);
    };
    FhirService.prototype.resolveReferences = function (references, context, count) {
        var _this = this;
        if (count === void 0) { count = 500; }
        if (!references || !Array.isArray(references) || !references.length) {
            return of({});
        }
        var resourceType = FhirService.referenceToId(references[0]).resourceType;
        var ids = references.map(function (ref) { return FhirService.referenceToId(ref).id; });
        return this.http.post(this.getContextBaseUrl(context) + "/" + resourceType + "/_search", "_id=" + ids.join(',') + "&_count=" + count, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .pipe(expand(function (res) {
            var foundNext = ((res.link || []).find(function (l) { return l.relation === 'next'; }) || {}).url;
            if (foundNext) {
                return _this.http.get(url.format(url.parse(foundNext, true)));
            }
            return of();
        }), reduce(function (acc, value) {
            if (acc.entry && value.entry) {
                acc.entry = acc.entry.concat(value.entry);
            }
            return acc;
        }));
    };
    FhirService.prototype.referenceToAbsoluteUrl = function (ref, context) {
        var refUrl = url.parse(ref.reference);
        if (refUrl.hash && !refUrl.protocol) { // don't touch contained resource references
            return ref.reference;
        }
        var base = this.getContextBaseUrl(context);
        return url.resolve(base + "/", ref.reference);
    };
    FhirService.prototype.getContextBaseUrl = function (context) {
        var base = this.getUrl();
        if (context && context.meta && context.meta.security) {
            var tenancyTag = context.meta.security.find(function (sec) { return sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM; });
            if (tenancyTag) {
                base = this.getUrl(tenancyTag.display);
            }
        }
        return base;
    };
    FhirService.EXTENSIONS = {
        TASK_ENABLE_WHEN: 'https://fhir-registry.cardihab.com/StructureDefiniton/TaskEnableWhen',
        EDUCATION_TASK: 'https://fhir-registry.cardihab.com/StructureDefiniton/EducationTask',
        ADHERENCE: 'https://fhir-registry.cardihab.com/StructureDefiniton/Adherence',
        RECURRING_TASK: 'https://fhir-registry.cardihab.com/StructureDefiniton/RecurringTask',
        BASED_ON_GOAL: 'https://fhir-registry.cardihab.com/StructureDefiniton/BasedOnGoal',
        PATIENT_SPECIFIC_REMINDER: 'https://fhir-registry.cardihab.com/StructureDefiniton/PatientSpecificReminder',
        ORGANIZATION_ATTRIBUTES: 'https://fhir-registry.cardihab.com/StructureDefiniton/OrganizationAttributes'
    };
    FhirService.IDENTIFIER_SYSTEMS = {
        SITECODE: 'urn:sitecode',
        FHIR_IDENTIFIER_TYPE: 'http://hl7.org/fhir/identifier-type',
        SNOMED: 'http://snomed.info/sct',
        GOAL_CATEGORY: 'http://hl7.org/fhir/goal-category',
        TENANCY_SECURITY_SYSTEM: 'Tenancy'
    };
    FhirService.ɵfac = function FhirService_Factory(t) { return new (t || FhirService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i2.RegionalConfigService)); };
    FhirService.ɵprov = i0.ɵɵdefineInjectable({ token: FhirService, factory: FhirService.ɵfac });
    return FhirService;
}());
export { FhirService };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FhirService, [{
        type: Injectable
    }], function () { return [{ type: i1.HttpClient }, { type: i2.RegionalConfigService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmhpci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGNhcmRpaGFiL2FuZ3VsYXItZmhpci8iLCJzb3VyY2VzIjpbImxpYi9zZXJ2aWNlcy9maGlyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMvRCxPQUFPLEVBQWMsVUFBVSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDakUsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzFELE9BQU8sS0FBSyxHQUFHLE1BQU0sS0FBSyxDQUFDO0FBQzNCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzNELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxPQUFPLENBQUM7Ozs7QUErQi9CO0lBa0ZFLHFCQUFvQixJQUFnQixFQUFVLE1BQTZCO1FBQXZELFNBQUksR0FBSixJQUFJLENBQVk7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUF1QjtRQTVEM0UsNERBQTREO1FBQ3JELFNBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixZQUFPLEdBQUcsV0FBVyxDQUFDO1FBRXJCLGFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQXdENEMsQ0FBQztJQXREekUscUJBQVMsR0FBaEIsVUFBaUIsT0FBNkIsRUFBRSxLQUFLOztRQUNuRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRTtvQ0FDM0IsSUFBSTtnQkFDYixJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUks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RztRQUMxQixRQUFRLEVBQUUsY0FBYztRQUN4QixvQkFBb0IsRUFBRSxxQ0FBcUM7UUFDM0QsTUFBTSxFQUFFLHdCQUF3QjtRQUNoQyxhQUFhLEVBQUUsbUNBQW1DO1FBQ2xELHVCQUF1QixFQUFFLFNBQVM7S0FDbkMsQ0FBQzswRUFsQlMsV0FBVzt1REFBWCxXQUFXLFdBQVgsV0FBVztzQkF0Q3hCO0NBNFVDLEFBdlNELElBdVNDO1NBdFNZLFdBQVc7a0RBQVgsV0FBVztjQUR2QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSHR0cEhlYWRlcnMsIEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aHJvd0Vycm9yLCBSZXBsYXlTdWJqZWN0LCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwLCB0YXAsIGV4cGFuZCwgcmVkdWNlIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0ICogYXMgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQgeyBSZWdpb25hbENvbmZpZ1NlcnZpY2UgfSBmcm9tICcuL3JlZ2lvbmFsLnNlcnZpY2UnO1xuaW1wb3J0IHsgTFJVTWFwIH0gZnJvbSAnLi9scnUnO1xuXG5leHBvcnQgaW50ZXJmYWNlIElGaGlyUmVzcG9uc2U8VCBleHRlbmRzIGZoaXIuUmVzb3VyY2U+IHtcbiAgcmVzb3VyY2VUeXBlOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG4gIG1ldGE6IHtcbiAgICBsYXN0VXBkYXRlZDogc3RyaW5nO1xuICB9O1xuICB0eXBlOiBzdHJpbmc7XG4gIHRvdGFsOiBudW1iZXI7XG4gIGxpbms6IHtcbiAgICByZWxhdGlvbjogc3RyaW5nLFxuICAgIHVybDogc3RyaW5nO1xuICB9W107XG4gIGVudHJ5OiB7XG4gICAgZnVsbFVybDogc3RyaW5nO1xuICAgIHJlc291cmNlOiBUO1xuICAgIHNlYXJjaDoge1xuICAgICAgbW9kZTogc3RyaW5nO1xuICAgIH07XG4gIH1bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRmhpclNlYXJjaFBhcmFtcyB7XG4gIG5leHRVcmw/OiBzdHJpbmc7XG4gIF9jb3VudD86IHN0cmluZztcbiAgX3NvcnQ/OiBzdHJpbmc7XG4gIF9nZXRwYWdlc29mZnNldD86IHN0cmluZztcbiAgW3BhcmFtOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEZoaXJTZXJ2aWNlIHtcblxuICBzdGF0aWMgRVhURU5TSU9OUyA9IHtcbiAgICBUQVNLX0VOQUJMRV9XSEVOOiAnaHR0cHM6Ly9maGlyLXJlZ2lzdHJ5LmNhcmRpaGFiLmNvbS9TdHJ1Y3R1cmVEZWZpbml0b24vVGFza0VuYWJsZVdoZW4nLFxuICAgIEVEVUNBVElPTl9UQVNLOiAnaHR0cHM6Ly9maGlyLXJlZ2lzdHJ5LmNhcmRpaGFiLmNvbS9TdHJ1Y3R1cmVEZWZpbml0b24vRWR1Y2F0aW9uVGFzaycsXG4gICAgQURIRVJFTkNFOiAnaHR0cHM6Ly9maGlyLXJlZ2lzdHJ5LmNhcmRpaGFiLmNvbS9TdHJ1Y3R1cmVEZWZpbml0b24vQWRoZXJlbmNlJyxcbiAgICBSRUNVUlJJTkdfVEFTSzogJ2h0dHBzOi8vZmhpci1yZWdpc3RyeS5jYXJkaWhhYi5jb20vU3RydWN0dXJlRGVmaW5pdG9uL1JlY3VycmluZ1Rhc2snLFxuICAgIEJBU0VEX09OX0dPQUw6ICdodHRwczovL2ZoaXItcmVnaXN0cnkuY2FyZGloYWIuY29tL1N0cnVjdHVyZURlZmluaXRvbi9CYXNlZE9uR29hbCcsXG4gICAgUEFUSUVOVF9TUEVDSUZJQ19SRU1JTkRFUjogJ2h0dHBzOi8vZmhpci1yZWdpc3RyeS5jYXJkaWhhYi5jb20vU3RydWN0dXJlRGVmaW5pdG9uL1BhdGllbnRTcGVjaWZpY1JlbWluZGVyJyxcbiAgICBPUkdBTklaQVRJT05fQVRUUklCVVRFUzogJ2h0dHBzOi8vZmhpci1yZWdpc3RyeS5jYXJkaWhhYi5jb20vU3RydWN0dXJlRGVmaW5pdG9uL09yZ2FuaXphdGlvbkF0dHJpYnV0ZXMnXG4gIH07XG5cbiAgc3RhdGljIElERU5USUZJRVJfU1lTVEVNUyA9IHtcbiAgICBTSVRFQ09ERTogJ3VybjpzaXRlY29kZScsXG4gICAgRkhJUl9JREVOVElGSUVSX1RZUEU6ICdodHRwOi8vaGw3Lm9yZy9maGlyL2lkZW50aWZpZXItdHlwZScsXG4gICAgU05PTUVEOiAnaHR0cDovL3Nub21lZC5pbmZvL3NjdCcsXG4gICAgR09BTF9DQVRFR09SWTogJ2h0dHA6Ly9obDcub3JnL2ZoaXIvZ29hbC1jYXRlZ29yeScsXG4gICAgVEVOQU5DWV9TRUNVUklUWV9TWVNURU06ICdUZW5hbmN5J1xuICB9O1xuXG5cbiAgLy8gc2V0IGJ5IGF1dGggZ3VhcmQuIEZpeG1lIGNsZWFuZXIgc2VwYXJhdGlvbiB3b3VsZCBiZSBuaWNlXG4gIHB1YmxpYyBiYXNlID0gdGhpcy5jb25maWcuZ2V0KCdmaGlyJyk7XG4gIHB1YmxpYyB0ZW5hbmN5ID0gJ2Jhc2VEc3R1Myc7XG5cbiAgcHJpdmF0ZSByZWZDYWNoZSA9IG5ldyBMUlVNYXAoMTAwKTtcblxuICBzdGF0aWMgaGFzQ29kaW5nKGNvbmNlcHQ6IGZoaXIuQ29kZWFibGVDb25jZXB0LCBjb2Rlcykge1xuICAgIGlmIChjb25jZXB0ICYmIGNvbmNlcHQuY29kaW5nICYmIGNvZGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvZGUgb2YgY29uY2VwdC5jb2RpbmcpIHtcbiAgICAgICAgaWYgKGNvZGUuY29kZSAmJiBjb2Rlcy5maW5kKGlhID0+IGlhLnN5c3RlbSA9PT0gY29kZS5zeXN0ZW0gJiYgaWEuY29kZSA9PT0gY29kZS5jb2RlKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3RhdGljIHJlZmVyZW5jZVRvSWQocmVmZXJlbmNlOiBmaGlyLlJlZmVyZW5jZSk6IHsgcmVzb3VyY2VUeXBlOiBzdHJpbmcsIGlkOiBzdHJpbmcgfSB7XG4gICAgY29uc3QgW3Jlc291cmNlVHlwZSwgaWRdID0gKHJlZmVyZW5jZSB8fCB7IHJlZmVyZW5jZTogJycgfSkucmVmZXJlbmNlLnNwbGl0KCcvJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc291cmNlVHlwZSxcbiAgICAgIGlkXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBmbGF0dGVuRXh0ZW5zaW9uPFQ+KGV4dGVuc2lvbjogZmhpci5FeHRlbnNpb24pOiBUIHwgYW55IHtcbiAgICBjb25zdCBvYmogPSB7fTtcbiAgICBpZiAoZXh0ZW5zaW9uLmV4dGVuc2lvbikge1xuICAgICAgZXh0ZW5zaW9uLmV4dGVuc2lvbi5mb3JFYWNoKGV4dCA9PiB7XG4gICAgICAgIG9ialtleHQudXJsXSA9IEZoaXJTZXJ2aWNlLmZsYXR0ZW5FeHRlbnNpb24oZXh0KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZXh0ZW5zaW9uLnZhbHVlU3RyaW5nID8gZXh0ZW5zaW9uLnZhbHVlU3RyaW5nIDpcbiAgICAgICAgZXh0ZW5zaW9uLnZhbHVlUmVmZXJlbmNlID8gZXh0ZW5zaW9uLnZhbHVlUmVmZXJlbmNlIDpcbiAgICAgICAgICBleHRlbnNpb24udmFsdWVDb2RpbmcgPyBleHRlbnNpb24udmFsdWVDb2RpbmcgOlxuICAgICAgICAgICAgZXh0ZW5zaW9uLnZhbHVlVXJpID8gZXh0ZW5zaW9uLnZhbHVlVXJpIDpcbiAgICAgICAgICAgICAgZXh0ZW5zaW9uLnZhbHVlQm9vbGVhbiA/IGV4dGVuc2lvbi52YWx1ZUJvb2xlYW4gOlxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUFkZHJlc3MgPyBleHRlbnNpb24udmFsdWVBZGRyZXNzIDpcbiAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUFnZSA/IGV4dGVuc2lvbi52YWx1ZUFnZSA6XG4gICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUFubm90YXRpb24gPyBleHRlbnNpb24udmFsdWVBbm5vdGF0aW9uIDpcbiAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24udmFsdWVBdHRhY2htZW50ID8gZXh0ZW5zaW9uLnZhbHVlQXR0YWNobWVudCA6XG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24udmFsdWVCYXNlNjRCaW5hcnkgPyBleHRlbnNpb24udmFsdWVCYXNlNjRCaW5hcnkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24udmFsdWVDb2RlID8gZXh0ZW5zaW9uLnZhbHVlQ29kZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uLnZhbHVlQ29kZWFibGVDb25jZXB0ID8gZXh0ZW5zaW9uLnZhbHVlQ29kZWFibGVDb25jZXB0IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUNvbnRhY3RQb2ludCA/IGV4dGVuc2lvbi52YWx1ZUNvbnRhY3RQb2ludCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUNvdW50ID8gZXh0ZW5zaW9uLnZhbHVlQ291bnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZURhdGUgPyBleHRlbnNpb24udmFsdWVEYXRlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZURlY2ltYWwgPyBleHRlbnNpb24udmFsdWVEZWNpbWFsIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uLnZhbHVlRHVyYXRpb24gPyBleHRlbnNpb24udmFsdWVEdXJhdGlvbiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uLnZhbHVlSHVtYW5OYW1lID8gZXh0ZW5zaW9uLnZhbHVlSHVtYW5OYW1lIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUlkID8gZXh0ZW5zaW9uLnZhbHVlSWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24udmFsdWVEYXRlVGltZSA/IGV4dGVuc2lvbi52YWx1ZURhdGVUaW1lIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24udmFsdWVEaXN0YW5jZSA/IGV4dGVuc2lvbi52YWx1ZURpc3RhbmNlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbi52YWx1ZUludGVnZXIgPyBleHRlbnNpb24udmFsdWVJbnRlZ2VyIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG9kbyBhZGQgYWRkaXRpb25hbCB2YWx1ZVt4XSB0eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LCBwcml2YXRlIGNvbmZpZzogUmVnaW9uYWxDb25maWdTZXJ2aWNlKSB7IH1cblxuICBnZXRVcmwodGVuYW5jeU92ZXJyaWRlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5iYXNlfS8ke3RlbmFuY3lPdmVycmlkZSA/IHRlbmFuY3lPdmVycmlkZSA6IHRoaXMudGVuYW5jeX1gO1xuICB9XG5cbiAgc2V0VXJsKG5ld1VybDogc3RyaW5nKSB7XG4gICAgdGhpcy5iYXNlID0gbmV3VXJsO1xuICB9XG5cbiAgb3B0aW9ucygpOiBIdHRwSGVhZGVycyB7XG4gICAgcmV0dXJuIG5ldyBIdHRwSGVhZGVycyh7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xuICB9XG5cbiAgbmV4dFBhZ2U8VD4ocmVzcG9uc2U6IElGaGlyUmVzcG9uc2U8VD4pOiBPYnNlcnZhYmxlPElGaGlyUmVzcG9uc2U8VD4+IHtcbiAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgIGNvbnN0IG5leHRMaW5rID0gKHJlc3BvbnNlLmxpbmsgfHwgW10pLmZpbmQobCA9PiBsLnJlbGF0aW9uID09PSAnbmV4dCcpO1xuICAgICAgaWYgKG5leHRMaW5rKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PElGaGlyUmVzcG9uc2U8VD4+KG5leHRMaW5rLnVybCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdObyBuZXh0IGxpbmsgdG8gZm9sbG93JykpO1xuICB9XG5cbiAgcmVmZXJlbmNlPFQ+KHJlZjogZmhpci5SZWZlcmVuY2UsIGNvbnRleHQ6IGZoaXIuRG9tYWluUmVzb3VyY2UpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBpZiAocmVmICYmIHJlZi5yZWZlcmVuY2UpIHtcbiAgICAgIGNvbnN0IGFic29sdXRlVXJpID0gdGhpcy5yZWZlcmVuY2VUb0Fic29sdXRlVXJsKHJlZiwgY29udGV4dCk7XG4gICAgICBsZXQgcmVmJCA9IHRoaXMucmVmQ2FjaGUuZ2V0KGFic29sdXRlVXJpKTtcblxuICAgICAgLy8gVE9ETyBoYW5kbGUgY29udGFpbmVkIHJlc291cmNlIHJlZmVyZW5jZXNcbiAgICAgIGlmIChhYnNvbHV0ZVVyaS5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKGBEb24ndCB5ZXQgc3VwcG9ydCBjb250YWluZWQgcmVmZXJlbmNlc2ApKTtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFyZWYkKSB7XG4gICAgICAgICAgcmVmJCA9IG5ldyBSZXBsYXlTdWJqZWN0PFQ+KDEpO1xuICAgICAgICAgIHRoaXMuaHR0cC5nZXQ8VD4oYWJzb2x1dGVVcmkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHJlZiQpO1xuICAgICAgICAgIHRoaXMucmVmQ2FjaGUuc2V0KGFic29sdXRlVXJpLCByZWYkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVmJDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdJbnZhbGlkIHJlZmVyZW5jZScpKTtcbiAgICB9XG4gIH1cblxuICBnZXQ8VCBleHRlbmRzIGZoaXIuUmVzb3VyY2U+KHJlc291cmNlVHlwZTogc3RyaW5nLCBpZDogc3RyaW5nLCB0ZW5hbmN5Pzogc3RyaW5nKTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgaWYgKGlkID09PSAnbmV3Jykge1xuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxUPihgJHt0aGlzLmdldFVybCh0ZW5hbmN5KX0vJHtyZXNvdXJjZVR5cGV9LyR7aWR9YCk7XG4gICAgfVxuICB9XG5cblxuICBzZWFyY2g8VCBleHRlbmRzIGZoaXIuUmVzb3VyY2U+KFxuICAgIHJlc291cmNlVHlwZTogc3RyaW5nLFxuICAgIHBhcmFtczogYW55LFxuICAgIG9wdGlvbnM/OiB7IHRlbmFuY3k/OiBzdHJpbmcsIGhlYWRlcnM/OiBhbnl9LFxuICAgIHBhZ2luYXRpb246IGJvb2xlYW4gPSBmYWxzZVxuICApOiBPYnNlcnZhYmxlPElGaGlyUmVzcG9uc2U8VD4+IHtcbiAgICBjb25zdCByZXF1ZXN0T3B0aW9uczoge3BhcmFtczogYW55LCBoZWFkZXJzPzogYW55fSA9IHtcbiAgICAgIHBhcmFtc1xuICAgIH07XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICByZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmh0dHAuZ2V0PElGaGlyUmVzcG9uc2U8VD4+KGAke3RoaXMuZ2V0VXJsKChvcHRpb25zIHx8IHt9KS50ZW5hbmN5KX0vJHtyZXNvdXJjZVR5cGV9YCwgcmVxdWVzdE9wdGlvbnMpO1xuXG4gICAgaWYgKHBhZ2luYXRpb24pIHtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVxdWVzdFxuICAgICAgICAucGlwZShcbiAgICAgICAgICBleHBhbmQoKHJlcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZm91bmROZXh0ID0gKChyZXMubGluayB8fCBbXSkuZmluZChsID0+IGwucmVsYXRpb24gPT09ICduZXh0JykgfHwge30gYXMgYW55KS51cmw7XG4gICAgICAgICAgICBpZiAoZm91bmROZXh0KSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PElGaGlyUmVzcG9uc2U8VD4+KHVybC5mb3JtYXQodXJsLnBhcnNlKGZvdW5kTmV4dCwgdHJ1ZSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvZigpO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIHJlZHVjZSgoYWNjOiBJRmhpclJlc3BvbnNlPFQ+LCB2YWx1ZTogSUZoaXJSZXNwb25zZTxUPikgPT4ge1xuICAgICAgICAgICAgaWYgKGFjYy5lbnRyeSAmJiB2YWx1ZS5lbnRyeSkge1xuICAgICAgICAgICAgICBhY2MuZW50cnkgPSBhY2MuZW50cnkuY29uY2F0KHZhbHVlLmVudHJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwYXRjaChyZXNvdXJjZVVybCwgY21kLCBvcHRpb25zPzogeyB0ZW5hbmN5Pzogc3RyaW5nLCBoZWFkZXJzPzogYW55IH0pOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zOiB7IHBhcmFtcz86IGFueSwgaGVhZGVycz86IGFueSB9ID0ge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24tcGF0Y2granNvbidcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuaGVhZGVycykge1xuICAgICAgT2JqZWN0LmFzc2lnbihyZXF1ZXN0T3B0aW9ucy5oZWFkZXJzLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5odHRwLnBhdGNoKHJlc291cmNlVXJsLCBjbWQsIHJlcXVlc3RPcHRpb25zKTtcbiAgfVxuXG4gIGRlbGV0ZShyZXNvdXJjZVR5cGUsIGlkLCBvcHRpb25zPzoge3RlbmFuY3k/OiBzdHJpbmcsIGhlYWRlcnM/OiBhbnl9KSB7XG4gICAgY29uc3QgcmVxdWVzdE9wdGlvbnM6IHsgcGFyYW1zPzogYW55LCBoZWFkZXJzPzogYW55IH0gPSB7IH07XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICByZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5odHRwLmRlbGV0ZShgJHt0aGlzLmdldFVybCgob3B0aW9ucyB8fCB7fSkudGVuYW5jeSl9LyR7cmVzb3VyY2VUeXBlfS8ke2lkfWAsIHJlcXVlc3RPcHRpb25zKTtcbiAgfVxuXG4gIHNhdmU8VCBleHRlbmRzIGZoaXIuUmVzb3VyY2U+KGJ1bmRsZTogVCwgb3B0aW9ucz86IHsgdGVuYW5jeT86IHN0cmluZywgaGVhZGVycz86IGFueSB9KTogT2JzZXJ2YWJsZTxUPiB7XG4gICAgaWYgKGJ1bmRsZS5yZXNvdXJjZVR5cGUgPT09ICdCdW5kbGUnKSB7XG4gICAgICByZXR1cm4gdGhpcy5odHRwLnBvc3Q8VD4oYCR7dGhpcy5nZXRVcmwoKG9wdGlvbnMgfHwge30pLnRlbmFuY3kpfWAsIGJ1bmRsZSwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9maGlyK2pzb24nLFxuICAgICAgICAgIFByZWZlcjogJ3JldHVybj1yZXByZXNlbnRhdGlvbidcbiAgICAgICAgfVxuICAgICAgfSkucGlwZShcbiAgICAgICAgdGFwKGJ1bmRsZVJlc3BvbnNlID0+IHtcbiAgICAgICAgICAoKGJ1bmRsZVJlc3BvbnNlIGFzIGZoaXIuQnVuZGxlKS5lbnRyeSB8fCBbXSkuZm9yRWFjaCgodjogZmhpci5CdW5kbGVFbnRyeSwgaykgPT4ge1xuICAgICAgICAgICAgaWYgKChidW5kbGUgYXMgZmhpci5CdW5kbGUpLmVudHJ5W2tdKSB7XG4gICAgICAgICAgICAgIChidW5kbGUgYXMgZmhpci5CdW5kbGUpLmVudHJ5W2tdLnJlc291cmNlLmlkID0gdi5yZXNvdXJjZS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnNhdmVBbGwoW2J1bmRsZV0sIG9wdGlvbnMpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIG1hcChidW5kbGVSZXNwb25zZSA9PiBidW5kbGVSZXNwb25zZS5lbnRyeVswXS5yZXNvdXJjZSBhcyBUKVxuICAgICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHNhdmVBbGwocmVzb3VyY2VzOiBmaGlyLlJlc291cmNlW10sIG9wdGlvbnM/OiB7IHRlbmFuY3k/OiBzdHJpbmcsIGhlYWRlcnM/OiBhbnkgfSk6IE9ic2VydmFibGU8Zmhpci5CdW5kbGU+IHtcblxuICAgIGNvbnN0IGJ1bmRsZUVudHJpZXMgPSByZXNvdXJjZXMubWFwKHAgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWVzdDoge1xuICAgICAgICAgIG1ldGhvZDogcC5pZCA/ICdQVVQnIDogJ1BPU1QnLFxuICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1zdHJpbmctbGl0ZXJhbFxuICAgICAgICAgIHVybDogcC5pZCA/IGAke3AucmVzb3VyY2VUeXBlfS8ke3AuaWR9YCA6IChwWydpZGVudGlmaWVyJ10gfHwgW10pWzBdID8gYHVybjp1dWlkOiR7cFsnaWRlbnRpZmllciddWzBdLnZhbHVlfWAgOiBwLnJlc291cmNlVHlwZVxuICAgICAgICB9LFxuICAgICAgICByZXNvdXJjZTogcFxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLnNhdmU8Zmhpci5CdW5kbGU+KHtcbiAgICAgIHJlc291cmNlVHlwZTogJ0J1bmRsZScsXG4gICAgICB0eXBlOiAndHJhbnNhY3Rpb24nLFxuICAgICAgZW50cnk6IGJ1bmRsZUVudHJpZXNcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHJlc29sdmVSZWZlcmVuY2VzPFQgZXh0ZW5kcyBmaGlyLkRvbWFpblJlc291cmNlPihcbiAgICByZWZlcmVuY2VzOiBmaGlyLlJlZmVyZW5jZVtdLFxuICAgIGNvbnRleHQ6IGZoaXIuRG9tYWluUmVzb3VyY2UsXG4gICAgY291bnQ6IG51bWJlciA9IDUwMFxuICApOiBPYnNlcnZhYmxlPGZoaXIuQnVuZGxlPiB7XG4gICAgaWYgKCFyZWZlcmVuY2VzIHx8ICFBcnJheS5pc0FycmF5KHJlZmVyZW5jZXMpIHx8ICFyZWZlcmVuY2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG9mKHt9IGFzIGZoaXIuQnVuZGxlKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHJlc291cmNlVHlwZSB9ID0gRmhpclNlcnZpY2UucmVmZXJlbmNlVG9JZChyZWZlcmVuY2VzWzBdKTtcbiAgICBjb25zdCBpZHMgPSByZWZlcmVuY2VzLm1hcChyZWYgPT4gRmhpclNlcnZpY2UucmVmZXJlbmNlVG9JZChyZWYpLmlkKTtcblxuICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxJRmhpclJlc3BvbnNlPFQ+PihgJHt0aGlzLmdldENvbnRleHRCYXNlVXJsKGNvbnRleHQpfS8ke3Jlc291cmNlVHlwZX0vX3NlYXJjaGAsXG4gICAgICBgX2lkPSR7aWRzLmpvaW4oJywnKX0mX2NvdW50PSR7Y291bnR9YCxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnBpcGUoXG4gICAgICAgIGV4cGFuZCgocmVzKSA9PiB7XG4gICAgICAgICAgY29uc3QgZm91bmROZXh0ID0gKChyZXMubGluayB8fCBbXSkuZmluZChsID0+IGwucmVsYXRpb24gPT09ICduZXh0JykgfHwge30gYXMgYW55KS51cmw7XG4gICAgICAgICAgaWYgKGZvdW5kTmV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5nZXQ8SUZoaXJSZXNwb25zZTxmaGlyLkJ1bmRsZT4+KHVybC5mb3JtYXQodXJsLnBhcnNlKGZvdW5kTmV4dCwgdHJ1ZSkpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG9mKCk7XG4gICAgICAgIH0pLFxuICAgICAgICByZWR1Y2UoKGFjYzogZmhpci5CdW5kbGUsIHZhbHVlOiBmaGlyLkJ1bmRsZSkgPT4ge1xuICAgICAgICAgIGlmIChhY2MuZW50cnkgJiYgdmFsdWUuZW50cnkpIHtcbiAgICAgICAgICAgIGFjYy5lbnRyeSA9IGFjYy5lbnRyeS5jb25jYXQodmFsdWUuZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgfVxuXG4gIHJlZmVyZW5jZVRvQWJzb2x1dGVVcmwocmVmOiBmaGlyLlJlZmVyZW5jZSwgY29udGV4dDogZmhpci5SZXNvdXJjZSk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVmVXJsID0gdXJsLnBhcnNlKHJlZi5yZWZlcmVuY2UpO1xuICAgIGlmIChyZWZVcmwuaGFzaCAmJiAhcmVmVXJsLnByb3RvY29sKSB7IC8vIGRvbid0IHRvdWNoIGNvbnRhaW5lZCByZXNvdXJjZSByZWZlcmVuY2VzXG4gICAgICByZXR1cm4gcmVmLnJlZmVyZW5jZTtcbiAgICB9XG4gICAgY29uc3QgYmFzZSA9IHRoaXMuZ2V0Q29udGV4dEJhc2VVcmwoY29udGV4dCk7XG4gICAgcmV0dXJuIHVybC5yZXNvbHZlKGAke2Jhc2V9L2AsIHJlZi5yZWZlcmVuY2UpO1xuICB9XG5cbiAgZ2V0Q29udGV4dEJhc2VVcmwoY29udGV4dD86IGZoaXIuUmVzb3VyY2UpIHtcbiAgICBsZXQgYmFzZSA9IHRoaXMuZ2V0VXJsKCk7XG4gICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5tZXRhICYmIGNvbnRleHQubWV0YS5zZWN1cml0eSkge1xuICAgICAgY29uc3QgdGVuYW5jeVRhZyA9IGNvbnRleHQubWV0YS5zZWN1cml0eS5maW5kKHNlYyA9PiBzZWMuc3lzdGVtID09PSBGaGlyU2VydmljZS5JREVOVElGSUVSX1NZU1RFTVMuVEVOQU5DWV9TRUNVUklUWV9TWVNURU0pO1xuICAgICAgaWYgKHRlbmFuY3lUYWcpIHtcbiAgICAgICAgYmFzZSA9IHRoaXMuZ2V0VXJsKHRlbmFuY3lUYWcuZGlzcGxheSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiYXNlO1xuICB9XG59XG4iXX0=