import { Pipe, PipeTransform } from '@angular/core';
import { FhirCodingPipe } from './fhir-coding.pipe';
import { toValueString } from '../utils';

@Pipe({
  name: 'observationValue'
})
export class ObservationValuePipe implements PipeTransform {
  constructor() {}

  transform(observation: fhir.Observation, args?: any): any {
    const multi = (observation.component || []).length > 1;
    return (observation.component || [])
    .map(component => {
      return `${multi ? new FhirCodingPipe().transform(component) + ': ' : ''}${toValueString(component)}`;
    }).join(', ');
  }
}
