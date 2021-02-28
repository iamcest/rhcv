import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as moment from 'moment';
import { FhirService } from 'src/app/services/fhir.service';

am4core.useTheme(am4themes_animated);

export interface IChartObservation {
  observation: {
    coding: fhir.Coding
    components?: {
      coding: fhir.Coding;
      legend?: string;
      unit?: string;
    }[];
  };
}

export interface IChartObservationConfig {
  name: string;
  yAxisLabel?: string;
  yAxisLabelRight?: string;
  minY?: number;
  maxY?: number;
  barPadding?: number;
  type: 'line' | 'bar';
  series?: IChartObservation[];
  deduplication?: 'sum' | 'sum-distinct' | 'none';
  tooltip?(ds: any): string;
  transform?(graphData: string, value: string, name: string, legend: string): void;
}

export const graphColors: any = {
  primary: '#153c58',
  secondary: '#44a4f5',
  ternary: '#ff4500',
};

export const seriesColours = [
  graphColors.primary, graphColors.secondary, graphColors.ternary
];

export const healthMeasureParams = {
  bloodPressure: {
    title: 'Blood Pressure (mmHg)',
    unit: 'mmHg',
    fields: ['systolic', 'diastolic', 'heartRate'],
  },
  heartRate: {
    title: 'Heart Rate',
    unit: 'bpm',
    fields: ['heartRate'],
  },
  weight: {
    title: 'Weight (kg)',
    unit: 'Kilograms',
    fields: ['weight'],
  },
  height: {
    title: 'Height (cm)',
    unit: 'Centimetres',
    fields: ['height'],
  },
  waist: {
    title: 'Waist (cm)',
    unit: 'Centimetres',
    fields: ['waist'],
  },
  bloodGlucose: {
    title: 'Blood Glucose (mmol)',
    unit: 'mmol',
    fields: ['bloodGlucose'],
  },
  alcohol: {
    title: 'Alcohol',
    unit: 'drink(s)',
    fields: ['alcohol'],
  },
  softDrink: {
    title: 'Soft Drink',
    unit: 'drink(s)',
    fields: ['softDrink'],
  },
  fruit: {
    title: 'Fruit',
    unit: 'fruit(s)',
    fields: ['fruit'],
  },
  vegetables: {
    title: 'Vegetables',
    unit: 'vegetables',
    fields: ['vegetables'],
  },
  water: {
    title: 'Water',
    unit: 'Glass(es) of water',
    fields: ['water'],
  },
  smoking: {
    title: 'Smoking',
    unit: 'smoke(s)',
    fields: ['smoking'],
  },
  steps: {
    title: 'Steps',
    unit: 'step(s)',
    fields: ['steps'],
  },
  sleep: {
    title: 'Sleep',
    unit: 'hour(s)',
    fields: ['sleepDuration', 'sleepAwakening'],
  },
  stressLevel: {
    title: 'Stress Level',
    unit: 'Stress level',
    fields: ['stressLevel'],
  },
};


