import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';

declare var gtag;

export const tag = (route: ActivatedRouteSnapshot, dialog?: string) => {
    if (environment.analytics && environment.analytics.enabled) {
        (<any>window).gtag(
            'config',
            environment.analytics.config['code'],
            {
                page_location: `${location.origin}`,
                'page_path': `${analyticsSafeUrl(route)}${dialog ? '/' + dialog : ''}`
            }
        );
    } else {
        console.log(`${analyticsSafeUrl(route)}${dialog ? '/' + dialog : ''}`);
    }
};


function analyticsSafeUrl(route: ActivatedRouteSnapshot): string {
    let child = route;
    let path = '';
    while (child.firstChild) {
        path += `/${child.firstChild.routeConfig.path}`;
        child = child.firstChild;
    }
    return path;
}
