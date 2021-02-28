import { Pipe, PipeTransform } from '@angular/core';
import { formatFhirName } from '../utils/format';

@Pipe({
  name: 'fhirUsualName'
})
export class FhirUsualNamePipe implements PipeTransform {

  transform(value: fhir.HumanName[], args?: any): any {
    return formatFhirName(value, args);
  }

}
