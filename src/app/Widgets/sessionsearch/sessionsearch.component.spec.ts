import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsearchComponent } from './sessionsearch.component';

describe('SessionsearchComponent', () => {
  let component: SessionsearchComponent;
  let fixture: ComponentFixture<SessionsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
