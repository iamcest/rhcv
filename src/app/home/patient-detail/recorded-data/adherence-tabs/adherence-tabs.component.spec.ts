import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdherenceTabsComponent } from './adherence-tabs.component';
import { TestingModule } from '../../../../../test';
import { ComponentsModule } from '../../../../components/components.module';
import { AdherenceComponent } from '../adherence/adherence.component';
import { AdherenceTableComponent } from '../adherence-table/adherence-table.component';

describe('AdherenceTabsComponent', () => {
  let component: AdherenceTabsComponent;
  let fixture: ComponentFixture<AdherenceTabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, ComponentsModule],
      declarations: [AdherenceTabsComponent, AdherenceComponent, AdherenceTableComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdherenceTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
