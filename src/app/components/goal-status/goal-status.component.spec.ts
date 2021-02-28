import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestingModule } from '../../../test';
import { PipesModule } from '../../pipes/pipes.module';
import { GoalStatusComponent } from './goal-status.component';

describe('GoalStatusComponent', () => {
  let component: GoalStatusComponent;
  let fixture: ComponentFixture<GoalStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ GoalStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
