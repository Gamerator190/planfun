import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Event {
  id: number | string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  email?: string;
  poster?: string;
  isNew?: boolean;
  isSpecial?: boolean;
  promo?: any[];
  ticketCategories?: any[];
  seatConfiguration?: { row: string; category: string }[];
  bookedSeats?: string[];
}

interface SeatSelection {
  seat: string;
  typeCode: string; // VIP / REG / SNR / CHD
}

interface Ticket {
  event: Event; // Now stores the full Event object
  poster: string;
  time: string; // This is event time, not ticket purchase time
  seats: string[];
  total: number;
  purchaseDate: string; // New property for purchase date
  seatDetails?: SeatSelection[];
  categoryTable?: Record<string, { name: string; price: number }>;
  appliedPromo?: any;
  discountAmount?: number;
}

@Component({
  selector: 'app-e-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './e-ticket.html',
  styleUrl: './e-ticket.css',
})
export class ETicketComponent implements OnInit {
  ticket: Ticket | null = null;
  index = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.index = Number(this.route.snapshot.paramMap.get('index') || 0);

    const raw = localStorage.getItem('pf-tickets');
    if (!raw) {
      this.router.navigate(['/my-tickets']);
      return;
    }

    try {
      const list: Ticket[] = JSON.parse(raw);
      this.ticket = list[this.index];

      if (!this.ticket) {
        this.router.navigate(['/my-tickets']);
        return;
      }

      // fallback: kalau tiket lama tidak punya seatDetails
      if (!this.ticket.seatDetails) {
        this.ticket.seatDetails = this.ticket.seats.map((s) => ({
          seat: s,
          typeCode: 'REG',
        }));
      }
    } catch (err) {
      this.router.navigate(['/my-tickets']);
    }
  }

  // label "VIP", "Anak-anak", dll.
  getTypeLabel(code: string): string {
    return this.ticket?.categoryTable?.[code]?.name || code;
  }

  // harga per kategori
  getTypePrice(code: string): number {
    return this.ticket?.categoryTable?.[code]?.price ?? 0;
  }

  // formatting
  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    this.router.navigate(['/my-tickets']);
  }
}
