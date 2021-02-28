import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestingModule } from '../../../test';
import { PipesModule } from '../../pipes/pipes.module';
import { PriorityIconComponent } from './priority-icon.component';

describe('PriorityIconComponent', () => {
  let component: PriorityIconComponent;
  let fixture: ComponentFixture<PriorityIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ PriorityIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
