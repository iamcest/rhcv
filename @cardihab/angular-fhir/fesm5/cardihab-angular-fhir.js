import { ɵɵdefinePipe, ɵsetClassMetadata, Pipe, ɵɵdefineInjectable, Injectable, ɵɵinject, ɵɵnamespaceSVG, ɵɵnamespaceHTML, ɵɵelementStart, ɵɵtext, ɵɵelementEnd, ɵɵnextContext, ɵɵadvance, ɵɵtextInterpolate, InjectionToken, ɵɵdirectiveInject, ɵɵdefineComponent, ɵɵelement, ɵɵtemplate, ɵɵproperty, Component, Optional, Inject, Injector, ɵɵdefineNgModule, ɵɵdefineInjector, ɵɵsetNgModuleScope, NgModule } from '@angular/core';
import moment from 'moment';
import { ReplaySubject, throwError, of } from 'rxjs';
import { __awaiter, __generator, __values, __read } from 'tslib';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { expand, reduce, tap, map } from 'rxjs/operators';
import { format, parse, resolve } from 'url';
import { OverlayConfig, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { NgIf, CommonModule } from '@angular/common';

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
    AgePipe.ɵpipe = ɵɵdefinePipe({ name: "ageInYears", type: AgePipe, pure: true });
    return AgePipe;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(AgePipe, [{
        type: Pipe,
        args: [{
                name: 'ageInYears'
            }]
    }], null, null); })();

var FhirCodingPipe = /** @class */ (function () {
    function FhirCodingPipe() {
    }
    FhirCodingPipe.prototype.transform = function (value, args) {
        if (value && value.code && value.code.coding && value.code.coding.length > 0) {
            return value.code.coding[0].display;
        }
        return '';
    };
    FhirCodingPipe.ɵfac = function FhirCodingPipe_Factory(t) { return new (t || FhirCodingPipe)(); };
    FhirCodingPipe.ɵpipe = ɵɵdefinePipe({ name: "fhirCoding", type: FhirCodingPipe, pure: true });
    return FhirCodingPipe;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(FhirCodingPipe, [{
        type: Pipe,
        args: [{
                name: 'fhirCoding'
            }]
    }], null, null); })();

