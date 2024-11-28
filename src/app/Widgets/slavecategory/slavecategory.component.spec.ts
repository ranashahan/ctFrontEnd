import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlavecategoryComponent } from './slavecategory.component';

describe('SlavecategoryComponent', () => {
  let component: SlavecategoryComponent;
  let fixture: ComponentFixture<SlavecategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlavecategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlavecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
