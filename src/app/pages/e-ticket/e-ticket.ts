declare const QRCode: any;

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  availableSeats: number;
}

interface SeatSelection {
  seat: string;
  typeCode: string; // VIP / REG / SNR / CHD
}

interface Ticket {
  id: string; // Assuming ticket has an ID
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
  isRead: boolean; // Added isRead flag
}

@Component({
  selector: 'app-e-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './e-ticket.html',
  styleUrl: './e-ticket.css',
})
export class ETicketComponent implements OnInit, AfterViewInit {
  ticket: Ticket | null = null;
  index = 0;

  @ViewChild('qrcodeCanvas', { static: false }) qrcodeCanvas!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.index = Number(this.route.snapshot.paramMap.get('index') || 0);

    const raw = localStorage.getItem('pf-tickets');
    if (!raw) {
      this.router.navigate(['/notifications']);
      return;
    }

    try {
      const list: Ticket[] = JSON.parse(raw);
      this.ticket = list[this.index];

      if (!this.ticket) {
        this.router.navigate(['/notifications']);
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
      this.router.navigate(['/notifications']);
    }
  }

  ngAfterViewInit(): void {
    if (this.ticket && this.qrcodeCanvas) {
      this.generateQRCode();
    }
  }

  generateQRCode(): void {
    if (this.ticket) {
      const qrData = JSON.stringify({
        ticketId: this.ticket.id,
        eventName: this.ticket.event.title,
        purchaseDate: this.ticket.purchaseDate,
        // Add more relevant data if needed for verification
      });

      new QRCode(this.qrcodeCanvas.nativeElement, {
        text: qrData,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H, // High error correction
      });
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
    this.router.navigate(['/notifications']);
  }

  get isCancelDisabled(): boolean {
    if (!this.ticket || !this.ticket.event) return true;
    const eventDate = new Date(this.ticket.event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  }

  cancelBooking() {
    if (!this.ticket) return;

    const eventDate = new Date(this.ticket.event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      alert('Booking can only be cancelled 7 days or more prior to the event.');
      return;
    }

    // 1. Remove ticket from 'pf-tickets'
    const rawTickets = localStorage.getItem('pf-tickets');
    if (rawTickets) {
      const tickets: Ticket[] = JSON.parse(rawTickets);
      const updatedTickets = tickets.filter((_, i) => i !== this.index); // Filter out the current ticket
      localStorage.setItem('pf-tickets', JSON.stringify(updatedTickets));
    }

    // 2. Update 'bookedSeats' for the event in 'pf-events'
    const rawEvents = localStorage.getItem('pf-events');
    if (rawEvents) {
      const events: Event[] = JSON.parse(rawEvents);
      const eventIndex = events.findIndex((e) => e.id === this.ticket?.event.id);

      if (eventIndex !== -1) {
        const updatedEvent = { ...events[eventIndex] };
        const cancelledSeatIds = this.ticket.seats; // Get seats from the cancelled ticket
        updatedEvent.bookedSeats =
          updatedEvent.bookedSeats?.filter((seatId) => !cancelledSeatIds.includes(seatId)) || [];
        // Recalculate availableSeats for consistency
        const totalSeats = updatedEvent.seatConfiguration
          ? updatedEvent.seatConfiguration.length * 30
          : 0;
        updatedEvent.availableSeats = totalSeats - updatedEvent.bookedSeats.length;

        events[eventIndex] = updatedEvent;
        localStorage.setItem('pf-events', JSON.stringify(events));
      }
    }

    alert('Booking cancelled successfully!');
    this.router.navigate(['/notifications']);
  }
}
