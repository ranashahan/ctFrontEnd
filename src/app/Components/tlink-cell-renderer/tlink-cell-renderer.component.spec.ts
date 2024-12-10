import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TlinkCellRendererComponent } from './tlink-cell-renderer.component';

describe('TlinkCellRendererComponent', () => {
  let component: TlinkCellRendererComponent;
  let fixture: ComponentFixture<TlinkCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TlinkCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TlinkCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
