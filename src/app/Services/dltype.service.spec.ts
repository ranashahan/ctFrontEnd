import { TestBed } from '@angular/core/testing';

import { DltypeService } from './dltype.service';

describe('DltypeService', () => {
  let service: DltypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DltypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
