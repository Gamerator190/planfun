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

import { Inject, Injectable, PLATFORM_ID } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common'; 
import { BehaviorSubject, Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _unreadCount = new BehaviorSubject<number>(0);
  public readonly unreadCount$: Observable<number> = this._unreadCount.asObservable();

  private _tickets = new BehaviorSubject<Ticket[]>([]); 
  public readonly tickets$: Observable<Ticket[]> = this._tickets.asObservable(); 

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { 
    if (isPlatformBrowser(this.platformId)) { 
      this.updateUnreadCount(); 
    }
  }

  updateUnreadCount(): void {
    if (isPlatformBrowser(this.platformId)) { 
      const rawTickets = localStorage.getItem('pf-tickets');
      const currentUserJson = localStorage.getItem('pf-current-user');
      let currentUserId = null;
      if (currentUserJson) {
        try {
          const user = JSON.parse(currentUserJson);
          currentUserId = user.id || user._id;
        } catch (e) {
          console.error('Error parsing current user');
        }
      }
      if (rawTickets) {
        try {
          const allTickets: Ticket[] = JSON.parse(rawTickets);
          const userTickets = currentUserId ? allTickets.filter(t => t.userId === currentUserId) : [];
          this._tickets.next(userTickets); 
          const count = userTickets.filter(t => !t.isRead).length;
          this._unreadCount.next(count);
        } catch (e) {
          console.error('Error parsing tickets for notifications:', e); 
          this._tickets.next([]);
          this._unreadCount.next(0);
        }
      } else {
        this._tickets.next([]);
        this._unreadCount.next(0);
      }
    } else {
      this._tickets.next([]);
      this._unreadCount.next(0);
    }
  }
}