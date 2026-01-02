import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs'; // For managing subscriptions

// Re-defining Ticket interface here to match what NotificationService provides
interface Ticket {
  eventId: string;
  eventTitle: string;
  poster: string;
  time: string;
  seats: string[];
  total: number;
  purchaseDate: string;
  seatDetails?: any[];
  categoryTable?: Record<string, { name: string; price: number }>;
  appliedPromo?: any;
  discountAmount?: number;
  isRead: boolean;
  userId?: string;
  _id?: string; // MongoDB ID for the ticket document itself
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'] // Corrected from styleUrl
})
export class NotificationsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = []; // Populate from NotificationService
  private ticketsSubscription: Subscription | undefined;
  unreadCount: number = 0; // For displaying unread count if needed in template
  private unreadCountSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    // Removed ApiService as it's not directly used here for getUserTickets anymore
    private cdr: ChangeDetectorRef // Injected ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to the tickets stream from NotificationService
    this.ticketsSubscription = this.notificationService.tickets$.subscribe(
      (ticketsFromService: Ticket[]) => {
        this.tickets = ticketsFromService;
        this.cdr.detectChanges(); // Trigger change detection when tickets update
      }
    );

    // Subscribe to unread count for display if needed
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      (count: number) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      }
    );

    // Initial load/update of tickets and unread count from localStorage
    this.notificationService.updateUnreadCount(); 
  }

  ngOnDestroy(): void {
    if (this.ticketsSubscription) {
      this.ticketsSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
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
      // Ensure typeCode exists and is valid key
      if (s.typeCode && typeof s.typeCode === 'string') {
        counter[s.typeCode] = (counter[s.typeCode] || 0) + 1;
      }
    }

    return Object.keys(counter)
      .map((code) => `${ticket.categoryTable?.[code]?.name || code} x ${counter[code]}`)
      .join(', ');
  }

  markAsRead(ticket: Ticket) {
    // Logic to update `isRead` in localStorage
    const rawTickets = localStorage.getItem('pf-tickets');
    if (rawTickets) {
      let allTickets: Ticket[] = JSON.parse(rawTickets);
      allTickets = allTickets.map(t => t._id === ticket._id ? { ...t, isRead: true } : t); // Compare by _id
      localStorage.setItem('pf-tickets', JSON.stringify(allTickets));
      this.notificationService.updateUnreadCount(); // Trigger service to refresh
    }
  }

  openTicket(ticket: Ticket) { // Pass the full ticket object
    if (ticket._id) {
      this.markAsRead(ticket); // Mark as read before navigating
      this.router.navigate(['/e-ticket', ticket._id]);
    } else {
      console.error('Ticket ID is missing, cannot navigate to e-ticket.');
    }
  }
}