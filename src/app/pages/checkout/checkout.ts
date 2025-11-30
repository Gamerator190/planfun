import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  appliedPromo: any = null;
  discountAmount = 0;
  finalTotal = 0;

  categoryTable: Record<string, { name: string; price: number }> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.time = String(this.route.snapshot.paramMap.get('time'));
    const seatsParam = this.route.snapshot.paramMap.get('seats') || '';
    const categoryTableString = this.route.snapshot.paramMap.get('categoryTable');

    if (categoryTableString) {
      this.categoryTable = JSON.parse(categoryTableString);
    }

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

  get applicableCategoriesLabel(): string {
    if (!this.appliedPromo || !this.appliedPromo.applicableTicketTypes) {
      return '';
    }
    const applicableTypes = Object.keys(this.appliedPromo.applicableTicketTypes)
      .filter(typeCode => this.appliedPromo.applicableTicketTypes[typeCode])
      .join(', ');
    return applicableTypes ? ` for ${applicableTypes}` : '';
  }

  updateTotal() {
    this.subtotal = this.seatSelections.reduce(
      (sum, sel) => sum + (this.categoryTable[sel.typeCode]?.price || 0),
      0,
    );

    if (this.appliedPromo) {
      const today = new Date().setHours(0, 0, 0, 0);
      const expiryDate = new Date(this.appliedPromo.expiryDate).setHours(0, 0, 0, 0);

      if (today > expiryDate) {
        alert('The applied promo code has expired.');
        this.appliedPromo = null;
        this.discountAmount = 0;
      } else {
        let discountableAmount = 0;
        for (const seat of this.seatSelections) {
          if (this.appliedPromo.applicableTicketTypes[seat.typeCode]) {
            discountableAmount += this.categoryTable[seat.typeCode]?.price || 0;
          }
        }
        this.discountAmount = (discountableAmount * this.appliedPromo.discountPercent) / 100;
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
      this.appliedPromo = null;
      this.updateTotal();
      return;
    }

    // if (!Array.isArray(this.event.promo) || this.event.promo.length === 0) {
    //   alert('No promo available for this event.');
    //   return;
    // }

    const promo = this.event.promo.find((p: any) => p.code === this.promoCodeInput);

    if (!promo) {
      alert('Invalid promo code.');
      this.appliedPromo = null;
      this.updateTotal();
      return;
    }

    this.appliedPromo = promo;
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
      event: this.event, // Store full event object
      poster: this.event.poster, // Keep for backward compatibility/simplicity
      time: this.time, // This is event time, so keep it for consistency
      seats: this.seatSelections.map((s) => s.seat),
      total: this.finalTotal,
      purchaseDate: new Date().toLocaleString('id-ID'), // Store purchase date
      seatDetails: this.seatSelections,
      categoryTable: this.categoryTable,
      appliedPromo: this.appliedPromo,
      discountAmount: this.discountAmount,
    };

    const existing: Ticket[] = JSON.parse(localStorage.getItem('pf-tickets') || '[]');
    existing.push(ticket);
    localStorage.setItem('pf-tickets', JSON.stringify(existing));

    // Update booked seats for the event
    const eventsJson = localStorage.getItem('pf-events');
    if (eventsJson) {
      const allEvents: any[] = JSON.parse(eventsJson);
      const eventIndex = allEvents.findIndex((e) => e.id === this.event.id);

      if (eventIndex !== -1) {
        const updatedEvent = { ...allEvents[eventIndex] };
        updatedEvent.bookedSeats = [
          ...(updatedEvent.bookedSeats || []),
          ...this.seatSelections.map((s) => s.seat),
        ];
        allEvents[eventIndex] = updatedEvent;
        localStorage.setItem('pf-events', JSON.stringify(allEvents));
      }
    }

    alert('Payment successful! Ticket saved 🎉');
    this.router.navigate(['/my-tickets']);
  }
}
