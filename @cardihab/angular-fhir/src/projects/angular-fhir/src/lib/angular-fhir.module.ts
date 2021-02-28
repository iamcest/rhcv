import { NgModule } from '@angular/core';
import { FhirService } from './services/fhir.service';
import { RegionalConfigService } from './services/regional.service';
import { LoaderComponent } from './loader/loader.component';
import { LoaderService } from './services/loader.service';
import { CommonModule } from '@angular/common';
import { FhirCodingPipe } from './pipes/fhir-coding.pipe';
import { FhirUsualNamePipe } from './pipes/fhir-usual-name.pipe';
import { AgePipe } from './pipes/age.pipe';
import { ObservationValuePipe } from './pipes/observation-value.pipe';

@NgModule({
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
})
export class AngularFhirModule { }
