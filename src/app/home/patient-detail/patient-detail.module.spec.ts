import { PatientDetailModule } from './patient-detail.module';

describe('PatientDetailModule', () => {
  let patientDetailModule: PatientDetailModule;

  beforeEach(() => {
    patientDetailModule = new PatientDetailModule();
  });

  it('should create an instance', () => {
    expect(patientDetailModule).toBeTruthy();
  });
});
