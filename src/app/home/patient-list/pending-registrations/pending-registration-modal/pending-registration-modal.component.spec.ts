import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PendingRegistrationModalComponent } from './pending-registration-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TestingModule } from '../../../../../test';
import { PipesModule } from '../../../../pipes/pipes.module';
import { DialogHeaderComponent } from '../../../../components/dialog-header/dialog-header.component';

describe('PendingRegistrationModalComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const userData = {
    user: {
      Attributes: []
    }
  };

  let component: PendingRegistrationModalComponent;
  let fixture: ComponentFixture<PendingRegistrationModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ PendingRegistrationModalComponent, DialogHeaderComponent ],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: userData}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingRegistrationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
