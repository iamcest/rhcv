import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef
} from '@angular/core';
import { scaleBand } from 'd3-scale';
import {
  BaseChartComponent,
  calculateViewDimensions,
  ViewDimensions,
  ColorHelper,
  getScaleType
} from '@swimlane/ngx-charts';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./heatmap.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeatmapComponent extends BaseChartComponent {

  @Input() legend;
  @Input() legendTitle = 'Legend';
  @Input() legendPosition = 'right';
  @Input() xAxis;
  @Input() yAxis;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() xAxisLabel;
  @Input() yAxisLabel;
  @Input() gradient: boolean;
  @Input() innerPadding: number | number[] = 8;
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() xAxisTicks: any[];
  @Input() yAxisTicks: any[];
  @Input() tooltipDisabled = false;
  @Input() tooltipText: any;
  @Input() min: any;
  @Input() max: any;
  @Input() roundedCorners = 0;
  @Input() today$: ReplaySubject<boolean>;
  @Input() keepAspectRatio: boolean;

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;

  dims: ViewDimensions;
  xAxisDims: ViewDimensions;
  xDomain: any[];
  yDomain: any[];
  valueDomain: any[];
  xScale: any;
  yScale: any;
  color: any;
  colors: ColorHelper;
  transform: string;
  rects: any[];
  margin = [10, 20, 10, 20];
  xAxisHeight = 0;
  yAxisWidth = 0;
  legendOptions: any;
  scaleType = 'linear';
  // This makes x axis sit at the top
  verticalOffsetTransform = `translate(0, 38)`;

  update(): void {
    super.update();
    this.formatDates();

    this.xDomain = this.getXDomain();
    this.yDomain = this.getYDomain();
    this.valueDomain = this.getValueDomain();

    this.scaleType = getScaleType(this.valueDomain, false);

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
      legendType: this.scaleType,
      legendPosition: this.legendPosition
    });

    // This makes x axis sit at the top
    this.xAxisDims = Object.assign({}, this.dims, {height: 0});

    if (this.scaleType === 'linear') {
      let min = this.min;
      let max = this.max;
      if (!this.min) {
        min = Math.min(0, ...this.valueDomain);
      }
      if (!this.max) {
        max = Math.max(...this.valueDomain);
      }
      this.valueDomain = [min, max];
    }

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.rects = this.getRects();
  }

  getXDomain(): any {
    const domain = [];
    for (const group of this.results) {
      if (!domain.includes(group.name)) {
        domain.push(group.name);
      }
    }

    return domain;
  }

  getYDomain(): any[] {
    const domain = [];

    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.name)) {
          domain.push(d.name);
        }
      }
    }

    return domain;
  }

  getValueDomain(): any[] {
    const domain = [];

    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.value)) {
          domain.push(d.value);
        }
      }
    }

    return domain;
  }

  /**
   * Converts the input to gap paddingInner in fraction
   * Supports the following inputs:
   *    Numbers: 8
   *    Strings: "8", "8px", "8%"
   *    Arrays: [8,2], "8,2", "[8,2]"
   *    Mixed: [8,"2%"], ["8px","2%"], "8,2%", "[8,2%]"
   *
   * @param {(string | number | Array<string | number>)} value
   * @param {number} [index=0]
   * @param {number} N
   * @param {number} L
   * @returns {number}
   *
   * @memberOf HeatMapComponent
   */
  getDimension(value: string | number | Array<string | number>, index = 0, N: number, L: number): number {
    if (typeof value === 'string') {
      value = value
      .replace('[', '')
      .replace(']', '')
      .replace('px', '')
      .replace('\'', '');

      if (value.includes(',')) {
        value = value.split(',');
      }
    }
    if (Array.isArray(value) && typeof index === 'number') {
      return this.getDimension(value[index], null, N, L);
    }
    if (typeof value === 'string' && value.includes('%')) {
      return +value.replace('%', '') / 100;
    }
    return N / (L / +value + 1);
  }

  getXScale(): any {
    const f = this.getDimension(this.innerPadding, 0, this.xDomain.length, this.dims.width);
    return scaleBand()
    .rangeRound([0, this.dims.width])
    .domain(this.xDomain)
    .paddingInner(f);
  }

  getYScale(): any {
    const dimension = this.keepAspectRatio ? this.dims.width : this.dims.height;
    const f = this.getDimension(this.innerPadding, 1, this.yDomain.length, dimension);
    return scaleBand()
    .rangeRound([dimension, 0])
    .domain(this.yDomain)
    .paddingInner(f);
  }

  getRects(): any[] {
    const rects = [];

    this.xDomain.map((xVal) => {
      this.yDomain.map((yVal) => {
        rects.push({
          x: this.xScale(xVal),
          y: this.yScale(yVal),
          rx: this.roundedCorners,
          width: this.xScale.bandwidth(),
          height: this.yScale.bandwidth(),
          fill: 'rgba(200,200,200,0.03)'
        });
      });
    });

    return rects;
  }

  onClick(data): void {
    this.select.emit(data);
  }

  setColors(): void {
    this.colors = new ColorHelper(this.scheme, this.scaleType, this.valueDomain);
  }

  getLegendOptions() {
    return {
      scaleType: this.scaleType,
      domain: this.valueDomain,
      colors: this.scaleType === 'ordinal' ? this.colors : this.colors.scale,
      title: this.scaleType === 'ordinal' ? this.legendTitle : undefined,
      position: this.legendPosition
    };
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

}