export const OBSERVATION_CHART_CODES: IChartObservationConfig[] = [
  {
    name: 'Blood Pressure',
    type: 'line',
    series: [
      {
        observation: {
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '75367002' },
          components: [
            {
              coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '271649006' },
              legend: 'Systolic blood pressure',
              unit: 'mmHg'
            },
            {
              coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '271650006' },
              legend: 'Diastolic blood pressure',
              unit: 'mmHg'
            }
          ]
        }
      },
      {
        observation: {
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '364075005' },
          components: [{
            coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '364075005' },
            legend: 'Heart Rate',
            unit: 'bpm'
          }]
        },
      }
    ],
    yAxisLabel: 'mmHg',
    yAxisLabelRight: 'bpm',
    minY: 50,
    maxY: 200
  },
  {
    name: 'Blood Glucose',
    type: 'line', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '434912009' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '434912009' },
          legend: 'Blood Glucose',
          unit: 'mmol/L'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'Blood Glucose (mmol/L)',
  },
  {
    name: 'Waist Measurement',
    type: 'line', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '276361009' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '276361009' },
          legend: 'Waist Circumference',
          unit: 'cm'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'Waist Circumference'
  },
  {
    name: 'Body Weight',
    type: 'line', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '363808001' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '363808001' },
          legend: 'Body Weight',
          unit: 'kg'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'kg'
  },
  {
    name: 'Steps',
    type: 'line', series: [
      {
        observation: {
          coding: { system: 'http://loinc.org', code: '55423-8' },
          components: [{
            coding: { system: 'http://loinc.org', code: '55423-8' },
            legend: 'Number of steps',
            unit: 'steps/day'
          }]
        }
      }
    ],
    minY: 0,
    yAxisLabel: 'steps',
    deduplication: 'sum-distinct'
  },
  {
    name: 'Sleep',
    type: 'line', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '258158006' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '248263006' },
          legend: 'Duration of Sleep',
          unit: 'hours'
        },
        {
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '248254009' },
          legend: 'Quality of Sleep',
          unit: ''
        }]
      },
    }],
    yAxisLabel: 'Sleep (hours)',
    yAxisLabelRight: 'Quality of Sleep',
    tooltip: tooltipFn,
    transform: getLegend
  },
  {
    name: 'Stress',
    type: 'line', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '405052004' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '405052004' },
          legend: 'Stress',
          unit: ''
        }]
      },
    }],
    minY: 0,
    maxY: 10,
    yAxisLabel: 'Stress Level',
    barPadding: 1,
    tooltip: tooltipFn,
    transform: getLegend
  },
  {
    name: 'Water',
    type: 'bar', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226354008' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226354008' },
          legend: 'Water Intake',
          unit: 'glasses'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'Water (glasses)',
    barPadding: 1,
    deduplication: 'sum'
  },
  {
    name: 'Alcohol',
    type: 'bar', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '160573003' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '160573003' },
          legend: 'Alcohol Consumption',
          unit: 'standard drinks'
        }]
      },
    }],
    yAxisLabel: 'Alcohol (standard drinks)',
    minY: 0,
    barPadding: 1,
    deduplication: 'sum'
  },
  {
    name: 'Soft Drinks',
    type: 'bar', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226385004' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226385004' },
          legend: 'Soft Drinks',
          unit: 'glasses'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'Soft Drinks (glasses)',
    barPadding: 1,
    deduplication: 'sum'
  },
  {
    name: 'Vegetables',
    type: 'bar', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226448008' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226448008' },
          legend: 'Vegetable intake',
          unit: 'serves'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'Vegetables (serves)',
    barPadding: 1,
    deduplication: 'sum'
  },
  {
    name: 'Fruit',
    type: 'bar', series: [{
      observation: {
        coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226452008' },
        components: [{
          coding: { system: FhirService.IDENTIFIER_SYSTEMS.SNOMED, code: '226452008' },
          legend: 'Fruit Consumption',
          unit: 'serves'
        }]
      },
    }],
    minY: 0,
    yAxisLabel: 'Fruit (serves)',
    barPadding: 1,
    deduplication: 'sum'
  }
];

export function getLegend(graphData, value, name, legend) {
  if (legend === 'Quality of Sleep') {
    switch (value) {
      case 0:
        graphData[name]['title'] = 'VERY POOR';
        break;
      case 1:
        graphData[name]['title'] = 'POOR';
        break;
      case 2:
        graphData[name]['title'] = 'FAIR';
        break;
      case 3:
        graphData[name]['title'] = 'GOOD';
        break;
      case 4:
        graphData[name]['title'] = 'VERY GOOD';
        break;
      default:
        graphData[name]['title'] = value;
    }
  } else if (legend === 'Stress') {
      const level = STRESS_LEVELS.find(_level => {
        return parseInt(value, 10) === parseInt(_level.value, 10);
      });
      graphData[name]['title'] = level.valueText;

  }
}

