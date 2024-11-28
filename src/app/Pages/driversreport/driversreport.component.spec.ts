import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversreportComponent } from './driversreport.component';

describe('DriversreportComponent', () => {
  let component: DriversreportComponent;
  let fixture: ComponentFixture<DriversreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriversreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriversreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
