import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentComponent implements OnInit {
  ticket: any | null = null;
  paymentOption: 'creditCard' | 'eWallet' | 'bankTransfer' = 'creditCard';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const ticketDataString = this.route.snapshot.paramMap.get('ticketData');
    if (ticketDataString) {
      try {
        this.ticket = JSON.parse(ticketDataString);
      } catch (e) {
        console.error('Error parsing ticket data from route:', e);
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  processPayment() {
    if (!this.ticket) return;

    // The ticket object already contains eventId, so we can pass it directly.
    this.apiService.createTicket(this.ticket).subscribe({
      next: (res) => {
        if (res.success) {
          // --- BUG FIX: Add new ticket to localStorage ---
          if (isPlatformBrowser(this.platformId)) {
            const rawTickets = localStorage.getItem('pf-tickets');
            let tickets = [];
            if (rawTickets) {
              try {
                tickets = JSON.parse(rawTickets);
              } catch (e) {
                console.error('Could not parse existing tickets, starting fresh.');
              }
            }
            // The response from createTicket should be the new ticket object.
            // We'll add the flat eventTitle and poster to it for consistency.
            const newTicketForStorage = {
              ...res.ticket,
              eventTitle: this.ticket.eventTitle,
              poster: this.ticket.poster,
              eventDate: this.ticket.eventDate,
              time: this.ticket.time, // Add the event time here
            };
            tickets.push(newTicketForStorage);
            localStorage.setItem('pf-tickets', JSON.stringify(tickets));
          }
          // --- END BUG FIX ---

          alert(`Payment successful via ${this.paymentOption}!`);
          this.notificationService.updateUnreadCount();
          this.router.navigate(['/home']);
        } else {
          alert(`Payment failed: ${res.message}`);
        }
      },
      error: (err) => {
        alert(`An error occurred during payment: ${err.error?.message || err.message}`);
      }
    });
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    if (this.ticket) {
      this.router.navigate(
        [
          '/checkout',
          this.ticket.eventId,
          this.ticket.time,
          this.ticket.seats.join(','),
        ],
        {
          state: { categoryTable: this.ticket.categoryTable } // Correctly pass state back
        }
      );
    } else {
      this.router.navigate(['/home']);
    }
  }
}
