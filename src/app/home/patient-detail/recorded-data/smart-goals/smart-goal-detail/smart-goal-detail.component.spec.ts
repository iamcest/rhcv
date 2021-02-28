import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SmartGoalDetailComponent } from './smart-goal-detail.component';
import { TestingModule } from '../../../../../../test';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { GoalStatusComponent } from '../../../../../components/goal-status/goal-status.component';
import { NotesListComponent } from '../../../../../components/notes-list/notes-list.component';
import { NoteAddComponent } from '../../../../../components/note-add/note-add.component';

describe('SmartGoalDetailComponent', () => {
  let component: SmartGoalDetailComponent;
  let fixture: ComponentFixture<SmartGoalDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ SmartGoalDetailComponent, GoalStatusComponent, NotesListComponent, NoteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartGoalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
