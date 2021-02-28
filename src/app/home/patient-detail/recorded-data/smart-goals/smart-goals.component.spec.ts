import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SmartGoalsComponent } from './smart-goals.component';
import { TestingModule } from '../../../../../test';
import { PipesModule } from '../../../../pipes/pipes.module';
import { SmartGoalListComponent } from './smart-goal-list/smart-goal-list.component';
import { SmartGoalDetailComponent } from './smart-goal-detail/smart-goal-detail.component';
import { GoalStatusComponent } from '../../../../components/goal-status/goal-status.component';
import { NotesListComponent } from '../../../../components/notes-list/notes-list.component';
import { NoteAddComponent } from '../../../../components/note-add/note-add.component';

describe('SmartGoalsComponent', () => {
  let component: SmartGoalsComponent;
  let fixture: ComponentFixture<SmartGoalsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ SmartGoalsComponent, SmartGoalListComponent, SmartGoalDetailComponent, GoalStatusComponent,
      NotesListComponent, NoteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
