import { Component, Inject, Optional, InjectionToken } from '@angular/core';

export const CONTAINER_DATA = new InjectionToken<any>('CONTAINER_DATA');
@Component({
  selector: 'lib-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  message: string;

  constructor(@Optional() @Inject(CONTAINER_DATA) private componentData: any) {
    this.message = this.componentData && this.componentData.message
      ? this.componentData.message : '';
  }

}
