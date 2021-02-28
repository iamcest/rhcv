import { NgModule } from '@angular/core';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HeatmapCellComponent } from './heatmap/heatmap-cell/heatmap-cell.component';
import { HeatmapCellSeriesComponent } from './heatmap/heatmap-cell-series/heatmap-cell-series.component';
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { PriorityIconComponent } from './priority-icon/priority-icon.component';
import { GoalStatusComponent } from './goal-status/goal-status.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { PipesModule } from '../pipes/pipes.module';
import { NoteAddComponent } from './note-add/note-add.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExportDataComponent } from './export-data/export-data.component';
import { TelehealthComponent } from './telehealth/telehealth.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [DialogHeaderComponent, ConfirmationDialogComponent, ErrorDialogComponent, HeatmapComponent,
    HeatmapCellComponent, HeatmapCellSeriesComponent, FooterComponent, PriorityIconComponent, GoalStatusComponent,
    NotesListComponent, NoteAddComponent, ExportDataComponent, TelehealthComponent],
  entryComponents: [DialogHeaderComponent, ConfirmationDialogComponent, ErrorDialogComponent, ExportDataComponent],
  imports: [
    PipesModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatTooltipModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    NgxChartsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [DialogHeaderComponent, ConfirmationDialogComponent, ErrorDialogComponent, HeatmapComponent,
    HeatmapCellComponent, HeatmapCellSeriesComponent, FooterComponent, PriorityIconComponent, GoalStatusComponent,
    NotesListComponent, NoteAddComponent, TelehealthComponent]
})
export class ComponentsModule {
}

