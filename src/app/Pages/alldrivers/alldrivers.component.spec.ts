import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlldriversComponent } from './alldrivers.component';

describe('AlldriversComponent', () => {
  let component: AlldriversComponent;
  let fixture: ComponentFixture<AlldriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlldriversComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlldriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
