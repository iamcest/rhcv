import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogHeaderComponent } from '../../../components/dialog-header/dialog-header.component';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { CarePlanUtils } from '../../../services/care-plan-utils';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { tag } from 'src/app/utils/analytics';

const TAB_NAMES = [
  'adherence',
  'observation-adherence',
  'exercise-adherence',
  'education-adherence',
  'medication-adherence',
  'recorded-data',
  'symptoms',
  'goals',
  'medicines',
  'diary',
  'charts'
];

@Component({
  selector: 'app-recorded-data',
  templateUrl: './recorded-data.component.html',
  styleUrls: ['./recorded-data.component.scss']
})
export class RecordedDataComponent extends DialogHeaderComponent {

  menuName: string;
  patient: fhir.Patient;
  carePlan: fhir.CarePlan;
  journalEntryCodes = CarePlanUtils.JOURNAL_ENTRY_CODES;

  constructor(
    @Inject(MAT_DIALOG_DATA) private patientData: { patient: fhir.Patient, carePlan: fhir.CarePlan, title: string,
      menuName: string },
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    super(patientData);
    this.patient = patientData.patient;
    this.carePlan = patientData.carePlan;
    this.menuName = patientData.menuName;
    this.tabChange({index: 1, tab: undefined});
   }

  // Had to use a literal value here, because Breakpoints.Medium is 1279.99,
  // and 1280 falls into this range somehow making it look bad on a 1280 screen,
  // but we still want it to look nice on an ipad which is 1024,
  // more than Breakpoints.Small could cover
  // To be fixed in PAM-162
  tablet$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small, '(max-width: 1152px)'])
  .pipe(map(result => result.matches));


  tabChange($event: MatTabChangeEvent) {
    tag(this.router.routerState.root.snapshot, TAB_NAMES[$event.index]);
  }
}
