import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AmplifyService } from 'aws-amplify-angular';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ServicesModule } from './services.module';
import { Router } from '@angular/router';
import { RegionalConfigService } from '@cardihab/angular-fhir';

@Injectable({
    providedIn: ServicesModule
})
export class AuthInterceptor implements HttpInterceptor {
  amplify: AmplifyService;
  router: Router;
  region: RegionalConfigService;
  private sessionCache;

  constructor(inj: Injector) {
    this.amplify = inj.get(AmplifyService);
    this.router = inj.get(Router);
    this.region = inj.get(RegionalConfigService);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    let tokenType;
    if (request.url.startsWith(this.region.get('api').fhir) ||
        request.url.startsWith(this.region.get('api').reporting) ||
        request.url.startsWith(this.region.get('api').mobile)) {
          tokenType = 'idToken';
    } else if (request.url.startsWith(this.region.get('api').helpers)) {
      tokenType = 'accessToken';
    }

    if (tokenType) {
        return from(this.getCachedUserSession())
        .pipe(
            mergeMap(tokens => {
              if (tokens && tokens.accessToken) {
                request = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${tokens[tokenType].jwtToken}`
                    }
                });
                return next.handle(request);
              } else {
                this.router.navigate(['login']);
              }
            })
        );
    } else {
        return next.handle(request);
    }
  }

  getCachedUserSession(): Promise<any> {
    if (this.sessionCache && this.sessionCache.isValid()) {
        return Promise.resolve(this.sessionCache);
    }
    this.sessionCache = undefined;
    return this.amplify.auth().currentSession().then(tokens => {
        this.sessionCache = tokens;
        return tokens;
    });
  }
}
