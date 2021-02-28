import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';
import * as moment from 'moment';
import { cloneDeep } from 'lodash';
import { IPatientAdherenceRow } from '../../../../../services/care-plan-utils';
import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MedicationService } from '../../../../../services/medication.service';
import { FhirService } from '../../../../../services/fhir.service';
import { validateUniqueTime } from '../../../../../utils/validators';
import { ConfirmationDialogComponent } from '../../../../../components/confirmation-dialog/confirmation-dialog.component';
import { DialogData } from '../../../../../components/dialog-header/dialog-header.component';
import { PractitionerService } from '../../../../../services/practitioner.service';


import { STATUSES } from '../medicines.component';
import { IFhirSearchParams } from '../../../../../services/fhir.service';



export const FREQUENCIES = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'days', label: 'Specific Days' },
  { value: 'asneeded', label: 'As needed' },
  { value: 'custom', label: 'Custom Schedule' }
];

export const DAYS_OF_WEEK = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' }
];

export const PERIOD = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
];

export const HOW_MANY_TIMES = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6 (Every 4 hours)' },
  { value: '7', label: '6' },
  { value: '8', label: '8 (Every 3 hours)' },
  { value: '9', label: '4' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12 (Every 2 hours)' },
  { value: '24', label: '24 (Every 1 hours)' }
];

@Component({
  selector: 'app-medicines-detail',
  templateUrl: './medicines-detail.component.html',
  styleUrls: ['./medicines-detail.component.scss']
})
export class MedicinesDetailComponent implements OnInit, OnDestroy {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  selectedMedicine$: BehaviorSubject<IPatientAdherenceRow>;

  @Input()
  allowEditing: boolean;

  selectedMedicine: IPatientAdherenceRow;
  oldMedicine: fhir.MedicationRequest;
  subscription: Subscription;
  isNewMedicine = false;
  medicationSearchResult$: Observable<fhir.Coding[]>;
  medicationSearch$: Subject<string> = new Subject();
  medicationFilters$: Subject<IFhirSearchParams> = new Subject();
  medicationFilters = { status: STATUSES[0].value };
  currentMedications: IPatientAdherenceRow[] = [];
  selectDaysOfWeek: any;
  selectInterval: string;
  selectPeriod: string;

  prescriptionForm: FormGroup;
  timesArray: FormArray = this.fb.array([], [Validators.required]);

  readonly frequencies = FREQUENCIES;
  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly period = PERIOD;
  readonly howManyTimes = HOW_MANY_TIMES;
  isAlreadyMedicine = false;

  constructor(private fb: FormBuilder,
    private medicationService: MedicationService,
    private practitionerService: PractitionerService,
    private fhirService: FhirService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog) {
    this.prescriptionForm = this.fb.group({
      name: this.fb.control({ value: '', disabled: !this.isNewMedicine }, [Validators.required]),
      // Always disabled for now
      startDate: this.fb.control({ value: '', disabled: true }, [Validators.required]),
      // Always disabled for now
      endDate: this.fb.control({ value: '', disabled: true }),
      frequency: ['', [Validators.required]],
      daysOfWeek: [[]],
      howManyTimes: [[]],
      times: this.timesArray,
      interval: [],
      period: ['']
    });



    this.intChangeEvents();

    // Searchbar
    this.medicationSearchResult$ = this.medicationSearch$.pipe(
      // debounceTime(250),
      mergeMap(term => {
        return this.medicationService.searchMedicine(term);
      })
    );
  }

