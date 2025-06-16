import { TestBed } from '@angular/core/testing';

import { ExceljsService } from './exceljs.service';

describe('ExceljsService', () => {
  let service: ExceljsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExceljsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
