import { ErrorHandler, Injectable } from '@angular/core';
import { ServicesModule } from './services.module';
import * as Sentry from '@sentry/browser';

@Injectable({
  providedIn: ServicesModule
})
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    Sentry.captureException(error.originalError || error);
    throw error;
  }
}
