import { FhirService } from './fhir.service';
import * as moment from 'moment';

export interface IPatientAdherenceRow {
  record_type: 'medicine' | 'exercise' | 'task' | 'observation' | 'education' | 'other' | 'SMARTGoal' | 'questionnaire';
  goal?: fhir.Goal;
  name: string;
  description?: string;
  activity?: number;
  groupedRows?: IPatientAdherenceRow[];
  statements?: fhir.MedicationStatement[];
  request?: fhir.MedicationRequest;
  dosage?: fhir.TimingRepeat;
  dosageText?: string[];
  startDate?: string;
  endDate?: string;
}

export interface IGoalAdherenceExtension {
  groupLabel: string;
  goalType: string;
}

export interface ITaskEnableWhenExtension {
  questionnaire: fhir.Reference;
  question: string;
  answerChoice: fhir.Coding[];
  answerBoolean: boolean;
}


export enum ANSWER_CHOICE {
  YES = '373066001',
  NO = '373067005'
}


export class CarePlanUtils {

  static VITAL_SIGNAL_CODE = {
    WEIGHT: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '363808001'
    }],
    STANDING_HEIGHT: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '248333004'
    }],
    WAIST_CIRCUMFERENCE: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '276361009'
    }],
    BLOOD_PRESSURE: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '75367002'
    }],
    SYSTOLIC: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '271649006'
    }],
    DIASTOLIC: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '271650006'
    }],
    HEART_RATE: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '364075005'
    }],
    SIX_MIN_WALK: [{
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '252478000'
    }],
  };

  static DIABETES_CODES = {
    TYPE1: {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '46635009'
    },
    TYPE2: {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '44054006'
    },
    NONE: {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '373067005'
    }
  };

  static INITIAL_ASSESSMENT_CODES = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '170571002'
    }
  ];

  static FINAL_ASSESSMENT_CODES = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '306496000'
    }
  ];

  static WEEKLY_REVIEW_CODES = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '170572009'
    }
  ];

  static CURRENT_PROCEDURE_CODES = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '8319008'
    }
  ];

  static EXERCISE_GOAL_CODE = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.GOAL_CATEGORY,
      code: 'physiotherapy'
    }
  ];

  static TASK_GOAL_CODE = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.GOAL_CATEGORY,
      code: 'behavioral'
    }
  ];

  static JOURNAL_ENTRY_CODES = {
    SYMPTOM: {
      system: FhirService.IDENTIFIER_SYSTEMS.SYMPTOM_CATEGORY,
      code: 'symptom',
      display: 'Symptom'
    },
    FITNESS: {
      system: FhirService.IDENTIFIER_SYSTEMS.OBSERVATION_CATEGORY,
      code: 'fitness-data',
      display: 'Fitness Data'
    },
    ACTIVITY: {
      system: FhirService.IDENTIFIER_SYSTEMS.ACTIVITY_CATEGORY,
      code: 'activity',
      display: 'Activity'
    },
    VITAL_SIGNS: {
      system: FhirService.IDENTIFIER_SYSTEMS.OBSERVATION_CATEGORY,
      code: 'vital-signs',
      display: 'Vital Signs'
    }
  };

  static STATUS_ORDER = ['draft', 'active', 'suspended', 'completed', 'entered-in-error', 'cancelled', 'unknown'];

  static isInitialAssessment(activity: fhir.CarePlanActivity): boolean {
    return FhirService.hasCoding(activity.detail.code, CarePlanUtils.INITIAL_ASSESSMENT_CODES);
  }

  static isFinalAssessment(activity: fhir.CarePlanActivity): boolean {
    return FhirService.hasCoding(activity.detail.code, CarePlanUtils.FINAL_ASSESSMENT_CODES);
  }

  static isWeeklyReview(activity: fhir.CarePlanActivity): boolean {
    return !FhirService.hasCoding(activity.detail.code, CarePlanUtils.INITIAL_ASSESSMENT_CODES) &&
      !FhirService.hasCoding(activity.detail.code, CarePlanUtils.FINAL_ASSESSMENT_CODES);
  }

  static progress(carePlan: fhir.CarePlan): 'design' | 'delivery' | 'discharge' {
    if (!carePlan) { return 'design'; }

    const ia = [];
    const wr = [];
    carePlan.activity.forEach(a => {
      if (CarePlanUtils.isInitialAssessment(a)) {
        ia.push(a);
      } else if (CarePlanUtils.isWeeklyReview(a)) {
        wr.push(a);
      }
    });
    if (ia.find(a => a.detail.status !== 'completed')) {
      return 'design';
    } else if (wr.find(a => a.detail.status !== 'completed')) {
      return 'delivery';
    } else {
      return 'discharge';
    }
  }


  static planSorter(a: fhir.CarePlan, b: fhir.CarePlan): number {
    const statusDiff = (CarePlanUtils.STATUS_ORDER.indexOf(a.status) - CarePlanUtils.STATUS_ORDER.indexOf(b.status));
    if (statusDiff === 0) {
      const aEnd = moment(a.period ? a.period.end : moment.unix(Number.MAX_VALUE));
      const bEnd = moment(b.period ? b.period.end : moment.unix(Number.MAX_VALUE));
      return bEnd.diff(aEnd);
    }
    return statusDiff;
  }

  static findCurrent(carePlans: fhir.CarePlan[]): fhir.CarePlan | null {
    // last ending first, draft plans (no date) first
    (carePlans || []).sort(CarePlanUtils.planSorter);
    // find a care plan not cancelled
    const validPlan = (carePlans || []).find((cp) => ['entered-in-error', 'cancelled', 'unknown'].indexOf(cp.status) === -1);
    if (!validPlan) {
      return (carePlans || []).length > 0 ? carePlans[0] : null;
    }
    return validPlan;
  }

  static isSMARTGoal(goal) {
    const extensions = goal.extension ? goal.extension : [];
    const adherenceExtension = extensions.find(
      extension => extension.url === FhirService.EXTENSIONS.ADHERENCE
    );
    return FhirService.flattenExtension<IGoalAdherenceExtension>(adherenceExtension).goalType === 'SMARTGoal';
  }

  static isExerciseGoal(goal) {
    const extensions = goal.extension ? goal.extension : [];
    const adherenceExtension = extensions.find(
      extension => extension.url === FhirService.EXTENSIONS.ADHERENCE
    );
    return FhirService.flattenExtension<IGoalAdherenceExtension>(adherenceExtension).goalType === 'exercise';
  }

  static isTaskGoal(goal) {
    return (goal.category || []).find(c => FhirService.hasCoding(c, CarePlanUtils.TASK_GOAL_CODE)) != null;
  }

  static getGoalRecordType(goal: fhir.Goal) {
    const adherenceExtension = (goal.extension || []).find(ext => ext.url === FhirService.EXTENSIONS.ADHERENCE);
    if (adherenceExtension) {
      const adherence = FhirService.flattenExtension<IGoalAdherenceExtension>(adherenceExtension);
      return adherence.goalType || 'other';
    }
    return 'other';
  }

  static goalText(goal: fhir.Goal): { name: string; description: string } {
    const s = {
      name: goal.id,
      description: ''
    };

    if (goal.description) {
      if (goal.description.text) {
        s.description = goal.description.text;
        s.name = goal.description.text;
      } else {
        if (goal.description.coding && goal.description.coding[0]) {
          s.description = goal.description.coding[0].display;
          s.name = goal.description.coding[0].display;
        }
      }
    }
    return s;
  }

  static getGroupLabel(entry: IPatientAdherenceRow): string {
    const extensions = entry.goal && entry.goal.extension ? entry.goal.extension : [];
    const adherenceExtension = extensions.find(
      extension => extension.url === FhirService.EXTENSIONS.ADHERENCE
    );
    return adherenceExtension ? FhirService.flattenExtension<IGoalAdherenceExtension>(adherenceExtension).groupLabel : entry.description;
  }

  static isCarePlanIncomplete(carePlan: fhir.CarePlan): boolean {
    if (!carePlan) { return; }

    return carePlan.status === 'draft' ||
      carePlan.status === 'active';
  }

  static goalToAdherenceRow(goal: fhir.Goal, activity: number): IPatientAdherenceRow {
    const record_type = CarePlanUtils.getGoalRecordType(goal);

    return <IPatientAdherenceRow>{
      record_type,
      goal,
      ...CarePlanUtils.goalText(goal),
      activity
    };
  }
}
