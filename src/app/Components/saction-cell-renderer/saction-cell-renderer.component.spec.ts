import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SActionCellRendererComponent } from './saction-cell-renderer.component';

describe('SActionCellRendererComponent', () => {
  let component: SActionCellRendererComponent;
  let fixture: ComponentFixture<SActionCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SActionCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
