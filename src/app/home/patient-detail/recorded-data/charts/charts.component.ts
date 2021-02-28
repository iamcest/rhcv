import { Component, Input, OnInit, NgZone, OnDestroy } from '@angular/core';
import { PatientService } from '../../../../services/patient.service';
import * as moment from 'moment';
import * as am4charts from '@amcharts/amcharts4/charts';
import { generateGraph, IChartObservationConfig, OBSERVATION_CHART_CODES } from './chart-config';
import { tag } from 'src/app/utils/analytics';
import { Router } from '@angular/router';



@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, OnDestroy {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  isDiabetic: boolean;
  availableCharts: any[] = [];
  loadingChart = false;

  selectedMeasure: IChartObservationConfig = OBSERVATION_CHART_CODES[0];

  endDate: Date;
  startDate: Date;


  // amcharts port
  graph: am4charts.XYChart;

  constructor(private patientService: PatientService, private zone: NgZone, private router: Router) { }

  async ngOnInit() {
    this.patientService.isDiabetic(this.patient).subscribe(result => {
      this.isDiabetic = result;
      // Only return the charts that have no hide function or it returns false
      this.availableCharts = OBSERVATION_CHART_CODES;
      // .filter(c => !c.hide || (isFunction(c.hide) && !c.hide()));
    });

    this.onMeasurementChange(this.selectedMeasure);
    if (this.carePlan && this.carePlan.period) {
      this.startDate = moment(this.carePlan.period.start).toDate();
      this.endDate = moment(this.carePlan.period.end).toDate();
    }
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.graph) {
        this.graph.dispose();
      }
    });
  }

  fillDefaultBarData() {
    let date = moment.parseZone(this.carePlan.period.start);
    const result = [];
    while (moment.parseZone(this.carePlan.period.end).diff(date, 'days') !== -1) {
      result.push({
        name: this.formatDateForDisplay(date),
        value: 0,
        date: date
      });

      date = moment(date).clone().add(1, 'days');
    }

    return result;
  }

  formatDateForDisplay(date) {
    return moment(date).format('D MMM');
  }


  onMeasurementChange(measure) {
    this.loadingChart = true;
    this.selectedMeasure = measure;
    tag(this.router.routerState.root.snapshot, `charts/${measure.name}`);

    // fetch the observations
    const codes = [];
    const chartSeries = [];
    (this.selectedMeasure.series || []).forEach(m => {
      codes.push(m.observation.coding.code);
      m.observation.components.forEach(comp => {
        const line: any = {
          series: `${comp.coding.system}/${comp.coding.code}`,
          legend: comp.legend,
          unit: comp.unit,
          minY: this.selectedMeasure.minY,
          maxY: this.selectedMeasure.maxY,
        };
        chartSeries.push(line);
      });
    });

    this.patientService.patientObservations(this.patient, {
      code: codes.join(',')
    }, false).subscribe(observations => {
      const series: any = {};
      (observations.entry || []).forEach(obs => {
        const ob = obs.resource;
        (ob.component || []).forEach(v => {
          const seriesKey = `${v.code.coding[0].system}/${v.code.coding[0].code}`;
          if (!series[seriesKey]) {
            series[seriesKey] = [];
          }
          if (v.valueQuantity) {
            series[seriesKey].push({
              name: ob.effectiveDateTime,
              value: v.valueQuantity.value,
              unit: v.valueQuantity.unit
            });
          } else if (v.valueCodeableConcept) {
            series[seriesKey].push({
              name: ob.effectiveDateTime,
              value: Number(v.valueCodeableConcept.coding[0].code),
              unit: v.code.coding[0].display
            });
          }
        });
      });

      const config = {
        type: this.selectedMeasure.type,
        series: []
      };

      const graphData: {
        [key: string]: {
          date: Date,
          records?: any[];
        };
      } = {};
      chartSeries.forEach(s => {
        config.series.push({
          name: s.legend,
          text: 'title',
          unit: s.unit,
          minY: s.minY,
          maxY: s.maxY,
          tooltip: this.selectedMeasure.tooltip
        });

        (series[s.series] || []).forEach(t => {
          const date = moment(t.name).toDate();
          graphData[t.name] = graphData[t.name] || { date, records: [] };
          graphData[t.name].records.push(t);
          if (graphData[t.name].records.length > 1) {
            if (this.selectedMeasure.deduplication === 'sum') {
              graphData[t.name][s.legend] += t.value;
            } else if (this.selectedMeasure.deduplication === 'sum-distinct') {
              graphData[t.name][s.legend] = graphData[t.name].records
                .sort((a, b) => a[t.name] - b[t.name])
                .reduce((sum, val, currentIndex, array) => {
                  // const prevVal = array[currentIndex - 1][t.name];
                  if (currentIndex === 0 || array[currentIndex - 1].value !== val.value) {
                    sum += val.value;
                  }
                  return sum;
                }, 0);
            } else {
              graphData[t.name][s.legend] = t.value;
            }
          } else {
            graphData[t.name][s.legend] = t.value;
          }
          if (measure.transform) {
          // if (measure.transform !== null && measure.transform !== undefined) {
            measure.transform(graphData, t.value, t.name, s.legend);
          }
          if (measure.transform) {
          // if (measure.transform !== null && measure.transform !== undefined) {
            measure.transform(graphData, t.value, t.name, s.legend);
          }
        });
      });
      const allSeries = Object.values(graphData).sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });

      this.zone.runOutsideAngular(() => {
        if (this.graph) {
          this.graph.dispose();
          this.graph = null;
        }
        this.graph = generateGraph(allSeries, config);
      });
      this.loadingChart = false;
    });
  }



}
