import { TestBed } from '@angular/core/testing';

import { ExcelreportService } from './excelreport.service';

describe('ExcelreportService', () => {
  let service: ExcelreportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelreportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
