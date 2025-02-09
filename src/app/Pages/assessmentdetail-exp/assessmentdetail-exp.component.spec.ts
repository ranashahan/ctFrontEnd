import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentdetailExpComponent } from './assessmentdetail-exp.component';

describe('AssessmentdetailExpComponent', () => {
  let component: AssessmentdetailExpComponent;
  let fixture: ComponentFixture<AssessmentdetailExpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentdetailExpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentdetailExpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
