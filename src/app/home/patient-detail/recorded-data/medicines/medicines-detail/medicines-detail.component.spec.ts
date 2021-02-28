import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MedicinesDetailComponent } from './medicines-detail.component';
import { TestingModule } from '../../../../../../test';
import { PipesModule } from '../../../../../pipes/pipes.module';

describe('MedicinesDetailComponent', () => {
  let component: MedicinesDetailComponent;
  let fixture: ComponentFixture<MedicinesDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ MedicinesDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicinesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
