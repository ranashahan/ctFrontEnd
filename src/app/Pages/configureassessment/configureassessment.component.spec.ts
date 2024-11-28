import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureassessmentComponent } from './configureassessment.component';

describe('ConfigureassessmentComponent', () => {
  let component: ConfigureassessmentComponent;
  let fixture: ComponentFixture<ConfigureassessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureassessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigureassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
