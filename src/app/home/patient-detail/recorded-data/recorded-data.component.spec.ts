import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RecordedDataComponent } from './recorded-data.component';
import { TestingModule } from '../../../../test';
import { AdherenceComponent } from './adherence/adherence.component';
import { AdherenceTableComponent } from './adherence-table/adherence-table.component';
import { ChartsComponent } from './charts/charts.component';
import { ComboChartComponent } from './combo-chart/combo-chart.component';
import { ComboSeriesVerticalComponent } from './combo-chart/combo-series-vertical.component';
import { JournalComponent } from './journal/journal.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { ComponentsModule } from '../../../components/components.module';
import { SmartGoalsComponent } from './smart-goals/smart-goals.component';
import { SmartGoalDetailComponent } from './smart-goals/smart-goal-detail/smart-goal-detail.component';
import { SmartGoalListComponent } from './smart-goals/smart-goal-list/smart-goal-list.component';
import { AdherenceTabsComponent } from './adherence-tabs/adherence-tabs.component';
import { MedicinesComponent } from './medicines/medicines.component';
import { MedicinesListComponent } from './medicines/medicines-list/medicines-list.component';
import { MedicinesDetailComponent } from './medicines/medicines-detail/medicines-detail.component';

describe('RecordedDataComponent', () => {
  let component: RecordedDataComponent;
  let fixture: ComponentFixture<RecordedDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule, ComponentsModule],
      declarations: [RecordedDataComponent, JournalComponent, AdherenceTabsComponent, AdherenceComponent,
        AdherenceTableComponent, ChartsComponent, ComboChartComponent, ComboSeriesVerticalComponent,
        SmartGoalsComponent, SmartGoalDetailComponent, SmartGoalListComponent, MedicinesComponent, MedicinesListComponent,
        MedicinesDetailComponent],
      providers: [{
        provide: MAT_DIALOG_DATA,
        useValue: {
          patient: {},
          carePlan: {},
          title: ''
        } // Add any data you wish to test if it is passed/used correctly
      },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordedDataComponent);
    component = fixture.componentInstance;
    component.patient = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
