import { Component, Input } from '@angular/core';

const STATUSES = [
  {status: 'proposed', icon: 'stars'},
  {status: 'accepted', icon: 'stars'},
  {status: 'in-progress', icon: 'stars'},
  {status: 'rejected', icon: 'not_interested'},
  {status: 'achieved', icon: 'check_circle_outline'},
  {status: 'cancelled', icon: 'cancel'}
];

@Component({
  selector: 'app-goal-status',
  templateUrl: './goal-status.component.html',
  styleUrls: ['./goal-status.component.scss']
})
export class GoalStatusComponent {
  @Input()
  status: string;

  getStatus(status: string) {
    return STATUSES.find(s => s.status === status);
  }
}
