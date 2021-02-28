import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ISMARTGoal } from '../smart-goals.component';
import { FhirService } from '../../../../../services/fhir.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isEmpty } from 'lodash';

@Component({
  selector: 'app-smart-goal-detail',
  templateUrl: './smart-goal-detail.component.html',
  styleUrls: ['./smart-goal-detail.component.scss']
})
export class SmartGoalDetailComponent implements OnInit, OnDestroy {

  @Input()
  patient: fhir.Patient;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  selectedGoal$: BehaviorSubject<ISMARTGoal>;

  selectedGoal: ISMARTGoal;

  subscription: Subscription;

  constructor(private fhirService: FhirService,
              private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    if (this.selectedGoal$) {
      this.subscription = this.selectedGoal$.subscribe(goal => {
        if (goal) {
          this.selectedGoal = goal;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  goBack() {
    this.selectedGoal$.next(void 0);
  }

  saveNote(note: fhir.Annotation) {
    // Only when there are no notes
    if (!this.selectedGoal.view.notes || isEmpty(this.selectedGoal.view.notes)) {
      this.selectedGoal.view.notes = [];
      this.selectedGoal.view.notes.push(note);
    }

    this.selectedGoal.raw.note = this.selectedGoal.raw.note || [];
    this.selectedGoal.raw.note.push(note);

    this.fhirService.save(this.selectedGoal.raw).toPromise().then(() => {
      this.snackbar.open('Note has been added', 'Close', {
        duration: 2000,
      });
    });
  }
}
