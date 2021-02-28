import { Injectable } from '@angular/core';
import { ServicesModule } from './services.module';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RegionalConfigService, FhirService } from '@cardihab/angular-fhir';

export interface IReportHeader {
  height?: string;
  contents?: string;
}

export interface IReportFooter {
  height?: string;
  contents?: {
    default?: string;
    first?: string;
    last?: string;
  };
}

@Injectable({
  providedIn: ServicesModule
})
export class ReportService {

  static INITIAL_ASSESSMENT_CODES = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '170571002'
    }
  ];
  static CURRENT_PROCEDURE_CODES = [
    {
      system: FhirService.IDENTIFIER_SYSTEMS.SNOMED,
      code: '8319008'
    }
  ];


  static isInitialAssessment(activity: fhir.CarePlanActivity): boolean {
    return FhirService.hasCoding(activity.detail.code, ReportService.INITIAL_ASSESSMENT_CODES);
  }

  constructor(
    private http: HttpClient,
    private regionConfig: RegionalConfigService
  ) { }

  createReport(content: string,
               header: IReportHeader = void 0,
               footer: IReportFooter = void 0,
               format: string = 'A4'): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/pdf'
    });

    return this.http.post(`${this.regionConfig.get('api').helpers}/pdf`, {
      content: encodeURI(content),
      userPoolId: this.regionConfig['aws_user_pools_id'],
      region: this.regionConfig['aws_cognito_region'],
      options: {
        format,
        header,
        footer
      }
    }, {
      headers,
      responseType: 'blob'
    });
  }
}
