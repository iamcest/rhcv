import { Component } from '@angular/core';
import { Router, NavigationEnd, UrlTree } from '@angular/router';
import { environment } from 'src/environments/environment';
import { tag } from './utils/analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Cardihab Patient Management';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        tag(this.router.routerState.root.snapshot);
      }
    });
  }
}
