import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentdetailComponent } from './assessmentdetail.component';

describe('AssessmentdetailComponent', () => {
  let component: AssessmentdetailComponent;
  let fixture: ComponentFixture<AssessmentdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentdetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
