import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionnaireComponent } from './questionnaire.component';
import { TestingModule, fhirServiceStub } from '../../../../test';
import { QuestionComponent } from './question.component';
import { FhirService } from '../../../services/fhir.service';

describe('QuestionnaireComponent', () => {
  let component: QuestionnaireComponent;
  let fixture: ComponentFixture<QuestionnaireComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ QuestionnaireComponent, QuestionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireComponent);
    component = fixture.componentInstance;
    component.questionnaire = {} as fhir.Questionnaire;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
