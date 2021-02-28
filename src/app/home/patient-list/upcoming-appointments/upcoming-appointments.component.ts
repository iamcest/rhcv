import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, ReplaySubject } from 'rxjs';
import * as moment from 'moment';
import { IPatientAppointmentEntry, PatientService } from '../../../services/patient.service';
import { formatFhirName } from '../../../utils';
import { debounceTime } from 'rxjs/operators';
import { RegionalConfigService } from '@cardihab/angular-fhir';

@Component({
  selector: 'app-upcoming-appointments',
  templateUrl: './upcoming-appointments.component.html',
  styleUrls: ['./upcoming-appointments.component.scss']
})
export class UpcomingAppointmentsComponent implements OnInit {
  @Input()
  org$: BehaviorSubject<string>;

  currentDate: moment.Moment = moment();
  currentDate$: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment());

  items: IPatientAppointmentEntry[];
  patientsCount = -1;
  totalPatientsCount = -1;
  loading = false;

  readonly limit: number = 7;
  limit$: BehaviorSubject<number> = new BehaviorSubject(this.limit);

  constructor(
    private patientService: PatientService,
    private router: Router,
    private regionConfig: RegionalConfigService
  ) { }

  ngOnInit() {
    this.currentDate$.subscribe(value => {
      this.loading = true;
      this.currentDate = value;
    });

    combineLatest([this.currentDate$, this.org$, this.limit$])
    .pipe(debounceTime(250))
    .subscribe(([currentDate, orgId, limit]) => {
      if (!orgId) {
        return;
      }

      const patientAppointments = this.patientService.upcomingAppointments(currentDate, orgId, limit);
      patientAppointments.entries$.subscribe((entries: IPatientAppointmentEntry[]) => {
        this.patientsCount = entries.length;
        this.totalPatientsCount = patientAppointments.totalCount;
        this.items = entries;
        this.loading = false;
      });
    });
  }


  nextDay() {
    this.currentDate$.next(this.currentDate.add(1, 'days'));
    // Reset the limit back to default
    this.limit$.next(this.limit);
  }

  prevDay() {
    this.currentDate$.next(this.currentDate.subtract(1, 'days'));
    this.limit$.next(this.limit);
  }

  formatName(patient) {
    if (!patient) {
      return 'Loading...';
    }

    return formatFhirName(patient.name, {noTitle: true, capitaliseLastName: true});
  }

  backToToday() {
    this.currentDate$.next(moment());
    this.limit$.next(this.limit);
  }

  goToPatientAppointment(patient$: ReplaySubject<fhir.Patient>) {
    patient$.subscribe(patient => {
      this.router.navigate([`/${this.regionConfig.region}/home`, 'patient', patient.id, 'delivery']);
    });
  }

  toggleLimit(value: boolean) {
    this.loading = true;
    this.limit$.next(value ? this.limit : 0);
  }

  getAppointmentType(appointment: fhir.Appointment): string {
    return appointment.description
    .split(' ')
    .slice(0, 2)
    .map(item => item[0])
    .join('')
    .toUpperCase();
  }
}
