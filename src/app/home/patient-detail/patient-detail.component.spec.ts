import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientDetailComponent } from './patient-detail.component';
import { ActivatedRoute } from '@angular/router';
import { TestingModule } from '../../../test';
import { PatientDetailSideComponent } from './patient-detail-side/patient-detail-side.component';
import { PipesModule } from '../../pipes/pipes.module';
import { PatientDetailIdentifyComponent } from './patient-detail-identify/patient-detail-identify.component';
import { TelehealthComponent } from 'src/app/components/telehealth/telehealth.component';


const snapshot = {
    data: {
      carePlan: [],
      patient: {}
    },
    url: null,
    params: {
      patientId: 'new'
    },
    children: [{

    }]
};

const activatedRouteStub = {
  get snapshot() {
    return snapshot;
  }
};


describe('PatientDetailComponent', () => {
  let component: PatientDetailComponent;
  let fixture: ComponentFixture<PatientDetailComponent>;

  beforeEach(waitForAsync(() => {


    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ PatientDetailComponent, PatientDetailSideComponent, PatientDetailIdentifyComponent, TelehealthComponent ],
      providers:    [
        { provide: ActivatedRoute, useValue: activatedRouteStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
