import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { ServicesModule } from './services.module';
import { CarePlanUtils, IPatientAdherenceRow } from './care-plan-utils';
import * as moment from 'moment';
import { FhirService } from './fhir.service';

export interface IHeatmapData {
  name: string;
  series: IHeatmapItem[];
}

export interface IHeatmapItem {
  day: string;
  week: string;
  date: moment.Moment;
  value?: number;
  total?: number;
  id?: string;
  percentage?: number;
  items?: IPatientAdherenceRow[];
}

export interface IDailyObservations {
  [key: string]: IPatientAdherenceRow[];
}

export interface IOverallAdherence {
  [key: string]: { value: number, total: number, percentage: number };
}

const DATE_FORMAT = 'YYYY-MM-DD';

@Injectable({
  providedIn: ServicesModule
})
export class AdherenceService {

  constructor() { }

  itemsByDueDate: IDailyObservations = {};

  private getDailyValues(data: IPatientAdherenceRow[], carePlan: fhir.CarePlan, goalType: string): IDailyObservations {
    if (!carePlan || !goalType || !carePlan.period || !carePlan.period.start) { return {}; }

    const itemsByDueDate: IDailyObservations = {};
    const startDate = moment(carePlan.period.start);

    // Prepopulate itemsByDueDate
    const keyDate = startDate.clone();
    while (!keyDate.isSame(moment(carePlan.period.end).add(1, 'day'), 'day')) {
      itemsByDueDate[keyDate.format(DATE_FORMAT)] = [];
      keyDate.add(1, 'day');
    }

    data
      .filter(r => r.record_type === goalType)
      // active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown
      .filter(r => r.goal && (r.goal.status === 'accepted' ||
        r.goal.status === 'achieved') ||
        r.request && (
          r.request.status === 'active' ||
          r.request.status === 'completed' ||
          r.request.status === 'cancelled'))
      .forEach(r => {
        if (r.goal && r.goal.target && r.goal.target.dueDate) {
          // Strip the time and only use the date, we want all the goals for this day
          const date = moment(r.goal.target.dueDate).format(DATE_FORMAT);
          // To prevent problems if the careplan finished early
          itemsByDueDate[date] = itemsByDueDate[date] || [];
          itemsByDueDate[date].push(r);
        } else if (r.request) {
          const request = r.request || void 0;
          const statements = r.statements || [];

          const medicationStartDate = moment(request.dispenseRequest &&
            request.dispenseRequest.validityPeriod &&
            request.dispenseRequest.validityPeriod.start || carePlan.period.start);
          const medicationEndDate = moment(
            FhirService.flattenExtension((request.extension || []).find(e => e.url === 'deletedAt')
            || {url: ''}) || carePlan.period.end);

          // Something went horribly wrong, evacuate
          if (medicationEndDate.isBefore(medicationStartDate)) {
            return;
          }

          const medStartMillis = medicationStartDate.clone().startOf('day').toDate().getTime();
          const medEndMillis = medicationEndDate.clone().endOf('day').toDate().getTime();

          const dosages = request.dosageInstruction && request.dosageInstruction.length ?
            request.dosageInstruction
              .map(d => {
                return d && d.timing && d.timing.repeat ?
                  {
                    period: d.timing.repeat.period,
                    periodUnit: d.timing.repeat.periodUnit,
                    timeOfDay: d.timing.repeat.timeOfDay,
                    dayOfWeek: d.timing.repeat.dayOfWeek
                  }
                  : void 0;
              })
              .filter(d => !!d) : [];

          const TWENTY_FOUR_HOURS = 24 * 3600 * 1000;

          dosages.forEach(d => {
            let repeatDateMillis = medStartMillis;
            const repeatDate = medicationStartDate.clone();
            while (repeatDateMillis < medEndMillis) {
              d.timeOfDay.forEach(t => {
                const repeatDateFormatted = repeatDate.format(DATE_FORMAT);
                const repeatDateWeekDay = repeatDate.format('ddd').toLowerCase();

                // Do this when there's no weekday specified
                // Otherwise if there is one, it must match the date in question
                if (!(d.dayOfWeek && d.dayOfWeek.length) ||
                  (d.dayOfWeek && d.dayOfWeek.length && d.dayOfWeek.find(w => w === repeatDateWeekDay))) {
                  // To prevent problems if the careplan finished early
                  itemsByDueDate[repeatDateFormatted] = itemsByDueDate[repeatDateFormatted] || [];
                  const todayStatements = statements.filter(s => {
                    const millis = new Date(s.effectiveDateTime).getTime();
                    return millis >= repeatDateMillis && millis < repeatDateMillis + TWENTY_FOUR_HOURS &&
                           s.dosage[0].timing.repeat.timeOfDay.indexOf(t) !== -1;
                  });
                  itemsByDueDate[repeatDateFormatted].push({
                    record_type: r.record_type,
                    name: r.name,
                    request,
                    dosage: d,
                    statements: todayStatements
                  });
                }

                repeatDate.add(d.period || 1, (d.periodUnit || 'd') as moment.unitOfTime.DurationConstructor);
                repeatDateMillis = repeatDate.startOf('day').toDate().getTime();
              });
            }
          });
        }
      });
    return itemsByDueDate;
  }

