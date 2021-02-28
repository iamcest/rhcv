import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { PractitionerService } from '../../services/practitioner.service';

@Component({
  selector: 'app-note-add',
  templateUrl: './note-add.component.html',
  styleUrls: ['./note-add.component.scss']
})
export class NoteAddComponent implements OnInit {
  @Input()
  placeholder = 'Add a Note';

  @Input()
  buttonText = 'Add a Note';

  @Input()
  errorMessage = 'Note cannot be empty. Please enter note text and try again.';

  @Output()
  noteAdded: EventEmitter<fhir.Annotation> = new EventEmitter<fhir.Annotation>();

  newNoteText: string;
  practitioner: fhir.Practitioner;

  constructor(private dialog: MatDialog,
              private practitionerService: PractitionerService) { }

  ngOnInit(): void {
    this.practitionerService.current.subscribe(p => {
      this.practitioner = p;
    });
  }

  addNote() {
    if (!this.newNoteText) {
      // error dialog pop up
      this.dialog.open(ErrorDialogComponent, {
        data: {
          title: 'Error adding note',
          text: 'Note cannot be empty. Please enter note text and try again.'
        }
      });
      return;
    }

    const note: fhir.Annotation = {
      text: this.newNoteText,
      authorReference: {reference: `${this.practitioner.resourceType}/${this.practitioner.id}`},
      time: moment().format()
    };

    this.noteAdded.emit(note);
    this.newNoteText = '';
  }
}
