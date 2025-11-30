import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Define Event interface, consistent with dashboard.ts, checkout.ts, e-ticket.ts
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
  availableSeats?: number;
}

interface SeatSelection {
  seat: string;
  typeCode: string; // REG, VIP, SNR, CHD
}

interface Ticket {
  event: Event;
  poster: string;
  time: string;
  seats: string[];
  total: number;
  purchaseDate: string;
  seatDetails?: SeatSelection[];
  categoryTable?: Record<string, { name: string; price: number }>;
  appliedPromo?: any;
  discountAmount?: number;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentComponent implements OnInit {
  ticket: Ticket | null = null;
  paymentOption: 'creditCard' | 'eWallet' | 'bankTransfer' = 'creditCard'; // Default payment option

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const ticketDataString = this.route.snapshot.paramMap.get('ticketData');
    if (ticketDataString) {
      try {
        this.ticket = JSON.parse(ticketDataString);
        // Ensure availableSeats is calculated for the event if not present (for old event data)
        if (this.ticket && this.ticket.event && typeof this.ticket.event.availableSeats === 'undefined') {
          const totalSeats = this.ticket.event.seatConfiguration ? this.ticket.event.seatConfiguration.length * 30 : 0;
          const bookedSeatsCount = this.ticket.event.bookedSeats ? this.ticket.event.bookedSeats.length : 0;
          this.ticket.event.availableSeats = totalSeats - bookedSeatsCount;
        }
      } catch (e) {
        console.error('Error parsing ticket data from route:', e);
        this.router.navigate(['/home']); // Redirect home if data is invalid
      }
    } else {
      this.router.navigate(['/home']); // Redirect home if no ticket data
    }
  }

  processPayment() {
    if (!this.ticket) return;

    // Simulate payment success
    alert(`Payment successful via ${this.paymentOption}!`);

    // Perform localStorage operations (copied from CheckoutComponent's bayar method)
    // 1. Save the ticket to 'pf-tickets'
    const existingTicketsRaw = localStorage.getItem('pf-tickets');
    const existingTickets: Ticket[] = existingTicketsRaw ? JSON.parse(existingTicketsRaw) : [];
    existingTickets.push(this.ticket);
    localStorage.setItem('pf-tickets', JSON.stringify(existingTickets));

    // 2. Update booked seats for the event in 'pf-events'
    const eventsJson = localStorage.getItem('pf-events');
    if (eventsJson) {
      const allEvents: any[] = JSON.parse(eventsJson);
      const eventIndex = allEvents.findIndex((e) => e.id === this.ticket?.event.id);

      if (eventIndex !== -1) {
        const updatedEvent = { ...allEvents[eventIndex] };
        const bookedSeatsToAdd = this.ticket.seats;
        updatedEvent.bookedSeats = [
          ...(updatedEvent.bookedSeats || []),
          ...bookedSeatsToAdd,
        ];
        // Recalculate availableSeats for consistency
        const totalSeats = updatedEvent.seatConfiguration ? updatedEvent.seatConfiguration.length * 30 : 0;
        updatedEvent.availableSeats = totalSeats - updatedEvent.bookedSeats.length;

        allEvents[eventIndex] = updatedEvent;
        localStorage.setItem('pf-events', JSON.stringify(allEvents));
      }
    }

    // Redirect to home page
    this.router.navigate(['/home']);
  }

  // Helper for displaying currency
  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    if (this.ticket) {
      const eventId = this.ticket.event.id;
      const eventTime = this.ticket.time; // Use ticket.time (event time)
      const seatData = this.ticket.seatDetails
                       ? this.ticket.seatDetails.map(s => `${s.seat}:${s.typeCode}`).join(',')
                       : this.ticket.seats.map(s => `${s}:REG`).join(','); // Fallback logic consistent with checkout

      const categoryTableString = this.ticket.categoryTable ? JSON.stringify(this.ticket.categoryTable) : '';

      this.router.navigate(['/checkout', eventId, eventTime, seatData, { categoryTable: categoryTableString }]);
    } else {
      this.router.navigate(['/home']); // Fallback if no ticket data
    }
  }
}