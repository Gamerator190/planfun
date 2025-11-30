import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  @Input() bookedSeats: string[] = []; // Added bookedSeats input
  @Output() goBackEvent = new EventEmitter<void>();
  @Output() continueEvent = new EventEmitter<{ seatData: string; categoryTable: Record<string, { name: string; price: number }> }>();
  @Input() showContinueButton: boolean = true;

  // LOWER FOYER: A–J (10 baris)
  lowerRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  // BALCONY: AA–EE (5 baris)
  balconyRows = ['AA', 'BB', 'CC', 'DD', 'EE'];

  // semua kursi (lower + balcony)
  seats: Seat[][] = [];
  selectedSeats: string[] = [];

  categoryTable: Record<string, { name: string; price: number }> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticketCategories'] || changes['seatConfiguration'] || changes['bookedSeats']) { // Added bookedSeats to changes check
      let categories: Record<string, string> = {};

      if (this.ticketCategories && this.seatConfiguration) {
        // Create category table from ticketCategories
        this.categoryTable = this.ticketCategories.reduce((acc: Record<string, { name: string; price: number }>, cat: any) => {
          acc[cat.shortName] = { name: cat.name, price: cat.price };
          return acc;
        }, {});

        // Create categories map from seatConfiguration
        categories = this.seatConfiguration.reduce((acc: Record<string, string>, config: any) => {
          acc[config.row] = config.category;
          return acc;
        }, {});
      }

      // Fallback to default if not configured
      if (Object.keys(this.categoryTable).length === 0) {
        this.categoryTable = { GEN: { name: 'General', price: 25000 } };
      }
      if (Object.keys(categories).length === 0) {
        this.lowerRows.forEach((row) => (categories[row] = 'GEN'));
        this.balconyRows.forEach((row) => (categories[row] = 'GEN'));
      }

      this.generateSeats(categories);
    }
  }

  generateSeats(categories: Record<string, string>) {
    this.seats = [];
    const bookedSeatsSet = new Set(this.bookedSeats); // Convert to Set for efficient lookup

    // LOWER FOYER → 30 kursi per baris (10 kiri, 10 tengah, 10 kanan)
    for (const row of this.lowerRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= 30; i++) {
        const seatId = row + i;
        rowSeats.push({
          id: seatId,
          booked: bookedSeatsSet.has(seatId), // Use actual bookedSeats
          type: categories[row] || 'GEN',
        });
      }
      this.seats.push(rowSeats);
    }

    // BALCONY → 30 kursi per baris juga (10 kiri, 10 tengah, 10 kanan)
    for (const row of this.balconyRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= 30; i++) {
        const seatId = row + i;
        rowSeats.push({
          id: seatId,
          booked: bookedSeatsSet.has(seatId), // Use actual bookedSeats
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
