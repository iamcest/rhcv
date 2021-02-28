import { FhirCodingPipe } from './fhir-coding.pipe';

describe('FhirCodingPipe', () => {
  it('create an instance', () => {
    const pipe = new FhirCodingPipe();
    expect(pipe).toBeTruthy();
  });
});
