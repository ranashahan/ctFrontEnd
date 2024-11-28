import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllassessmentsComponent } from './allassessments.component';

describe('AllassessmentsComponent', () => {
  let component: AllassessmentsComponent;
  let fixture: ComponentFixture<AllassessmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllassessmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllassessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
