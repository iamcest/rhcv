import { TestBed, inject } from '@angular/core/testing';

import { CarePlanService } from './care-plan.service';
import { FhirService } from './fhir.service';
import { fhirServiceStub, patientServiceStub, practitionerServiceStub, medicationServiceStub } from '../../test';
import { PatientService } from './patient.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PractitionerService } from './practitioner.service';
import { MedicationService } from './medication.service';
import { of } from 'rxjs';
import * as moment from 'moment';

describe('CareplanService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CarePlanService,
      {provide: FhirService, useValue: fhirServiceStub},
      {provide: PatientService, useValue: patientServiceStub},
      {provide: PractitionerService, useValue: practitionerServiceStub},
      {provide: MedicationService, useValue: medicationServiceStub}
    ]
    });
  });

  it('should be created', inject([CarePlanService], (service: CarePlanService) => {
    expect(service).toBeTruthy();
  }));


  it('should expand recurring goals', inject([CarePlanService, FhirService], async (service: CarePlanService, fhirService: FhirService) => {
    const fakePlan: fhir.CarePlan = {
      resourceType: 'CarePlan',
      context: {
        reference: '#context'
      },
      subject: {
        reference: '#patient'
      },
      intent: 'plan',
      status: 'draft',
      period: {
        start: '2070-01-01T00:00Z',
        end: '2070-02-01T00:00Z'
      },
      goal: [
        {
          reference: 'Goal/planGoal'
        }
      ],
      contained: [
        {
          id: 'patient'
        },
        {
          id: 'context'
        }
      ]
    };
    const planGoal = {
      resourceType: 'Goal',
      id: 'planGoal',
      status: 'proposed',
      extension: [
        {
          url: 'https://fhir-registry.cardihab.com/StructureDefiniton/RecurringTask',
          extension: [{
              url: 'timing',
              valueString: 'R/PT9H/P1D'
            }
          ]
        }
      ]
    };
    spyOn(service, 'findQuestionsAndAnswers').and.returnValue(Promise.resolve({} as any));
    spyOn(fhirService, 'resolveReferences').and.
    returnValue(
      of({
        type: 'Bundle',
        entry: [{
          resource: planGoal
        }]
      })
    );
    // spyOn(fhirService.save)
    const result: fhir.Bundle = await service.activate(fakePlan);

    expect(result).toBeDefined();
    expect(result.entry).toBeDefined();
    const activatedGoals: fhir.Goal[] = result.entry.filter(e => e.resource.resourceType === 'Goal').map(e => e.resource as fhir.Goal);
    activatedGoals.sort((a, b) => a.startDate.localeCompare(b.startDate));
    expect(activatedGoals.length).toBe(32);
    expect(activatedGoals[0].startDate).toBeDefined();
    console.log(moment(activatedGoals[0].startDate).toISOString());
    expect(moment(activatedGoals[0].startDate).toISOString()).toBe(moment('2070-01-01T00:00Z').add(9, 'hours').toISOString());
  }));
});
