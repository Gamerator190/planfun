import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ETicket } from './e-ticket';

describe('ETicket', () => {
  let component: ETicket;
  let fixture: ComponentFixture<ETicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ETicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ETicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
