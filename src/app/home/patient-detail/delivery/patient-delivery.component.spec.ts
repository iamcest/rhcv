import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientDeliveryComponent } from './patient-delivery.component';
import { TestingModule } from '../../../../test';
import { ReviewComponent } from './review/review.component';
import { QuestionnaireComponent } from '../questionnaire/questionnaire.component';
import { ActivatedRoute } from '@angular/router';
import { QuestionComponent } from '../questionnaire/question.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { ComponentsModule } from '../../../components/components.module';


const snapshot = {

  snapshot: {
    data: {
      patient: {
        carePlan: {},
        patient: {}
      }
    },
    url: null
  },
};

const activatedRouteStub = {
  get parent() {
    return snapshot;
  }
};

describe('PatientDeliveryComponent', () => {
  let component: PatientDeliveryComponent;
  let fixture: ComponentFixture<PatientDeliveryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule, ComponentsModule],
      declarations: [ PatientDeliveryComponent, ReviewComponent, QuestionnaireComponent, QuestionComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
