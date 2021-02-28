import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestingModule } from 'src/test';

import { TelehealthComponent } from './telehealth.component';

describe('TelehealthComponent', () => {
  let component: TelehealthComponent;
  let fixture: ComponentFixture<TelehealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ TelehealthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelehealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
