import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import * as moment from 'moment';
import { CarePlanService } from '../../../../../services/care-plan.service';
import { IPatientAdherenceRow } from '../../../../../services/care-plan-utils';
import { ISMARTGoal, ISMARTGoalFilters, ISMARTGoalRow, NOTES, STATUSES } from '../smart-goals.component';
import { clone, includes, isEqual, truncate } from 'lodash';
import { PRIORITIES } from '../smart-goals.component';

@Component({
  selector: 'app-smart-goal-list',
  templateUrl: './smart-goal-list.component.html',
  styleUrls: ['./smart-goal-list.component.scss']
})
export class SmartGoalListComponent implements OnInit {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  selectedGoal$: BehaviorSubject<ISMARTGoal>;

  @Input()
  filters: ISMARTGoalFilters;

  @Input()
  defaultFilters: ISMARTGoalFilters;

  goals: IPatientAdherenceRow[];
  rows: ISMARTGoal[];
  allRows: ISMARTGoal[];
  readonly priorities = PRIORITIES;
  readonly notes = of(NOTES);
  readonly statuses = of(STATUSES);

  loading = false;

  constructor(private carePlanService: CarePlanService) { }

  ngOnInit() {
    if (!this.filters) {
      this.filters = {};
    }

    this.loading = true;

    this.carePlanService.planGoals(this.carePlan).subscribe(goals => {
      this.allRows = goals.filter(g => g.record_type === 'SMARTGoal')
        .map(g => {
          const goal = g.goal;
            return <ISMARTGoal>{
              view: <ISMARTGoalRow>{
                id: goal.id,
                priority: {
                  short:  goal.priority.text,
                  full: goal.priority.coding[0].display
                },
                startDate: goal.startDate,
                dueDate: goal.target.dueDate,
                status: goal.status,
                name: g.name,
                description: goal.description.text,
                notes: goal.note.map(n => n.text ? n : void 0).filter(n => !!n) || [],
                notesPreview: truncate(goal.note.map(n => n.text ? `* ${n.text}` : void 0).filter(n => !!n).join('\n'), {length: 200}),
                daysRemaining: moment(goal.target.dueDate).fromNow(),
                sinceStarted: moment(goal.startDate).fromNow(),
                futureGoal: moment(goal.startDate).isAfter(moment())
              },
              raw: goal
            };
          }
        );

      this.loading = false;

      this.rows = this.applyFilters();
    });
  }

  getPriorityLabel(priority: string): string {
    const found = PRIORITIES.find(p => p.value === priority);
    return found ? found.name : priority;
  }

  applyFilters() {
    this.rows = this.allRows.slice();
    for (const key in this.filters) {
      if (this.filters.hasOwnProperty(key)) {
        switch (key) {
          case 'priority': {
            if (this.filters[key].length) {
              this.rows = this.rows.filter(row => includes(this.filters[key], row.view.priority.short));
            }
            break;
          }
          case 'name': {
            if (this.filters[key]) {
              this.rows = this.rows.filter(row => row.view.description.toLowerCase().includes(this.filters.name));
            }
            break;
          }
          case 'startDate': {
            if (this.filters[key]) {
              this.rows = this.rows.filter(row => moment(row.view.startDate).isSame(moment(this.filters.startDate), 'day'));
            }
            break;
          }
          case 'dueDate': {
            if (this.filters[key]) {
              this.rows = this.rows.filter(row => moment(row.view.dueDate).isSame(moment(this.filters.dueDate), 'day'));
            }
            break;
          }
          case 'notes': {
            if (this.filters[key].length) {
              if (this.filters[key].length === 1) {
                this.rows = this.rows.filter(row => this.filters[key][0] ? row.view.notes.length : row.view.notes.length === 0);
              }
            }
            break;
          }
          case 'status': {
            if (this.filters[key].length) {
              this.rows = this.rows.filter(row => includes(this.filters[key], row.view.status));
            }
            break;
          }
        }
      }
    }

    return this.rows;
  }

  isFiltered(filter: string): boolean {
    if (!this.filters || !this.defaultFilters) {
      return false;
    }
    return !isEqual(this.filters[filter], this.defaultFilters[filter]);
  }

  resetFilter(filter: string = '') {
    if (!this.filters || !this.defaultFilters) {
      return void 0;
    }

    if (filter) {
      this.filters[filter] = this.defaultFilters[filter];
    } else {
      this.filters = clone(this.defaultFilters);
    }

    this.applyFilters();

    return this.rows;
  }

  onSort(event) {
  }

  select($event) {
    this.selectedGoal$.next($event.selected[0]);
  }
}
