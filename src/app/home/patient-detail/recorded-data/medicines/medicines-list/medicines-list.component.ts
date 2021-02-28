import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { CarePlanService } from '../../../../../services/care-plan.service';
import { IPatientAdherenceRow } from '../../../../../services/care-plan-utils';
import { IFhirSearchParams } from '../../../../../services/fhir.service';
import { MedicationService } from '../../../../../services/medication.service';
import { STATUSES } from '../medicines.component';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-medicines-list',
  templateUrl: './medicines-list.component.html',
  styleUrls: ['./medicines-list.component.scss']
})
export class MedicinesListComponent implements OnInit {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  selectedMedicine$: BehaviorSubject<IPatientAdherenceRow | {}>;

  @Input()
  allowEditing: boolean;

  loading = false;
  currentMedications: IPatientAdherenceRow[] = [];
  readonly statuses = of(STATUSES);
  statusFilter = [STATUSES[0].value];
  medicationFilters$: Subject<IFhirSearchParams> = new Subject();
  medicationFilters = {status: STATUSES[0].value};

  constructor(private medicationService: MedicationService) {
    this.loading = true;
  }

  ngOnInit() {
    if (this.patient && this.carePlan) {

      this.medicationFilters$
        .pipe(
          debounceTime(250)
        )
        .subscribe(options => {
        this.medicationService.medicationsToRecords(this.patient, options).then(res => {
          this.currentMedications = res;
          this.loading = false;
        });
      });

      this.medicationFilters$.next(this.medicationFilters);
    }
  }

  onSort(event) {
  }

  select($event) {
    this.selectedMedicine$.next($event.selected[0]);
  }

  addNewMedicine() {
    this.selectedMedicine$.next({});
  }

  getStatusByValue(value: string) {
    return STATUSES.find(s => s.value === value);
  }

  filterByStatus(event) {
    this.loading = true;
    this.medicationFilters$.next({status: event.value.length ? this.statusFilter.join(',') : ''});
  }
}