function formatAddress(organisation, types) {
    if (!organisation || !organisation.address ||
        !Array.isArray(organisation.address) || !organisation.address.length) {
        return '';
    }
    types = types || [];
    var address = organisation.address.find(function (item) { return types.indexOf(item.type) > -1; });
    address = address || organisation.address[0];
    var phoneNumber = organisation.telecom.find(function (item) { return item.system === 'phone'; });
    return [
        organisation.name + ",",
        address.line.join(' ') + ",",
        address.city,
        address.state,
        address.postalCode,
        phoneNumber
    ].join(' ');
}
function toValueString(item) {
    // A hack for pluralising some unit names
    var formatUnit = function (unit, value) {
        if (value !== 1) {
            if (unit === 'serving') {
                return unit + "s";
            }
        }
        return unit;
    };
    return item.valueString ? item.valueString :
        item.valueReference ? item.valueReference :
            item.valueCoding ? item.valueCoding :
                item.valueUri ? item.valueUri :
                    item.valueBoolean ? item.valueBoolean :
                        item.valueAddress ? item.valueAddress :
                            item.valueAge ? item.valueAge :
                                item.valueAnnotation ? item.valueAnnotation :
                                    item.valueAttachment ? item.valueAttachment :
                                        item.valueBase64Binary ? item.valueBase64Binary :
                                            item.valueCode ? item.valueCode :
                                                item.valueCodeableConcept ? item.valueCodeableConcept :
                                                    item.valueContactPoint ? item.valueContactPoint :
                                                        item.valueCount ? item.valueCount :
                                                            item.valueDate ? item.valueDate :
                                                                item.valueDecimal ? item.valueDecimal :
                                                                    item.valueDuration ? item.valueDuration :
                                                                        item.valueHumanName ? item.valueHumanName :
                                                                            item.valueId ? item.valueId :
                                                                                item.valueDateTime ? item.valueDateTime :
                                                                                    item.valueDistance ? item.valueDistance :
                                                                                        item.valueInteger ? item.valueInteger :
                                                                                            // todo add additional value[x] types
                                                                                            item.valueQuantity ? item.valueQuantity.value + " " + formatUnit(item.valueQuantity.unit, item.valueQuantity.value) : '';
}
// tslint:disable-next-line:max-line-length
function formatFhirName(value, args) {
    if (args === void 0) { args = { noTitle: false, capitaliseLastName: false, firstNameFirst: false }; }
    if (value && value.length > 0) {
        var preferredName = value.reduce(function (best, name, idx, names) {
            if (name.use === 'usual') {
                return name;
            }
            else if (!best) {
                return name;
            }
            else {
                if (name.use === 'official') {
                    return name;
                }
            }
            return best;
        });
        if (preferredName.text) {
            return preferredName.text;
        }
        var family = (args.capitaliseLastName ? preferredName.family.toUpperCase() : preferredName.family) || '';
        var titles = (preferredName.prefix || []).length > 0 ? " (" + (preferredName.prefix || []).join(' ') + ")" : '';
        // tslint:disable-next-line:max-line-length
        return args.firstNameFirst ? (args.noTitle ? '' : titles) + " " + (preferredName.given || [])[0] + " " + family : family + ", " + (preferredName.given || [])[0] + (args.noTitle ? '' : titles);
    }
    else {
        return '<No Name>';
    }
}
function formatDOB(date, includeAge) {
    if (includeAge === void 0) { includeAge = false; }
    var mDate = moment(date);
    var age = " (" + moment().diff(mDate, 'years') + " ys)";
    return "" + mDate.format('DD-MMM-YYYY') + (includeAge ? age : '');
}

var FhirUsualNamePipe = /** @class */ (function () {
    function FhirUsualNamePipe() {
    }
    FhirUsualNamePipe.prototype.transform = function (value, args) {
        return formatFhirName(value, args);
    };
    FhirUsualNamePipe.ɵfac = function FhirUsualNamePipe_Factory(t) { return new (t || FhirUsualNamePipe)(); };
    FhirUsualNamePipe.ɵpipe = ɵɵdefinePipe({ name: "fhirUsualName", type: FhirUsualNamePipe, pure: true });
    return FhirUsualNamePipe;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(FhirUsualNamePipe, [{
        type: Pipe,
        args: [{
                name: 'fhirUsualName'
            }]
    }], null, null); })();

var ObservationValuePipe = /** @class */ (function () {
    function ObservationValuePipe() {
    }
    ObservationValuePipe.prototype.transform = function (observation, args) {
        var multi = (observation.component || []).length > 1;
        return (observation.component || [])
            .map(function (component) {
            return "" + (multi ? new FhirCodingPipe().transform(component) + ':' : '') + toValueString(component);
        }).join(', ');
    };
    ObservationValuePipe.ɵfac = function ObservationValuePipe_Factory(t) { return new (t || ObservationValuePipe)(); };
    ObservationValuePipe.ɵpipe = ɵɵdefinePipe({ name: "observationValue", type: ObservationValuePipe, pure: true });
    return ObservationValuePipe;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(ObservationValuePipe, [{
        type: Pipe,
        args: [{
                name: 'observationValue'
            }]
    }], function () { return []; }, null); })();

function observableToReplaySubject(observable, history) {
    var subject = new ReplaySubject(history || 1);
    observable.subscribe(subject);
    return subject;
}

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
    RegionalConfigService.ɵprov = ɵɵdefineInjectable({ token: RegionalConfigService, factory: RegionalConfigService.ɵfac });
    return RegionalConfigService;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(RegionalConfigService, [{
        type: Injectable
    }], null, null); })();

