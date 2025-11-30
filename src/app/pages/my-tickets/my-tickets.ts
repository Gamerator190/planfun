import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  typeCode: string; // VIP | REG | SNR | CHD
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
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css',
})
export class MyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('pf-tickets');
    if (raw) {
      try {
        const list: Ticket[] = JSON.parse(raw);

        // fallback untuk tiket lama
        this.tickets = list.map((t) => {
          if (!t.seatDetails) {
            t.seatDetails = t.seats.map((s) => ({
              seat: s,
              typeCode: 'REG',
            }));
          }
          return t;
        });
      } catch {
        this.tickets = [];
      }
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  // Ringkasan: "VIP x 2, Anak-anak x 1"
  getSeatTypeSummary(ticket: Ticket): string {
    if (!ticket.seatDetails || !ticket.categoryTable) return '';

    const counter: Record<string, number> = {};

    for (const s of ticket.seatDetails) {
      counter[s.typeCode] = (counter[s.typeCode] || 0) + 1;
    }

    return Object.keys(counter)
      .map((code) => `${ticket.categoryTable?.[code]?.name || code} x ${counter[code]}`)
      .join(', ');
  }

  openTicket(i: number) {
    this.router.navigate(['/my-tickets', i]);
  }
}
