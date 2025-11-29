import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  event: any = null;
  time = '';

  seatSelections: SeatSelection[] = [];
  subtotal = 0;
  promoCodeInput = '';
  appliedPromotion: any = null;
  discountAmount = 0;
  finalTotal = 0;

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
    if (!this.event || !this.event.ticketCategories) {
      return 0;
    }
    const t = this.event.ticketCategories.find((cat: any) => cat.shortName === code);
    return t ? t.price : 0;
  }

  getTypeLabel(code: string): string {
    if (!this.event || !this.event.ticketCategories) {
      return code;
    }
    const t = this.event.ticketCategories.find((cat: any) => cat.shortName === code);
    return t ? t.name : code;
  }

  updateTotal() {
    this.subtotal = this.seatSelections.reduce((sum, sel) => sum + this.getTypePrice(sel.typeCode), 0);

    if (this.appliedPromotion) {
      const today = new Date().setHours(0, 0, 0, 0);
      const expiryDate = new Date(this.appliedPromotion.expiryDate).setHours(0, 0, 0, 0);

      if (today > expiryDate) {
        alert('The applied promo code has expired.');
        this.appliedPromotion = null;
        this.discountAmount = 0;
      } else {
        let discountableAmount = 0;
        for (const seat of this.seatSelections) {
          if (this.appliedPromotion.applicableTicketTypes[seat.typeCode]) {
            discountableAmount += this.getTypePrice(seat.typeCode);
          }
        }
        this.discountAmount = (discountableAmount * this.appliedPromotion.discountPercent) / 100;
      }
    } else {
        this.discountAmount = 0;
    }

    this.finalTotal = this.subtotal - this.discountAmount;
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  applyPromo() {
    if (!this.promoCodeInput) {
      this.appliedPromotion = null;
      this.updateTotal();
      return;
    }

    if (!this.event.promotions || this.event.promotions.length === 0) {
      alert('No promotions available for this event.');
      return;
    }

    const promo = this.event.promotions.find((p: any) => p.code === this.promoCodeInput);

    if (!promo) {
      alert('Invalid promo code.');
      this.appliedPromotion = null;
      this.updateTotal();
      return;
    }

    this.appliedPromotion = promo;
    this.updateTotal();
  }

  goBack() {
    this.router.navigate(['/event', this.event.id]);
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
      total: this.finalTotal,
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
