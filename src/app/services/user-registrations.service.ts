import { Injectable, OnDestroy } from '@angular/core';
import { API } from 'aws-amplify';
import { environment } from '../../environments/environment';
import { ServicesModule } from './services.module';
import { Observable, BehaviorSubject, Observer, Subject, combineLatest, Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FhirService } from './fhir.service';
import { RegionalConfigService } from '@cardihab/angular-fhir';

export interface IAppUser {
  given_name: string;
  family_name: string;
  birthdate: string;
  sitecode: string;
  phone_number: string;
}

export interface IPendingRegistration {
  Attributes: {Name: string; Value: string}[];
  Enabled: boolean;
  UserCreateDate: string;
  UserLastModifiedDate: string;
  UserStatus: string;
  Username: string;
}

@Injectable({
  providedIn: ServicesModule
})
export class UserRegistrationsService implements OnDestroy {

  currentRegistrations = new BehaviorSubject<IPendingRegistration[]>([]);
  messages = new Subject();
  subscribedSiteCodes = new BehaviorSubject<string[]>([]);

  websocket: WebSocket;
  subscriptions: Subscription[] = [];

  constructor(private region: RegionalConfigService, private fhirService: FhirService) { }

  ngOnDestroy() {
    this.disconnect();
  }


  async createAppUser(userAttributes: IAppUser) {
    return API.post(this.region.get('api')['user-management'], '/user/app', {
      body: userAttributes
    });
  }

  listPendingRegistration(siteCodes: string[]): Observable<IPendingRegistration[]> {
    this.connect();
    this.subscribedSiteCodes.next(siteCodes);

    return this.currentRegistrations;
  }

  async approveRegistration(username: string, tenant: string) {
    return API.post(this.region.get('api')['user-management'], `/user/app/${username}`, {
      // headers: {
      //   'x-http-method-override': 'PATCH'
      // },
      body: [
        {
          op: 'remove',
          path: '/tenant',
          value: 'public'
        }, {
          op: 'add',
          path: '/tenant',
          value: tenant
        }]
    });
  }

  async revertApproval(username: string, tenant: string) {
    return API.patch(this.region.get('api')['user-management'], `/user/app/${username}`, {
      body: [
        {
          op: 'add',
          path: '/tenant',
          value: 'public'
        }, {
          op: 'remove',
          path: '/tenant',
          value: tenant
        }]
    });
  }

  async rejectRegistration(username: string) {
    return API.del(this.region.get('api')['user-management'], `/user/app/${username}`, {});
  }

  async archive(username, tenant) {
    const cmd = [
      {
        op: 'remove',
        path: '/tenant',
        value: tenant
      }
    ];

    return API.patch(this.region.get('api')['user-management'], `/user/app/${username}`, {
      body: cmd
    });
  }

  async createZendeskToken(name: string, email: string): Promise<any> {
    return API.get(this.region.get('api')['user-management'], `/zendesk/token`, {
      queryStringParameters: {
        name,
        email
      }
    });
  }

  private onSocketConnect(receiver: Observer<MessageEvent>) {
    console.log(`Connected.\nSubscribing to ${this.fhirService.tenancy}`);
    // send a subscribe message after socket is open
    this.websocket.send(JSON.stringify({action: 'subscribeTenant', tenant: this.fhirService.tenancy}));
    receiver.next(null);
  }

  private onSocketError(err) {
    // Sentry.captureMessage(`Error from registrations websocket, before open: ${JSON.stringify(err)}`, Sentry.Severity.Error);
    if (this.websocket.readyState !== WebSocket.OPEN) {
      setTimeout(() => this.connect(), 5000);
    }
  }

  private onSocketClose() {
    console.log('Socket went offline, reconnecting...');
    this.connect();
  }

  private disconnect() {
    this.subscriptions.forEach(s => s.unsubscribe());

    if (this.websocket) {
      this.websocket.onclose = undefined;
      this.websocket.close();
      this.websocket = null;
    }
  }

  private connect() {
    // replace subscriptions
    this.disconnect();

    this.subscriptions.push(
      new Observable((messageReceiver: Observer<MessageEvent>) => {
        this.websocket = new WebSocket(this.region.get('api')['registrations-websocket']);

        this.websocket.onmessage = messageReceiver.next.bind(messageReceiver);
        this.websocket.onclose = this.onSocketClose.bind(this);
        this.websocket.onerror = this.onSocketError.bind(this);
        this.websocket.onopen = this.onSocketConnect.bind(this, messageReceiver);
      }).subscribe(this.messages)
    );

    this.subscriptions.push(
      combineLatest([this.subscribedSiteCodes, this.messages])
      .pipe(
        mergeMap(([siteCodes, refresh]) => {
          return API.get(this.region.get('api')['user-management'], '/user', {
            queryStringParameters: {
              sites: siteCodes
            }
          });
        })
      ).subscribe(this.currentRegistrations)
    );
  }
}
