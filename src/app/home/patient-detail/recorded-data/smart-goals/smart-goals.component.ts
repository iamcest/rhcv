import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { clone } from 'lodash';
import { INameValue } from '../../patient-detail.component';

export interface ISMARTGoalRow {
  id: string;
  priority: {
    short: string;
    full: string;
  };
  startDate: string;
  dueDate: string;
  name: string;
  description: string;
  notes: fhir.Annotation[];
  notesPreview: string;
  status: string;
  daysRemaining: string;
  sinceStarted: string;
  futureGoal: boolean;
}

export interface ISMARTGoal {
  view: ISMARTGoalRow;
  raw: fhir.Goal;
}

export interface ISMARTGoalFilters {
  priority?: string[];
  name?: string;
  startDate?: string;
  dueDate?: string;
  notes?: boolean[];
  status?: string[];
}

export const PRIORITIES: INameValue[] = [
  {name: 'Low', value: 'low'},
  {name: 'Medium', value: 'medium'},
  {name: 'High', value: 'high'}
];

export const NOTES: INameValue[] = [
  {name: 'Has notes', value: true},
  {name: 'No notes', value: false}
];

export const STATUSES: INameValue[] = [
  {name: 'Achieved', value: 'achieved'},
  {name: 'In Progress', value: 'in-progress'}
];

@Component({
  selector: 'app-smart-goals',
  templateUrl: './smart-goals.component.html',
  styleUrls: ['./smart-goals.component.scss']
})
export class SmartGoalsComponent {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  selectedGoal$: BehaviorSubject<ISMARTGoal> = new BehaviorSubject(void 0);

  defaultFilters: ISMARTGoalFilters = {
    priority: PRIORITIES.map(item => item.value as string),
    name: '',
    startDate: '',
    dueDate: '',
    notes: NOTES.map(note => note.value as boolean),
    status: STATUSES.map(item => item.value as string)
  };

  // Storing filters in the parent component so that we can keep them
  // when going back to the list
  filters: ISMARTGoalFilters = clone(this.defaultFilters);
}
