import { Injectable } from '@angular/core';
import { Observable, of, zip } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FhirService, IFhirResponse, IFhirSearchParams } from './fhir.service';
import { CarePlanService } from './care-plan.service';
import { ServicesModule } from './services.module';
import * as url from 'url';
import { Moment } from 'moment';
import { CarePlanUtils } from './care-plan-utils';

export interface IPatientAppointmentEntry {
  patient$: Observable<fhir.Patient>;
  appointment: fhir.Appointment;
}

export interface IPatientAppointment {
  totalCount: number;
  entries$: Observable<IPatientAppointmentEntry[]>;
}

@Injectable({
  providedIn: ServicesModule
})
export class PatientService {

  constructor(private http: HttpClient, private fhirService: FhirService, private carePlanService: CarePlanService) { }

  organizationBySitecode(sitecode: string): Observable<fhir.Organization | null> {
    return this.fhirService.search<fhir.Organization>(`Organization`, {identifier: `urn:sitecode|${sitecode}`})
    .pipe(
      map(response => {
        if (response.total > 0) {
          return response.entry[0].resource;
        } else {
          return null;
        }
      })
    );
  }

  public async createPatient(organization: fhir.Organization, site: string, demographics: Partial<fhir.Patient>, patientUUID: string, referencePlan: {fullUrl: string, resource: fhir.CarePlan}): Promise<fhir.Bundle> {
    const siteOrg =  await this.organizationBySitecode(site).toPromise();
    if (siteOrg == null) {
      return Promise.reject('No matching site');
    }
    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          request: {
            method: 'POST',
            url: `urn:uuid:${patientUUID}`
          },
          resource: {
            resourceType: 'Patient',
            active: true,
            identifier: [
              {
                system: 'urn:uuid',
                value: patientUUID
              },
            ],
            managingOrganization: {
              reference: `Organization/${organization.id}`
            },
            ...demographics
          },
        },
      ]
    };
    const carePlanResources = await this.carePlanService.create(referencePlan, `urn:uuid:${ patientUUID}`, `Organization/${siteOrg.id}`);
    bundle.entry.push(...carePlanResources);
    return bundle;
  }

  patientMedications(patient: fhir.Patient, options?): Observable<{request: fhir.MedicationRequest, statements: fhir.MedicationStatement[]}[]> {
    return zip(
      this.fhirService.search<fhir.MedicationStatement>(`MedicationStatement`, {patient: patient.id, ...options}, {headers: {'Cache-Control': 'no-cache'}}),
      this.fhirService.search<fhir.MedicationRequest>(`MedicationRequest`, {patient: patient.id, ...options}, {headers: {'Cache-Control': 'no-cache'}})
    ).pipe(
      map(([statementsResponse, requestsResponse]) => {
        // TODO MODIFY SEARCH FUNCTION so that it can fetch ALL items
        const requestsByRef: { [key: string]: {request: fhir.MedicationRequest, statements: fhir.MedicationStatement[]}} = {};
        (requestsResponse.entry || []).forEach(mr => {
          const ref = `MedicationRequest/${mr.resource.id}`;
          requestsByRef[ref] = {
            request: mr.resource,
            statements: []
          };
        });

        (statementsResponse.entry || []).forEach(ms => {
          const mrRef = ms.resource.basedOn;
          let req;
          if (mrRef && mrRef.length > 0) {
            req = requestsByRef[mrRef[0].reference];
          }

          if (req && req.statements) {
            req.statements.push(ms.resource);
          }
        });
        return Object.keys(requestsByRef).map(r => requestsByRef[r]);
      })
    );
  }

  patientObservations(patient: fhir.Patient, params: IFhirSearchParams, paginate: boolean = true): Observable<IFhirResponse<fhir.Observation>> {
    if (params && params.nextUrl) {
      const parsedNext = url.parse(params.nextUrl, true);
      const nextParams = parsedNext.query;
      nextParams._getpagesoffset = params._getpagesoffset;
      parsedNext.search = undefined;

      return this.http.get<IFhirResponse<fhir.Observation>>(url.format(parsedNext));
    } else {
      // This magic is required to allow multiple parameters with the same name
      // e.g. date=ge2010-01-01&date=le2011-12-31
      let prms = new HttpParams();

      Object.keys(params).forEach(key => {
        if (key === 'dateFrom') {
          prms = prms.append('date', `ge${params[key]}`);
        } else if (key === 'dateTo') {
          prms = prms.append('date', `le${params[key]}`);
        } else {
          if (params[key] !== void 0) {
            prms = prms.append(key, `${params[key]}`);
          }
        }
      });

      prms = prms.append('patient', patient.id);

      return this.fhirService.search<fhir.Observation>(`Observation`, prms, {}, paginate);
    }
  }

  public patientCarePlans(patient: fhir.Patient): Observable<IFhirResponse<fhir.CarePlan>> {
      return this.fhirService.search<fhir.CarePlan>(`CarePlan`, { patient: patient.id }, {headers: {'Cache-Control': 'no-cache'}});
  }

  public createResponseContext(patient: fhir.Patient, carePlan: fhir.CarePlan, activity: fhir.CarePlanActivity) {
    return <fhir.Encounter>{
      resourceType: 'Encounter',
      appointment: activity.reference,
      subject: {
        reference: patient.id ? `Patient/${patient.id}` : `urn:uuid:${patient.identifier[0].value}`
      },
      status: 'in-progress',
      episodeOfCare: [carePlan.context]
    };
  }

  public createResponse(patient: fhir.Patient, questionnaire: fhir.Questionnaire, context: fhir.Reference): fhir.QuestionnaireResponse {
    const ref = `${this.fhirService.getContextBaseUrl(questionnaire)}/Questionnaire/${questionnaire.id}`;
    return <fhir.QuestionnaireResponse>{
      resourceType: 'QuestionnaireResponse',
      'questionnaire': {
        'reference': ref
      },
      context,
      status: 'in-progress',
      subject: {
        reference: patient.id ? `Patient/${patient.id}` : `urn:uuid:${patient.identifier[0].value}`
      },
      item: questionnaire.item ? this.deepMapQuestionnaireItems(questionnaire.item) : undefined
    };
  }

  deepMapQuestionnaireItems(items: fhir.QuestionnaireItem[]): fhir.QuestionnaireResponseItem[] {
    return items.map(item => {
      return {
        linkId: item.linkId,
        definition: item.definition,
        text: item.text,
        item: item.item ? this.deepMapQuestionnaireItems(item.item) : undefined
      };
    });
  }

  public upcomingAppointments(date: Moment, orgId: string, limit: number = 10): IPatientAppointment {
    const dateStart = date.startOf('day').format();
    const dateEnd = date.endOf('day').format();

    let params = new HttpParams()
    .append('date', `ge${dateStart}`)
    .append('date', `le${dateEnd}`)
    .append('patient:Patient.organization', orgId)
    .append('patient:Patient.active', 'true')
    .append('status', 'proposed')
    .append('_sort', 'date,patient');

    // Provide 0 to prevent adding limit
    if (limit) {
      params = params.append('_count', `${limit}`);
    }

    const result = <IPatientAppointment>{
      totalCount: 0,
      entries$: of([])
    };

    result.entries$ = this.fhirService.search<fhir.Appointment>(`Appointment`, params)
    .pipe(
      map((response) => {
        return (response.entry || []).map((entry: fhir.BundleEntry) => {
          const appointment = entry.resource as fhir.Appointment;
          if (!appointment || !appointment.participant || !appointment.participant.length || !appointment.participant[0].actor) {
            return;
          }

          result.totalCount = response.total;

          return <IPatientAppointmentEntry>{
            patient$: this.fhirService.reference<fhir.Patient>(appointment.participant[0].actor, appointment),
            appointment: appointment
          };
        });
      })
    );

    return result;
  }

  public patientConditions(patient: fhir.Patient): Observable<IFhirResponse<fhir.Condition>> {
    const params = new HttpParams()
    .append('patient', patient.id);

    return this.fhirService.search<fhir.Condition>(`Condition`, params);
  }

  public isDiabetic(patient: fhir.Patient): Observable<boolean> {
    return this.patientConditions(patient)
      .pipe(map(conditions => {
        return !!((conditions.entry || []).find((c: fhir.BundleEntry) => {
            return FhirService.hasCoding((c.resource as fhir.Condition).code, [CarePlanUtils.DIABETES_CODES.TYPE1, CarePlanUtils.DIABETES_CODES.TYPE2]);
          }));
      }));
  }

  public urn(patient: fhir.Patient): fhir.Identifier | undefined {
    if (!patient) { return; }
    return (patient.identifier || []).find(id => {
      if (id.type && id.type.coding) {
        const mrCode = id.type.coding
          .find(coding => coding.system === FhirService.IDENTIFIER_SYSTEMS.FHIR_IDENTIFIER_TYPE && coding.code === 'MR');
        return mrCode != null;
      }
      return false;
    });
  }

  patientOrganisation(patient: fhir.Patient): Observable<fhir.Organization> {
    return this.fhirService.reference<fhir.Organization>(patient.managingOrganization, patient);
  }
}
