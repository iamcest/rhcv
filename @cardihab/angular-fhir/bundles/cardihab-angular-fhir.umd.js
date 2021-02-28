(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('moment'), require('rxjs'), require('@angular/common/http'), require('rxjs/operators'), require('url'), require('@angular/cdk/overlay'), require('@angular/cdk/portal'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('@cardihab/angular-fhir', ['exports', '@angular/core', 'moment', 'rxjs', '@angular/common/http', 'rxjs/operators', 'url', '@angular/cdk/overlay', '@angular/cdk/portal', '@angular/common'], factory) :
    (global = global || self, factory((global.cardihab = global.cardihab || {}, global.cardihab['angular-fhir'] = {}), global.ng.core, global.moment, global.rxjs, global.ng.common.http, global.rxjs.operators, global.url, global.ng.cdk.overlay, global.ng.cdk.portal, global.ng.common));
}(this, (function (exports, core, moment, rxjs, http, operators, url, overlay, portal, common) { 'use strict';

    moment = moment && Object.prototype.hasOwnProperty.call(moment, 'default') ? moment['default'] : moment;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

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
        AgePipe.ɵpipe = core.ɵɵdefinePipe({ name: "ageInYears", type: AgePipe, pure: true });
        return AgePipe;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(AgePipe, [{
            type: core.Pipe,
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
        FhirCodingPipe.ɵpipe = core.ɵɵdefinePipe({ name: "fhirCoding", type: FhirCodingPipe, pure: true });
        return FhirCodingPipe;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(FhirCodingPipe, [{
            type: core.Pipe,
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
        FhirUsualNamePipe.ɵpipe = core.ɵɵdefinePipe({ name: "fhirUsualName", type: FhirUsualNamePipe, pure: true });
        return FhirUsualNamePipe;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(FhirUsualNamePipe, [{
            type: core.Pipe,
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
        ObservationValuePipe.ɵpipe = core.ɵɵdefinePipe({ name: "observationValue", type: ObservationValuePipe, pure: true });
        return ObservationValuePipe;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(ObservationValuePipe, [{
            type: core.Pipe,
            args: [{
                    name: 'observationValue'
                }]
        }], function () { return []; }, null); })();

    function observableToReplaySubject(observable, history) {
        var subject = new rxjs.ReplaySubject(history || 1);
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
        RegionalConfigService.ɵprov = core.ɵɵdefineInjectable({ token: RegionalConfigService, factory: RegionalConfigService.ɵfac });
        return RegionalConfigService;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(RegionalConfigService, [{
            type: core.Injectable
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
            return new http.HttpHeaders({ Accept: 'application/json' });
        };
        FhirService.prototype.nextPage = function (response) {
            if (response) {
                var nextLink = (response.link || []).find(function (l) { return l.relation === 'next'; });
                if (nextLink) {
                    return this.http.get(nextLink.url);
                }
            }
            return rxjs.throwError(new Error('No next link to follow'));
        };
        FhirService.prototype.reference = function (ref, context) {
            if (ref && ref.reference) {
                var absoluteUri = this.referenceToAbsoluteUrl(ref, context);
                var ref$ = this.refCache.get(absoluteUri);
                // TODO handle contained resource references
                if (absoluteUri.startsWith('#')) {
                    return rxjs.throwError(new Error("Don't yet support contained references"));
                }
                else {
                    if (!ref$) {
                        ref$ = new rxjs.ReplaySubject(1);
                        this.http.get(absoluteUri)
                            .subscribe(ref$);
                        this.refCache.set(absoluteUri, ref$);
                    }
                    return ref$;
                }
            }
            else {
                return rxjs.throwError(new Error('Invalid reference'));
            }
        };
        FhirService.prototype.get = function (resourceType, id, tenancy) {
            if (id === 'new') {
                return rxjs.of(null);
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
                    .pipe(operators.expand(function (res) {
                    var foundNext = ((res.link || []).find(function (l) { return l.relation === 'next'; }) || {}).url;
                    if (foundNext) {
                        return _this.http.get(url.format(url.parse(foundNext, true)));
                    }
                    return rxjs.of();
                }), operators.reduce(function (acc, value) {
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
                }).pipe(operators.tap(function (bundleResponse) {
                    (bundleResponse.entry || []).forEach(function (v, k) {
                        if (bundle.entry[k]) {
                            bundle.entry[k].resource.id = v.resource.id;
                        }
                    });
                }));
            }
            else {
                return this.saveAll([bundle], options)
                    .pipe(operators.map(function (bundleResponse) { return bundleResponse.entry[0].resource; }));
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
                return rxjs.of({});
            }
            var resourceType = FhirService.referenceToId(references[0]).resourceType;
            var ids = references.map(function (ref) { return FhirService.referenceToId(ref).id; });
            return this.http.post(this.getContextBaseUrl(context) + "/" + resourceType + "/_search", "_id=" + ids.join(',') + "&_count=" + count, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .pipe(operators.expand(function (res) {
                var foundNext = ((res.link || []).find(function (l) { return l.relation === 'next'; }) || {}).url;
                if (foundNext) {
                    return _this.http.get(url.format(url.parse(foundNext, true)));
                }
                return rxjs.of();
            }), operators.reduce(function (acc, value) {
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
        FhirService.ɵfac = function FhirService_Factory(t) { return new (t || FhirService)(core.ɵɵinject(http.HttpClient), core.ɵɵinject(RegionalConfigService)); };
        FhirService.ɵprov = core.ɵɵdefineInjectable({ token: FhirService, factory: FhirService.ɵfac });
        return FhirService;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(FhirService, [{
            type: core.Injectable
        }], function () { return [{ type: http.HttpClient }, { type: RegionalConfigService }]; }, null); })();

    function LoaderComponent_h2_5_Template(rf, ctx) { if (rf & 1) {
        core.ɵɵnamespaceSVG();
        core.ɵɵnamespaceHTML();
        core.ɵɵelementStart(0, "h2", 5);
        core.ɵɵtext(1);
        core.ɵɵelementEnd();
    } if (rf & 2) {
        var ctx_r0 = core.ɵɵnextContext();
        core.ɵɵadvance(1);
        core.ɵɵtextInterpolate(ctx_r0.message);
    } }
    var CONTAINER_DATA = new core.InjectionToken('CONTAINER_DATA');
    var LoaderComponent = /** @class */ (function () {
        function LoaderComponent(componentData) {
            this.componentData = componentData;
            this.message = this.componentData && this.componentData.message
                ? this.componentData.message : '';
        }
        LoaderComponent.ɵfac = function LoaderComponent_Factory(t) { return new (t || LoaderComponent)(core.ɵɵdirectiveInject(CONTAINER_DATA, 8)); };
        LoaderComponent.ɵcmp = core.ɵɵdefineComponent({ type: LoaderComponent, selectors: [["lib-loader"]], decls: 6, vars: 1, consts: [["width", "200px", "height", "200px", "xmlns", "http://www.w3.org/2000/svg", "viewBox", "0 0 100 100", "preserveAspectRatio", "xMidYMid", 1, "lds-heart", 2, "background", "none"], ["transform", "translate(50 50)"], ["d", "M40.7-34.3c-9.8-9.8-25.6-9.8-35.4,0L0-29l-5.3-5.3c-9.8-9.8-25.6-9.8-35.4,0l0,0c-9.8,9.8-9.8,25.6,0,35.4l5.3,5.3L-23,18.7l23,23l23-23L35.4,6.3L40.7,1C50.4-8.8,50.4-24.6,40.7-34.3z", "fill", "#df1317", "transform", "scale(0.721575 0.721575)"], ["attributeName", "transform", "type", "scale", "calcMode", "spline", "values", "0.68;0.8;0.6000000000000001;0.7200000000000001;0.68;0.6400000000000001", "keyTimes", "0;0.05;0.39;0.45;0.6;1", "dur", "1.5s", "keySplines", "0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1;0.215 0.61,0.355 1", "begin", "0s", "repeatCount", "indefinite"], ["class", "loading-message", 4, "ngIf"], [1, "loading-message"]], template: function LoaderComponent_Template(rf, ctx) { if (rf & 1) {
                core.ɵɵelementStart(0, "div");
                core.ɵɵnamespaceSVG();
                core.ɵɵelementStart(1, "svg", 0);
                core.ɵɵelementStart(2, "g", 1);
                core.ɵɵelementStart(3, "path", 2);
                core.ɵɵelement(4, "animateTransform", 3);
                core.ɵɵelementEnd();
                core.ɵɵelementEnd();
                core.ɵɵelementEnd();
                core.ɵɵtemplate(5, LoaderComponent_h2_5_Template, 2, 1, "h2", 4);
                core.ɵɵelementEnd();
            } if (rf & 2) {
                core.ɵɵadvance(5);
                core.ɵɵproperty("ngIf", ctx.message);
            } }, directives: [common.NgIf], styles: [".loading-message[_ngcontent-%COMP%]{text-align:center;margin-top:20px;background:#dedede;border-radius:20px}"] });
        return LoaderComponent;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(LoaderComponent, [{
            type: core.Component,
            args: [{
                    selector: 'lib-loader',
                    templateUrl: './loader.component.html',
                    styleUrls: ['./loader.component.scss']
                }]
        }], function () { return [{ type: undefined, decorators: [{
                    type: core.Optional
                }, {
                    type: core.Inject,
                    args: [CONTAINER_DATA]
                }] }]; }, null); })();

    var LoaderService = /** @class */ (function () {
        function LoaderService(overlay$1, injector) {
            this.overlay = overlay$1;
            this.injector = injector;
            this.overlayConfig = new overlay.OverlayConfig();
            this.overlayConfig.positionStrategy = this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically();
            this.overlayConfig.hasBackdrop = true;
        }
        LoaderService.prototype.start = function (message) {
            if (message === void 0) { message = ''; }
            this.overlayRef = this.overlay.create(this.overlayConfig);
            var containerPortal = new portal.ComponentPortal(LoaderComponent, null, this.createInjector({
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
            return new portal.PortalInjector(this.injector, injectorTokens);
        };
        LoaderService.ɵfac = function LoaderService_Factory(t) { return new (t || LoaderService)(core.ɵɵinject(overlay.Overlay), core.ɵɵinject(core.Injector)); };
        LoaderService.ɵprov = core.ɵɵdefineInjectable({ token: LoaderService, factory: LoaderService.ɵfac });
        return LoaderService;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(LoaderService, [{
            type: core.Injectable
        }], function () { return [{ type: overlay.Overlay }, { type: core.Injector }]; }, null); })();

    var AngularFhirModule = /** @class */ (function () {
        function AngularFhirModule() {
        }
        AngularFhirModule.ɵmod = core.ɵɵdefineNgModule({ type: AngularFhirModule });
        AngularFhirModule.ɵinj = core.ɵɵdefineInjector({ factory: function AngularFhirModule_Factory(t) { return new (t || AngularFhirModule)(); }, providers: [
                FhirService,
                RegionalConfigService,
                LoaderService
            ], imports: [[
                    common.CommonModule
                ]] });
        return AngularFhirModule;
    }());
    (function () { (typeof ngJitMode === "undefined" || ngJitMode) && core.ɵɵsetNgModuleScope(AngularFhirModule, { declarations: [FhirCodingPipe,
            FhirUsualNamePipe,
            AgePipe,
            ObservationValuePipe,
            LoaderComponent], imports: [common.CommonModule], exports: [FhirCodingPipe,
            FhirUsualNamePipe,
            AgePipe,
            ObservationValuePipe,
            LoaderComponent] }); })();
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(AngularFhirModule, [{
            type: core.NgModule,
            args: [{
                    declarations: [
                        FhirCodingPipe,
                        FhirUsualNamePipe,
                        AgePipe,
                        ObservationValuePipe,
                        LoaderComponent
                    ],
                    imports: [
                        common.CommonModule
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

    exports.AgePipe = AgePipe;
    exports.AngularFhirModule = AngularFhirModule;
    exports.FhirCodingPipe = FhirCodingPipe;
    exports.FhirService = FhirService;
    exports.FhirUsualNamePipe = FhirUsualNamePipe;
    exports.LoaderComponent = LoaderComponent;
    exports.LoaderService = LoaderService;
    exports.ObservationValuePipe = ObservationValuePipe;
    exports.RegionalConfigService = RegionalConfigService;
    exports.formatAddress = formatAddress;
    exports.formatDOB = formatDOB;
    exports.formatFhirName = formatFhirName;
    exports.observableToReplaySubject = observableToReplaySubject;
    exports.toValueString = toValueString;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cardihab-angular-fhir.umd.js.map
