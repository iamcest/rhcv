import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReviewComponent } from './review.component';
import { TestingModule } from '../../../../../test';
import { QuestionnaireComponent } from '../../questionnaire/questionnaire.component';
import { QuestionComponent } from '../../questionnaire/question.component';
import { PipesModule } from '../../../../pipes/pipes.module';
import { NotesListComponent } from '../../../../components/notes-list/notes-list.component';
import { NoteAddComponent } from '../../../../components/note-add/note-add.component';


describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule],
      declarations: [ ReviewComponent, QuestionnaireComponent, QuestionComponent, NotesListComponent, NoteAddComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
