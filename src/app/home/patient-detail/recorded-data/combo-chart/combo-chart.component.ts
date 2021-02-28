import { Component, Input, ViewChild, ContentChild, TemplateRef, HostListener } from '@angular/core';
import { ViewDimensions, ColorHelper, LineSeriesComponent, BaseChartComponent, calculateViewDimensions, XAxisTicksComponent } from '@swimlane/ngx-charts';
import { area, line, curveLinear } from 'd3-shape';
import { scaleBand, scaleLinear, scalePoint, scaleTime } from 'd3-scale';

@Component({
  selector: 'app-combo-chart',
  templateUrl: './combo-chart.component.html',
  styleUrls: ['./combo-chart.component.scss']
})
export class ComboChartComponent extends BaseChartComponent {

  @ViewChild(LineSeriesComponent) lineSeriesComponent: LineSeriesComponent;
  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
  @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<any>;

  @Input() results: any;
  @Input() curve: any = curveLinear;
  @Input() legend = false;
  @Input() legendTitle = 'Legend';
  @Input() xAxis;
  @Input() yAxis;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() showRightYAxisLabel;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() yAxisLabelRight;
  @Input() tooltipDisabled = false;
  @Input() gradient = false;
  @Input() showGridLines = true;
  @Input() activeEntries: any[] = [];
  @Input() schemeType: string;
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() yRightAxisTickFormatting: any;
  @Input() roundDomains = false;
  @Input() colorSchemeLine: any = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: ['#01579b', '#7aa3e5', '#a8385d', '#00bfa5']
  };
  @Input() autoScale;
  @Input() lineChart: any;
  @Input() yLeftAxisScaleFactor: any;
  @Input() yRightAxisScaleFactor: any;
  @Input() rangeFillOpacity: number;
  @Input() animations = true;
  @Input() barPadding = 8;
  @Input() yScaleMin: number;
  @Input() yScaleMax: number;

  dims: ViewDimensions;
  xScale: any;
  yScale: any;
  xDomain: any;
  yDomain: any;
  transform: string;
  colors: ColorHelper;
  colorsLine: ColorHelper;
  margin: any[] = [10, 20, 10, 20];
  xAxisHeight = 0;
  yAxisWidth = 0;
  legendOptions: any;
  scaleType = 'linear';
  xScaleLine;
  yScaleLine;
  xDomainLine;
  yDomainLine;
  seriesDomain;
  scaledAxis;
  combinedSeries;
  xSet;
  filteredDomain;
  hoveredVertical;
  yOrientLeft = 'left';
  yOrientRight = 'right';
  legendSpacing = 0;
  bandwidth;
  clipPath;

  trackBy(index, item): string {
    return item.name;
  }

  update(): void {
    super.update();
    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
      showLegend: this.legend,
      legendType: this.schemeType
    });

    if (!this.yAxis) {
      this.legendSpacing = 0;
    } else if (this.showYAxisLabel && this.yAxis) {
      this.legendSpacing = 100;
    } else {
      this.legendSpacing = 40;
    }
    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    // line chart
    this.xDomainLine = this.getXDomainLine();
    if (this.filteredDomain) {
      this.xDomainLine = this.filteredDomain;
    }

    this.yDomainLine = this.getYDomainLine();
    this.seriesDomain = this.getSeriesDomain();

    this.xScaleLine = this.getXScaleLine(this.xDomainLine, this.dims.width);
    this.yScaleLine = this.getYScaleLine(this.yDomainLine, this.dims.height);

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${ this.dims.xOffset } , ${ this.margin[0] })`;
  }

  deactivateAll() {
    this.activeEntries = [...this.activeEntries];
    for (const entry of this.activeEntries) {
      // this.deactivate.emit({ value: entry, entries: [] });
    }
    this.activeEntries = [];
  }

  @HostListener('mouseleave')
  hideCircles(): void {
    this.hoveredVertical = null;
    this.deactivateAll();
  }

  updateHoveredVertical(item): void {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomainLine = this.filteredDomain;
    this.xScaleLine = this.getXScaleLine(this.xDomainLine, this.dims.width);
  }

  getSeriesDomain(): any[] {
    this.combinedSeries = this.lineChart.slice(0);
    this.combinedSeries.push({
      name: this.yAxisLabel,
      series: this.results
    });
    return this.combinedSeries.map(d => d.name);
  }

  isDate(value): boolean {
    if (value instanceof Date) {
      return true;
    }

    return false;
  }

  getScaleType(values): string {
    let date = true;
    let num = true;

    for (const value of values) {
      if (!this.isDate(value)) {
        date = false;
      }

      if (typeof value !== 'number') {
        num = false;
      }
    }

    if (date) { return 'time'; }
    if (num) { return 'linear'; }
    return 'ordinal';
  }

  getXDomainLine(): any[] {
    let values = [];

    for (const results of this.lineChart) {
      for (const d of results.series) {
        if (!values.includes(d.name)) {
          values.push(d.name);
        }
      }
    }

    this.scaleType = this.getScaleType(values);
    let domain = [];

    if (this.scaleType === 'time') {
      const min = Math.min(...values);
      const max = Math.max(...values);
      domain = [min, max];
    } else if (this.scaleType === 'linear') {
      values = values.map(v => Number(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      domain = [min, max];
    } else {
      domain = values;
    }

    this.xSet = values;
    return domain;
  }

  getYDomainLine(): any[] {
    const domain = [];

    for (const results of this.lineChart) {
      for (const d of results.series) {
        if (domain.indexOf(d.value) < 0) {
          domain.push(d.value);
        }
        if (d.min !== undefined) {
          if (domain.indexOf(d.min) < 0) {
            domain.push(d.min);
          }
        }
        if (d.max !== undefined) {
          if (domain.indexOf(d.max) < 0) {
            domain.push(d.max);
          }
        }
      }
    }

    let min = Math.min(...domain);
    const max = Math.max(...domain);
    if (this.yRightAxisScaleFactor) {
      const minMax = this.yRightAxisScaleFactor(min, max);
      return [Math.min(0, minMax.min), minMax.max];
    } else {
      min = Math.min(0, min);
      return [min, max];
    }
  }

  getXScaleLine(domain, width): any {
    let scale;
    if (this.bandwidth === undefined) {
      this.bandwidth = (this.dims.width - this.barPadding);
    }

    if (this.scaleType === 'time') {
      scale = scaleTime()
        .range([0, width])
        .domain(domain);
    } else if (this.scaleType === 'linear') {
      scale = scaleLinear()
        .range([0, width])
        .domain(domain);

      if (this.roundDomains) {
        scale = scale.nice();
      }
    } else if (this.scaleType === 'ordinal') {
      scale = scalePoint()
        .range([this.bandwidth / 2, width - this.bandwidth / 2])
        .domain(domain);
    }

    return scale;
  }

  getYScaleLine(domain, height): any {
    const scale = scaleLinear()
      .range([height, 0])
      .domain(domain);

    return this.roundDomains ? scale.nice() : scale;
  }

  getXScale(): any {
    this.xDomain = this.getXDomain();
    const spacing = this.xDomain.length / (this.dims.width / this.barPadding + 1);
    return scaleBand()
      .rangeRound([0, this.dims.width])
      .paddingInner(spacing)
      .domain(this.xDomain);
  }

  getYScale(): any {
    this.yDomain = this.getYDomain();
    const scale = scaleLinear()
      .range([this.dims.height, 0])
      .domain(this.yDomain);
    return this.roundDomains ? scale.nice() : scale;
  }

  getXDomain(): any[] {
    return this.results.map(d => d.name);
  }

  getYDomain() {
    const values = this.results.map(d => d.value);
    const min = this.yScaleMin || Math.min(0, ...values);
    const max = this.yScaleMax || Math.max(...values);
    if (this.yLeftAxisScaleFactor) {
      const minMax = this.yLeftAxisScaleFactor(min, max);
      return [ Math.min(0, minMax.min), minMax.max];
    } else {
      return [min, max];
    }
  }

  onClick(data) {
    this.select.emit(data);
  }

  setColors(): void {
    let domain;
    if (this.schemeType === 'ordinal') {
      domain = this.xDomain;
    } else {
      domain = this.yDomain;
    }
    this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    this.colorsLine = new ColorHelper(this.colorSchemeLine, this.schemeType, domain, this.customColors);
  }

  getLegendOptions() {
    const opts = {
      scaleType: this.schemeType,
      colors: undefined,
      domain: [],
      title: undefined,
      position: 'right'
    };
    if (opts.scaleType === 'ordinal') {
      opts.domain = this.seriesDomain;
      opts.colors = this.colorsLine;
      opts.title = this.legendTitle;
    } else {
      opts.domain = this.seriesDomain;
      opts.colors = this.colors.scale;
    }
    return opts;
  }

  updateLineWidth(width): void {
    this.bandwidth = width;
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width + 20;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  onActivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [ item, ...this.activeEntries ];
    // this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item) {
    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    // this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  // data: line chart (bp)
  // [
  // {
  //   "name": "Saint Pierre and Miquelon",
  //   "series": [
  //     {
  //       "value": 4364,
  //       "name": "2016-09-17T02:14:34.176Z"
  //     },
  //     {
  //       "value": 6938,
  //       "name": "2016-09-19T10:38:32.989Z"
  //     },
  //     {
  //       "value": 2743,
  //       "name": "2016-09-20T01:06:38.961Z"
  //     },
  //     {
  //       "value": 5126,
  //       "name": "2016-09-21T05:17:30.847Z"
  //     },
  //     {
  //       "value": 6669,
  //       "name": "2016-09-17T19:08:00.874Z"
  //     }
  //   ]
  // }]

  // tslint:disable-next-line:member-ordering
  static DATA1 = [
    {
      'name': 'USA',
      'value': 50000
    },
    {
      'name': 'United Kingdom',
      'value': 30000
    },
    {
      'name': 'France',
      'value': 10000
    },
    {
      'name': 'Japan',
      'value': 5000
    },
    {
      'name': 'China',
      'value': 500
    }
  ];

  // tslint:disable-next-line:member-ordering
  static DATA2 = [
    {
      'name': 'Tablets',
      'series': [
        {
          'name': 'USA',
          'value': 50
        },
        {
          'value': 80,
          'name': 'United Kingdom'
        },
        {
          'value': 85,
          'name': 'France'
        },
        {
          'value': 90,
          'name': 'Japan'
        },
        {
          'value': 100,
          'name': 'China'
        }
      ]
    },
    {
      'name': 'Cell Phones',
      'series': [
        {
          'value': 10,
          'name': 'USA'
        },
        {
          'value': 20,
          'name': 'United Kingdom'
        },
        {
          'value': 30,
          'name': 'France'
        },
        {
          'value': 40,
          'name': 'Japan'
        },
        {
          'value': 10,
          'name': 'China'
        }
      ]
    },
    {
      'name': 'Computers',
      'series': [
        {
          'value': 2,
          'name': 'USA'
        },
        {
          'value': 4,
          'name': 'United Kingdom'
        },
        {
          'value': 20,
          'name': 'France'
        },
        {
          'value': 30,
          'name': 'Japan'
        },
        {
          'value': 35,
          'name': 'China'
        }
      ]
    }
  ];
}
