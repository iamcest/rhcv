import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PractitionerService } from '../../services/practitioner.service';
import { observableToReplaySubject } from '../../utils';
import { FhirService } from '../../services/fhir.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss']
})
export class NotesListComponent implements OnInit {
  @Input()
  notes: fhir.Annotation[];

  @Input()
  disabled: boolean;

  @Input()
  carePlan: fhir.CarePlan;

  @Input()
  title: string;

  @Input()
  hasCheckboxes = false;

  practitioners: Map<string, Observable<fhir.Practitioner>> = new Map();
  readonly datePlaceholder: string = 'Date unknown';
  readonly authorPlaceholder: string = 'Author unknown';

  constructor(private practitionerService: PractitionerService, private fhirService: FhirService) { }

  ngOnInit(): void {
    this.practitionerService.current.subscribe(p => {
      this.practitioners.set(`${p.resourceType}/${p.id}`, of(p));
    });

    (this.notes || []).forEach(item => {
      if (!this.practitioners.has(item.authorReference.reference)) {
        this.practitioners.set(item.authorReference.reference,
          observableToReplaySubject(this.fhirService.reference<fhir.Practitioner>(item.authorReference, this.carePlan)));
      }
    });
  }

  getReminderCheckedStatus(reminder: fhir.Annotation) {
    const extension = reminder.extension
      .find(ext => ext.url === FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER);
    return FhirService.flattenExtension(extension);
  }

  updateReminderStatus($event: MatCheckboxChange, reminder: fhir.Annotation) {
    const ext = reminder.extension.find(item => item.url === FhirService.EXTENSIONS.PATIENT_SPECIFIC_REMINDER);
    if (ext) {
      ext.valueBoolean = $event.checked;
    }

    this.fhirService.save<fhir.CarePlan>(this.carePlan).toPromise();
  }
}
