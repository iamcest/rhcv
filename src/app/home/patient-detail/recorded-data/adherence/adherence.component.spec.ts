import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdherenceComponent } from './adherence.component';
import { AdherenceTableComponent } from '../adherence-table/adherence-table.component';
import {
  TestingModule,
  medicationServiceStub
} from '../../../../../test';
import { MedicationService } from '../../../../services/medication.service';
import { ComponentsModule } from '../../../../components/components.module';

describe('AdherenceComponent', () => {
  let component: AdherenceComponent;
  let fixture: ComponentFixture<AdherenceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, ComponentsModule],
      declarations: [AdherenceComponent, AdherenceTableComponent],
      providers: [{provide: MedicationService, useValue: medicationServiceStub}],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdherenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
