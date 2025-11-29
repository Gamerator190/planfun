import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';

import { Router } from '@angular/router';

interface Event {
  id: number;
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
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  activeChoice: 'create-event' | 'edit-event' | 'analytics-reports' | '' = 'analytics-reports';

  showChoice(choice: 'create-event' | 'edit-event' | 'analytics-reports' | '') {
    this.activeChoice = choice;
  }

  // User properties
  userName = 'Organizer';
  showMenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('pf-current-user');

    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      this.userName = user.name || 'Organizer';
    } catch {
      this.userName = 'Organizer';
    }
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    localStorage.removeItem('pf-current-user');
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  submitForm() {
    if (this.activeChoice === 'create-event') {
      const title = (document.getElementById('event-title') as HTMLInputElement).value;
      const location = (document.getElementById('event-location') as HTMLInputElement).value;
      const date = (document.getElementById('event-date') as HTMLInputElement).value;
      const time = (document.getElementById('event-time') as HTMLInputElement).value;
      const description = (document.getElementById('event-description') as HTMLTextAreaElement)
        .value;
      const promoCode = (document.getElementById('event-promo-code') as HTMLInputElement).value;
      const discount = parseFloat(
        (document.getElementById('event-discount') as HTMLInputElement).value,
      );
      const posterFile = (document.getElementById('event-poster') as HTMLInputElement).files?.[0];

      if (!title || !location || !date || !time || !description) {
        alert('Please fill in all required fields: Title, Location, Date, Time, and Description.');
        return;
      }

      const eventsJson = localStorage.getItem('pf-events');
      if (eventsJson) {
        try {
          const events: Event[] = JSON.parse(eventsJson);
          if (events.some((event) => event.date === date)) {
            alert('There is already an ongoing event on that date.');
            return;
          }
        } catch (e) {
          console.error('Error parsing events from localStorage', e);
        }
      }

      let posterBase64: string | undefined = undefined;
      const reader = new FileReader();

      reader.onload = () => {
        posterBase64 = reader.result as string;
        this.saveEvent({
          title,
          location,
          date,
          time,
          description,
          promoCode,
          discount,
          poster: posterBase64,
        });
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Could not read event poster file.');
        this.saveEvent({ title, location, date, time, description, promoCode, discount }); // Save without poster
      };

      if (posterFile) {
        reader.readAsDataURL(posterFile);
      } else {
        this.saveEvent({ title, location, date, time, description, promoCode, discount });
      }
    } else if (this.activeChoice === 'edit-event') {
      // Future implementation for editing events
      alert('Edit event functionality is not yet implemented.');
    }
  }

  private saveEvent(eventData: Omit<Event, 'id'>) {
    const eventsJson = localStorage.getItem('pf-events');
    let events: Event[] = [];
    if (eventsJson) {
      try {
        events = JSON.parse(eventsJson);
      } catch (e) {
        console.error('Error parsing events from localStorage', e);
      }
    }

    const newEvent: Event = {
      id:
        events.length > 0
          ? Math.max(...events.map((e) => (typeof e.id === 'number' ? e.id : 0))) + 1
          : 1, // Generate ID based on existing events, defaulting to 1
      ...eventData,
      isNew: true,
    };

    events.push(newEvent);
    localStorage.setItem('pf-events', JSON.stringify(events));

    alert('Event created successfully!');
    this.clearCreateEventForm();
  }

  private clearCreateEventForm() {
    (document.getElementById('event-title') as HTMLInputElement).value = '';
    (document.getElementById('event-location') as HTMLInputElement).value = '';
    (document.getElementById('event-date') as HTMLInputElement).value = '';
    (document.getElementById('event-time') as HTMLInputElement).value = '';
    (document.getElementById('event-description') as HTMLTextAreaElement).value = '';
    (document.getElementById('event-promo-code') as HTMLInputElement).value = '';
    (document.getElementById('event-discount') as HTMLInputElement).value = '0';
    (document.getElementById('event-poster') as HTMLInputElement).value = ''; // Clear file input
  }

  openNotifications() {
    alert('There are no new notifications 😊');
  }
}
