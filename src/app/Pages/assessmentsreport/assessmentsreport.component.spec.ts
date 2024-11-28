import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentsreportComponent } from './assessmentsreport.component';

describe('AssessmentsreportComponent', () => {
  let component: AssessmentsreportComponent;
  let fixture: ComponentFixture<AssessmentsreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentsreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentsreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
