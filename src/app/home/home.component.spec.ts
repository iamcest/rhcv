
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { PipesModule } from '../pipes/pipes.module';
import { AngularFhirModule } from '@cardihab/angular-fhir';
import { TestingModule } from 'src/test';


describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule, PipesModule, AngularFhirModule],
      declarations: [HomeComponent],
      providers: [
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
