import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartsComponent } from './charts.component';
import { TestingModule, patientServiceStub, fhirServiceStub } from '../../../../../test';
import { PatientService } from '../../../../services/patient.service';
import { ComboChartComponent } from '../combo-chart/combo-chart.component';
import { ComboSeriesVerticalComponent } from '../combo-chart/combo-series-vertical.component';
import { FhirService } from '../../../../services/fhir.service';

describe('ChartsComponent', () => {
  let component: ChartsComponent;
  let fixture: ComponentFixture<ChartsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ ChartsComponent, ComboChartComponent, ComboSeriesVerticalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
