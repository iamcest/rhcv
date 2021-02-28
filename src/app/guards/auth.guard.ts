import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AmplifyService } from 'aws-amplify-angular';

import { GuardsModule } from './guards.module';
import { LoaderService } from '@cardihab/angular-fhir';

@Injectable({
  providedIn: GuardsModule
})
export class AuthGuard implements CanActivate {
  constructor(private amplifyService: AmplifyService,
              private router: Router,
              private loader: LoaderService) {
  }

  async canActivate() {
    const ATTEMPTS = 5;
    const DELAY = 700;

    // Return a new promise after a delay for the magic to work
    const delay = (t, v) => {
      return new Promise(function(resolve) {
        setTimeout(resolve.bind(null, v), t);
      });
    };

    // The actual promise that checks the user session
    const getPromise = () => {
      return this.amplifyService.auth().currentAuthenticatedUser().then((user: any) => {
        return true;
      })
      .catch(err => {
        return false;
      });
    };

    // The first attempts usually fail due to the way aws-amplify works,
    // The slower the network, the more attempts might be required
    // That's why we need to retry a few times
    // And exit after the first successful attempt
    const retry = async (maxAttempts: number = 5) => {
      this.loader.start('Loading');
      try {
        for (let i = 0; i < maxAttempts; i++) {
          const attempt = await delay(DELAY, this).then(() => getPromise());
          if (attempt) {
            return attempt;
          }
        }
      }
      finally {
        this.loader.stop();
      }
      return false;
    };

    const result = await retry(ATTEMPTS);

    if (result) {
      return result;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
