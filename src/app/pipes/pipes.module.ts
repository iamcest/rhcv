import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirCodingPipe } from './fhir-coding.pipe';
import { FhirUsualNamePipe } from './fhir-usual-name.pipe';
import { ObservationValuePipe } from './observation-value.pipe';
import { AgePipe } from './age.pipe';
import { QuestionLabelPipe } from './question-label.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FhirCodingPipe,
    FhirUsualNamePipe,
    ObservationValuePipe,
    AgePipe,
    QuestionLabelPipe
  ],
  exports: [
    FhirCodingPipe,
    FhirUsualNamePipe,
    ObservationValuePipe,
    AgePipe,
    QuestionLabelPipe
  ]
})
export class PipesModule {}
