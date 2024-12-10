import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlltrainingsComponent } from './alltrainings.component';

describe('AlltrainingsComponent', () => {
  let component: AlltrainingsComponent;
  let fixture: ComponentFixture<AlltrainingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlltrainingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlltrainingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
