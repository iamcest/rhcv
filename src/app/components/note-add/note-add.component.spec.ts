import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestingModule } from '../../../test';
import { PipesModule } from '../../pipes/pipes.module';
import { NoteAddComponent } from './note-add.component';

describe('NoteAddComponent', () => {
  let component: NoteAddComponent;
  let fixture: ComponentFixture<NoteAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ NoteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
