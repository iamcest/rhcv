import { Injectable } from '@angular/core';
import { CarePlanService } from './care-plan.service';
import { PatientService } from './patient.service';
import { IPatientAdherenceRow } from './care-plan-utils';
import { ServicesModule } from './services.module';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { capitalize } from 'lodash';
import { v4 as uuid } from 'uuid';
import * as moment from 'moment';
import { FhirService } from './fhir.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RegionalConfigService } from '@cardihab/angular-fhir';

const TIMING_PERIOD_UNITS = {
  d: 'day'
};

const COUNT = 10;

const UNITS = [
  'application',
  'bandage',
  'bar',
  'block',
  'capsule',
  'collodion',
  'conditioner',
  'cream',
  'diluent',
  'dressing',
  'drug delivery system',
  'ear drops',
  'ear ointment',
  'enema',
  'eye and ear',
  'eye drops',
  'eye gel',
  'eye ointment',
  'eye pad',
  'eye solution',
  'eye spray',
  'eye strip',
  'film',
  'foam',
  'foam dressing',
  'gas',
  'gel',
  'glove',
  'granules',
  'gum',
  'implant',
  'inhalation',
  'injection',
  'intratracheal suspension',
  'jelly',
  'liniment',
  'liquid',
  'lotion',
  'lozenge',
  'mouthwash',
  'nasal cream',
  'nasal drops',
  'nasal gel',
  'nasal ointment',
  'nasal spray',
  'oil',
  'ointment',
  'oral gel',
  'oral liquid',
  'oral semi-solid',
  'oral spray',
  'pad',
  'paint',
  'paste',
  'pastille',
  'patch',
  'pessary',
  'powder',
  'ribbon',
  'roll',
  'rope',
  'shampoo',
  'sheet',
  'solution',
  'spray',
  'stick',
  'strip',
  'suppository',
  'tablet',
  'tape',
  'tincture',
  'toothpaste',
  'vaginal cream',
  'vaginal gel',
  'wafer'
];

@Injectable({
  providedIn: ServicesModule
})
export class MedicationService {
  private _snomedVersion  = '';

  static medicationText(request: fhir.MedicationRequest): {name: string; description: string} {
    if (request && request.medicationCodeableConcept) {
      return {
        name: request.medicationCodeableConcept.text || 'Other Medication',
        description: (request.dosageInstruction || [{text: ''}])[0].text
      };
    } else {
      return {
        name: 'Other Medication',
        description: ''
      };
    }

  }

  constructor(private patientService: PatientService,
              private carePlanService: CarePlanService,
              private http: HttpClient,
              private region: RegionalConfigService,
              private fhirService: FhirService) { }

  public compileAdherence(patient: fhir.Patient, carePlan: fhir.CarePlan, refresh: boolean = false,
                          includeMeds: boolean = true, includeGoals: boolean = true): Observable<IPatientAdherenceRow[]> {
    return combineLatest([
      includeGoals ? this.carePlanService.planGoals(carePlan, refresh) : of([]),
      includeMeds ? this.medicationsToRecords(patient) : of([])
    ]).pipe(map(([goals, meds]) => goals.concat(meds)));
  }

  private getDosageText(dosage: fhir.Dosage[]): string[] {
    if (!dosage || !dosage.length) {
      return void 0;
    }
    return dosage
      .map(d => {
        const timing = d.timing.repeat;
        let timingPeriod;
        if (timing.dayOfWeek && timing.dayOfWeek.length) {
          timingPeriod = ` on ${timing.dayOfWeek.map(a => capitalize(a)).join(', ')}`;
        } else {
          if (timing.period === 1) {
            timingPeriod = 'every day';
          } else {
            if (timing.period) {
              timingPeriod = this.getPeriodText(timing);
            } else {
              timingPeriod = ' as needed';
            }
          }
        }
        return `${d.doseQuantity.value} ${d.doseQuantity.unit}${d.doseQuantity.value !== 1 ? 's' : ''
          }${timing.timeOfDay && timing.timeOfDay.length && timing.period ? ` at ${timing.timeOfDay[0]}` : ''
          } ${timingPeriod}`;
      });
  }

  getPeriodText(timing) {
    const intPeriod = (!timing.period) ? '0' : timing.period?.toString();
    let periodText = 'every ';
    let periodValue = 'days';
    let period = intPeriod;
    if (!isNaN(parseInt(intPeriod, 10))) {
      let intQuotient = 0;
      let intRemainder = 0;
      if (parseInt(intPeriod, 10) >= 30) {
        intQuotient = Math.floor(parseInt(intPeriod, 10) / 30);
        intRemainder = parseInt(intPeriod, 10) % 30;
        if (intRemainder === 0) {
          period = intQuotient;
          periodValue = 'months';
        }
      } else if (parseInt(intPeriod, 10) >= 7) {
        intQuotient = Math.floor(parseInt(intPeriod, 10) / 7);
        intRemainder = parseInt(intPeriod, 10) % 7;
        if (intRemainder === 0) {
          period = intQuotient;
          periodValue = 'weeks';
        }
      }
    }
    periodText += period + ' ' + periodValue;
    return periodText;
  }

