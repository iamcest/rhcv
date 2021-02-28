import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GoalsComponent } from './goals.component';
import { TestingModule } from '../../../../../test';
import { GoalStatusComponent } from '../../../../components/goal-status/goal-status.component';

describe('GoalsComponent', () => {
  let component: GoalsComponent;
  let fixture: ComponentFixture<GoalsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ GoalsComponent, GoalStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
