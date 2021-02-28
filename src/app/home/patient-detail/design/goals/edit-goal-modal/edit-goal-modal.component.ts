import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarePlanService } from '../../../../../services/care-plan.service';
import { IPatientAdherenceRow } from '../../../../../services/care-plan-utils';
import { DialogHeaderComponent } from '../../../../../components/dialog-header/dialog-header.component';
import { LoaderService } from '@cardihab/angular-fhir';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { FhirService } from '../../../../../services/fhir.service';
import * as moment from 'moment';
import { iso8601Duration, ISO8601_DURATION_PATTERN } from '../../../../../utils/format';

@Component({
  selector: 'app-edit-goal-modal',
  templateUrl: './edit-goal-modal.component.html',
  styleUrls: ['./edit-goal-modal.component.scss']
})
export class EditGoalModalComponent extends DialogHeaderComponent implements OnInit {
  static FLEXIBLE_EXTENSION = 'https://fhir-registry.cardihab.com/StructureDefiniton/PlanFlexibility';

  goal: fhir.Goal;
  activity: fhir.CarePlanActivity;
  isRecurringGoal = false;
  isFlexiblePlan = false;
  hintText = '';
  goalEditorForm: FormGroup;
  targetForm: FormGroup;
  activityControl: FormControl;

  ACTIVITY_CODINGS = {
    walking: {
      system: 'https://fhir-registry.cardihab.com/ValueSets/activity-type',
      code: 'walking',
      display: 'Walking'
    },
    running: {
      system: 'https://fhir-registry.cardihab.com/ValueSets/activity-type',
      code: 'running',
      display: 'Running'
    },
    cycling: {
      system: 'https://fhir-registry.cardihab.com/ValueSets/activity-type',
      code: 'cycling',
      display: 'Cycling'
    },
    swimming: {
      system: 'https://fhir-registry.cardihab.com/ValueSets/activity-type',
      code: 'swimming',
      display: 'Swimming'
    },
    gym: {
      system: 'https://fhir-registry.cardihab.com/ValueSets/activity-type',
      code: 'gym',
      display: 'Gym'
    }
  };

  constructor(
    public dialogRef: MatDialogRef<EditGoalModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { adherence: IPatientAdherenceRow, carePlan: fhir.CarePlan, title: string },
    private carePlanService: CarePlanService,
    private snackbar: MatSnackBar,
    private loader: LoaderService,
    private formBuilder: FormBuilder
  ) {
    super(data);

    this.targetForm = this.formBuilder.group({
      detailRange: this.formBuilder.group({
        low: this.formBuilder.group({
          value: null
        }),
        high: this.formBuilder.group({
          value: null
        }),
        dueDate: '',
      }),
      measure: this.formBuilder.group({
        coding: this.formBuilder.array([
          this.formBuilder.group({
            code: '',
            display: '',
            system: ''
          })
        ])
      })
    });

    this.goalEditorForm = this.formBuilder.group({
      isEnabled: [false],
      repeats: [false],
      count: '',
      period: [0],
      frequency: ['D'],
      at: ['00:00'],
      description: this.formBuilder.group({
        text: ''
      }),
      target: this.targetForm
    });

    this.activityControl = new FormControl();
    if (this.data.carePlan && this.data.carePlan.status !== 'draft' && this.data.carePlan.status !== 'active') {
      this.goalEditorForm.get('description').disable();
    }
  }

  ngOnInit() {
    if (!this.data || !this.data.adherence || !this.data.adherence.goal) {
      return;
    }
    this.goal = this.data.adherence.goal;
    this.activity = this.data.carePlan.activity[this.data.adherence.activity];
    const flexibleExt = (this.data.carePlan.extension || []).find(ext => ext.url === EditGoalModalComponent.FLEXIBLE_EXTENSION);
    if (flexibleExt) {
      const flexibility = FhirService.flattenExtension(flexibleExt);
      this.isFlexiblePlan = flexibility.goal_schedule;
    }

    this.hintText = `Repeats until the end of ${this.activity ? this.activity.detail.description : 'the plan'}`;
    const duration: any = {
      repeats: false
    };

    const target = {};

    const recurrenceExt = this.goal.extension.find(ext => ext.url === FhirService.EXTENSIONS.RECURRING_TASK);
    if (recurrenceExt) {
      const { timing } = FhirService.flattenExtension<{timing?: string}>(recurrenceExt);
      const matchedTiming = (timing || '').match(ISO8601_DURATION_PATTERN);
      if (matchedTiming) {
        duration.repeats = true;
        this.isRecurringGoal = true;
        const [, count, at, period]: string[] = matchedTiming;
        if (at) {
          const at_dur = moment.duration(at);
          const timeOfDay = moment().startOf('day').add(at_dur);
          duration.at = timeOfDay.format('HH:mm');
        }
        duration.count = count;
        if (period) {
          const per_dur = moment.duration(period);
          const months = per_dur.months();
          const weeks = per_dur.weeks();
          const days = per_dur.days();

          if (months > 0) {
            duration.frequency = 'M';
            duration.period = months;
          } else if (weeks > 0) {
            duration.frequency = 'W';
            duration.period = weeks;
          } else {
            duration.frequency = 'D';
            duration.period = days;
          }
        }
      }
    }

    if (this.goal.target) {
      if (this.goal.target.measure && this.goal.target.measure.coding && this.goal.target.measure.coding.length > 0) {
        this.activityControl.setValue(this.goal.target.measure.coding[0].code);
      }
    }

    this.goalEditorForm.reset({
      isEnabled: this.goal.status === 'accepted' || this.goal.status === 'proposed',
      ...duration,
      description: {
        text: (this.goal.description || {}).text
      },
      target: this.goal.target
    });

    this.goalEditorForm.get('repeats').disable();

    this.activityControl.valueChanges.subscribe(targetActivity => {
      if (targetActivity) {
        (this.targetForm.get('measure').get('coding') as FormArray).at(0).setValue(this.ACTIVITY_CODINGS[targetActivity]);
        this.goalEditorForm.markAsDirty();
      }
    });
  }

  async saveGoal() {
    if (this.goalEditorForm.dirty) {
      const formData = this.goalEditorForm.getRawValue();
      // Do nothing if the user hasn't changed the status
      try {
        this.loader.start('Saving...');
        const timing = formData.repeats ? iso8601Duration(formData) : null;
        const result = await this.carePlanService.updateGoal(this.data.adherence, this.data.carePlan, { description: formData.description, isEnabled: formData.isEnabled, timing, target: formData.target});
        this.snackbar.open('Saved', '', {
          duration: 2000,
        });
        // Return updated careplan back
        this.dialogRef.close(result.entry.find(r => r.resource.resourceType === 'CarePlan').resource as fhir.CarePlan);
      } finally {
        this.loader.stop();
      }
    }
  }
}
