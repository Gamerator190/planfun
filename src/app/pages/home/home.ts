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

  private hardcodedEvents: Event[] = [
    {
      id: 1,
      title: 'Digital Innovation Conference 2025',
      location: 'Main Auditorium',
      date: '2025-03-10',
      time: '09:00',
      description: 'A conference about the future of technology.',
      isNew: true,
      poster: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    },
    {
      id: 2,
      title: 'Creative Technology Workshop Series',
      location: 'Main Auditorium',
      date: '2025-04-05',
      time: '13:00',
      description: 'A workshop for creative minds.',
      isNew: true,
      poster: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
    },
    {
      id: 3,
      title: 'Leadership & Career Development Conference',
      location: 'Main Auditorium',
      date: '2025-05-20',
      time: '10:00',
      description: 'A conference for future leaders.',
      poster: 'https://images.pexels.com/photos/1181395/pexels-photo-1181395.jpeg',
    },
  ];

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
        const storedEventIds = new Set(storedEvents.map((e) => e.id));
        const filteredHardcodedEvents = this.hardcodedEvents.filter(
          (e) => !storedEventIds.has(e.id),
        );
        this.events = [...storedEvents, ...filteredHardcodedEvents];
      } catch (e) {
        console.error('Error parsing events from localStorage', e);
        this.events = this.hardcodedEvents;
      }
    } else {
      this.events = this.hardcodedEvents;
    }
    localStorage.setItem('pf-events', JSON.stringify(this.events));
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