  async ngOnInit() {
    if (this.selectedMedicine$) {
      this.checkMedication();
      const pRole = await this.practitionerService.currentRole().toPromise();
      const practitioner = await this.fhirService.reference(pRole.practitioner, pRole).toPromise();
      this.subscription = this.selectedMedicine$.subscribe(med => {
        if (!med.name) {
          this.isNewMedicine = true;
          this.selectedMedicine = this.medicationService.createNewMedicine(this.patient, practitioner);
        } else {
          this.oldMedicine = cloneDeep(med.request);
          this.selectedMedicine = med;
        }

        if (med && med.request) {
          this.prescriptionForm.reset({
            name: med.name,
            startDate: this.isNewMedicine ? moment().format('L') : med.startDate,
            endDate: med.endDate,
            frequency: this.readValue(med.request, 'frequency'),
            daysOfWeek: this.readValue(med.request, 'daysOfWeek'),
            interval: this.readValue(med.request, 'interval'),
            period: this.readValue(med.request, 'period'),
            howManyTimes: this.readValue(med.request, 'howManyTimes'),
          });
          this.selectDaysOfWeek = this.readValue(med.request, 'daysOfWeek');
          this.selectInterval = this.prescriptionForm.get('interval').value;
          this.selectPeriod = this.prescriptionForm.get('period').value;
          this.selectPeriod = this.getSelectPeriodValue();
          this.selectInterval = this.getSelectIntervalValue();
          this.timesArray.clear();
          const times = this.readValue(med.request, 'times') as FormGroup[];
          times.forEach(t => this.timesArray.push(t));
        } else {
          this.selectInterval = '2';
          this.selectPeriod = 'day';
          this.prescriptionForm.reset({
            name: '',
            startDate: moment().format(),
            interval: this.selectInterval,
            period: this.selectPeriod,
            howManyTimes: '',
          });
        }
      });

      if (!this.allowEditing || this.selectedMedicine.request.status === 'cancelled') {
        this.prescriptionForm.disable();
      }

      if (this.isNewMedicine) {
        this.prescriptionForm.get('name').enable();
      }
    }
  }

  setValidators(field: string, validators: ValidatorFn[] = []): void {
    this.prescriptionForm.get(field).setValidators(validators);
    this.prescriptionForm.get(field).setValue('');
    this.prescriptionForm.get(field).updateValueAndValidity();
  }

  readValue(request: fhir.MedicationRequest, name: string) {
    if (!request || !request.dosageInstruction || !request.dosageInstruction.length) {
      return '';
    }


    const timing = request.dosageInstruction[0].timing.repeat;
    switch (name) {
      case 'frequency': {
        if (timing.dayOfWeek && timing.dayOfWeek.length) {
          return this.frequencies[1].value;
        } else if (timing.period === 1) {
          return this.frequencies[0].value;
        } else if (!timing.period) {
          return this.frequencies[2].value;
        } else {
          return this.frequencies[3].value;
        }
      }
      case 'daysOfWeek': {
        return timing.dayOfWeek;
      }
      case 'period': {
        const intPeriod = (!timing.period) ? '0' : timing.period?.toString();
        let periodValue = 'day';
        if (!isNaN(parseInt(intPeriod, 10))) {
          let intRemainder = 0;
          if (parseInt(intPeriod, 10) >= 30) {
            intRemainder = parseInt(intPeriod, 10) % 30;
            if (intRemainder === 0) {
              periodValue = 'month';
            }
          } else if (parseInt(intPeriod, 10) >= 7) {
            intRemainder = parseInt(intPeriod, 10) % 7;
            if (intRemainder === 0) {
              periodValue = 'week';
            }
          }
        }
        return periodValue;
      }
      case 'interval': {
        const intPeriod = (timing.period === null || timing.period === undefined) ? '0' : timing.period?.toString();
        let period = timing.period;
        if (!isNaN(parseInt(intPeriod, 10))) {
          let intRemainder = 0;
          let intQuotient = 0;
          if (parseInt(intPeriod, 10) >= 30) {
            intQuotient = Math.floor(parseInt(intPeriod, 10) / 30);
            intRemainder = parseInt(intPeriod, 10) % 30;
            if (intRemainder === 0) {
              period = intQuotient;
            }
          } else if (parseInt(intPeriod, 10) >= 7) {
            intQuotient = Math.floor(parseInt(intPeriod, 10) / 7);
            intRemainder = parseInt(intPeriod, 10) % 7;
            if (intRemainder === 0) {
              period = intQuotient;
            }
          }
        }
        return period;
      }
      case 'times': {
        return request.dosageInstruction.map((d, i) => {
          const dose = d.doseQuantity || {};
          return this.addTimeControl(i, dose.value, (d.timing.repeat || { timeOfDay: [] }).timeOfDay[0]);
        });
      }
      case 'howManyTimes': {
        return (request.dosageInstruction) ? request.dosageInstruction.length.toString() : '1';
      }
    }
  }

