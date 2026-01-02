import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

type Seat = { id: string; booked: boolean; type: string };

@Component({
  selector: 'app-seat-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-picker.html',
  styleUrl: './seat-picker.css',
})
export class SeatPickerComponent implements OnChanges {
  @Input() ticketCategories: any[] = [];
  @Input() seatConfiguration: any[] = [];
  @Input() bookedSeats: string[] = [];
  @Output() goBackEvent = new EventEmitter<void>();
  @Output() continueEvent = new EventEmitter<{
    seatData: string;
    categoryTable: Record<string, { name: string; price: number }>;
  }>();
  @Input() showContinueButton: boolean = true;

  lowerRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  balconyRows = ['AA', 'BB', 'CC', 'DD', 'EE'];

  seats: Seat[][] = [];
  selectedSeats: string[] = [];

  categoryTable: Record<string, { name: string; price: number }> = {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketCategories'] || changes['seatConfiguration'] || changes['bookedSeats']) {
      let categories: Record<string, string> = {};

      if (this.ticketCategories && this.seatConfiguration) {
        this.categoryTable = this.ticketCategories.reduce(
          (acc: Record<string, { name: string; price: number }>, cat: any) => {
            acc[cat.shortName] = { name: cat.name, price: cat.price };
            return acc;
          },
          {},
        );

        categories = this.seatConfiguration.reduce((acc: Record<string, string>, config: any) => {
          acc[config.row] = config.category;
          return acc;
        }, {});
      }

      if (Object.keys(this.categoryTable).length === 0) {
        this.categoryTable = { GEN: { name: 'General', price: 25000 } };
      }
      if (Object.keys(categories).length === 0) {
        this.lowerRows.forEach((row) => (categories[row] = 'GEN'));
        this.balconyRows.forEach((row) => (categories[row] = 'GEN'));
      }

      this.generateSeats(categories);
      this.cdr.detectChanges();
    }
  }

  generateSeats(categories: Record<string, string>) {
    this.seats = [];
    const bookedSeatsSet = new Set(this.bookedSeats);

    for (const row of this.lowerRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= 30; i++) {
        const seatId = row + i;
        rowSeats.push({
          id: seatId,
          booked: bookedSeatsSet.has(seatId),
          type: categories[row] || 'GEN',
        });
      }
      this.seats.push(rowSeats);
    }

    for (const row of this.balconyRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= 30; i++) {
        const seatId = row + i;
        rowSeats.push({
          id: seatId,
          booked: bookedSeatsSet.has(seatId),
          type: categories[row] || 'GEN',
        });
      }
      this.seats.push(rowSeats);
    }
  }

  // getter buat template
  get lowerFoyerSeats(): Seat[][] {
    return this.seats.slice(0, this.lowerRows.length);
  }

  get balconySeats(): Seat[][] {
    return this.seats.slice(this.lowerRows.length);
  }

  toggleSeat(seat: Seat) {
    if (seat.booked) return;

    const idx = this.selectedSeats.indexOf(seat.id);
    if (idx >= 0) {
      this.selectedSeats.splice(idx, 1);
    } else {
      // Check max tickets for the category (per session)
      const category = seat.type;
      const cat = this.ticketCategories.find(c => c.shortName === category);
      if (cat && cat.maxTickets > 0) {
        // Count currently selected seats for this category
        const selectedCount = this.selectedSeats.filter(seatId => {
          const s = this.seats.flat().find(s => s.id === seatId);
          return s && s.type === category;
        }).length;

        if (selectedCount + 1 > cat.maxTickets) {
          alert(`Maximum tickets (${cat.maxTickets}) exceeded for category ${cat.name}. You can select up to ${cat.maxTickets} tickets per category in this session.`);
          return;
        }
      }

      this.selectedSeats.push(seat.id);
    }
  }

  goBack() {
    this.goBackEvent.emit();
  }

  get selectedSeatDetails() {
    const flat = this.seats.flat();
    return this.selectedSeats.map((id) => {
      const seat = flat.find((s) => s.id === id);
      const type = seat?.type ?? 'REG';
      const price = this.categoryTable[type]?.price ?? 0;
      return { id, type, price };
    });
  }

  get totalPrice(): number {
    return this.selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  selectAllSeats() {
    const availableSeats = new Set<string>();
    for (const row of this.seats) {
      for (const seat of row) {
        if (!seat.booked) {
          availableSeats.add(seat.id);
        }
      }
    }
    this.selectedSeats = [...availableSeats];
    // Bypass max tickets check for dev and go to checkout
    this.continue();
  }

  continue() {
    if (!this.selectedSeats.length) {
      alert('Please choose at least 1 seat first, okay? 😊');
      return;
    }

    const flat = this.seats.flat();
    const seatData = this.selectedSeats
      .map((id) => {
        const seat = flat.find((s) => s.id === id);
        const type = seat?.type ?? 'REG';
        return `${id}:${type}`;
      })
      .join(',');

    this.continueEvent.emit({ seatData, categoryTable: this.categoryTable });
  }
}