/**
 * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
 * recently used items while discarding least recently used items when its limit
 * is reached.
 *
 * Licensed under MIT. Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>
 * See README.md for details.
 *
 * Illustration of the design:
 *
 *       entry             entry             entry             entry
 *       ______            ______            ______            ______
 *      | head |.newer => |      |.newer => |      |.newer => | tail |
 *      |  A   |          |  B   |          |  C   |          |  D   |
 *      |______| <= older.|______| <= older.|______| <= older.|______|
 *
 *  removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added
 */
var NEWER = Symbol('newer');
var OLDER = Symbol('older');
var Entry = /** @class */ (function () {
    function Entry(key, value) {
        this.key = key;
        this.value = value;
    }
    return Entry;
}());
var LRUMap = /** @class */ (function () {
    function LRUMap(limit, entries) {
        this.limit = limit;
        this.size = 0;
        this._keymap = new Map();
        if (typeof limit !== 'number') {
            // called as (entries)
            entries = limit;
            limit = 0;
        }
        if (entries) {
            this.assign(entries);
            if (limit < 1) {
                this.limit = this.size;
            }
        }
    }
    LRUMap.prototype._markEntryAsUsed = function (entry) {
        if (entry === this.newest) {
            // Already the most recenlty used entry, so no need to update the list
            return;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry[NEWER]) {
            if (entry === this.oldest) {
                this.oldest = entry[NEWER];
            }
            entry[NEWER][OLDER] = entry[OLDER]; // C <-- E.
        }
        if (entry[OLDER]) {
            entry[OLDER][NEWER] = entry[NEWER]; // C. --> E
        }
        entry[NEWER] = undefined; // D --x
        entry[OLDER] = this.newest; // D. --> E
        if (this.newest) {
            this.newest[NEWER] = entry; // E. <-- D
        }
        this.newest = entry;
    };
    LRUMap.prototype.assign = function (entries) {
        var entry;
        var limit = this.limit || Number.MAX_VALUE;
        this._keymap.clear();
        var it = entries[Symbol.iterator]();
        for (var itv = it.next(); !itv.done; itv = it.next()) {
            var e = new Entry(itv.value[0], itv.value[1]);
            this._keymap.set(e.key, e);
            if (!entry) {
                this.oldest = e;
            }
            else {
                entry[NEWER] = e;
                e[OLDER] = entry;
            }
            entry = e;
            if (limit-- === 0) {
                throw new Error('overflow');
            }
        }
        this.newest = entry;
        this.size = this._keymap.size;
    };
    LRUMap.prototype.get = function (key) {
        // First, find our cache entry
        var entry = this._keymap.get(key);
        if (!entry)
            return; // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        this._markEntryAsUsed(entry);
        return entry.value;
    };
    LRUMap.prototype.set = function (key, value) {
        var entry = this._keymap.get(key);
        if (entry) {
            // update existing
            entry.value = value;
            this._markEntryAsUsed(entry);
            return this;
        }
        // new entry
        this._keymap.set(key, (entry = new Entry(key, value)));
        if (this.newest) {
            // link previous tail to the new tail (entry)
            this.newest[NEWER] = entry;
            entry[OLDER] = this.newest;
        }
        else {
            // we're first in -- yay
            this.oldest = entry;
        }
        // add new entry to the end of the linked list -- it's now the freshest entry.
        this.newest = entry;
        ++this.size;
        if (this.size > this.limit) {
            // we hit the limit -- remove the head
            this.shift();
        }
        return this;
    };
    LRUMap.prototype.shift = function () {
        // todo: handle special case when limit == 1
        var entry = this.oldest;
        if (entry) {
            if (this.oldest[NEWER]) {
                // advance the list
                this.oldest = this.oldest[NEWER];
                this.oldest[OLDER] = undefined;
            }
            else {
                // the cache is exhausted
                this.oldest = undefined;
                this.newest = undefined;
            }
            // Remove last strong reference to <entry> and remove links from the purged
            // entry being returned:
            entry[NEWER] = entry[OLDER] = undefined;
            this._keymap.delete(entry.key);
            --this.size;
            return [entry.key, entry.value];
        }
    };
    return LRUMap;
}());

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
                    return _this.http.get(format(parse(foundNext, true)));
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
                return _this.http.get(format(parse(foundNext, true)));
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
        var refUrl = parse(ref.reference);
        if (refUrl.hash && !refUrl.protocol) { // don't touch contained resource references
            return ref.reference;
        }
        var base = this.getContextBaseUrl(context);
        return resolve(base + "/", ref.reference);
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
    FhirService.ɵfac = function FhirService_Factory(t) { return new (t || FhirService)(ɵɵinject(HttpClient), ɵɵinject(RegionalConfigService)); };
    FhirService.ɵprov = ɵɵdefineInjectable({ token: FhirService, factory: FhirService.ɵfac });
    return FhirService;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(FhirService, [{
        type: Injectable
    }], function () { return [{ type: HttpClient }, { type: RegionalConfigService }]; }, null); })();

