import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestingModule } from '../../../test';
import { PipesModule } from '../../pipes/pipes.module';
import { NotesListComponent } from './notes-list.component';

describe('NotesListComponent', () => {
  let component: NotesListComponent;
  let fixture: ComponentFixture<NotesListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ NotesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
