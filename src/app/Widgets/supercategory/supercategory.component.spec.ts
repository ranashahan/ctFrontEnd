import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupercategoryComponent } from './supercategory.component';

describe('SupercategoryComponent', () => {
  let component: SupercategoryComponent;
  let fixture: ComponentFixture<SupercategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupercategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupercategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
