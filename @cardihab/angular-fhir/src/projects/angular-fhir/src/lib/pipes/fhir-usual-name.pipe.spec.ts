import { FhirUsualNamePipe } from './fhir-usual-name.pipe';

describe('FhirUsualNamePipe', () => {
  it('create an instance', () => {
    const pipe = new FhirUsualNamePipe();
    expect(pipe).toBeTruthy();
  });

  it('Should return <No Name> value not defined', () => {
    const pipe = new FhirUsualNamePipe();
    expect(pipe.transform(undefined)).toEqual('<No Name>');
  });

  it('Should return <No Name> value is empty array', () => {
    const pipe = new FhirUsualNamePipe();
    expect(pipe.transform([])).toEqual('<No Name>');
  });
});
