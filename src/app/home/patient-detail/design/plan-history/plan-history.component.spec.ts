import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlanHistoryComponent } from './plan-history.component';
import { TestingModule } from 'src/test';
import { DischargeReportComponent } from '../../discharge-report/discharge-report.component';
import { AngularFhirModule } from '@cardihab/angular-fhir';

describe('PlanHistoryComponent', () => {
  let component: PlanHistoryComponent;
  let fixture: ComponentFixture<PlanHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, AngularFhirModule],
      declarations: [ PlanHistoryComponent, DischargeReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
