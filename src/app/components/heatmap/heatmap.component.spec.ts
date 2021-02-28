import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeatmapComponent } from './heatmap.component';
import { TestingModule } from '../../../test';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeatmapComponent', () => {
  let component: HeatmapComponent;
  let fixture: ComponentFixture<HeatmapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [HeatmapComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
