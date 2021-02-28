import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fhirCoding'
})
export class FhirCodingPipe implements PipeTransform {

  transform(value: {code: fhir.CodeableConcept}, args?: any): any {
    if (value && value.code && value.code.coding && value.code.coding.length > 0) {
      return value.code.coding[0].display;
    }
    return '';
  }

}
