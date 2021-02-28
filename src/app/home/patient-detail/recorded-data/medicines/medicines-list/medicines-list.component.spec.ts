import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MedicinesListComponent } from './medicines-list.component';
import { TestingModule } from '../../../../../../test';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { AdherenceComponent } from '../../adherence/adherence.component';
import { AdherenceTabsComponent } from '../../adherence-tabs/adherence-tabs.component';
import { AdherenceTableComponent } from '../../adherence-table/adherence-table.component';
import { ComponentsModule } from '../../../../../components/components.module';

describe('MedicinesListComponent', () => {
  let component: MedicinesListComponent;
  let fixture: ComponentFixture<MedicinesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule, ComponentsModule],
      declarations: [MedicinesListComponent, AdherenceComponent, AdherenceTabsComponent, AdherenceTableComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicinesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
