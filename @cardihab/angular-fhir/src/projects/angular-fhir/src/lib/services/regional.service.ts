import { Injectable } from '@angular/core';

export interface AnyConfig {
    [key: string]: any;
}

@Injectable()
export class RegionalConfigService implements AnyConfig {
  region: string;

  async load(region): Promise<any> {
    // assert that region is one of ['au', 'de', 'us']

    const configResponse = await fetch(`./assets/environment-${region}.json`);
    const config: any = await configResponse.json();

    Object.keys(config).forEach(key => {
      if (!this.hasOwnProperty(key)) {
        Object.defineProperty(this, key, {
          get: () => config[key]
        });
      }
    });
    this.region = region;
    return config;
  }

  get(key) {
    return this[key];
  }
}

