import { PipeTransform, Pipe } from '@angular/core';


@Pipe({
    name: 'questionLabel'
})
export class QuestionLabelPipe implements PipeTransform {
    transform(question: fhir.QuestionnaireItem) {
        if (question) {
          return `${question.text}${question.initialQuantity && question.initialQuantity.unit ?
            ` (${question.initialQuantity.unit})` : ''}`;
        } else {
          return '';
        }
    }
}
