import { Component, OnInit, Input } from '@angular/core';
import { combineLatest, Subject, of } from 'rxjs';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { PatientService } from '../../../../services/patient.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IFhirSearchParams } from '../../../../services/fhir.service';
import { CarePlanUtils } from '../../../../services/care-plan-utils';
import { FhirCodingPipe } from '../../../../pipes/fhir-coding.pipe';
import { ObservationValuePipe } from '../../../../pipes/observation-value.pipe';
import { take } from 'rxjs/operators';
const LIMIT = 20;

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  category: string[] = [];

  rows: fhir.Observation[];

  page = {
    limit: LIMIT,
    offset: 0,
    total: 0,
  };

  options: IFhirSearchParams = {
    _count: String(LIMIT),
    _sort: '-date',
    category: void 0
  };

  optionChanges: Subject<IFhirSearchParams> = new Subject();
  private CSV_FILE = {
    type: 'text/csv;charset=utf-8',
    extension: 'csv'
  };

  loading = false;

  journalEntryTypes = of(
    Object.keys(CarePlanUtils.JOURNAL_ENTRY_CODES)
      .map(k => CarePlanUtils.JOURNAL_ENTRY_CODES[k])
  );
  isFilteredByCategory = true;

  constructor(private patientService: PatientService) { }

  ngOnInit() {
    if (this.category && this.category.length) {
      this.options.category = this.category.join(',');
      this.isFilteredByCategory = false;
    }

    this.optionChanges.subscribe((options) => {
      this.loading = true;
      this.patientService.patientObservations(this.patient, options)
        .subscribe({
          error: (err: HttpErrorResponse) => {
            if (err.status === 410) {
              console.log('Paginated result expired');
              delete options.nextUrl;
              this.optionChanges.next(options);
            }
            console.error(err);
          },
          next: observations => {
            this.page.total = observations.total;

            const foundNext = (observations.link.find(l => l.relation === 'next') || {} as any).url;
            const foundPrevious = (observations.link.find(l => l.relation === 'previous') || {} as any).url;

            if (foundPrevious) {
              options.nextUrl = foundPrevious;
            }

            if (foundNext) {
              options.nextUrl = foundNext;
            }

            this.rows = observations.entry && observations.entry.map(item => item.resource) || [];
            this.loading = false;
            return this.rows;
          }
        });
    });
  }

  setPage($event) {
    this.page.offset = $event.offset;
    this.options._getpagesoffset = String(this.page.offset * $event.pageSize);
    this.options._count = $event.pageSize;
    this.optionChanges.next(this.options);
  }

  onSort($event) {
    const { dir, prop } = $event.sorts[0];

    switch (prop) {
      case 'effectiveDateTime':
        dir === 'desc' ? this.options._sort = 'date' : this.options._sort = '-date';
        break;
    }

    delete this.options.nextUrl;
    this.options._getpagesoffset = '0';
    this.optionChanges.next(this.options);
  }

  filter(itemsToRemove: string[]) {
    if (itemsToRemove && itemsToRemove.length) {
      itemsToRemove.forEach(item => {
        delete this.options[item];
      });
    }

    delete this.options.nextUrl;
    this.options._getpagesoffset = '0';
    if (this.options['code:text'] === '') {
      delete this.options['code:text'];
    }

    this.optionChanges.next(this.options);
  }

  filterByCategory($event) {
    delete this.options.nextUrl;
    this.options._getpagesoffset = '0';
    if ($event.value.length) {
      this.options.category = $event.value.join(',');
    } else {
      delete this.options.category;
    }
    this.optionChanges.next(this.options);
  }

  dateChange(type, $event) {
    this.options[type] = moment($event).format();
    delete this.options.nextUrl;
    this.optionChanges.next(this.options);
  }

  getCategories(category: fhir.CodeableConcept[]): string {
    if (!category) {
      return '';
    }
    return category.map(c => c.coding[0].display).join(', ');
  }

  dateTimeDeleted(record: fhir.Observation): fhir.Extension {
    return record.extension ? record.extension.find(e => e.url === 'deletedAt') : void 0;
  }
  async download() {
    // const options = await this.optionChanges.pipe(take(1)).toPromise();
    delete this.options.nextUrl;
    const dataTable = this.patientService.patientObservations(this.patient, this.options, false).toPromise();
    dataTable.then(result => {
      const rows = result.entry && result.entry.map(item => item.resource);
      this.exportToCsv(rows);
    });      
  }
  exportToCsv(rows): void {
    let rowData = this.fileExportJson(rows);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(rowData);
    const csvOutput: string = XLSX.utils.sheet_to_csv(worksheet);
    this.saveAsCsvFile(csvOutput, 'data');
  }
  saveAsCsvFile(csvOutput: any, fileName: string): void {
    const data: Blob = new Blob([csvOutput], { type: this.CSV_FILE.type });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + this.CSV_FILE.extension);
  }

  fileExportJson(rows): any[] {
    let rowJson = [];
    const fhirCoding = new FhirCodingPipe(), 
          observationValue = new ObservationValuePipe();
    rows.forEach((row) => {
      const deletedObj = this.dateTimeDeleted(row);
      if(!deletedObj){ //Skip deleted records
        let temp = {};
        temp['Event'] = fhirCoding.transform(row);
        temp['Value'] = observationValue.transform(row);
        temp['Type'] = this.getCategories(row.category); 
        temp['Date/Time'] = (row.effectiveDateTime)?moment(row.effectiveDateTime).format('DD MMM yyyy h:mm a'): null; 
        rowJson.push(temp);
      }      
    });
    return rowJson;
  }

}
