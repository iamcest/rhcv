import { PatientService } from './../../../services/patient.service';
import { CarePlanService } from 'src/app/services/care-plan.service';
import { ActivatedRoute } from '@angular/router';
import { PipesModule } from './../../../pipes/pipes.module';
import { TestingModule, carePlanServiceStub, patientServiceStub } from './../../../../test';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientDetailIdentifyComponent } from './patient-detail-identify.component';

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

describe('PatientDetailIdentifyComponent', () => {
  let component: PatientDetailIdentifyComponent;
  let fixture: ComponentFixture<PatientDetailIdentifyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule ],
      declarations: [ PatientDetailIdentifyComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: CarePlanService, useValue: carePlanServiceStub },
        { provide: PatientService, useValue: patientServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
