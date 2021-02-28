import { Component, Input, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IPatientAdherenceRow } from '../../../../services/care-plan-utils';
import * as moment from 'moment';
import { HeatMapComponent } from '@swimlane/ngx-charts';
import { Observable, ReplaySubject } from 'rxjs';
import { MedicationService } from '../../../../services/medication.service';
import { FhirService } from '../../../../services/fhir.service';
import { AdherenceService, IHeatmapItem } from '../../../../services/adherence.service';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
am4core.useTheme(am4themes_animated);

interface IHeatmapSettings {
  colourScheme: {
    domain: string[];
  };
  showXAxis: boolean;
  showYAxis: boolean;
  showLegend: boolean;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  roundedCorners: number;
  innerPadding: number;
  keepAspectRatio: boolean;
  min: number;
  max: number;
}

@Component({
  selector: 'app-adherence',
  templateUrl: './adherence.component.html',
  styleUrls: ['./adherence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdherenceComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  tablet$: Observable<boolean>;

  @Input()
  goalType: string;

  loading = false;
  today$: ReplaySubject<boolean> = new ReplaySubject();
  selection: { date: moment.Moment, items: IPatientAdherenceRow[] };
  goals: IPatientAdherenceRow[] = [];
  heatmapData: IHeatmapItem[] = [];
  chart;

  @ViewChild('heatmap')
  heatmapElement: ElementRef;
  colourScheme = {
    domain: ['#d8d8d8', '#cfe291', '#97c675', '#5b9643', '#49722e']
  };

  constructor(
    private medicationService: MedicationService,
    private fhirService: FhirService,
    private adherenceService: AdherenceService,
    private zone: NgZone,
    private changeDetector: ChangeDetectorRef
  ) {
    this.heatmapData = [];
    this.loading = true;
  }

  async ngOnInit() {
    if (this.patient && this.carePlan) {
      this.loading = true;
      // Reloading careplan here so it's up-to-date
      this.carePlan = await this.fhirService.get<fhir.CarePlan>('CarePlan', this.carePlan.id).toPromise();
      const medsOnly = this.goalType === 'medicine';
      // Fetching adherence data
      this.zone.runOutsideAngular(() => {

        this.medicationService.compileAdherence(this.patient, this.carePlan, false, medsOnly, !medsOnly)
          .subscribe(result => {
            this.goals = result;
            if (medsOnly) {
              const filteredGoals = this.goals.filter(hm => {

                if (hm.dosageText.length > 0) {

                  if (!hm.dosageText[0].includes('as needed')) {
                    return true;
                  }
                }
              });
              this.goals = filteredGoals;
            }
            if (this.carePlan) {
              this.heatmapData = this.adherenceService.getWeeklyValues(this.goals, this.carePlan, this.goalType);
              if (this.heatmapData.length > 0) {
                const today = moment();
                const todaysData = this.heatmapData.find(hm => {
                  if (today.isSame(hm.date, 'day')) {
                    return true;
                  }
                });
                if (todaysData) {
                  this.selection = { date: todaysData.date, items: todaysData.items };
                } else {
                  this.selection = { date: this.heatmapData[0].date, items: this.heatmapData[0].items };
                }
              }
            }
            this.loading = false;
            this.chart.data = this.heatmapData;
            this.changeDetector.detectChanges();
          });
      });
    }
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const chart = am4core.create(this.heatmapElement.nativeElement, am4charts.XYChart);
      chart.logo.disabled = true;
      this.heatmap(chart);
      this.chart = chart;
      this.changeDetector.detectChanges();
    });
  }

  onSelectionChanged(data: IHeatmapItem) {
    const date = data.date;
    this.selection = { date, items: data.items };
    this.changeDetector.detectChanges();
  }

  resetToToday() {
    this.today$.next(true);
  }


  heatmap(chart) {
    chart.maskBullets = false;

    const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    xAxis.dataFields.category = 'day';
    yAxis.dataFields.category = 'week';

    xAxis.renderer.grid.template.disabled = true;
    xAxis.renderer.minGridDistance = 40;

    yAxis.renderer.grid.template.disabled = true;
    yAxis.renderer.inversed = true;
    yAxis.renderer.minGridDistance = 30;

    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = 'day';
    series.dataFields.categoryY = 'week';
    series.dataFields.value = 'percentage';
    series.sequencedInterpolation = true;
    series.defaultState.transitionDuration = 3000;

    const bgColor = new am4core.InterfaceColorSet().getFor('background');

    const columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 1;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.stroke = bgColor;
    columnTemplate.tooltipText = '{date.formatDate("dd MMM, yyyy")}: {value}/{total}';
    columnTemplate.width = am4core.percent(100);
    columnTemplate.height = am4core.percent(100);

    series.heatRules.push({
      target: columnTemplate,
      property: 'fill',
      min: am4core.color('#eee'),
      max: am4core.color('green'),
      minValue: 0,
      maxValue: 100
    });

    // heat legend
    const heatLegend = chart.bottomAxesContainer.createChild(am4charts.HeatLegend);
    heatLegend.width = am4core.percent(100);
    heatLegend.series = series;
    heatLegend.valueAxis.renderer.labels.template.fontSize = 9;
    heatLegend.valueAxis.renderer.minGridDistance = 30;
    heatLegend.minValue = 0;
    heatLegend.maxValue = 100;


    const handleHover = (column) => {
      if (!isNaN(column.dataItem.value)) {
        heatLegend.valueAxis.showTooltipAt(column.dataItem.value);
      } else {
        heatLegend.valueAxis.hideTooltip();
      }
    };

    series.columns.template.column.adapter.add('fillOpacity', (fill, target) => {
      if (target.dataItem) {
        if (target.dataItem.value < 0) {
          return 0;
        }
      }
      return 1;
    });

    series.columns.template.column.adapter.add('stroke', (fill, target) => {
      if (target.dataItem && target.dataItem.dataContext) {
        if (moment().isSame(target.dataItem.dataContext.date, 'day')) {
          target.strokeWidth = 2;
          return am4core.color('#ec5529');
        }
      }
      return bgColor;
    });

    // heat legend behavior
    series.columns.template.events.on('over', (event) => {
      handleHover(event.target);
    });

    series.columns.template.events.on('hit', (event) => {
      if (event.target.dataItem && event.target.dataItem.dataContext && event.target.dataItem.dataContext.date) {
        this.onSelectionChanged(event.target.dataItem.dataContext as IHeatmapItem);
      }
    });

    series.columns.template.events.on('out', (event) => {
      heatLegend.valueAxis.hideTooltip();
    });
  }



}
