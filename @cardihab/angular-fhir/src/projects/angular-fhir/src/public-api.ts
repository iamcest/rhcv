/*
 * Public API Surface of angular-fhir
 */

export { AgePipe } from './lib/pipes/age.pipe';
export { FhirCodingPipe } from './lib/pipes/fhir-coding.pipe';
export { FhirUsualNamePipe } from './lib/pipes/fhir-usual-name.pipe';
export { ObservationValuePipe} from './lib/pipes/observation-value.pipe';
export { formatAddress, toValueString, formatDOB, formatFhirName } from './lib/utils/format';
export {observableToReplaySubject} from './lib/utils/observables';
export {RegionalConfigService, AnyConfig} from './lib/services/regional.service';
export {FhirService, IFhirResponse, IFhirSearchParams} from './lib/services/fhir.service';
export {LoaderService} from './lib/services/loader.service';
export {LoaderComponent} from './lib/loader/loader.component';
export {AngularFhirModule} from './lib/angular-fhir.module';
