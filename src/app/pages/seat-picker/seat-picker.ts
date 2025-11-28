import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

type Seat = { id: string; booked: boolean; type: string };

@Component({
  selector: 'app-seat-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-picker.html',
  styleUrl: './seat-picker.css',
})
export class SeatPickerComponent implements OnInit {
  movieId!: number;
  time!: string;

  // LOWER FOYER: A–J (10 baris)
  lowerRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  // BALCONY: AA–EE (5 baris)
  balconyRows = ['AA', 'BB', 'CC', 'DD', 'EE'];

  // semua kursi (lower + balcony)
  seats: Seat[][] = [];
  selectedSeats: string[] = [];

  priceTable: Record<string, number> = {
    VIP: 65000,
    REG: 45000,
    SNR: 30000,
    CHD: 25000,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.movieId = Number(this.route.snapshot.paramMap.get('id'));
    this.time = String(this.route.snapshot.paramMap.get('time'));
    this.generateSeats();
  }

  generateSeats() {
    this.seats = [];

    const categories: Record<string, string> = {
      A: 'VIP',
      B: 'VIP',
      C: 'REG',
      D: 'REG',
      E: 'REG',
      F: 'REG',
      G: 'REG',
      H: 'REG',
      I: 'SNR',
      J: 'SNR',

      AA: 'REG',
      BB: 'REG',
      CC: 'REG',
      DD: 'SNR',
      EE: 'CHD',
    };

    // LOWER FOYER → 30 kursi per baris (10 kiri, 10 tengah, 10 kanan)
    for (const row of this.lowerRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= 30; i++) {
        rowSeats.push({
          id: row + i,
          booked: Math.random() < 0.15,
          type: categories[row] || 'REG',
        });
      }
      this.seats.push(rowSeats);
    }

    // BALCONY → 30 kursi per baris juga (10 kiri, 10 tengah, 10 kanan)
    for (const row of this.balconyRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= 30; i++) {
        rowSeats.push({
          id: row + i,
          booked: Math.random() < 0.15,
          type: categories[row] || 'REG',
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
    this.router.navigate(['/movie', this.movieId, 'schedule']);
  }

  get selectedSeatDetails() {
    const flat = this.seats.flat();
    return this.selectedSeats.map((id) => {
      const seat = flat.find((s) => s.id === id);
      const type = seat?.type ?? 'REG';
      const price = this.priceTable[type] ?? 0;
      return { id, type, price };
    });
  }

  get totalPrice(): number {
    return this.selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  lanjut() {
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

    this.router.navigate(['/checkout', this.movieId, this.time, seatData]);
  }
}
