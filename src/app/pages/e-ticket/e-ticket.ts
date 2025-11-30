import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface SeatSelection {
  seat: string;
  typeCode: string; // VIP / REG / SNR / CHD
}

interface Ticket {
  event: string;
  poster: string;
  time: string;
  seats: string[];
  total: number;
  date: string;
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
