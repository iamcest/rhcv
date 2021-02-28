import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ElementRef,
  OnChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { select, selectAll } from 'd3-selection';
import { id } from '../utils/id';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'g[app-heatmap-cell]',
  templateUrl: './heatmap-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatmapCellComponent implements OnChanges {

  @Input() fill;
  @Input() x;
  @Input() y;
  @Input() width;
  @Input() height;
  @Input() data;
  @Input() date;
  @Input() label;
  @Input() gradient = false;
  @Input() animations = true;
  @Input() rx = 0;
  @Input() id: string = void 0;

  @Output() select = new EventEmitter();

  element: HTMLElement;
  transform: string;
  activeRange: any[];
  startOpacity: number;
  gradientId: string;
  gradientUrl: string;
  gradientStops: any[];

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.transform = `translate(${this.x} , ${this.y})`;

    this.startOpacity = 0.3;
    this.gradientId = 'grad' + id().toString();
    this.gradientUrl = `url(#${this.gradientId})`;
    this.gradientStops = this.getGradientStops();

    if (this.animations) {
      this.loadAnimation();
    }
  }

  getGradientStops(): any[] {
    return [
      {
        offset: 0,
        color: this.fill,
        opacity: this.startOpacity
      },
      {
        offset: 100,
        color: this.fill,
        opacity: 1
      }];
  }

  loadAnimation(): void {
    const node = select(this.element).select('.cell');
    node.attr('opacity', 0);
    this.animateToCurrentForm();
  }

  animateToCurrentForm(): void {
    const node = select(this.element).select('.cell');

    node.transition().duration(750)
    .attr('opacity', 1);
  }

  onClick($event): void {
    this.select.emit(this.data);
  }
}
