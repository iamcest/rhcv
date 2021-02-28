import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { formatFhirName } from '../../../../utils';
import { IPatientAdherenceRow } from '../../../../services/care-plan-utils';
import { FhirService } from '../../../../services/fhir.service';

export const MED_SKIP_REASON = {
  'no-stock': 'I ran out',
  'unwell': 'Not feeling well',
  'unavailable-on-person': 'I don\'t have this medicine on me',
  other: 'other'
};

// Sorts medications by time and description alphabetically
const medicationComparator = (a: IPatientAdherenceRow, b: IPatientAdherenceRow): number => {
  if (!a.dosage || !b.dosage) { return 0; }
  return a.dosage.timeOfDay[0] > b.dosage.timeOfDay[0] ? 1
    : a.dosage.timeOfDay[0] < b.dosage.timeOfDay[0] ? -1
      : (a.request.medicationCodeableConcept.text > b.request.medicationCodeableConcept.text ? 1
        : a.request.medicationCodeableConcept.text < b.request.medicationCodeableConcept.text ? -1 : 0);
};

@Component({
  selector: 'app-adherence-table',
  templateUrl: './adherence-table.component.html',
  styleUrls: ['./adherence-table.component.scss']
})
export class AdherenceTableComponent implements OnChanges {
  @Input() selection: { items: IPatientAdherenceRow[], date: moment.Moment };
  @Input() patient: fhir.Patient;
  @Input() goalType: string;

  weekDay: string;
  date: string;
  items: IPatientAdherenceRow[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selection) {
      const {currentValue} = changes.selection;
      if (currentValue) {
        this.date = currentValue.date.format('DD MMM YYYY');
        this.weekDay = currentValue.date.format('dddd');
        this.items = (currentValue.items || [])
        .filter(item => {
          if (item.request && item.request.status === 'cancelled') {
            // medications cancelled on this day to be filtered out if no statements
            if (item.statements.length === 0) {
              let deletedMoment;
              const deletedAt = item.request.extension
                .find(ext => ext.url === 'deletedAt');
              if (deletedAt) {
                deletedMoment = moment(FhirService.flattenExtension(deletedAt).deletedAt);

                // const endDate = moment(item.request.dispenseRequest.validityPeriod.end);
                if (deletedMoment.isSame(moment(), 'day') && item.statements.length === 0) {
                  return false;
                }
              }
            }
          }
          return true;
        }).sort(medicationComparator);
      }
    }
  }

  formatName(name: fhir.HumanName[]) {
    return formatFhirName(name, {noTitle: true, firstNameFirst: true});
  }

  getDescription(item): {time: string; name: string} {
    if (item.goal && item.goal.description) {
      return {time: '', name: item.goal.description.text};
    } else if (item.request && item.name) {
      const time = item.dosage ? `${moment(item.dosage.timeOfDay[0], 'HH:mm').format('hh:mm A')}` : '';
      return {time, name: item.name};
    }
    return {time: '', name: ''};
  }

  getSkipReason(item: IPatientAdherenceRow): string {
    let reason = '';

    if (item.request) {
      const statements = item.statements;
      if (this.getItemStatus(item) === false) {
        const note = (statements.find(s => !!s.note) || {note: []}).note;
        if (note && note.length) {
          if (note[0].text === MED_SKIP_REASON.other) {
            reason = note[1] ? note[1].text : MED_SKIP_REASON.other;
          } else {
            reason = MED_SKIP_REASON[note[0].text];
          }
        }
      }
    }

    return reason;
  }

  getItemStatus(item: IPatientAdherenceRow): boolean {
    // Medicine
    if (item.request) {
      const statements = item.statements;
      if (!statements || !statements.length || (statements.find(s => s.taken === 'unk'))) {
        // returning undefined if no information has been logged by the user
        return void 0;
      } else {
        if (statements.find(s => s.taken === 'y')) {
          // returning true if the user has taken the medicine
          return true;
        } else if (statements.find(s => s.taken === 'n')) {
          // returning false if the user skipped the medicine
          return false;
        }
      }
      // Other type of goal
    } else if (item.goal) {
      if (!item || !item.goal ||
        item.goal.status === 'accepted' ||
        item.goal.status === 'in-progress' ||
        item.goal.status === 'proposed') {
        // returning undefined if it's still in progress or no information has been logged by the user
        return void 0;
      } else if (item.goal.status === 'cancelled' ||
        item.goal.status === 'entered-in-error' ||
        item.goal.status === 'rejected') {
        // returning false if the goal has been cancelled, rejected or entered in error.
        // It will not count towards adherence score
        return false;
      } else if (item.goal.status === 'achieved') {
        // returning true if the goal is marked as achieved
        return true;
      }
    }
  }
}
