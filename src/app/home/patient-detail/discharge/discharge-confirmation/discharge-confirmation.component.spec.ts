import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DischargeConfirmationComponent } from './discharge-confirmation.component';
import { TestingModule } from 'src/test';
import { PipesModule } from '../../../../pipes/pipes.module';
import { ComponentsModule } from '../../../../components/components.module';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('DischargeConfirmationComponent', () => {
  let component: DischargeConfirmationComponent;
  let fixture: ComponentFixture<DischargeConfirmationComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const dialogData = {
    patient: {
      id: 1
    },
    carePlan: {
      context: {
        reference: 'EpisodeOfCare/eoc'
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule, ComponentsModule, MatDialogModule],
      declarations: [ DischargeConfirmationComponent ],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: dialogData}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
