import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PatientDetailSideComponent } from './patient-detail-side.component';
import { carePlanServiceStub, patientServiceStub, TestingModule } from '../../../../test';
import { ReportService} from '../../../services/report.service';
import { ActivatedRoute } from '@angular/router';
import { PipesModule } from '../../../pipes/pipes.module';
import { CarePlanService } from '../../../services/care-plan.service';
import { PatientService } from '../../../services/patient.service';


const snapshot = {
    data: {
      patient: {},
      carePlan: [{}],
    },
    url: null
};


const activatedRouteStub = {
  get snapshot() {
    return snapshot;
  }
};


describe('PatientDetailSideComponent', () => {
  let component: PatientDetailSideComponent;
  let fixture: ComponentFixture<PatientDetailSideComponent>;
  const reportServiceStub: Partial<ReportService> = {
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule ],
      declarations: [ PatientDetailSideComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: CarePlanService, useValue: carePlanServiceStub },
        { provide: PatientService, useValue: patientServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
