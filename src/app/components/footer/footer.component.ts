import { Component } from '@angular/core';
import { BUILD_NUMBER, PACKAGE_VERSION } from '../../../version';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  readonly buildNumber: string = BUILD_NUMBER;
  readonly packageVersion: string = PACKAGE_VERSION;
  readonly currentYear: number = new Date().getFullYear();
}

