import { Injectable } from '@angular/core';
import { ServicesModule } from './services.module';
import * as _ from 'lodash';

const PAM_KEY_PREFIX = 'pam';

@Injectable({
  providedIn: ServicesModule
})
export class StorageService {
  selectedStorageLabel: string;

  constructor() {}

  get({ key }: { key: string; }): string {
    try {
      let storedValue;
      if (JSON.parse(sessionStorage.getItem('isShared'))) {
        storedValue = sessionStorage.getItem(`${PAM_KEY_PREFIX}-${key}`);
      } else {
        storedValue = localStorage.getItem(`${PAM_KEY_PREFIX}-${key}`);
      }
      return storedValue;
    } catch (error) {
      // Handling storage errors TBD
      return null;
    }
  }

  set({ key, value }: { key: string; value: string; }): void {
    if (JSON.parse(sessionStorage.getItem('isShared'))) {
      sessionStorage.setItem(`${PAM_KEY_PREFIX}-${key}`, value);
    } else {
      localStorage.setItem(`${PAM_KEY_PREFIX}-${key}`, value);
    }
  }

  clear(): void {
    if (JSON.parse(sessionStorage.getItem('isShared'))) {
      _.forIn(window.sessionStorage, (value: string, objKey: string) => {
          if (true === _.startsWith(objKey, PAM_KEY_PREFIX)) {
              sessionStorage.removeItem(objKey);
          }
      });
    } else {
      _.forIn(window.localStorage, (value: string, objKey: string) => {
        if (true === _.startsWith(objKey, PAM_KEY_PREFIX) ) {
            localStorage.removeItem(objKey);
        }
    });
    }

  }

  remove({ key }: { key: string }): void {
    if (JSON.parse(sessionStorage.getItem('isShared'))) {
      sessionStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  }

}

