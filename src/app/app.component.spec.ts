import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

// tslint:disable-next-line:component-selector
@Component({selector: 'router-outlet', template: ''})
class RouterOutletStubComponent { }

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        AppComponent,
        RouterOutletStubComponent
      ],
    }).compileComponents();
  }));
  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'Cardihab Patient Management'`, waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Cardihab Patient Management');
  }));
  it('should render router-outlet', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  }));
});
