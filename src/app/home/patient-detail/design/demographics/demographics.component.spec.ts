import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DemographicsComponent } from './demographics.component';
import { TestingModule} from '../../../../../test';

describe('DemographicsComponent', () => {
  let component: DemographicsComponent;
  let fixture: ComponentFixture<DemographicsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ DemographicsComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemographicsComponent);
    component = fixture.componentInstance;
    component.patient = {

    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
