import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditGoalModalComponent } from './edit-goal-modal.component';
import { TestingModule } from '../../../../../../test';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { DialogHeaderComponent } from '../../../../../components/dialog-header/dialog-header.component';

describe('EditGoalModalComponent', () => {
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const userData = {
    user: {
      Attributes: []
    },
    adherence: {}
  };

  let component: EditGoalModalComponent;
  let fixture: ComponentFixture<EditGoalModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ EditGoalModalComponent, DialogHeaderComponent ],
      providers: [
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: userData}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGoalModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
