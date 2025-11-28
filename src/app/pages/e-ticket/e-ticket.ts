import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface SeatSelection {
  seat: string;
  typeCode: string; // VIP / REG / SNR / CHD
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
  selector: 'app-e-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './e-ticket.html',
  styleUrl: './e-ticket.css',
})
export class ETicketComponent implements OnInit {
  ticket: Ticket | null = null;
  index = 0;

  // tabel label + harga sesuai kategori
  typeLabels: Record<string, string> = {
    VIP: 'VIP',
    REG: 'General Admission',
    SNR: 'Senior Citizens',
    CHD: 'Children',
  };

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
    this.index = Number(this.route.snapshot.paramMap.get('index') || 0);

    const raw = localStorage.getItem('tix-tickets');
    if (!raw) {
      this.router.navigate(['/tiket-saya']);
      return;
    }

    try {
      const list: Ticket[] = JSON.parse(raw);
      this.ticket = list[this.index];

      if (!this.ticket) {
        this.router.navigate(['/tiket-saya']);
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
      this.router.navigate(['/tiket-saya']);
    }
  }

  // label "VIP", "Anak-anak", dll.
  getTypeLabel(code: string): string {
    return this.typeLabels[code] || code;
  }

  // harga per kategori
  getTypePrice(code: string): number {
    return this.priceTable[code] ?? 0;
  }

  // formatting
  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    this.router.navigate(['/tiket-saya']);
  }
}
