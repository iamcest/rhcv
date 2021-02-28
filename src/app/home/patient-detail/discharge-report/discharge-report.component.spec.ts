import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestingModule, medicationServiceStub } from '../../../../test';

import { DischargeReportComponent } from './discharge-report.component';
import { ActivatedRoute } from '@angular/router';
import { PipesModule } from '../../../pipes/pipes.module';
import { MedicationService } from '../../../services/medication.service';

describe('DischargeReportComponent', () => {
  let component: DischargeReportComponent;
  let fixture: ComponentFixture<DischargeReportComponent>;

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ DischargeReportComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MedicationService, useValue: medicationServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
