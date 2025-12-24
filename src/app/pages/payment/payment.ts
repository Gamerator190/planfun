import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

    const ticketData = {
      ...this.ticket,
      eventId: this.ticket.event._id,
    };

    this.apiService.createTicket(ticketData).subscribe({
      next: (res) => {
        if (res.success) {
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
      const eventId = this.ticket.event._id;
      const eventTime = this.ticket.time;
      const seatData = this.ticket.seatDetails
        ? this.ticket.seatDetails.map((s: any) => `${s.seat}:${s.typeCode}`).join(',')
        : this.ticket.seats.map((s: any) => `${s}:REG`).join(',');

      const categoryTableString = this.ticket.categoryTable
        ? JSON.stringify(this.ticket.categoryTable)
        : '';

      this.router.navigate([
        '/checkout',
        eventId,
        eventTime,
        seatData,
        { categoryTable: categoryTableString },
      ]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
