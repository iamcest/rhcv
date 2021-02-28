import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestingModule } from '../../../../test';
import { DesignComponent } from './design.component';
import { DemographicsComponent} from './demographics/demographics.component';
import { ActivatedRoute } from '@angular/router';
import { QuestionnaireComponent } from '../questionnaire/questionnaire.component';
import { QuestionComponent } from '../questionnaire/question.component';
import { ReviewScheduleComponent } from './review-schedule/review-schedule.component';
import { GoalsComponent } from './goals/goals.component';
import { ComponentsModule } from '../../../components/components.module';
import { AngularFhirModule } from '@cardihab/angular-fhir';
import { PlanHistoryComponent } from './plan-history/plan-history.component';
import { DischargeReportComponent } from '../discharge-report/discharge-report.component';

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


describe('DesignComponent', () => {
  let component: DesignComponent;
  let fixture: ComponentFixture<DesignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, ComponentsModule, AngularFhirModule],
      declarations: [ DesignComponent, DemographicsComponent, ReviewScheduleComponent, QuestionnaireComponent, QuestionComponent, GoalsComponent, PlanHistoryComponent, DischargeReportComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRouteStub},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
