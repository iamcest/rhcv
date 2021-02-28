import { Component, Input, OnInit } from '@angular/core';
import { FhirService } from '../../../../services/fhir.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';
import { CarePlanUtils } from '../../../../services/care-plan-utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { CalendarOptions } from '@fullcalendar/angular';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentDetailComponent } from './appointment-detail/appointment-detail.component';

@Component({
  selector: 'app-review-schedule',
  templateUrl: './review-schedule.component.html',
  styleUrls: ['./review-schedule.component.scss']
})
export class ReviewScheduleComponent implements OnInit {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  appointments: {[key: string]: fhir.Appointment} = {};
  appointmentDates = [];
  start = moment().startOf('year').format('YYYY-MM-DD');
  end = moment().endOf('year').format('YYYY-MM-DD');
  months = 12;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    customButtons: {
      weekends: {
        text: 'Weekends',
        click: this.toggleWeekends.bind(this),
      }
    },
    weekends: false,
    headerToolbar: {
      start: 'title', // will normally be on the left. if RTL, will be on the right
      center: 'dayGridMonth,listMonth',
      end: 'weekends today prev,next'
    },
    eventClick: this.handleAppointmentClick.bind(this),
    eventClassNames: this.handleAppointmentClassNames.bind(this)
  };

  parentPlan: fhir.CarePlan;

  rehabForm: FormGroup;
  loading = true;
  ready = false;

  private readonly defaultTime: moment.Moment = moment().set('hour', 9).set('minute', 0).set('second', 0);

  constructor(
              private fhirService: FhirService,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private snackbar: MatSnackBar) {

    this.rehabForm = new FormGroup({
      basedOn: new FormControl({value: '', disabled: true}),
      period: new FormGroup({
        start: new FormControl(moment(), Validators.required),
        defaultTime: new FormControl(this.defaultTime.format('HH:mm'))
      }),
      reviews: this.fb.array([
        this.fb.group({
          date: {value: ''},
          time: {value: ''}
        })
      ])
    }, { updateOn: 'blur'});
  }

  async ngOnInit() {
    if (this.patient && this.carePlan) {
      if ((this.carePlan.basedOn || []).length > 0) {
        // Fetch base plan
        this.parentPlan = await this.fhirService.reference<fhir.CarePlan>(this.carePlan.basedOn[0], this.carePlan).toPromise();

        // Initialise form
        this.rehabForm.get('basedOn').reset(this.parentPlan.id);
        this.rehabForm.setControl('reviews', this.fb.array(
          (this.carePlan.activity || []).map(() => this.fb.group({id: '', date: '', time: ''}))
        ));

        // Initialise schedule
        await this.initPlanSchedule();
        this.ready = true;

        // Subscribe to form changes
        this.rehabForm.valueChanges
        .pipe(debounceTime(250))
        .subscribe(async (formValue) => {
          await this.updatePlanDates(formValue);
          this.snackbar.open('Changes saved', 'Close', {
            duration: 2000,
          });
        });
      }
    }
    this.loading = false;
  }

  async updatePlanDates(formValue) {
    // Updating dates on a finished care plan is not allowed
    if (!this.isCarePlanIncomplete()) {
      return;
    }

    const startTime = formValue.period.defaultTime;
    const currentStartTime = moment(this.carePlan.period.start).format('HH:mm');
    const startDate: moment.Moment = formValue.period.start;
    const currentStartDate: moment.Moment = moment(this.carePlan.period.start);
    const appointmentsToSave = [];
    let latestDate = startDate.clone();

    // If the start time changes and the date remains, we still want to save the careplan,
    // but don't want to touch appointments
    const changedStartDate = !startDate.isSame(currentStartDate, 'day');
    const changedStartTime = startTime !== currentStartTime;

    (this.carePlan.activity || [])
    .forEach((activity, index) => {
      const formControl = formValue.reviews[index];
      const {appointmentMoment, activityStartMoment, activityEndMoment} = this.getNewDateTime(index, startDate, formControl.time);

      // Only update activities on start date change
      if (changedStartDate) {
        activity.detail.scheduledPeriod = {
          start: activityStartMoment.format(),
          end: activityEndMoment.format()
        };
      }

      // Update latestDate to use later as the careplan's end date
      if (activityEndMoment.isAfter(latestDate) && CarePlanUtils.isWeeklyReview(activity)) {
        latestDate = activityEndMoment;
      }

      const appointment = this.appointmentFor(activity);

      // We don't want to touch fulfilled or cancelled appointments
      if (appointment && appointment.status !== 'fulfilled' && appointment.status !== 'cancelled') {
        const currentDateTime = moment(appointment.start);
        const newDateTime = changedStartDate ? appointmentMoment :
          formControl.date.clone().add(moment.duration(formControl.time));

        // If date/time is different, update this appointment start date
        if (!currentDateTime.isSame(newDateTime)) {
          appointment.start = newDateTime.format();
          appointmentsToSave.push(appointment);

          // Update appointment reference
          this.appointments[`Appointment/${appointment.id}`] = appointment;
        }
      }
    });

    // Save appointments and careplan
    if (changedStartDate || changedStartTime) {
      this.carePlan.period.start = startDate.startOf('day').add(moment.duration(startTime)).format();
      this.carePlan.period.end = latestDate.endOf('day').format();

      // Update form with the latest appointment dates/times
      try {
        const newVal = {
          basedOn: {value: this.parentPlan.id, disabled: true},
          period: {
            start: moment(startDate).startOf('day'),
            defaultTime: startTime
          },
          reviews: Object.entries(this.appointments).map(([key, value]) => this.appoinmentDateTime(value))
        };
        this.rehabForm.reset(newVal, {emitEvent: false});
      } catch (err) {
        console.error(err);
      }
    }

    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        ...appointmentsToSave.map(app => {
          return {
            request: {
              method: 'PUT',
              url: `Appointment/${app.id}`
            },
            resource: app
          } as fhir.BundleEntry;
        }),
        {
          request: {
            method: 'PUT',
            url: `CarePlan/${this.carePlan.id}`
          },
          resource: this.carePlan
        }]
    };

    return this.fhirService.save<fhir.Bundle>(bundle).toPromise();
  }

  /**
   * Initialises appointments and sets initial values in the form
   */
  async initPlanSchedule() {
    const appointmentReferences = (this.carePlan.activity || []).map(activity => activity.reference).filter(i => !!i);
    const appointmentsBundle = await this.fhirService.resolveReferences(appointmentReferences, this.carePlan).toPromise();
    const appointments_ = appointmentsBundle && appointmentsBundle.entry ? appointmentsBundle.entry.map(r => r.resource as fhir.Appointment) : [];
    let appointments: fhir.Appointment[] = [];
    // We rely on the order of activities in the careplan to work out the right order of appointments
    appointmentReferences.forEach(a => {
      appointments.push(appointments_.find(ap => FhirService.referenceToId(a).id === ap.id));
    });

    // Create new appointments if they don't exist yet
    if (!appointments.length) {
      const savedAppointments = await this.createNewAppointments();

      this.snackbar.open('Changes saved', 'Close', {
        duration: 2000,
      });

      if (!savedAppointments) {
        return;
      }

      appointments = savedAppointments.entry
      .filter(r => r.resource.resourceType === 'Appointment')
      .map(r => r.resource as fhir.Appointment);

      // Replace current care plan with the one with proper appointment references
      this.carePlan = savedAppointments.entry.find(a => a.resource.resourceType === 'CarePlan').resource as fhir.CarePlan;
    }

    // Update internal appointments object
    this.appointments = {};
    appointments.forEach(appointment => {
      this.appointments[`Appointment/${appointment.id}`] = appointment;
    });

    this.eventsFromAppointments(appointments);
    this.calendarOptions.initialDate = moment(this.carePlan.period.start).format('YYYY-MM-DD');

    this.start = moment(this.carePlan.period.start).startOf('month').format('YYYY-MM-DD');
    this.end = moment(this.carePlan.period.end).endOf('month').format('YYYY-MM-DD');
    this.months = moment(this.carePlan.period.end).diff(moment(this.carePlan.period.start), 'months');

    // Update the form with the latest values
    try {
      const newVal = {
        basedOn: {value: this.parentPlan.id, disabled: true},
        period: {
          start: moment(this.carePlan.period.start).startOf('day'),
          defaultTime: moment(this.carePlan.period.start).format('HH:mm')
        },
        reviews: appointments.map(appointment => this.appoinmentDateTime(appointment))
      };
      this.rehabForm.reset(newVal, {emitEvent: false});
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Returns new dates/times for activities and appointments based on
   * start date/time of the careplan and the plan it's based on
   */
  getNewDateTime(index: number, start: moment.Moment, time: string) {
    const baseActivity = this.parentPlan.activity[index];
    if (baseActivity && baseActivity.detail && baseActivity.detail.scheduledString) {
      const [startP, endP] = baseActivity.detail.scheduledString.split('/');
      const activityStartMoment = start.clone().add(moment.duration(startP)).startOf('day');
      let activityEndMoment, appointmentMoment;
      if (endP) {
        appointmentMoment = start.clone().startOf('day').add(moment.duration(endP)).add(moment.duration(time));
        activityEndMoment = start.clone().add(moment.duration(endP)).subtract(1, 'day').endOf('day');
      } else {
        appointmentMoment = start.clone().startOf('day').add(moment.duration(startP)).add(moment.duration(time));
        activityEndMoment = start.clone().add(moment.duration(startP)).endOf('day');
      }

      return {appointmentMoment, activityStartMoment, activityEndMoment};
    }

    return {appointmentMoment: void 0, activityStartMoment: void 0, activityEndMoment: void 0};
  }

  /**
   * Creates new appointments when they don't exist and updates the careplan's start and end dates
   */
  createNewAppointments(): Promise<fhir.Bundle> {
    const appointmentsToSave = [];

    // If care plan is brand new and incomplete, set its start date to default
    if (!(this.carePlan.period && this.carePlan.period.start) && this.isCarePlanIncomplete()) {
      this.carePlan.period = this.carePlan.period || {};
      this.carePlan.period.start = this.defaultTime.format();
    }

    // Initialise care plan end date
    let latestDate = moment(this.carePlan.period.start);

    (this.carePlan.activity || []).forEach((activity, index) => {
      const {appointmentMoment, activityStartMoment, activityEndMoment} = this.getNewDateTime(index, moment(this.carePlan.period.start), this.defaultTime.format('HH:mm'));

      activity.detail.scheduledPeriod = {
        start: activityStartMoment.format(),
        end: activityEndMoment.format()
      };

      const appointment = {
        resourceType: 'Appointment',
        id: `urn:uuid:${uuid()}`,
        status: 'proposed',
        start: appointmentMoment.format(),
        description: activity.detail.description,
        participant: [{
          actor: this.carePlan.subject,
          status: 'tentative'
        }]
      };

      activity.detail.scheduledPeriod = {
        start: activityStartMoment.format(),
        end: activityEndMoment.format()
      };

      activity.reference = {
        reference: appointment.id
      };

      // It can be safely removed. We don't depend on it anymore, we use time periods from the base plan
      delete activity.detail.scheduledString;

      if (activityEndMoment.isAfter(latestDate) && CarePlanUtils.isWeeklyReview(activity)) {
        latestDate = activityEndMoment;
      }

      appointmentsToSave.push(appointment);
    });

    // Update careplan's end date
    this.carePlan.period.end = latestDate.endOf('day').format();

    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry:
        appointmentsToSave.map(app => {
          const entry: fhir.BundleEntry = {
            request: {
              method: 'POST',
              url: app.id
            },
            resource: app
          };
          delete entry.resource.id;
          return entry;
        }).concat(
          {
            request: {
              method: 'PUT',
              url: `CarePlan/${this.carePlan.id}`
            },
            resource: this.carePlan
          } as fhir.BundleEntry
        )
    };

    return this.fhirService.save<fhir.Bundle>(bundle).toPromise();
  }

  get initialAssessment() {
    return this.carePlan.activity.find(CarePlanUtils.isInitialAssessment);
  }

  get reviews() {
    return this.carePlan.activity.filter(a => !CarePlanUtils.isInitialAssessment(a));
  }

  appointmentFor(activity: fhir.CarePlanActivity): fhir.Appointment {
    if (activity && activity.reference && activity.reference.reference) {
      // This is for it to work with temporary references
      let ref = activity.reference.reference;
      if (activity.reference.reference.indexOf('/') === -1) {
        ref = `Appointment/${ref}`;
      }
      return this.appointments[ref];
    }
    return null;
  }

  private appoinmentDateTime(appointment: fhir.Appointment) {
    return {
      id: appointment.id,
      date: moment(appointment.start).startOf('day'),
      time: moment(appointment.start).format('HH:mm'),
    };
  }

  isCarePlanIncomplete(): boolean {
    return CarePlanUtils.isCarePlanIncomplete(this.carePlan);
  }

  private eventsFromAppointments(appointments) {
    const selections = [];
    appointments.forEach(appointment => {
      selections.push({
        title: appointment.description,
        date: appointment.start,
        extendedProps: {
          appointment
        },
      });
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: selections
    };
  }

  private toggleWeekends() {
    this.calendarOptions = {
      ...this.calendarOptions,
      weekends: !this.calendarOptions.weekends
    };
  }

  async handleAppointmentClick($event) {
    const ref = this.dialog.open(AppointmentDetailComponent, {
      data: $event.event.extendedProps.appointment
    });

    const result: fhir.Appointment = await ref.afterClosed().toPromise();
    if (result) {
      this.eventsFromAppointments(Object.values(this.appointments));
      this.fhirService.invalidate({reference: `${result.resourceType}/${result.id}`}, this.carePlan);
    }
  }

  handleAppointmentClassNames($event) {
    return `${$event.event.extendedProps.appointment.status}-appointment`;
  }
}