  async saveChanges($event) {
    $event.stopPropagation();
    this.prescriptionForm.updateValueAndValidity();
    const medicationID = (this.oldMedicine) ? (this.oldMedicine.id) ? this.oldMedicine.id : '' : '';
    this.isAlreadyMedicine = this.isMedicationExist(medicationID);
    if (!this.isAlreadyMedicine && this.prescriptionForm.valid) {

      this.selectedMedicine.request.dosageInstruction =
        this.timesArray.controls.map((t, index) => {
          return <fhir.Dosage>{
            doseQuantity: {
              value: t.get('amount').value,
              unit: t.get('unit').value
            },
            sequence: index + 1,
            timing: {
              repeat: {
                frequency: this.timesArray.length,
                period: this.getPeriodValue(),
                periodUnit: 'd',
                timeOfDay: [t.get('time').value],
                ...(this.prescriptionForm.get('daysOfWeek').value) &&
                { dayOfWeek: this.prescriptionForm.get('daysOfWeek').value }
              }
            }
          };
        });
      if (!this.isNewMedicine) {
        const pRole = await this.practitionerService.currentRole().toPromise();
        const practitioner = await this.fhirService.reference(pRole.practitioner, pRole).toPromise();
        this.medicationService.replaceMedicine(this.oldMedicine, this.selectedMedicine.request, practitioner).then(res => {
          this.snackbar.open('Prescription Saved', 'Close', {
            duration: 2000,
          });
        });
      } else {
        this.fhirService.save<fhir.MedicationRequest>(this.selectedMedicine.request).toPromise().then(res => {
          this.snackbar.open('Medicine Created', 'Close', {
            duration: 2000,
          });
        });
      }
      this.goBack();
    }
  }
  updateSchedule(value) {
    const howManyTimes = parseInt(value, 10);
    const times = this.getScheduledTimes(howManyTimes);
    this.timesArray.clear();
    for (let i = 0; i < howManyTimes; i++) {
      this.timesArray.push(this.
        addTimeControl(this.timesArray.length, 1, moment().startOf('day').
          add(moment.duration(times[i])).format('HH:mm')));
      this.timesArray.markAllAsTouched();
      this.prescriptionForm.updateValueAndValidity();
    }
  }

  getScheduledTimes(times) {
    switch (times) {
      case 1:
        return ['08:00'];
      case 2:
        return ['08:00', '16:00'];
      case 3:
        return ['08:00', '12:00', '16:00'];
      case 4:
        return ['08:00', '12:00', '16:00', '20:00'];
      case 5:
        return ['07:00', '10:00', '14:00', '18:00', '22:00'];
      case 6:
        return ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00'];
      case 7:
        return ['08:00', '11:30', '15:00', '18:30', '22:00', '01:00', '04:00'];
      case 8:
        return [
          '08:00',
          '11:00',
          '14:00',
          '17:00',
          '20:00',
          '23:00',
          '02:00',
          '05:00'
        ];
      case 9:
        return [
          '08:00',
          '11:00',
          '13:30',
          '16:00',
          '18:30',
          '21:30',
          '00:00',
          '02:30',
          '05:30'
        ];
      case 10:
        return [
          '08:00',
          '10:30',
          '13:00',
          '15:00',
          '17:30',
          '20:00',
          '22:30',
          '01:00',
          '03:00',
          '05:30'
        ];
      case 11:
        return [
          '08:00',
          '10:00',
          '12:30',
          '14:30',
          '16:30',
          '19:00',
          '21:00',
          '23:00',
          '01:30',
          '03:30',
          '05:30'
        ];
      case 12:
        return [
          '08:00',
          '10:00',
          '12:00',
          '14:00',
          '16:00',
          '18:00',
          '20:00',
          '22:00',
          '00:00',
          '02:00',
          '04:00',
          '06:00'
        ];
      case 24:
        return [
          '08:00',
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
          '19:00',
          '20:00',
          '21:00',
          '22:00',
          '23:00',
          '00:00',
          '01:00',
          '02:00',
          '03:00',
          '04:00',
          '05:00',
          '06:00',
          '07:00'
        ];
    }
  }

