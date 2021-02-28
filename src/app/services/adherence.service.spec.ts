import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdherenceService } from './adherence.service';

describe('AdherenceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdherenceService
      ]
    });
  });

  it('should be created', inject([AdherenceService], (service: AdherenceService) => {
    expect(service).toBeTruthy();
  }));
});