  public async medicationsToRecords(patient: fhir.Patient, options?): Promise<IPatientAdherenceRow[]> {
    return (await this.patientService.patientMedications(patient, options).toPromise())
      .map(med => {
        return <IPatientAdherenceRow>{
          record_type: 'medicine',
          ...MedicationService.medicationText(med.request),
          request: med.request,
          statements: med.statements,
          dosage: med.request.dosageInstruction,
          dosageText: this.getDosageText(med.request.dosageInstruction),
          startDate: med.request.dispenseRequest && med.request.dispenseRequest.validityPeriod
            ? med.request.dispenseRequest.validityPeriod.start
            : '',
          endDate: FhirService.flattenExtension((med.request.extension || []).find(e => e.url === 'deletedAt')
            || {url: ''})
        };
      });
  }

  public get snomedVersion(): string {
    return this._snomedVersion;
  }

  searchMedicine(term: string): Observable<fhir.Coding[]> {
    const endpoint = `${this.region.get('api').ontoserver.url}/ValueSet/$expand?_format=json&count=${COUNT}&filter=${term}&url=${this.region.get('api').ontoserver.snomed}`;
    return this.http
      .get<{ expansion: { contains: fhir.Coding[] }, version: string }>(
        endpoint,
        {
          params: {term: term.toLowerCase()}
        },
      ).pipe(
        map(s => {
          this._snomedVersion = s.version;
          (s.expansion.contains as fhir.Coding[] || []).forEach(ex => {
          });
          return s.expansion.contains as fhir.Coding[];
        })
      );
  }

  getMedicineUnit(displayName: string): string {
    return UNITS.find(u => displayName.includes(`${u},`));
  }

  createNewMedicine(patient: fhir.Patient, practitioner: fhir.Practitioner): IPatientAdherenceRow {
    const today = moment().format();

    const med: fhir.MedicationRequest = {
      dispenseRequest: {
        validityPeriod: {
          start: today
        }
      },
      resourceType: 'MedicationRequest',
      status: 'active',
      identifier: [{
        system: 'urn:uuid',
        value: uuid()
      }],
      extension: [{
        url: 'updatedAt',
        valueDateTime: today
      }],
      intent: 'plan',
      recorder: {
        reference: `Practitioner/${practitioner.id}`
      },
      subject: {
        reference: `Patient/${patient.id}`
      }
    };

    return <IPatientAdherenceRow>{
      name: '',
      request: med,
      dosage: med.dosageInstruction as fhir.TimingRepeat,
      startDate: med.dispenseRequest.validityPeriod.start,
      dosageText: this.getDosageText(med.dosageInstruction),
      record_type: 'medicine',
      statements: []
    };
  }


  private cancelMedicine(request: fhir.MedicationRequest, practitioner: fhir.Practitioner) {
    request.status = 'cancelled';
    request.extension = request.extension.filter(ext => ext.url !== 'deletedAt');

    // Cancel this medication at 23:59
    request.extension
      .push({
        url: 'deletedAt',
        valueDateTime: moment().format()
      });

    request.recorder = {
      reference: `Practitioner/${practitioner.id}`
    };
    return request;
  }

  cancelAndSaveMedicine(request: fhir.MedicationRequest, practitioner: fhir.Practitioner) {
    return this.fhirService.save<fhir.MedicationRequest>(this.cancelMedicine(request, practitioner)).toPromise();
  }

  replaceMedicine(oldMed: fhir.MedicationRequest, newMed: fhir.MedicationRequest, practitioner: fhir.Practitioner) {
    oldMed = this.cancelMedicine(oldMed, practitioner);

    // Start the new medication immediately
    newMed.dispenseRequest.validityPeriod.start =
      moment().format();

    newMed.extension =
      newMed.extension
        .filter(ext => ext.url !== 'updatedAt');

    newMed.extension
      .push({
        url: 'updatedAt',
        valueDateTime: moment().format()
      });

    newMed.priorPrescription = <fhir.Reference>{
      reference: `MedicationRequest/${oldMed.id}`
    };

    newMed.recorder = {
      reference: `Practitioner/${practitioner.id}`
    };


    const id = uuid();
    newMed.identifier = (newMed.identifier || [])
      .filter(x => x.system !== 'urn:uuid');
    newMed.identifier.push({
      system: 'urn:uuid',
      value: id
    });

    delete newMed.id;
    delete newMed.meta;

    const bundle: fhir.Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          request: {
            method: 'PUT',
            url: `MedicationRequest/${oldMed.id}`
          },
          resource: oldMed
        },
        {
          request: {
            method: 'POST',
            url: `urn:uuid:${id}`
          },
          resource: newMed
        }]
    };

    return this.fhirService.save<fhir.Bundle>(bundle).toPromise();
  }
}
