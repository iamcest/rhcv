import { ɵɵdefinePipe, ɵsetClassMetadata, Pipe, ɵɵdefineInjectable, Injectable, ɵɵinject, ɵɵnamespaceSVG, ɵɵnamespaceHTML, ɵɵelementStart, ɵɵtext, ɵɵelementEnd, ɵɵnextContext, ɵɵadvance, ɵɵtextInterpolate, InjectionToken, ɵɵdirectiveInject, ɵɵdefineComponent, ɵɵelement, ɵɵtemplate, ɵɵproperty, Component, Optional, Inject, Injector, ɵɵdefineNgModule, ɵɵdefineInjector, ɵɵsetNgModuleScope, NgModule } from '@angular/core';
import moment from 'moment';
import { ReplaySubject, throwError, of } from 'rxjs';
import { __awaiter } from 'tslib';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { expand, reduce, tap, map } from 'rxjs/operators';
import { format, parse, resolve } from 'url';
import { OverlayConfig, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { NgIf, CommonModule } from '@angular/common';

class AgePipe {
    transform(value, args) {
        if (!value || !moment(value).isValid()) {
            return void 0;
        }
        return moment().diff(value, 'years');
    }
}
AgePipe.ɵfac = function AgePipe_Factory(t) { return new (t || AgePipe)(); };
AgePipe.ɵpipe = ɵɵdefinePipe({ name: "ageInYears", type: AgePipe, pure: true });
/*@__PURE__*/ (function () { ɵsetClassMetadata(AgePipe, [{
        type: Pipe,
        args: [{
                name: 'ageInYears'
            }]
    }], null, null); })();

class FhirCodingPipe {
    transform(value, args) {
        if (value && value.code && value.code.coding && value.code.coding.length > 0) {
            return value.code.coding[0].display;
        }
        return '';
    }
}
FhirCodingPipe.ɵfac = function FhirCodingPipe_Factory(t) { return new (t || FhirCodingPipe)(); };
FhirCodingPipe.ɵpipe = ɵɵdefinePipe({ name: "fhirCoding", type: FhirCodingPipe, pure: true });
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
    let address = organisation.address.find(item => types.indexOf(item.type) > -1);
    address = address || organisation.address[0];
    const phoneNumber = organisation.telecom.find(item => item.system === 'phone');
    return [
        `${organisation.name},`,
        `${address.line.join(' ')},`,
        address.city,
        address.state,
        address.postalCode,
        phoneNumber
    ].join(' ');
}
function toValueString(item) {
    // A hack for pluralising some unit names
    const formatUnit = (unit, value) => {
        if (value !== 1) {
            if (unit === 'serving') {
                return `${unit}s`;
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
                                                                                            item.valueQuantity ? `${item.valueQuantity.value} ${formatUnit(item.valueQuantity.unit, item.valueQuantity.value)}` : '';
}
// tslint:disable-next-line:max-line-length
function formatFhirName(value, args = { noTitle: false, capitaliseLastName: false, firstNameFirst: false }) {
    if (value && value.length > 0) {
        const preferredName = value.reduce((best, name, idx, names) => {
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
        const family = (args.capitaliseLastName ? preferredName.family.toUpperCase() : preferredName.family) || '';
        const titles = (preferredName.prefix || []).length > 0 ? ` (${(preferredName.prefix || []).join(' ')})` : '';
        // tslint:disable-next-line:max-line-length
        return args.firstNameFirst ? `${args.noTitle ? '' : titles} ${(preferredName.given || [])[0]} ${family}` : `${family}, ${(preferredName.given || [])[0]}${args.noTitle ? '' : titles}`;
    }
    else {
        return '<No Name>';
    }
}
function formatDOB(date, includeAge = false) {
    const mDate = moment(date);
    const age = ` (${moment().diff(mDate, 'years')} ys)`;
    return `${mDate.format('DD-MMM-YYYY')}${includeAge ? age : ''}`;
}

class FhirUsualNamePipe {
    transform(value, args) {
        return formatFhirName(value, args);
    }
}
FhirUsualNamePipe.ɵfac = function FhirUsualNamePipe_Factory(t) { return new (t || FhirUsualNamePipe)(); };
FhirUsualNamePipe.ɵpipe = ɵɵdefinePipe({ name: "fhirUsualName", type: FhirUsualNamePipe, pure: true });
/*@__PURE__*/ (function () { ɵsetClassMetadata(FhirUsualNamePipe, [{
        type: Pipe,
        args: [{
                name: 'fhirUsualName'
            }]
    }], null, null); })();

class ObservationValuePipe {
    constructor() { }
    transform(observation, args) {
        const multi = (observation.component || []).length > 1;
        return (observation.component || [])
            .map(component => {
            return `${multi ? new FhirCodingPipe().transform(component) + ':' : ''}${toValueString(component)}`;
        }).join(', ');
    }
}
ObservationValuePipe.ɵfac = function ObservationValuePipe_Factory(t) { return new (t || ObservationValuePipe)(); };
ObservationValuePipe.ɵpipe = ɵɵdefinePipe({ name: "observationValue", type: ObservationValuePipe, pure: true });
/*@__PURE__*/ (function () { ɵsetClassMetadata(ObservationValuePipe, [{
        type: Pipe,
        args: [{
                name: 'observationValue'
            }]
    }], function () { return []; }, null); })();

function observableToReplaySubject(observable, history) {
    const subject = new ReplaySubject(history || 1);
    observable.subscribe(subject);
    return subject;
}

class RegionalConfigService {
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
RegionalConfigService.ɵprov = ɵɵdefineInjectable({ token: RegionalConfigService, factory: RegionalConfigService.ɵfac });
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
const NEWER = Symbol('newer');
const OLDER = Symbol('older');
class Entry {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
class LRUMap {
    constructor(limit, entries) {
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
    _markEntryAsUsed(entry) {
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
    }
    assign(entries) {
        let entry;
        let limit = this.limit || Number.MAX_VALUE;
        this._keymap.clear();
        const it = entries[Symbol.iterator]();
        for (let itv = it.next(); !itv.done; itv = it.next()) {
            const e = new Entry(itv.value[0], itv.value[1]);
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
    }
    get(key) {
        // First, find our cache entry
        const entry = this._keymap.get(key);
        if (!entry)
            return; // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        this._markEntryAsUsed(entry);
        return entry.value;
    }
    set(key, value) {
        let entry = this._keymap.get(key);
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
    }
    shift() {
        // todo: handle special case when limit == 1
        const entry = this.oldest;
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
    }
}

class FhirService {
    constructor(http, config) {
        this.http = http;
        this.config = config;
        // set by auth guard. Fixme cleaner separation would be nice
        this.base = this.config.get('fhir');
        this.tenancy = 'baseDstu3';
        this.refCache = new LRUMap(100);
    }
    static hasCoding(concept, codes) {
        if (concept && concept.coding && codes) {
            for (const code of concept.coding) {
                if (code.code && codes.find(ia => ia.system === code.system && ia.code === code.code) != null) {
                    return true;
                }
            }
        }
        return false;
    }
    static referenceToId(reference) {
        const [resourceType, id] = (reference || { reference: '' }).reference.split('/');
        return {
            resourceType,
            id
        };
    }
    static flattenExtension(extension) {
        const obj = {};
        if (extension.extension) {
            extension.extension.forEach(ext => {
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
    }
    getUrl(tenancyOverride) {
        return `${this.base}/${tenancyOverride ? tenancyOverride : this.tenancy}`;
    }
    setUrl(newUrl) {
        this.base = newUrl;
    }
    options() {
        return new HttpHeaders({ Accept: 'application/json' });
    }
    nextPage(response) {
        if (response) {
            const nextLink = (response.link || []).find(l => l.relation === 'next');
            if (nextLink) {
                return this.http.get(nextLink.url);
            }
        }
        return throwError(new Error('No next link to follow'));
    }
    reference(ref, context) {
        if (ref && ref.reference) {
            const absoluteUri = this.referenceToAbsoluteUrl(ref, context);
            let ref$ = this.refCache.get(absoluteUri);
            // TODO handle contained resource references
            if (absoluteUri.startsWith('#')) {
                return throwError(new Error(`Don't yet support contained references`));
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
    }
    get(resourceType, id, tenancy) {
        if (id === 'new') {
            return of(null);
        }
        else {
            return this.http.get(`${this.getUrl(tenancy)}/${resourceType}/${id}`);
        }
    }
    search(resourceType, params, options, pagination = false) {
        const requestOptions = {
            params
        };
        if (options && options.headers) {
            requestOptions.headers = options.headers;
        }
        const request = this.http.get(`${this.getUrl((options || {}).tenancy)}/${resourceType}`, requestOptions);
        if (pagination) {
            return request;
        }
        else {
            return request
                .pipe(expand((res) => {
                const foundNext = ((res.link || []).find(l => l.relation === 'next') || {}).url;
                if (foundNext) {
                    return this.http.get(format(parse(foundNext, true)));
                }
                return of();
            }), reduce((acc, value) => {
                if (acc.entry && value.entry) {
                    acc.entry = acc.entry.concat(value.entry);
                }
                return acc;
            }));
        }
    }
    patch(resourceUrl, cmd, options) {
        const requestOptions = {
            headers: {
                'content-type': 'application/json-patch+json'
            }
        };
        if (options && options.headers) {
            Object.assign(requestOptions.headers, options.headers);
        }
        return this.http.patch(resourceUrl, cmd, requestOptions);
    }
    delete(resourceType, id, options) {
        const requestOptions = {};
        if (options && options.headers) {
            requestOptions.headers = options.headers;
        }
        return this.http.delete(`${this.getUrl((options || {}).tenancy)}/${resourceType}/${id}`, requestOptions);
    }
    save(bundle, options) {
        if (bundle.resourceType === 'Bundle') {
            return this.http.post(`${this.getUrl((options || {}).tenancy)}`, bundle, {
                headers: {
                    'content-type': 'application/fhir+json',
                    Prefer: 'return=representation'
                }
            }).pipe(tap(bundleResponse => {
                (bundleResponse.entry || []).forEach((v, k) => {
                    if (bundle.entry[k]) {
                        bundle.entry[k].resource.id = v.resource.id;
                    }
                });
            }));
        }
        else {
            return this.saveAll([bundle], options)
                .pipe(map(bundleResponse => bundleResponse.entry[0].resource));
        }
    }
    saveAll(resources, options) {
        const bundleEntries = resources.map(p => {
            return {
                request: {
                    method: p.id ? 'PUT' : 'POST',
                    // tslint:disable-next-line:no-string-literal
                    url: p.id ? `${p.resourceType}/${p.id}` : (p['identifier'] || [])[0] ? `urn:uuid:${p['identifier'][0].value}` : p.resourceType
                },
                resource: p
            };
        });
        return this.save({
            resourceType: 'Bundle',
            type: 'transaction',
            entry: bundleEntries
        }, options);
    }
    resolveReferences(references, context, count = 500) {
        if (!references || !Array.isArray(references) || !references.length) {
            return of({});
        }
        const { resourceType } = FhirService.referenceToId(references[0]);
        const ids = references.map(ref => FhirService.referenceToId(ref).id);
        return this.http.post(`${this.getContextBaseUrl(context)}/${resourceType}/_search`, `_id=${ids.join(',')}&_count=${count}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .pipe(expand((res) => {
            const foundNext = ((res.link || []).find(l => l.relation === 'next') || {}).url;
            if (foundNext) {
                return this.http.get(format(parse(foundNext, true)));
            }
            return of();
        }), reduce((acc, value) => {
            if (acc.entry && value.entry) {
                acc.entry = acc.entry.concat(value.entry);
            }
            return acc;
        }));
    }
    referenceToAbsoluteUrl(ref, context) {
        const refUrl = parse(ref.reference);
        if (refUrl.hash && !refUrl.protocol) { // don't touch contained resource references
            return ref.reference;
        }
        const base = this.getContextBaseUrl(context);
        return resolve(`${base}/`, ref.reference);
    }
    getContextBaseUrl(context) {
        let base = this.getUrl();
        if (context && context.meta && context.meta.security) {
            const tenancyTag = context.meta.security.find(sec => sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM);
            if (tenancyTag) {
                base = this.getUrl(tenancyTag.display);
            }
        }
        return base;
    }
}
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
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance(1);
    ɵɵtextInterpolate(ctx_r0.message);
} }
const CONTAINER_DATA = new InjectionToken('CONTAINER_DATA');
class LoaderComponent {
    constructor(componentData) {
        this.componentData = componentData;
        this.message = this.componentData && this.componentData.message
            ? this.componentData.message : '';
    }
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

class LoaderService {
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
LoaderService.ɵfac = function LoaderService_Factory(t) { return new (t || LoaderService)(ɵɵinject(Overlay), ɵɵinject(Injector)); };
LoaderService.ɵprov = ɵɵdefineInjectable({ token: LoaderService, factory: LoaderService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(LoaderService, [{
        type: Injectable
    }], function () { return [{ type: Overlay }, { type: Injector }]; }, null); })();

class AngularFhirModule {
}
AngularFhirModule.ɵmod = ɵɵdefineNgModule({ type: AngularFhirModule });
AngularFhirModule.ɵinj = ɵɵdefineInjector({ factory: function AngularFhirModule_Factory(t) { return new (t || AngularFhirModule)(); }, providers: [
        FhirService,
        RegionalConfigService,
        LoaderService
    ], imports: [[
            CommonModule
        ]] });
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
