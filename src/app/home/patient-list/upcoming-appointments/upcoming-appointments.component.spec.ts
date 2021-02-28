import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UpcomingAppointmentsComponent } from './upcoming-appointments.component';
import { TestingModule } from '../../../../test';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

describe('PendingRegistrationsComponent', () => {
  let component: UpcomingAppointmentsComponent;
  let fixture: ComponentFixture<UpcomingAppointmentsComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const mockOrg = new BehaviorSubject<string>('1');

  const userData = {
    user: {}
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ UpcomingAppointmentsComponent ],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: userData}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingAppointmentsComponent);
    component = fixture.componentInstance;
    component.org$ = mockOrg;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
