import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComboChartComponent } from './combo-chart.component';
import { ComboSeriesVerticalComponent } from './combo-series-vertical.component';
import { TestingModule } from '../../../../../test';
import { ReportService } from '../../../../services/report.service';

xdescribe('ComboChartComponent', () => {
  let component: ComboChartComponent;
  let fixture: ComponentFixture<ComboChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ ComboChartComponent, ComboSeriesVerticalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboChartComponent);
    component = fixture.componentInstance;
    component.results = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
