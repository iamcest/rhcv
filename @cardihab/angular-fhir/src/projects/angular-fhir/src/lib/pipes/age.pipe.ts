import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'ageInYears'
})
export class AgePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value || !moment(value).isValid()) { return void 0; }
    return moment().diff(value, 'years');
  }

}
