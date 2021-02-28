import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CognitoIdentityServiceProvider } from 'aws-sdk/clients/all';
import { MatDialog } from '@angular/material/dialog';
import { UserRegistrationsService } from '../../../services/user-registrations.service';
import { PendingRegistrationModalComponent } from './pending-registration-modal/pending-registration-modal.component';
import { PractitionerService } from '../../../services/practitioner.service';
import { FhirService } from '../../../services/fhir.service';
import { BehaviorSubject, Subscription, Subject, combineLatest } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-pending-registrations',
  templateUrl: './pending-registrations.component.html',
  styleUrls: ['./pending-registrations.component.scss']
})
export class PendingRegistrationsComponent implements OnInit, OnChanges, OnDestroy {
  sites: Subject<fhir.Organization[]> = new Subject();
  selectedSites: string[] = [];
  pendingRegistrations: {[key: string]: CognitoIdentityServiceProvider.Types.UserType[] } = {};
  subscriptions: Subscription[] = [];
  approval$: BehaviorSubject<any> = new BehaviorSubject(void 0);
  selectedSiteChanges = new BehaviorSubject(void 0);

  @Input()
  currentSite: string;

  constructor(
    private userRegistration: UserRegistrationsService,
    private practitionerService: PractitionerService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      combineLatest([
        this.practitionerService.sites(),
        this.selectedSiteChanges
      ]).pipe(
        map(([sites, current]) => sites.filter(org => !current || org.id === current))
      ).subscribe(this.sites)
    );

    this.approval$.subscribe(sub => {
      this.subscriptions.push(
        this.sites.pipe(
          mergeMap(x => {
            // automatically select all sites if they change
            const siteCodes = (x || []).map(org => this.siteCode(org));
            return this.userRegistration.listPendingRegistration(siteCodes);
          })
        ).subscribe(allRegistered => {
          const registeredBySiteCode: any = {};
          allRegistered.forEach(r => {
            const registrationSiteCode = r.Attributes.find(a => a.Name === 'custom:sitecode');
            registeredBySiteCode[registrationSiteCode.Value] = registeredBySiteCode[registrationSiteCode.Value] || [];
            registeredBySiteCode[registrationSiteCode.Value].push(r);
          });
          this.pendingRegistrations = registeredBySiteCode;
        })
      );
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.currentSite) {
      this.selectedSiteChanges.next(changes.currentSite.currentValue);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getAttribute(user, attr) {
    const userAttribute = user.Attributes.find(a => a.Name === attr);
    return (userAttribute || {}).Value || '';
  }

  reviewPending(user) {
    this.dialog.open(PendingRegistrationModalComponent, {
      data: {
        user: user,
        approval$: this.approval$
      }
    }).afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  siteCode(org: fhir.Organization) {
    if (org) {
      const sitecodeId = org.identifier.find(id => id.system === FhirService.IDENTIFIER_SYSTEMS.SITECODE);
      return sitecodeId ? sitecodeId.value : null;
    }
    return null;
  }
}
