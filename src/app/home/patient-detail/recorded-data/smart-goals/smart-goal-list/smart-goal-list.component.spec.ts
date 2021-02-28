import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SmartGoalListComponent } from './smart-goal-list.component';
import { TestingModule } from '../../../../../../test';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { GoalStatusComponent } from '../../../../../components/goal-status/goal-status.component';

describe('SmartGoalListComponent', () => {
  let component: SmartGoalListComponent;
  let fixture: ComponentFixture<SmartGoalListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ SmartGoalListComponent, GoalStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartGoalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
