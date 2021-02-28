import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdherenceTableComponent } from './adherence-table.component';
import { TestingModule } from '../../../../../test';

describe('AdherenceTableComponent', () => {
  let component: AdherenceTableComponent;
  let fixture: ComponentFixture<AdherenceTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [AdherenceTableComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdherenceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
