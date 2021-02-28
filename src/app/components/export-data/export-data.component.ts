import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FhirService } from '../../services/fhir.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegionalConfigService } from '@cardihab/angular-fhir';

@Component({
  selector: 'app-export-data',
  templateUrl: './export-data.component.html',
  styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent {

  acceptedTerms = false;

  links: Observable<{
    file: string;
    url: string;
  }[]>;
  constructor(
    private http: HttpClient,
    private region: RegionalConfigService,
    private fhirServivce: FhirService
  ) {

    this.links = this.http.get<{file: string; url: string; }[]>(`${this.region.get('api').reporting}/$export/${this.fhirServivce.tenancy}`);

    // todo: dismiss the dialog if the links expire
  }


}
