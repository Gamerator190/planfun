import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Ticket {
  event: string;
  poster: string;
  time: string;
  seats: string[];
  total: number;
  date: string;
  seatDetails?: SeatSelection[];
}

interface TicketType {
  code: string;
  label: string;
  price: number;
}

interface SeatSelection {
  seat: string;
  typeCode: string; // REG, VIP, SNR, CHD
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  event: any = null;
  time = '';

  // daftar tipe + harga (kode harus sama dengan dari seat-picker: VIP/REG/SNR/CHD)
  ticketTypes: TicketType[] = [
    { code: 'REG', label: 'General Admission', price: 45000 },
    { code: 'VIP', label: 'VIP', price: 65000 },
    { code: 'SNR', label: 'Senior Citizens', price: 30000 },
    { code: 'CHD', label: 'Children', price: 25000 },
  ];

  seatSelections: SeatSelection[] = [];
  total = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.time = String(this.route.snapshot.paramMap.get('time'));
    const seatsParam = this.route.snapshot.paramMap.get('seats') || '';

    // seatsParam bentuknya: "A1:VIP,B3:VIP,C4:REG,E2:SNR"
    if (seatsParam) {
      this.seatSelections = seatsParam
        .split(',')
        .map((pair) => {
          const [seat, typeCode] = pair.split(':');
          return {
            seat: seat?.trim(),
            typeCode: (typeCode || 'REG').trim(),
          } as SeatSelection;
        })
        .filter((s) => !!s.seat);
    }

    const eventsJson = localStorage.getItem('pf-events');
    if (eventsJson) {
      const events = JSON.parse(eventsJson);
      this.event = events.find((m: any) => m.id === eventId);
    }

    if (!this.event) {
      alert('Event data not found');
      this.router.navigate(['/home']);
      return;
    }

    this.updateTotal();
  }

  // daftar kursi saja, untuk tampilan ringkas
  get seatListLabel(): string {
    return this.seatSelections.map((s) => s.seat).join(', ');
  }

  getTypePrice(code: string): number {
    const t = this.ticketTypes.find((tt) => tt.code === code);
    return t ? t.price : 0;
  }

  getTypeLabel(code: string): string {
    const t = this.ticketTypes.find((tt) => tt.code === code);
    return t ? t.label : code;
  }

  updateTotal() {
    this.total = this.seatSelections.reduce((sum, sel) => sum + this.getTypePrice(sel.typeCode), 0);
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    this.router.navigate(['/event', this.event.id, 'schedule']);
  }

  bayar() {
    if (!this.seatSelections.length) {
      alert('No seats selected.');
      return;
    }

    const ticket: Ticket = {
      event: this.event.title,
      poster: this.event.poster,
      time: this.time,
      seats: this.seatSelections.map((s) => s.seat),
      total: this.total,
      date: new Date().toLocaleString('id-ID'),
      seatDetails: this.seatSelections,
    };

    const existing: Ticket[] = JSON.parse(localStorage.getItem('pf-tickets') || '[]');
    existing.push(ticket);
    localStorage.setItem('pf-tickets', JSON.stringify(existing));

    alert('Payment successful! Ticket saved 🎉');
    this.router.navigate(['/my-tickets']);
  }
}
