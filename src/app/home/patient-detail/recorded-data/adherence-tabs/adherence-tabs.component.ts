import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// Smart goals are deliberately excluded, we don't want them here
export enum GoalType {
  Observations = 'observation',
  Exercise = 'exercise',
  Education = 'education'
}

@Component({
  selector: 'app-adherence-tabs',
  templateUrl: './adherence-tabs.component.html',
  styleUrls: ['./adherence-tabs.component.scss']
})
export class AdherenceTabsComponent {
  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  tablet$: Observable<boolean>;

  goalType: string;
  GoalType = GoalType;
  keys = Object.keys;

  constructor() {
    this.goalType = GoalType.Observations;
  }

  tabChanged($event) {
    this.goalType = GoalType[$event.tab.textLabel];
  }
}
