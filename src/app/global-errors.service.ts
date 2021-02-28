import { Injectable, ErrorHandler } from '@angular/core';

declare var gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorsService extends ErrorHandler {

  handleError(error) {
    gtag('event', 'exception', {
      description: error.toString()
    });
  }
}
