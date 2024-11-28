import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DltypeComponent } from './dltype.component';

describe('DltypeComponent', () => {
  let component: DltypeComponent;
  let fixture: ComponentFixture<DltypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DltypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DltypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