export function tooltipFn(ds) {
  return (ds.name === 'Quality of Sleep' || ds.name === 'Stress') ? `${ds.name}: {${ds.text}}` : `${ds.name}: {${ds.name}} ${ds.unit}`;
}

export const graphConfig: any = {
  bloodPressure: dataMap => [
    {
      label: 'Systolic',
      field: 'systolic',
      data: dataMap.systolic,
      color: graphColors.primary,
    },
    {
      label: 'Diastolic',
      field: 'diastolic',
      data: dataMap.diastolic,
      color: graphColors.secondary,
    }
  ],
  heartRate: dataMap => [
    {
      label: 'Heart Rate',
      field: 'heartRate',
      data: dataMap.heartRate,
      color: graphColors.primary,
    }
  ],
  weight: dataMap => [{
    label: 'Weight (kg)',
    field: 'weight',
    data: dataMap.weight,
    color: graphColors.primary,
  }],
  height: dataMap => [{
    label: 'Height (cm)',
    field: 'height',
    data: dataMap.height,
    color: graphColors.primary,
  }],
  waist: dataMap => [{
    label: 'Waist (cm)',
    field: 'waist',
    data: dataMap.waist,
    color: graphColors.primary,
  }],
  bloodGlucose: dataMap => [{
    label: 'Glucose (mmol)',
    field: 'bloodGlucose',
    data: dataMap.bloodGlucose,
    color: graphColors.primary,
  }],
  alcohol: dataMap => [{
    label: 'Drink(s)',
    field: 'alcohol',
    data: dataMap.alcohol,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  softDrink: dataMap => [{
    label: 'Drink(s)',
    field: 'softDrink',
    data: dataMap.softDrink,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  fruit: dataMap => [{
    label: 'Fruit(s)',
    field: 'fruit',
    data: dataMap.fruit,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  vegetables: dataMap => [{
    label: 'Vegetable(s)',
    field: 'vegetables',
    data: dataMap.vegetables,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  water: dataMap => [{
    label: 'Water(s)',
    field: 'water',
    data: dataMap.water,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  smoking: dataMap => [{
    label: 'Smoke(s)',
    field: 'smoking',
    data: dataMap.smoking,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  steps: dataMap => [{
    label: 'Step(s)',
    field: 'steps',
    data: dataMap.steps,
    color: graphColors.ternary,
    backgroundColor: graphColors.ternary,
    borderWidth: 2,
  }],
  sleep: dataMap => [
    {
      label: 'Sleep Duration',
      field: 'sleepDuration',
      data: dataMap.sleepDuration,
      color: graphColors.primary,
    },
    {
      label: 'Sleep Awakening',
      field: 'sleepAwakening',
      data: dataMap.sleepAwakening,
      color: graphColors.secondary,
    }
  ],
  stressLevel: dataMap => [
    {
      label: 'Stress Level',
      field: 'stressLevel',
      data: dataMap.stressLevel,
      color: graphColors.primary,
    }
  ],
  activity: dataMap => [
    {
      label: 'Duration (minutes)',
      field: 'duration',
      data: dataMap.duration,
      color: graphColors.primary,
    }
  ],
};

export function getCalendarTime(date: Date, currentDate: Date = new Date()) {
  return moment(date).calendar(currentDate, {
    sameDay: '[Today]',
    lastDay: '[Yesterday]',
    lastWeek: function (now) {
      if (this.isSame(now, 'week')) {
        return '[This Week]';
      } else {
        return '[Last Week]';
      }
    },
    sameElse: function (now) {
      if (this.isSame(now, 'month')) {
        return '[This Month]';
      } else if (this.isBefore(now, 'month') && Math.abs(this.diff(now, 'months')) < 2) {
        return '[Last Month]';
      } else if (this.isSame(now, 'year')) {
        return '[This Year]';
      } else if (this.isBefore(now, 'year') && Math.abs(this.diff(now, 'years')) < 2) {
        return '[Last Year]';
      } else {
        return '[More than a year ago]';
      }
    }
  });
}


export const STRESS_LEVELS: { value: string; valueText: string }[] = [
  {
    value: '0',
    valueText: 'Completely relaxed, deep sleep.',
  },
  {
    value: '1',
    valueText: 'Awake but very relaxed.',
  },
  {
    value: '2',
    valueText: 'Relaxing at the beach.',
  },
  {
    value: '3',
    valueText: '\'Normal\' stress required to stay attentive.',
  },
  {
    value: '4',
    valueText: 'Tolerable mixed feelings, mild worry or anxiety.',
  },
  {
    value: '5',
    valueText: 'Distinctly unpleasant distress.',
  },
  {
    value: '6',
    valueText: 'Headache or upset stomach from unpleasant feelings.',
  },
  {
    value: '7',
    valueText: 'Unable to concentrate along with bodily distress.',
  },
  {
    value: '8',
    valueText: 'High distress making it difficult to work, drive, talk.',
  },
  {
    value: '9',
    valueText: 'High to extreme distress impairing thinking.',
  },
  {
    value: '10',
    valueText: 'Extreme distress, panic from worst stress imaginable.',
  },
];

export const INTENSITIES: { value: number, valueText: string; displayText: string }[] = [
  {
    value: 0,
    valueText: 'Nothing at all/No exertion at all',
    displayText: 'Nothing at all'
  },
  {
    value: 0.5,
    valueText: ' Very, very slight/Extremely light',
    displayText: 'Very, very slight'
  },
  {
    value: 1,
    valueText: 'Very slight/Extremely light',
    displayText: 'Very slight'
  },
  {
    value: 2,
    valueText: 'Slight/Very light',
    displayText: 'Slight'
  },
  {
    value: 3,
    valueText: 'Moderate/Fairly light',
    displayText: 'Moderate'
  },
  {
    value: 4,
    valueText: 'Somewhat severe/Somewhat hard”',
    displayText: 'Somewhat severe'
  },
  {
    value: 5,
    valueText: 'Severe/Hard',
    displayText: 'Severe'
  },
  {
    value: 6,
    valueText: '6',
    displayText: 'Almost Very Severe'
  },
  {
    value: 7,
    valueText: 'Very severe/Very hard',
    displayText: 'Very severe'
  },
  {
    value: 8,
    valueText: '8',
    displayText: 'Almost very, very severe'
  },
  {
    value: 9,
    valueText: 'Very, very severe (almost maximal)/Extremely hard”',
    displayText: 'Very, very severe'
  },
  {
    value: 10,
    valueText: 'Maximal',
    displayText: 'Maximal'
  },
];

export function generateChartData(datasets) {
  let chartData = [];
  datasets.forEach(data => {
    chartData = data.data
      .map(d => {
        d.date = new Date(d.date);
        return d;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  return chartData;
}

function mapParamsToDataset(paramName: Array<string>, diaryEntries: Array<any>) {
  return diaryEntries.map(entry => {
    const mappedData = {};
    mappedData['date'] = entry.recordedAt;
    paramName.forEach(name => {
      mappedData[name] = entry.data[name];
    });
    return mappedData;
  });

}

function getLabelForHealthEntryType(type: string, data: any): string {
  const params = healthMeasureParams[type];
  if (type === 'bloodPressure') {
    return `${data.systolic}/${data.diastolic} ${params.unit}`;
  } else if (type === 'sleep') {
    return `Slept for ${data.sleepDuration} hours,
      Woke up ${data.sleepAwakening} times,
      Quality: ${data.sleepQuality}`.replace(/\s+/g, ' ');
  } else if (type === 'stressLevel') {
    const level = STRESS_LEVELS.find(_level => {
      return parseInt(data.stressLevel, 10) === parseInt(_level.value, 10);
    });
    return `Stress Level: ${level.valueText}`;
  }
  return `${data[type]} ${params.unit}`;
}

function aggregateBarData(diaryEntries, type) {
  const dataSet = [];
  const grouped = diaryEntries.reduce(
    (result, value, index, array, key = moment(value.date).format('YYYY-MM-DD')) => ((result[key] || (result[key] = [])).push(value), result), {}
  );
  Object.keys(grouped).forEach(key => {
    const entriesForRange = grouped[key];
    dataSet.push(
      entriesForRange.reduce((acc, curr) => {
        acc[type] = (acc[type] || 0) + parseInt(curr[type], 10);
        acc.date = curr.date;
        return acc;
      }, {})
    );
  });
  return dataSet;
}

export function generateGraph(datasets: any[], config: { type: string, series: { name: string, text: string, unit: string, minY, maxY, tooltip }[] }) {
  // Create chart instance
  const chart = am4core.create('line-chart-container', am4charts.XYChart);
  chart.logo.disabled = true;
  if (config.type === 'line') {
    chart.data = datasets;
  } else {
    chart.data = aggregateBarData(datasets, config.series[0].name);
  }
  console.log(chart.data);
  // Create axes
  const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.tooltipDateFormat = 'MMM dd HH:mm';
  if (chart.data.length > 0) {
    const earliestDataPoint = chart.data[0];
    const latestDataPoint = chart.data[chart.data.length - 1];
    dateAxis.min = moment(earliestDataPoint.date).subtract(1, 'day').toDate().getTime();
    dateAxis.max = moment(latestDataPoint.date).add(1, 'day').toDate().getTime();
  }

  chart.cursor = new am4charts.XYCursor();
  chart.cursor.behavior = 'panX';
  chart.cursor.xAxis = dateAxis;
  chart.scrollbarX = new am4core.Scrollbar();
  chart.scrollbarX.minWidth = 50;
  chart.scrollbarX.parent = chart.bottomAxesContainer;
  chart.legend = new am4charts.Legend();
  chart.legend.parent = chart.topAxesContainer;

  const axes = {};
  config.series.forEach((ax, n) => {
    axes[ax.unit] = axes[ax.unit] || { series: [], minY: ax.minY, maxY: ax.maxY };
    axes[ax.unit].series.push(n);
  });

  Object.keys(axes).forEach((axis, index) => {
    axes[axis].chartAxis = chart.yAxes.push(new am4charts.ValueAxis());
    axes[axis].chartAxis.title.text = axis;
    axes[axis].chartAxis.min = axes[axis].minY;
    axes[axis].chartAxis.max = axes[axis].maxY;
    if (index > 0) {
      axes[axis].chartAxis.renderer.opposite = true;
    }
  });

  config.series.forEach((ds, n) => {
    const series = chart.series.push(config.type === 'line' ? new am4charts.LineSeries() : new am4charts.ColumnSeries());
    series.yAxis = axes[ds.unit].chartAxis;
    series.dataFields.valueY = ds.name;
    if (ds.name === 'Systolic blood pressure') {
      series.dataFields.openValueY = 'Diastolic blood pressure';
      series.sequencedInterpolation = true;
      series.fillOpacity = 0.3;
    }
    series.bullets.push(new am4charts.CircleBullet());
    series.name = ds.name;
    series.dataFields.dateX = 'date';
    series.tooltipText = ds.tooltip ? ds.tooltip(ds) : `${ds.name}: {${ds.name}} ${ds.unit}`;
    series.stroke = series.fill = am4core.color(seriesColours[n]);
    series.tooltip.pointerOrientation = 'vertical';
    if (config.type === 'bar') {
      dateAxis.baseInterval = {
        timeUnit: 'day',
        count: 1
      };
      series.sequencedInterpolation = true;
      (series as am4charts.ColumnSeries).columns.template.column.cornerRadiusTopLeft = 10;
      (series as am4charts.ColumnSeries).columns.template.column.cornerRadiusTopRight = 10;
      (series as am4charts.ColumnSeries).columns.template.column.fillOpacity = 0.8;
    }

  });

  return chart;
}
