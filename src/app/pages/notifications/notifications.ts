import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs'; 


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
  status?: 'active' | 'used' | 'cancelled'; 
  userId?: string;
  _id?: string; 
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'] 
})
export class NotificationsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = []; 
  private ticketsSubscription: Subscription | undefined;
  unreadCount: number = 0; 
  private unreadCountSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    
    this.notificationService.updateUnreadCount();

    
    this.ticketsSubscription = this.notificationService.tickets$.subscribe(
      (ticketsFromService: Ticket[]) => {
        this.tickets = ticketsFromService;
        this.cdr.detectChanges(); 
      }
    );

    
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      (count: number) => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      }
    );
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
      
      if (s.typeCode && typeof s.typeCode === 'string') {
        counter[s.typeCode] = (counter[s.typeCode] || 0) + 1;
      }
    }

    return Object.keys(counter)
      .map((code) => `${ticket.categoryTable?.[code]?.name || code} x ${counter[code]}`)
      .join(', ');
  }

  markAsRead(ticket: Ticket) {
    
    const rawTickets = localStorage.getItem('pf-tickets');
    if (rawTickets) {
      let allTickets: Ticket[] = JSON.parse(rawTickets);
      allTickets = allTickets.map(t => t._id === ticket._id ? { ...t, isRead: true } : t); 
      localStorage.setItem('pf-tickets', JSON.stringify(allTickets));
      this.notificationService.updateUnreadCount(); 
    }
  }

  openTicket(ticket: Ticket) { 
    if (ticket._id) {
      this.markAsRead(ticket); 
      this.router.navigate(['/e-ticket', ticket._id]);
    } else {
      console.error('Ticket ID is missing, cannot navigate to e-ticket.');
    }
  }
}