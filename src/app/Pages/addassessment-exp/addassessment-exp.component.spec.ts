import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddassessmentEXPComponent } from './addassessment-exp.component';

describe('AddassessmentEXPComponent', () => {
  let component: AddassessmentEXPComponent;
  let fixture: ComponentFixture<AddassessmentEXPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddassessmentEXPComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddassessmentEXPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
