import { TestBed } from '@angular/core/testing';

import { BloodgroupService } from './bloodgroup.service';

describe('BloodgroupService', () => {
  let service: BloodgroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodgroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
