import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddassessmentComponent } from './addassessment.component';

describe('AddassessmentComponent', () => {
  let component: AddassessmentComponent;
  let fixture: ComponentFixture<AddassessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddassessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
