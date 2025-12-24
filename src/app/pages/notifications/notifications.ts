import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  tickets: any[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.apiService.getUserTickets().subscribe({
      next: (res) => {
        if (res.success) {
          this.tickets = res.tickets.map((t: any) => {
            if (!t.seatDetails) {
              t.seatDetails = t.seats.map((s: any) => ({
                seat: s,
                typeCode: 'REG',
              }));
            }
            // The isRead logic should ideally be handled by the backend
            // For now, we will just display the tickets
            return t;
          });
          this.notificationService.updateUnreadCount();
        }
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  getSeatTypeSummary(ticket: any): string {
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
    // This will need to be changed to pass ticket ID if we want to fetch ticket details on the e-ticket page
    this.router.navigate(['/notifications', i]);
  }
}
