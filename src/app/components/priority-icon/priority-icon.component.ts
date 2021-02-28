import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-priority-icon',
  templateUrl: './priority-icon.component.html',
  styleUrls: ['./priority-icon.component.scss']
})
export class PriorityIconComponent {
  @Input()
  priority: string;
}
