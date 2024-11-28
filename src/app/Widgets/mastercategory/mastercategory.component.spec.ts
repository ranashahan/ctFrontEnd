import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MastercategoryComponent } from './mastercategory.component';

describe('MastercategoryComponent', () => {
  let component: MastercategoryComponent;
  let fixture: ComponentFixture<MastercategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MastercategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MastercategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