function LoaderComponent_h2_5_Template(rf, ctx) { if (rf & 1) {
    ɵɵnamespaceSVG();
    ɵɵnamespaceHTML();
    ɵɵelementStart(0, "h2", 5);
    ɵɵtext(1);
    ɵɵelementEnd();
} if (rf & 2) {
    var ctx_r0 = ɵɵnextContext();
    ɵɵadvance(1);
    ɵɵtextInterpolate(ctx_r0.message);
} }
var CONTAINER_DATA = new InjectionToken('CONTAINER_DATA');
var LoaderComponent = /** @class */ (function () {
    function LoaderComponent(componentData) {
        this.componentData = componentData;
        this.message = this.componentData && this.componentData.message
            ? this.componentData.message : '';
    }
    LoaderComponent.ɵfac = function LoaderComponent_Factory(t) { return new (t || LoaderComponent)(ɵɵdirectiveInject(CONTAINER_DATA, 8)); };
    LoaderComponent.ɵcmp = ɵɵdefineComponent({ type: LoaderComponent, selectors: [["lib-loader"]], decls: 6, vars: 1, consts: [["width", "200px", "height", "200px", "xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 100 100", "preserveAspectRatio", "xMidYMid", 1, "lds-heart", 2, "background", "none"], ["transform", "translate(50 50)"], ["d", "M40.7-34.3c-9.8-9.8-25.6-9.8-35.4,0L0-29l-5.3-5.3c-9.8-9.8-25.6-9.8-35.4,0l0,0c-9.8,9.8-9.8,25.6,0,35.4l5.3,5.3L-23,18.7l23,23l23-23L35.4,6.3L40.7,1C50.4-8.8,50.4-24.6,40.7-34.3z", "fill", "#df1317", "transform", "scale(0.721575 0.721575)"], ["attributeName", "transform", "type", "scale", "calcMode", "spline", "values", "0.68;0.8;0.6000000000000001;0.7200000000000001;0.68;0.6400000000000001", "keyTimes", "0;0.05;0.39;0.45;0.6;1", "dur", "1.5s", "keySplines", "0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1", "begin", "0s", "repeatCount", "indefinite"], ["class", "loading-message", 4, "ngIf"], [1, "loading-message"]], template: function LoaderComponent_Template(rf, ctx) { if (rf & 1) {
            ɵɵelementStart(0, "div");
            ɵɵnamespaceSVG();
            ɵɵelementStart(1, "svg", 0);
            ɵɵelementStart(2, "g", 1);
            ɵɵelementStart(3, "path", 2);
            ɵɵelement(4, "animateTransform", 3);
            ɵɵelementEnd();
            ɵɵelementEnd();
            ɵɵelementEnd();
            ɵɵtemplate(5, LoaderComponent_h2_5_Template, 2, 1, "h2", 4);
            ɵɵelementEnd();
        } if (rf & 2) {
            ɵɵadvance(5);
            ɵɵproperty("ngIf", ctx.message);
        } }, directives: [NgIf], styles: [".loading-message[_ngcontent-%COMP%]{text-align:center;margin-top:20px;background:#dedede;border-radius:20px}"] });
    return LoaderComponent;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(LoaderComponent, [{
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

var LoaderService = /** @class */ (function () {
    function LoaderService(overlay, injector) {
        this.overlay = overlay;
        this.injector = injector;
        this.overlayConfig = new OverlayConfig();
        this.overlayConfig.positionStrategy = this.overlay.position()
            .global()
            .centerHorizontally()
            .centerVertically();
        this.overlayConfig.hasBackdrop = true;
    }
    LoaderService.prototype.start = function (message) {
        if (message === void 0) { message = ''; }
        this.overlayRef = this.overlay.create(this.overlayConfig);
        var containerPortal = new ComponentPortal(LoaderComponent, null, this.createInjector({
            message: message
        }));
        this.overlayRef.attach(containerPortal);
    };
    LoaderService.prototype.stop = function () {
        this.overlayRef.dispose();
    };
    LoaderService.prototype.createInjector = function (dataToPass) {
        var injectorTokens = new WeakMap();
        injectorTokens.set(CONTAINER_DATA, dataToPass);
        return new PortalInjector(this.injector, injectorTokens);
    };
    LoaderService.ɵfac = function LoaderService_Factory(t) { return new (t || LoaderService)(ɵɵinject(Overlay), ɵɵinject(Injector)); };
    LoaderService.ɵprov = ɵɵdefineInjectable({ token: LoaderService, factory: LoaderService.ɵfac });
    return LoaderService;
}());
/*@__PURE__*/ (function () { ɵsetClassMetadata(LoaderService, [{
        type: Injectable
    }], function () { return [{ type: Overlay }, { type: Injector }]; }, null); })();

var AngularFhirModule = /** @class */ (function () {
    function AngularFhirModule() {
    }
    AngularFhirModule.ɵmod = ɵɵdefineNgModule({ type: AngularFhirModule });
    AngularFhirModule.ɵinj = ɵɵdefineInjector({ factory: function AngularFhirModule_Factory(t) { return new (t || AngularFhirModule)(); }, providers: [
            FhirService,
            RegionalConfigService,
            LoaderService
        ], imports: [[
                CommonModule
            ]] });
    return AngularFhirModule;
}());
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(AngularFhirModule, { declarations: [FhirCodingPipe,
        FhirUsualNamePipe,
        AgePipe,
        ObservationValuePipe,
        LoaderComponent], imports: [CommonModule], exports: [FhirCodingPipe,
        FhirUsualNamePipe,
        AgePipe,
        ObservationValuePipe,
        LoaderComponent] }); })();
/*@__PURE__*/ (function () { ɵsetClassMetadata(AngularFhirModule, [{
        type: NgModule,
        args: [{
                declarations: [
                    FhirCodingPipe,
                    FhirUsualNamePipe,
                    AgePipe,
                    ObservationValuePipe,
                    LoaderComponent
                ],
                imports: [
                    CommonModule
                ],
                exports: [
                    FhirCodingPipe,
                    FhirUsualNamePipe,
                    AgePipe,
                    ObservationValuePipe,
                    LoaderComponent
                ],
                providers: [
                    FhirService,
                    RegionalConfigService,
                    LoaderService
                ]
            }]
    }], null, null); })();

/*
 * Public API Surface of angular-fhir
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AgePipe, AngularFhirModule, FhirCodingPipe, FhirService, FhirUsualNamePipe, LoaderComponent, LoaderService, ObservationValuePipe, RegionalConfigService, formatAddress, formatDOB, formatFhirName, observableToReplaySubject, toValueString };
//# sourceMappingURL=cardihab-angular-fhir.js.map
