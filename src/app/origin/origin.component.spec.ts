import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OriginComponent } from './origin.component';
import { TestingModule } from 'src/test';

describe('OriginComponent', () => {
  let component: OriginComponent;
  let fixture: ComponentFixture<OriginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ OriginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
