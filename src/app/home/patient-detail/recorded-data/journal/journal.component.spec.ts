import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { JournalComponent } from './journal.component';
import { TestingModule } from '../../../../../test';
import { PipesModule } from '../../../../pipes/pipes.module';

describe('JournalComponent', () => {
  let component: JournalComponent;
  let fixture: ComponentFixture<JournalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ JournalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
