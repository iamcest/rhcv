import {
  Component,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef, ElementRef
} from '@angular/core';
import { formatLabel } from '@swimlane/ngx-charts';
import { select, selectAll } from 'd3-selection';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface IHeatmapCell {
  row: string;
  cell: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  data: string;
  date: moment.Moment;
  id: string;
  label: string;
  series: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'g[app-heatmap-cell-series]',
  templateUrl: './heatmap-cell-series.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeatmapCellSeriesComponent implements OnChanges, OnInit {

  @Input() data;
  @Input() colors;
  @Input() xScale;
  @Input() yScale;
  @Input() gradient: boolean;
  @Input() tooltipDisabled = false;
  @Input() tooltipText: any;
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() animations = true;
  @Input() rx = 0;
  @Input() min: number;
  @Input() today$: ReplaySubject<boolean>;

  @Output() select = new EventEmitter();

  cells: IHeatmapCell[];
  element: HTMLElement;

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnInit() {
    if (!this.tooltipText) {
      this.tooltipText = this.getTooltipText;
    }

    this.today$.pipe(debounceTime(250))
    .subscribe(val => {
      this.selectToday(this.cells);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update(): void {
    this.cells = this.getCells();
    this.selectToday(this.cells);
  }

  getCells(): IHeatmapCell[] {
    const cells: IHeatmapCell[] = [];

    this.data.map((row) => {
      row.series.map((cell) => {
        const {value, total, date, id, percentage} = cell;

        cells.push(<IHeatmapCell>{
          row,
          cell,
          x: this.xScale(row.name),
          y: this.yScale(cell.name),
          width: this.xScale.bandwidth(),
          height: this.yScale.bandwidth(),
          fill: Number.isNaN(percentage) ? '#fff' : this.colors.getColor(percentage),
          data: Number.isNaN(percentage) ? '0' : `${percentage}% (${value}/${total})`,
          date: date,
          id,
          label: formatLabel(cell.name),
          series: row.name
        });
      });
    });

    return cells;
  }

  selectToday(cells): void {
    let today = cells.find(c => moment(c.date).isSame(new Date(), 'day'));

    if (!today) {
      // Selecting top/left day if today's date is not included in the careplan
      today = cells.reduce((prev, current) => (prev.y <= current.y && prev.x <= current.x) ? prev : current);
    }

    if (today) {
      this.onClick(today);
    }
  }

  getTooltipText({ label, data, series, date }): string {
    const isToday = moment(date).isSame(new Date(), 'day');
    return `
      <span class="tooltip-label">${label} • ${date.format('DD MMM')} • ${series}${isToday ? ' (today)' : ''}</span>
      <span class="tooltip-val">${data.toLocaleString()}</span>
    `;
  }

  trackBy(index, item): string {
    return item.tooltipText;
  }

  onClick(event): void {
    this.select.emit(event);
    // Unselect everything
    select(this.element).selectAll('.rect').classed('selected', false);
    // Select the item clicked on
    select(this.element).select(`[id='${event.id}']`).classed('selected', true);
  }
}
