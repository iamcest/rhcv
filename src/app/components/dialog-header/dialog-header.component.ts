import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title?: string;
  text?: string;
}

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss']
})
export class DialogHeaderComponent {

  @Input()
  title: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }
}
