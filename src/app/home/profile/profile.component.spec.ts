import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { TestingModule, practitionerServiceStub } from '../../../test';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PractitionerService } from '../../services/practitioner.service';
import { DialogHeaderComponent } from '../../components/dialog-header/dialog-header.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: PractitionerService, useValue: practitionerServiceStub},
        {provide: MAT_DIALOG_DATA, useValue: { title: '' }}
      ],
      declarations: [ ProfileComponent, DialogHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
