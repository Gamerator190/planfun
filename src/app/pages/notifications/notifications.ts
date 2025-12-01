import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

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

interface SeatSelection {
  seat: string;
  typeCode: string;
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
  isRead: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  tickets: Ticket[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('pf-tickets');
    if (raw) {
      try {
        let list: Ticket[] = JSON.parse(raw);

        this.tickets = list.map((t) => {
          if (!t.seatDetails) {
            t.seatDetails = t.seats.map((s) => ({
              seat: s,
              typeCode: 'REG',
            }));
          }
          if (typeof t.isRead === 'undefined' || t.isRead === false) {
            t.isRead = true;
          }
          return t;
        });
        localStorage.setItem('pf-tickets', JSON.stringify(this.tickets));
        this.notificationService.updateUnreadCount();
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

  getSeatTypeSummary(ticket: Ticket): string {
    if (!ticket.seatDetails || !ticket.categoryTable) return '';

    const counter: Record<string, number> = {};

    for (const s of ticket.seatDetails) {
      counter[s.typeCode] = (counter[s.typeCode] || 0) + 1;
    }

    return Object.keys(counter)
      .map((code) => `${ticket.categoryTable?.[code]?.name || code} x ${counter[code]}`)
      .join(', ');
  }

  openTicket(i: number) {
    this.router.navigate(['/notifications', i]);
  }
}