  getPeriodValue() {

    let intPeriodValue = 1;

    if (this.prescriptionForm.get('frequency').value.toLowerCase() === 'asneeded') {

      intPeriodValue = null;
    } else if (this.prescriptionForm.get('frequency').value.toLowerCase() === 'custom') {

      if (this.prescriptionForm.get('period').value.toLowerCase() === 'month') {

        intPeriodValue = parseInt(this.prescriptionForm.get('interval').value, 10) * 30;
      } else if (this.prescriptionForm.get('period').value.toLowerCase() === 'week') {

        intPeriodValue = parseInt(this.prescriptionForm.get('interval').value, 10) * 7;
      } else {
        intPeriodValue = parseInt(this.prescriptionForm.get('interval').value, 10);
      }
    }
    return intPeriodValue;
  }

  isMedicationExist(medicationID: string = '') {
    const lstMedicationExist = this.currentMedications.filter(d => {
      if (this.prescriptionForm.get('name').value.toLowerCase() === d.name.toLowerCase() && (medicationID === '' || d.request.id !== medicationID)) {
        this.isAlreadyMedicine = true;
        const lstDosageExist = Object(this.timesArray.value).filter(pf => {
          const lstFrequencyTimeExist = Object(d.dosage).filter((dq, i) => {
            if (dq.timing.repeat.timeOfDay[0] === pf.time) { return dq; }
          });
          if (lstFrequencyTimeExist && lstFrequencyTimeExist.length > 0) {
            return pf;
          }
        });
        if (lstDosageExist && lstDosageExist.length > 0) {
          return d;
        }
      }
    });

    return (lstMedicationExist && lstMedicationExist.length > 0) ? true : false;
  }


  addNewTime($event) {
    $event.stopPropagation();
    if (!this.selectedMedicine || !this.selectedMedicine.request) {
      return;
    }
    this.timesArray.push(this.addTimeControl(this.timesArray.length, null));
    this.timesArray.markAllAsTouched();
    this.prescriptionForm.updateValueAndValidity();
  }

  addTimeControl(index: number, amount: number, time: string = moment().format('HH:mm')): FormGroup {
    const group = this.fb.group({
      index: index,
      amount: this.fb.control({ value: amount, disabled: !this.allowEditing },
        // This validator allows only positive integers and floats
        [Validators.required, Validators.pattern('^([1-9]+\\.*|0\\.{1}\\d*[1-9]+)\\d*$')]),
      time: this.fb.control({
        value: time,
        disabled: !this.allowEditing
      }, [Validators.required, validateUniqueTime(this.prescriptionForm)]),
      unit: this.fb.control(
        { value: this.medicationService.getMedicineUnit(this.selectedMedicine.name), disabled: true },
        [Validators.required])
    });

    group.get('time').valueChanges.subscribe(frequency => {
      this.onChangeTime();
    });

    return group;
  }

  deleteTime(index) {
    this.timesArray.removeAt(index);
    this.prescriptionForm.updateValueAndValidity();
  }

  onChangeTime($event = null, control = null) {
    const medicationID = (this.oldMedicine) ? (this.oldMedicine.id) ? this.oldMedicine.id : '' : '';
    this.isAlreadyMedicine = this.isMedicationExist(medicationID);
  }

