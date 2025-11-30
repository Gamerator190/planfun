import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Event {
  id: number | string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  poster?: string;
  isNew?: boolean;
  isSpecial?: boolean;
  promoCode?: string;
  discount?: number;
  bookedSeats?: string[]; // Added bookedSeats
  seatConfiguration?: { row: string; category: string }[]; // Added seatConfiguration
  availableSeats: number; // Made availableSeats required
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  userName = 'Guest';
  showMenu = false;
  userRole = '';

  constructor(public router: Router) {}

  events: Event[] = [];

  ngOnInit(): void {
    const userJson = localStorage.getItem('pf-current-user');

    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      this.userName = user.name || 'Event Lover';
      this.userRole = user.role || '';
    } catch {
      this.userName = 'Event Lover';
    }

    const eventsFromStorage = localStorage.getItem('pf-events');
    if (eventsFromStorage) {
      try {
        const storedEvents: Event[] = JSON.parse(eventsFromStorage);
        this.events = storedEvents.map(event => {
          const totalSeats = event.seatConfiguration ? event.seatConfiguration.length * 30 : 0;
          const bookedSeatsCount = event.bookedSeats ? event.bookedSeats.length : 0;
          return {
            ...event,
            availableSeats: totalSeats - bookedSeatsCount
          };
        });
      } catch (e) {
        console.error('Error parsing events from localStorage', e);
        this.events = [];
      }
    } else {
      this.events = [];
    }
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  openNotifications() {
    alert('There are no new notifications 😊');
  }

  goEvent(id: number | string) {
    this.router.navigate(['/event', id]);
  }

  goAdmin() {
    this.router.navigate(['/admin-dashboard']);
  }

  goOrganizer() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    localStorage.removeItem('pf-current-user');
    this.router.navigate(['/login']);
  }
}
