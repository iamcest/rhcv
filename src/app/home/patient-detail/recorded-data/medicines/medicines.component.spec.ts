import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MedicinesComponent } from './medicines.component';
import { TestingModule } from '../../../../../test';
import { ComponentsModule } from '../../../../components/components.module';
import { MedicinesListComponent } from './medicines-list/medicines-list.component';
import { MedicinesDetailComponent } from './medicines-detail/medicines-detail.component';
import { AdherenceComponent } from '../adherence/adherence.component';
import { AdherenceTableComponent } from '../adherence-table/adherence-table.component';

describe('MedicinesComponent', () => {
  let component: MedicinesComponent;
  let fixture: ComponentFixture<MedicinesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, ComponentsModule],
      declarations: [MedicinesComponent, MedicinesListComponent, MedicinesDetailComponent,
        AdherenceComponent, AdherenceTableComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
