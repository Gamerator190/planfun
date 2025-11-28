import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SeatSelection {
  seat: string;
  typeCode: string; // VIP | REG | SNR | CHD
}

interface Ticket {
  movie: string;
  poster: string;
  time: string;
  seats: string[];
  total: number;
  date: string;
  seatDetails?: SeatSelection[];
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

  // label tipe tiket
  typeLabels: Record<string, string> = {
    VIP: 'VIP',
    REG: 'General Admission',
    SNR: 'Senior Citizens',
    CHD: 'Children',
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('tix-tickets');
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
    if (!ticket.seatDetails) return '';

    const counter: Record<string, number> = {};

    for (const s of ticket.seatDetails) {
      counter[s.typeCode] = (counter[s.typeCode] || 0) + 1;
    }

    return Object.keys(counter)
      .map((code) => `${this.typeLabels[code]} x ${counter[code]}`)
      .join(', ');
  }

  openTicket(i: number) {
    this.router.navigate(['/tiket-saya', i]);
  }
}
