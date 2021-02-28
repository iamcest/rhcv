import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PendingRegistrationsComponent } from './pending-registrations.component';
import { TestingModule } from '../../../../test';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PipesModule } from '../../../pipes/pipes.module';

describe('PendingRegistrationsComponent', () => {
  let component: PendingRegistrationsComponent;
  let fixture: ComponentFixture<PendingRegistrationsComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const userData = {
    user: {}
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ PendingRegistrationsComponent ],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: userData}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingRegistrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
