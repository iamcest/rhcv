import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { hmrBootstrap } from './hmr';
import * as Sentry from '@sentry/browser';
import { PACKAGE_VERSION } from './version';

declare var gtag;

if (environment.analytics && environment.analytics.enabled) {
  gtag('js', new Date());
  gtag('config', environment.analytics.config['code'], { 'send_page_view': false });
}

Sentry.init({
  dsn: environment.sentry.dsn,
  environment: environment.name,
  release: PACKAGE_VERSION
});

// Inject zendesk live chat if enabled
if (environment && environment.zendesk && environment.zendesk.widget) {
  document.write(`<script id="ze-snippet" src="${environment.zendesk.widget}"></script>`);
}

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
  if (module[ 'hot' ]) {
    hmrBootstrap(module, bootstrap);
  } else {
    console.error('HMR is not enabled for webpack-dev-server!');
    console.log('Are you using the --hmr flag for ng serve?');
  }
} else {
  bootstrap().catch(err => console.log(err));
}
