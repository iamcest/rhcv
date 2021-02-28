import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientListComponent } from './patient-list.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TestingModule } from '../../../test';
import { ActivatedRoute } from '@angular/router';
import { PipesModule } from '../../pipes/pipes.module';
import { PendingRegistrationsComponent } from './pending-registrations/pending-registrations.component';
import { PendingRegistrationModalComponent } from './pending-registrations/pending-registration-modal/pending-registration-modal.component';
import { UpcomingAppointmentsComponent } from './upcoming-appointments/upcoming-appointments.component';
import { ComponentsModule } from '../../components/components.module';


const snapshot = {

  snapshot: {
    data: {
      patient: {
        carePlan: {},
        patient: {}
      }
    },
    url: null
  },
};

const activatedRouteStub = {
  get parent() {
    return snapshot;
  }
};

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgxDatatableModule, TestingModule, PipesModule, ComponentsModule],
      declarations: [ PatientListComponent, PendingRegistrationsComponent, PendingRegistrationModalComponent, UpcomingAppointmentsComponent],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRouteStub},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
