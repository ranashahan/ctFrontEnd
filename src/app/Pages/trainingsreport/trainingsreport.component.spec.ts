import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingsreportComponent } from './trainingsreport.component';

describe('TrainingsreportComponent', () => {
  let component: TrainingsreportComponent;
  let fixture: ComponentFixture<TrainingsreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingsreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingsreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
