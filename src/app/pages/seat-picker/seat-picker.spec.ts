import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatPicker } from './seat-picker';

describe('SeatPicker', () => {
  let component: SeatPicker;
  let fixture: ComponentFixture<SeatPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
