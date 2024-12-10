import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TActionCellRendererComponent } from './taction-cell-renderer.component';

describe('TActionCellRendererComponent', () => {
  let component: TActionCellRendererComponent;
  let fixture: ComponentFixture<TActionCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TActionCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TActionCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