  ngOnDestroy(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  goBack() {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
    this.selectedMedicine$.next(void 0);
  }

  searchMedication(term: string) {
    if (term.length > 2) {
      this.medicationSearch$.next(term);
    }
  }

  selectMedication(medicine: fhir.Coding) {
    medicine.version = this.medicationService.snomedVersion;
    this.selectedMedicine.name = medicine.display;
    this.selectedMedicine.request.medicationCodeableConcept = {
      text: medicine.display,
      coding: [{ ...medicine }]
    };

    // Replace units with new ones in case of medication change
    this.timesArray.controls.forEach(c => {
      c.get('unit').setValue(this.medicationService.getMedicineUnit(this.selectedMedicine.name));
    });
  }

  changeFrequency() {
    this.prescriptionForm.get('daysOfWeek').setValue(this.selectDaysOfWeek);
    this.prescriptionForm.get('period').setValue(this.getSelectPeriodValue());
    this.prescriptionForm.get('interval').setValue(this.getSelectIntervalValue());
    this.prescriptionForm.get('howManyTimes').setValue(String((this.timesArray && this.timesArray.length !== 0) ? this.timesArray.length : 0));
    this.intChangeEvents();
    this.prescriptionForm.markAsPristine();
    this.prescriptionForm.markAsUntouched();
    this.prescriptionForm.updateValueAndValidity();
  }

  getSelectPeriodValue() {
    if (!this.selectPeriod) {
      this.selectPeriod = 'day';
    }
    return this.selectPeriod;
  }

  getSelectIntervalValue() {
    if (!this.selectInterval || (String(this.selectInterval) === '1' && this.selectPeriod === 'day')) {
      this.selectInterval = '2';
    }
    return this.selectInterval;
  }

  intChangeEvents() {
    // Setting up dynamic validators
    this.prescriptionForm.get('frequency').valueChanges.subscribe(frequency => {
      switch (frequency) {
        case 'days': {
          this.setValidators('howManyTimes', [Validators.required]);
          this.setValidators('daysOfWeek', [Validators.required]);
          break;
        }
        case 'custom': {
          this.setValidators('howManyTimes', [Validators.required]);
          this.setValidators('interval', [Validators.required, Validators.min(2)]);
          this.setValidators('period', [Validators.required]);
          break;
        }
        case 'everyday': {
          this.setValidators('howManyTimes', [Validators.required]);
          break;
        }
        default: {
          this.setValidators('interval');
          this.setValidators('period');
          this.setValidators('daysOfWeek');
          break;
        }
      }
      this.changeFrequency();
    });
    this.prescriptionForm.get('interval').valueChanges.subscribe(interval => {
      if (interval) {
        this.changeInterval(interval);
      }
    });
    this.prescriptionForm.get('period').valueChanges.subscribe(period => {
      if (period) {
        this.changePeriod(period);
      }
    });
    this.prescriptionForm.get('howManyTimes').valueChanges.subscribe(howManyTimes => {
      if (howManyTimes && howManyTimes !== '0') {
        this.updateSchedule(howManyTimes);
      }
    });
    this.prescriptionForm.get('daysOfWeek').valueChanges.subscribe(daysOfWeek => {
      if (daysOfWeek) {
        this.changeDaysOfWeek(daysOfWeek);
      }
    });
  }

  changeDaysOfWeek(value) {
    this.selectDaysOfWeek = value;
  }

  cancelMedication() {
    this.dialog.open(ConfirmationDialogComponent, {
      data: <DialogData>{
        text: `Are you sure you want to cease this medication?`
      } // confirmation dialog closed
    }).afterClosed().subscribe(async result => {
      if (result) {
        const pRole = await this.practitionerService.currentRole().toPromise();
        const practitioner = await this.fhirService.reference(pRole.practitioner, pRole).toPromise();

        this.medicationService.cancelAndSaveMedicine(this.selectedMedicine.request, practitioner).then(res => {
          this.prescriptionForm.disable();
          this.snackbar.open('Medication Cancelled', 'Close', {
            duration: 2000,
          });
        });
      }
    });
  }

  changeInterval(value) {
    this.selectInterval = value;
  }

  changePeriod(value) {
    this.selectPeriod = value;
  }

  checkMedication() {
    if (this.patient && this.carePlan) {
      this.medicationFilters$
        .pipe(
          debounceTime(250)
        )
        .subscribe(options => {
          this.medicationService.medicationsToRecords(this.patient, options).then(res => {
            this.currentMedications = res;
          });
        });
      this.medicationFilters$.next(this.medicationFilters);
    }
  }
}
