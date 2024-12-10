import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddtrainingComponent } from './addtraining.component';

describe('AddtrainingComponent', () => {
  let component: AddtrainingComponent;
  let fixture: ComponentFixture<AddtrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddtrainingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddtrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
