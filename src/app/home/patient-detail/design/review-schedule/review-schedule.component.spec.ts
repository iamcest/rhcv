import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReviewScheduleComponent } from './review-schedule.component';
import { fhirServiceStub, TestingModule } from '../../../../../test';
import * as moment from 'moment';
import { FhirService } from '../../../../services/fhir.service';

describe('ReviewScheduleComponent', () => {
  let component: ReviewScheduleComponent;
  let fixture: ComponentFixture<ReviewScheduleComponent>;
  const dateTime = moment().set('hour', 9).set('minute', 0).set('second', 0);
  const updatedDateTime = dateTime.clone().add(9, 'day');
  const formValue = {
    period: {
      defaultTime: dateTime.format('HH:mm'),
      start: dateTime.clone()
    },

    reviews: [
      { id: '',
        date: '',
        time: ''
      },
      { id: '',
        date: '',
        time: ''
      },
      { id: '',
        date: '',
        time: ''
      },
      { id: '',
        date: '',
        time: ''
      }
    ]
   };

  const updatedFormValue = {
    period: {
      defaultTime: updatedDateTime.format('HH:mm'),
      start: updatedDateTime.clone()
    },

    reviews: [
      { id: '',
        date: '',
        time: ''
      },
      { id: '',
        date: '',
        time: ''
      },
      { id: '',
        date: '',
        time: ''
      },
      { id: '',
        date: '',
        time: ''
      }
    ]
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule],
      declarations: [ ReviewScheduleComponent ],
      providers: [
        { provide: FhirService, useValue: fhirServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  beforeEach(async () => {
    component.carePlan = {
      status: 'draft',
      intent: 'plan',
      subject: { reference: 'Patient/nobody'},
      context: { reference: 'EpisodeOfCare/testing'},
      resourceType: 'CarePlan',
      activity: [
        {
          detail: {
            status: 'not-started', scheduledString: 'P0W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '170571002',
                  display: 'Initial cardiac assessment'
                }
              ]
            }
          }
        },
        {
          detail: {
            status: 'not-started', scheduledString: 'P0W/P1W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '170572009',
                  display: 'Follow-up cardiac assessment'
                }
              ]
            }
          }
        },
        {
          detail: {
            status: 'not-started', scheduledString: 'P1W/P2W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '170572009',
                  display: 'Follow-up cardiac assessment'
                }
              ]
            }
          }
        },
        {
          detail: {
            status: 'not-started',
            scheduledString: 'P7W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '306496000',
                  display: 'Discharge by cardiac rehabilitation nurse'
                }
              ]
            }
          }
        }
      ]
    };

    component.parentPlan = {
      status: 'draft',
      intent: 'plan',
      subject: { reference: 'Patient/nobody'},
      context: { reference: 'EpisodeOfCare/testing'},
      resourceType: 'CarePlan',
      activity: [
        {
          detail: {
            status: 'not-started',
            scheduledString: 'P0W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '170571002',
                  display: 'Initial cardiac assessment'
                }
              ]
            },
          }
        },
        {
          detail: {
            status: 'not-started',
            scheduledString: 'P0W/P1W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '170572009',
                  display: 'Follow-up cardiac assessment'
                }
              ]
            },
          }
        },
        {
          detail: {
            status: 'not-started',
            scheduledString: 'P1W/P2W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '170572009',
                  display: 'Follow-up cardiac assessment'
                }
              ]
            },
          }
        },
        {
          detail: {
            status: 'not-started',
            scheduledString: 'P7W',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '306496000',
                  display: 'Discharge by cardiac rehabilitation nurse'
                }
              ]
            },
          }
        }
      ]
    };

    await component.initPlanSchedule();
  });

  it('sets and updates plan start date', async () => {
    expect(component.carePlan.period).toBeDefined();
    expect(component.carePlan.period.start).toEqual(formValue.period.start.format());

    await component.updatePlanDates(updatedFormValue);

    expect(component.carePlan.period).toBeDefined();
    expect(component.carePlan.period.start).toEqual(updatedFormValue.period.start.format());
  });

  it('sets and updates activity initial assessment start and end', async () => {
    expect(component.carePlan.activity[0].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[0].detail.scheduledPeriod.start).toEqual(dateTime.clone().startOf('day').format());
    expect(component.carePlan.activity[0].detail.scheduledPeriod.end).toEqual(dateTime.clone().endOf('day').format());

    await component.updatePlanDates(updatedFormValue);

    expect(component.carePlan.activity[0].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[0].detail.scheduledPeriod.start).toEqual(updatedDateTime.clone().startOf('day').format());
    expect(component.carePlan.activity[0].detail.scheduledPeriod.end).toEqual(updatedDateTime.clone().endOf('day').format());
  });

  it('sets and updates activity week 1 start and end', async () => {
    const startDate = dateTime.clone().startOf('day');
    const endDate = startDate.clone().add(6, 'day').endOf('day');
    expect(component.carePlan.activity[1].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[1].detail.scheduledPeriod.start).toEqual(startDate.format());
    expect(component.carePlan.activity[1].detail.scheduledPeriod.end).toEqual(endDate.format());

    await component.updatePlanDates(updatedFormValue);

    const updatedStartDate = updatedDateTime.clone().startOf('day');
    const updatedEndDate = updatedStartDate.clone().add(6, 'day').endOf('day');
    expect(component.carePlan.activity[1].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[1].detail.scheduledPeriod.start).toEqual(updatedStartDate.format());
    expect(component.carePlan.activity[1].detail.scheduledPeriod.end).toEqual(updatedEndDate.format());
  });

  it('sets activity week 2 start and end', async () => {
    const startDate = dateTime.clone().add(1, 'week').startOf('day');
    const endDate = startDate.clone().add(6, 'day').endOf('day');
    expect(component.carePlan.activity[2].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[2].detail.scheduledPeriod.start).toEqual(startDate.format());
    expect(component.carePlan.activity[2].detail.scheduledPeriod.end).toEqual(endDate.format());

    await component.updatePlanDates(updatedFormValue);

    const updatedStartDate = updatedDateTime.clone().add(1, 'week').startOf('day');
    const updatedEndDate = updatedStartDate.clone().add(6, 'day').endOf('day');
    expect(component.carePlan.activity[2].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[2].detail.scheduledPeriod.start).toEqual(updatedStartDate.format());
    expect(component.carePlan.activity[2].detail.scheduledPeriod.end).toEqual(updatedEndDate.format());
  });

  it('sets and updates activity final assessment start and end', async () => {
    const startDate = dateTime.clone().add(7, 'week').startOf('day');
    const endDate = startDate.clone().endOf('day');
    expect(component.carePlan.activity[3].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[3].detail.scheduledPeriod.start).toEqual(startDate.format());
    expect(component.carePlan.activity[3].detail.scheduledPeriod.end).toEqual(endDate.format());

    await component.updatePlanDates(updatedFormValue);

    const updatedStartDate = updatedDateTime.clone().add(7, 'week').startOf('day');
    const updatedEndDate = updatedStartDate.clone().endOf('day');
    expect(component.carePlan.activity[3].detail.scheduledPeriod.start).toBeDefined();
    expect(component.carePlan.activity[3].detail.scheduledPeriod.start).toEqual(updatedStartDate.format());
    expect(component.carePlan.activity[3].detail.scheduledPeriod.end).toEqual(updatedEndDate.format());
  });

  it('sets and updates plan end date', async () => {
    // The end date of the last weekly review
    const endDate = dateTime.clone().add(1, 'week').add(6, 'day').endOf('day');
    expect(component.carePlan.period).toBeDefined();
    expect(component.carePlan.period.end).toEqual(endDate.format());

    await component.updatePlanDates(updatedFormValue);

    const updatedEndDate = updatedDateTime.clone().add(1, 'week').add(6, 'day').endOf('day');
    expect(component.carePlan.period).toBeDefined();
    expect(component.carePlan.period.end).toEqual(updatedEndDate.format());
  });
});
