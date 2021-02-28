import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CarePlanService } from '../../../../services/care-plan.service';
import { IPatientAdherenceRow } from '../../../../services/care-plan-utils';
import { MatDialog } from '@angular/material/dialog';
import { EditGoalModalComponent } from './edit-goal-modal/edit-goal-modal.component';
import { FhirService } from '../../../../services/fhir.service';

// Maintain tasks sort order
const goalTypeComparator = (goal1: string, goal2: string) => {
  const priority = ['observation', 'education', 'exercise'];
  const index1 = priority.indexOf(goal1);
  const index2 = priority.indexOf(goal2);

  return index1 > index2 ? 1 : index1 < index2 ? -1 : 0;
};

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  readonly excludedGoalTypes = ['SMARTGoal'];

  goals: { [key: string]: IPatientAdherenceRow[]};
  goalTypes = new ReplaySubject<string[]>(1);
  refresh$ = new BehaviorSubject(null);
  loading = true;

  constructor(private carePlanService: CarePlanService,
              private dialog: MatDialog,
              private fhirService: FhirService) { }

  async ngOnInit() {
    this.loading = true;

    try {
      this.carePlan = await this.fhirService.get<fhir.CarePlan>('CarePlan', (this.carePlan || {id: ''}).id).toPromise();
    } catch (err) {
      console.error(err);
    }


    combineLatest([
      this.carePlanService.planGoals(this.carePlan),
      this.refresh$
    ]).pipe(
      map(([rows]) => {
        this.goals = this.carePlanService.goalsToGroupedRows(rows, this.carePlan);

        // Fixes ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loading = false;
        }, 0);

        // We don't need to show smart goals on this page
        this.excludedGoalTypes.forEach(type => {
          delete this.goals[type];
        });

        return this.goals;
      }),
      map(groupedRows => Object.keys(groupedRows).sort(goalTypeComparator))
    ).subscribe(this.goalTypes);
  }

  editGoal(adherence) {
    if (!this.isGoalActive(adherence)) {
      return void 0;
    }

    this.dialog.open(EditGoalModalComponent, {
      data: {
        adherence: adherence,
        carePlan: this.carePlan
      }
    }).afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.carePlan = result || this.carePlan;
      this.refresh$.next(null);
    });
  }

  isGoalActive(record) {
    return record && record.goal && record.goal.status !== 'cancelled' && record.goal.status !== 'achieved'
      // No editing goals for any other plan status
      && (this.carePlan.status === 'draft' || this.carePlan.status === 'active');
  }
}
