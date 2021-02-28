import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangePasswordComponent } from './change-password.component';
import { TestingModule, amplifyServiceStub } from '../../../test';
import { MatDialogRef } from '@angular/material/dialog';
import { AmplifyService } from 'aws-amplify-angular';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ ChangePasswordComponent ],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: AmplifyService, useValue: amplifyServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
