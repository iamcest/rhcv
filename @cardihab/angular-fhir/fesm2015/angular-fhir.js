import moment from 'moment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ReplaySubject, throwError, of } from 'rxjs';
import { map, tap, expand, reduce } from 'rxjs/operators';
import { LRUMap } from 'lru_map';
import { format, parse, resolve } from 'url';
import { __awaiter } from 'tslib';
import { Pipe, Injectable, Component, Inject, Optional, InjectionToken, Injector, NgModule } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class AgePipe {
    /**
     * @param {?} value
     * @param {?=} args
     * @return {?}
     */
    transform(value, args) {
        if (!value || !moment(value).isValid()) {
            return void 0;
        }
        return moment().diff(value, 'years');
    }
}
AgePipe.decorators = [
    { type: Pipe, args: [{
                name: 'ageInYears'
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class FhirCodingPipe {
    /**
     * @param {?} value
     * @param {?=} args
     * @return {?}
     */
    transform(value, args) {
        if (value && value.code && value.code.coding && value.code.coding.length > 0) {
            return value.code.coding[0].display;
        }
        return '';
    }
}
FhirCodingPipe.decorators = [
    { type: Pipe, args: [{
                name: 'fhirCoding'
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @param {?} item
 * @return {?}
 */
function toValueString(item) {
    // A hack for pluralising some unit names
    /** @type {?} */
    const formatUnit = (/**
     * @param {?} unit
     * @param {?} value
     * @return {?}
     */
    (unit, value) => {
        if (value !== 1) {
            if (unit === 'serving') {
                return `${unit}s`;
            }
        }
        return unit;
    });
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
/**
 * @param {?} value
 * @param {?=} args
 * @return {?}
 */
function formatFhirName(value, args = { noTitle: false, capitaliseLastName: false, firstNameFirst: false }) {
    if (value && value.length > 0) {
        /** @type {?} */
        const preferredName = value.reduce((/**
         * @param {?} best
         * @param {?} name
         * @param {?} idx
         * @param {?} names
         * @return {?}
         */
        (best, name, idx, names) => {
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
        }));
        if (preferredName.text) {
            return preferredName.text;
        }
        /** @type {?} */
        const family = (args.capitaliseLastName ? preferredName.family.toUpperCase() : preferredName.family) || '';
        /** @type {?} */
        const titles = (preferredName.prefix || []).length > 0 ? ` (${(preferredName.prefix || []).join(' ')})` : '';
        // tslint:disable-next-line:max-line-length
        return args.firstNameFirst ? `${args.noTitle ? '' : titles} ${(preferredName.given || [])[0]} ${family}` : `${family}, ${(preferredName.given || [])[0]}${args.noTitle ? '' : titles}`;
    }
    else {
        return '<No Name>';
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class FhirUsualNamePipe {
    /**
     * @param {?} value
     * @param {?=} args
     * @return {?}
     */
    transform(value, args) {
        return formatFhirName(value, args);
    }
}
FhirUsualNamePipe.decorators = [
    { type: Pipe, args: [{
                name: 'fhirUsualName'
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class ObservationValuePipe {
    constructor() { }
    /**
     * @param {?} observation
     * @param {?=} args
     * @return {?}
     */
    transform(observation, args) {
        /** @type {?} */
        const multi = (observation.component || []).length > 1;
        return (observation.component || [])
            .map((/**
         * @param {?} component
         * @return {?}
         */
        component => {
            return `${multi ? new FhirCodingPipe().transform(component) + ':' : ''}${toValueString(component)}`;
        })).join(', ');
    }
}
ObservationValuePipe.decorators = [
    { type: Pipe, args: [{
                name: 'observationValue'
            },] }
];
/** @nocollapse */
ObservationValuePipe.ctorParameters = () => [];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class RegionalConfigService {
    /**
     * @param {?} region
     * @return {?}
     */
    load(region) {
        return __awaiter(this, void 0, void 0, function* () {
            // assert that region is one of ['au', 'de', 'us']
            // assert that region is one of ['au', 'de', 'us']
            /** @type {?} */
            const configResponse = yield fetch(`./assets/environment-${region}.json`);
            /** @type {?} */
            const config = yield configResponse.json();
            Object.keys(config).forEach((/**
             * @param {?} key
             * @return {?}
             */
            key => {
                Object.defineProperty(this, key, {
                    get: (/**
                     * @return {?}
                     */
                    () => config[key])
                });
            }));
            return config;
        });
    }
    /**
     * @param {?} key
     * @return {?}
     */
    get(key) {
        return this[key];
    }
}
RegionalConfigService.decorators = [
    { type: Injectable }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class FhirService {
    /**
     * @param {?} http
     * @param {?} config
     */
    constructor(http, config) {
        this.http = http;
        this.config = config;
        // set by auth guard. Fixme cleaner separation would be nice
        this.base = this.config.get('fhir');
        this.tenancy = 'baseDstu3';
        this.refCache = new LRUMap(100);
    }
    /**
     * @param {?} concept
     * @param {?} codes
     * @return {?}
     */
    static hasCoding(concept, codes) {
        if (concept && concept.coding && codes) {
            for (const code of concept.coding) {
                if (code.code && codes.find((/**
                 * @param {?} ia
                 * @return {?}
                 */
                ia => ia.system === code.system && ia.code === code.code)) != null) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * @param {?} reference
     * @return {?}
     */
    static referenceToId(reference) {
        const [resourceType, id] = (reference || { reference: '' }).reference.split('/');
        return {
            resourceType,
            id
        };
    }
    /**
     * @template T
     * @param {?} extension
     * @return {?}
     */
    static flattenExtension(extension) {
        /** @type {?} */
        const obj = {};
        if (extension.extension) {
            extension.extension.forEach((/**
             * @param {?} ext
             * @return {?}
             */
            ext => {
                obj[ext.url] = FhirService.flattenExtension(ext);
            }));
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
    /**
     * @param {?=} tenancyOverride
     * @return {?}
     */
    getUrl(tenancyOverride) {
        return `${this.base}/${tenancyOverride ? tenancyOverride : this.tenancy}`;
    }
    /**
     * @param {?} newUrl
     * @return {?}
     */
    setUrl(newUrl) {
        this.base = newUrl;
    }
    /**
     * @return {?}
     */
    options() {
        return new HttpHeaders({ Accept: 'application/json' });
    }
    /**
     * @template T
     * @param {?} response
     * @return {?}
     */
    nextPage(response) {
        if (response) {
            /** @type {?} */
            const nextLink = (response.link || []).find((/**
             * @param {?} l
             * @return {?}
             */
            l => l.relation === 'next'));
            if (nextLink) {
                return this.http.get(nextLink.url);
            }
        }
        return throwError(new Error('No next link to follow'));
    }
    /**
     * @template T
     * @param {?} ref
     * @param {?} context
     * @return {?}
     */
    reference(ref, context) {
        if (ref && ref.reference) {
            /** @type {?} */
            const absoluteUri = this.referenceToAbsoluteUrl(ref, context);
            /** @type {?} */
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
    /**
     * @template T
     * @param {?} resourceType
     * @param {?} id
     * @param {?=} tenancy
     * @return {?}
     */
    get(resourceType, id, tenancy) {
        if (id === 'new') {
            return of(null);
        }
        else {
            return this.http.get(`${this.getUrl(tenancy)}/${resourceType}/${id}`);
        }
    }
    /**
     * @template T
     * @param {?} resourceType
     * @param {?} params
     * @param {?=} options
     * @return {?}
     */
    search(resourceType, params, options) {
        /** @type {?} */
        const requestOptions = { params };
        if (options && options.headers) {
            requestOptions.headers = options.headers;
        }
        return this.http.get(`${this.getUrl((options || {}).tenancy)}/${resourceType}`, requestOptions);
    }
    /**
     * @param {?} resourceUrl
     * @param {?} cmd
     * @param {?=} options
     * @return {?}
     */
    patch(resourceUrl, cmd, options) {
        /** @type {?} */
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
    /**
     * @param {?} resourceType
     * @param {?} id
     * @param {?=} options
     * @return {?}
     */
    delete(resourceType, id, options) {
        /** @type {?} */
        const requestOptions = {};
        if (options && options.headers) {
            requestOptions.headers = options.headers;
        }
        return this.http.delete(`${this.getUrl((options || {}).tenancy)}/${resourceType}/${id}`, requestOptions);
    }
    /**
     * @template T
     * @param {?} bundle
     * @param {?=} options
     * @return {?}
     */
    save(bundle, options) {
        if (bundle.resourceType === 'Bundle') {
            return this.http.post(`${this.getUrl((options || {}).tenancy)}`, bundle, {
                headers: {
                    'content-type': 'application/fhir+json',
                    Prefer: 'return=representation'
                }
            }).pipe(tap((/**
             * @param {?} bundleResponse
             * @return {?}
             */
            bundleResponse => {
                (((/** @type {?} */ (bundleResponse))).entry || []).forEach((/**
                 * @param {?} v
                 * @param {?} k
                 * @return {?}
                 */
                (v, k) => {
                    if (((/** @type {?} */ (bundle))).entry[k]) {
                        ((/** @type {?} */ (bundle))).entry[k].resource.id = v.resource.id;
                    }
                }));
            })));
        }
        else {
            return this.saveAll([bundle], options)
                .pipe(map((/**
             * @param {?} bundleResponse
             * @return {?}
             */
            bundleResponse => (/** @type {?} */ (bundleResponse.entry[0].resource)))));
        }
    }
    /**
     * @param {?} resources
     * @param {?=} options
     * @return {?}
     */
    saveAll(resources, options) {
        /** @type {?} */
        const bundleEntries = resources.map((/**
         * @param {?} p
         * @return {?}
         */
        p => {
            return {
                request: {
                    method: p.id ? 'PUT' : 'POST',
                    // tslint:disable-next-line:no-string-literal
                    url: p.id ? `${p.resourceType}/${p.id}` : (p['identifier'] || [])[0] ? `urn:uuid:${p['identifier'][0].value}` : p.resourceType
                },
                resource: p
            };
        }));
        return this.save({
            resourceType: 'Bundle',
            type: 'transaction',
            entry: bundleEntries
        }, options);
    }
    /**
     * @template T
     * @param {?} references
     * @param {?} context
     * @param {?=} count
     * @return {?}
     */
    resolveReferences(references, context, count = 500) {
        if (!references || !Array.isArray(references) || !references.length) {
            return of((/** @type {?} */ ({})));
        }
        const { resourceType } = FhirService.referenceToId(references[0]);
        /** @type {?} */
        const ids = references.map((/**
         * @param {?} ref
         * @return {?}
         */
        ref => FhirService.referenceToId(ref).id));
        return this.http.post(`${this.getContextBaseUrl(context)}/${resourceType}/_search`, `_id=${ids.join(',')}&_count=${count}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .pipe(expand((/**
         * @param {?} res
         * @return {?}
         */
        (res) => {
            /** @type {?} */
            const foundNext = (res.link.find((/**
             * @param {?} l
             * @return {?}
             */
            l => l.relation === 'next')) || (/** @type {?} */ ({}))).url;
            if (foundNext) {
                return this.http.get(format(parse(foundNext, true)));
            }
            return of();
        })), reduce((/**
         * @param {?} acc
         * @param {?} value
         * @return {?}
         */
        (acc, value) => {
            if (acc.entry && value.entry) {
                acc.entry = acc.entry.concat(value.entry);
            }
            return acc;
        })));
    }
    /**
     * @param {?} ref
     * @param {?} context
     * @return {?}
     */
    referenceToAbsoluteUrl(ref, context) {
        /** @type {?} */
        const refUrl = parse(ref.reference);
        if (refUrl.hash && !refUrl.protocol) { // don't touch contained resource references
            return ref.reference;
        }
        /** @type {?} */
        const base = this.getContextBaseUrl(context);
        return resolve(`${base}/`, ref.reference);
    }
    /**
     * @param {?=} context
     * @return {?}
     */
    getContextBaseUrl(context) {
        /** @type {?} */
        let base = this.getUrl();
        if (context && context.meta && context.meta.security) {
            /** @type {?} */
            const tenancyTag = context.meta.security.find((/**
             * @param {?} sec
             * @return {?}
             */
            sec => sec.system === FhirService.IDENTIFIER_SYSTEMS.TENANCY_SECURITY_SYSTEM));
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
FhirService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
FhirService.ctorParameters = () => [
    { type: HttpClient },
    { type: RegionalConfigService }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const CONTAINER_DATA = new InjectionToken('CONTAINER_DATA');
class LoaderComponent {
    /**
     * @param {?} componentData
     */
    constructor(componentData) {
        this.componentData = componentData;
        this.message = this.componentData && this.componentData.message
            ? this.componentData.message : '';
    }
}
LoaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-loader',
                template: "<div>\n  <svg width=\"200px\" height=\"200px\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\"\n    class=\"lds-heart\" style=\"background: none;\">\n    <g transform=\"translate(50 50)\">\n      <path d=\"M40.7-34.3c-9.8-9.8-25.6-9.8-35.4,0L0-29l-5.3-5.3c-9.8-9.8-25.6-9.8-35.4,0l0,0c-9.8,9.8-9.8,25.6,0,35.4l5.3,5.3L-23,18.7l23,23l23-23L35.4,6.3L40.7,1C50.4-8.8,50.4-24.6,40.7-34.3z\"\n        fill=\"#df1317\" transform=\"scale(0.721575 0.721575)\">\n        <animateTransform attributeName=\"transform\" type=\"scale\" calcMode=\"spline\" values=\"0.68;0.8;0.6000000000000001;0.7200000000000001;0.68;0.6400000000000001\"\n          keyTimes=\"0;0.05;0.39;0.45;0.6;1\" dur=\"1.5s\" keySplines=\"0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1\"\n          begin=\"0s\" repeatCount=\"indefinite\"></animateTransform>\n      </path>\n    </g>\n  </svg>\n  <h2 class=\"loading-message\" *ngIf=\"message\">{{ message }}</h2>\n</div>\n",
                styles: [".loading-message{text-align:center;margin-top:20px;background:#dedede;border-radius:20px}"]
            }] }
];
/** @nocollapse */
LoaderComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CONTAINER_DATA,] }] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class LoaderService {
    /**
     * @param {?} overlay
     * @param {?} injector
     */
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
    /**
     * @param {?=} message
     * @return {?}
     */
    start(message = '') {
        this.overlayRef = this.overlay.create(this.overlayConfig);
        /** @type {?} */
        const containerPortal = new ComponentPortal(LoaderComponent, null, this.createInjector({
            message
        }));
        this.overlayRef.attach(containerPortal);
    }
    /**
     * @return {?}
     */
    stop() {
        this.overlayRef.dispose();
    }
    /**
     * @private
     * @param {?} dataToPass
     * @return {?}
     */
    createInjector(dataToPass) {
        /** @type {?} */
        const injectorTokens = new WeakMap();
        injectorTokens.set(CONTAINER_DATA, dataToPass);
        return new PortalInjector(this.injector, injectorTokens);
    }
}
LoaderService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
LoaderService.ctorParameters = () => [
    { type: Overlay },
    { type: Injector }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class AngularFhirModule {
}
AngularFhirModule.decorators = [
    { type: NgModule, args: [{
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
                ],
                providers: [
                    FhirService,
                    RegionalConfigService,
                    LoaderService
                ]
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { AngularFhirModule, AgePipe, FhirCodingPipe, FhirUsualNamePipe, ObservationValuePipe, FhirService, RegionalConfigService, LoaderService, CONTAINER_DATA, LoaderComponent };

//# sourceMappingURL=angular-fhir.js.map