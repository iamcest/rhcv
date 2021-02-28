import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { FhirService } from 'src/app/services/fhir.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-appointment-detail',
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.scss']
})
export class AppointmentDetailComponent implements OnInit {

  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fhir: FhirService,
    private snackbar: MatSnackBar,
    private dialog: MatDialogRef<AppointmentDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public appointment: fhir.Appointment
  ) {
    this.appointmentForm = this.fb.group({
      date: moment(appointment.start).format('YYYY-MM-DD'),
      time: moment(appointment.start).format('HH:mm'),
      status: appointment.status
    });
  }

  ngOnInit(): void {
  }

  async saveAppointment() {
    const value = this.appointmentForm.value;
    this.appointment.status = value.status;
    this.appointment.start = moment(value.date).add(moment.duration(value.time)).format();
    await this.fhir.save(this.appointment).toPromise();

    this.snackbar.open('Saved', '', {
      duration: 2000,
    });

    this.dialog.close(this.appointment);
  }

}
