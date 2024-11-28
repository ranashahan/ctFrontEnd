import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversearchComponent } from './driversearch.component';

describe('DriversearchComponent', () => {
  let component: DriversearchComponent;
  let fixture: ComponentFixture<DriversearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriversearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriversearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