  // date: format('L')
  getItemsByDueDate(date): IPatientAdherenceRow[] {
    return this.itemsByDueDate[date];
  }

  getWeeklyValues(data: IPatientAdherenceRow[], carePlan: fhir.CarePlan, goalType: string): IHeatmapItem[] {
    this.itemsByDueDate = this.getDailyValues(data, carePlan, goalType);
    const startDate = moment(carePlan.period.start);
    const endDate = moment(carePlan.period.end).endOf('day');

    const start: moment.Moment = startDate.clone().startOf('week');

    const result: IHeatmapItem[] = Object.keys(this.itemsByDueDate).map(date => {
      const dailyValues = this.itemsByDueDate[date];
      const value = dailyValues ? dailyValues.filter(o => o.statements && o.statements.length ?
        o.statements.find(s => s.taken === 'y') as fhir.MedicationStatement :
        o.goal && o.goal.status === 'achieved').length : 0;
      const total = dailyValues ? dailyValues.length : 0;
      const itemDate = moment(date);
      return {
        day: itemDate.format('ddd'),
        week: itemDate.clone().startOf('week').format('MMM DD'),
        date: itemDate,
        value,
        total,
        percentage: total > 0 ? Math.ceil(value * 100 / total) : 0,
        id: uuid(),
        items: dailyValues
      };
    });

    for (let i = 0; i < startDate.diff(start, 'days'); i++) {
      const nextDate = start.clone().add(i, 'day');
      result.splice(i, 0, {
        day: nextDate.format('ddd'),
        week: nextDate.clone().startOf('week').format('MMM DD'),
        date: nextDate,
        percentage: -1
      });
    }


    return result;
  }

  getOverallAdherence(data: IPatientAdherenceRow[], carePlan: fhir.CarePlan, goalType: string): IOverallAdherence {
    this.itemsByDueDate = this.getDailyValues(data, carePlan, goalType);
    const totals = {};

    for (const [key, value] of Object.entries(this.itemsByDueDate)) {
      if (value && value.length) {
        value.forEach(entry => {
          if (!totals[entry.name]) {
            totals[entry.name] = {
              value: 0,
              total: 0,
              percentage: 0
            };
          }

          totals[entry.name].value = totals[entry.name].value + (!!(entry.statements && entry.statements.length &&
          entry.statements.find(s => s.taken === 'y') as fhir.MedicationStatement) ? 1 : 0);
          totals[entry.name].total = totals[entry.name].total + 1;
          totals[entry.name].percentage = Math.ceil(totals[entry.name].value * 100 / totals[entry.name].total);
        });
      }
    }

    return totals;
  }
}
