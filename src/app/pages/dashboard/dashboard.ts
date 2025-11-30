import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeatPickerComponent } from '../seat-picker/seat-picker';

import { Router } from '@angular/router';

interface Promo {
  code: string;
  discountPercent: number;
  expiryDate: string;
  applicableTicketTypes: { [key: string]: boolean };
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  email?: string;
  poster?: string;
  isNew?: boolean;
  isSpecial?: boolean;
  promo?: Promo[];
  ticketCategories?: { name: string; shortName: string; price: number }[];
  seatConfiguration?: { row: string; category: string }[];
  bookedSeats?: string[]; // Added bookedSeats
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, SeatPickerComponent],
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
  userEvents: Event[] = [];
  selectedEventId: number | null = null;
  promo: Promo[] = [];

  ticketCategories = [{ name: 'General Admission', shortName: 'GEN', price: 25000 }];
  seatConfiguration = [
    { row: 'A', category: 'GEN' },
    { row: 'B', category: 'GEN' },
    { row: 'C', category: 'GEN' },
    { row: 'D', category: 'GEN' },
    { row: 'E', category: 'GEN' },
    { row: 'F', category: 'GEN' },
    { row: 'G', category: 'GEN' },
    { row: 'H', category: 'GEN' },
    { row: 'I', category: 'GEN' },
    { row: 'J', category: 'GEN' },
    { row: 'AA', category: 'GEN' },
    { row: 'BB', category: 'GEN' },
    { row: 'CC', category: 'GEN' },
    { row: 'DD', category: 'GEN' },
    { row: 'EE', category: 'GEN' },
  ];

  onEventSelect(event: any) {
    const eventId = Number(event.target.value);
    if (eventId) {
      this.selectedEventId = eventId;
      const selectedEvent = this.userEvents.find((e) => e.id === eventId);
      if (selectedEvent) {
        this.ticketCategories = selectedEvent.ticketCategories
          ? JSON.parse(JSON.stringify(selectedEvent.ticketCategories))
          : [{ name: 'General Admission', shortName: 'GEN', price: 25000 }];
        this.seatConfiguration = selectedEvent.seatConfiguration
          ? JSON.parse(JSON.stringify(selectedEvent.seatConfiguration))
          : [
              { row: 'A', category: 'GEN' },
              { row: 'B', category: 'GEN' },
              { row: 'C', category: 'GEN' },
              { row: 'D', category: 'GEN' },
              { row: 'E', category: 'GEN' },
              { row: 'F', category: 'GEN' },
              { row: 'G', category: 'GEN' },
              { row: 'H', category: 'GEN' },
              { row: 'I', category: 'GEN' },
              { row: 'J', category: 'GEN' },
              { row: 'AA', category: 'GEN' },
              { row: 'BB', category: 'GEN' },
              { row: 'CC', category: 'GEN' },
              { row: 'DD', category: 'GEN' },
              { row: 'EE', category: 'GEN' },
            ];
        this.promo = selectedEvent.promo ? JSON.parse(JSON.stringify(selectedEvent.promo)) : [];
      }
    } else {
      this.selectedEventId = null;
      this.ticketCategories = [{ name: 'General Admission', shortName: 'GEN', price: 25000 }];
      this.seatConfiguration = [
        { row: 'A', category: 'GEN' },
        { row: 'B', category: 'GEN' },
        { row: 'C', category: 'GEN' },
        { row: 'D', category: 'GEN' },
        { row: 'E', category: 'GEN' },
        { row: 'F', category: 'GEN' },
        { row: 'G', category: 'GEN' },
        { row: 'H', category: 'GEN' },
        { row: 'I', category: 'GEN' },
        { row: 'J', category: 'GEN' },
        { row: 'AA', category: 'GEN' },
        { row: 'BB', category: 'GEN' },
        { row: 'CC', category: 'GEN' },
        { row: 'DD', category: 'GEN' },
        { row: 'EE', category: 'GEN' },
      ];
      this.promo = [];
    }
  }

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

      const eventsJson = localStorage.getItem('pf-events');
      if (eventsJson) {
        const allEvents: Event[] = JSON.parse(eventsJson);
        this.userEvents = allEvents.filter((event) => event.email === user.email);
      }
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

  addCategory() {
    this.ticketCategories.push({ name: '', shortName: '', price: 0 });
  }

  removeCategory(index: number) {
    if (this.ticketCategories.length > 1) {
      this.ticketCategories.splice(index, 1);
    } else {
      alert('You must have at least one category.');
    }
  }

  addPromo() {
    console.log('addPromo() called');
    const applicableTicketTypes = this.ticketCategories.reduce(
      (acc, cat) => {
        acc[cat.shortName] = false;
        return acc;
      },
      {} as { [key: string]: boolean },
    );

    this.promo.push({
      code: '',
      discountPercent: 0,
      expiryDate: '',
      applicableTicketTypes: applicableTicketTypes,
    });
    console.log('this.promo after add:', this.promo);
  }

  removePromo(index: number) {
    this.promo.splice(index, 1);
  }

  submitForm() {
    if (this.activeChoice === 'create-event') {
      const title = (document.getElementById('event-title') as HTMLInputElement).value;
      const location = (document.getElementById('event-location') as HTMLInputElement).value;
      const date = (document.getElementById('event-date') as HTMLInputElement).value;
      const time = (document.getElementById('event-time') as HTMLInputElement).value;
      const description = (document.getElementById('event-description') as HTMLTextAreaElement)
        .value;

      let userEmail: string | undefined;
      const currentUserJson = localStorage.getItem('pf-current-user');
      if (currentUserJson) {
        try {
          const user = JSON.parse(currentUserJson);
          userEmail = user.email;
        } catch (e) {
          console.error('Error parsing current user from localStorage', e);
        }
      }

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
          email: userEmail,
          poster: posterBase64,
          ticketCategories: this.ticketCategories,
          seatConfiguration: this.seatConfiguration,
          promo: this.promo,
        });
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Could not read event poster file.');
        this.saveEvent({
          title,
          location,
          date,
          time,
          description,
          email: userEmail,
          ticketCategories: this.ticketCategories,
          seatConfiguration: this.seatConfiguration,
          promo: this.promo,
        }); // Save without poster
      };

      if (posterFile) {
        reader.readAsDataURL(posterFile);
      } else {
        this.saveEvent({
          title,
          location,
          date,
          time,
          description,
          email: userEmail,
          ticketCategories: this.ticketCategories,
          seatConfiguration: this.seatConfiguration,
          promo: this.promo,
        });
      }
    } else if (this.activeChoice === 'edit-event') {
      if (this.selectedEventId === null) {
        alert('Please select an event to edit.');
        return;
      }

      const eventsJson = localStorage.getItem('pf-events');
      let events: Event[] = [];
      if (eventsJson) {
        try {
          events = JSON.parse(eventsJson);
        } catch (e) {
          console.error('Error parsing events from localStorage', e);
        }
      }

      const eventIndex = events.findIndex((e) => e.id === this.selectedEventId);
      if (eventIndex !== -1) {
        events[eventIndex].ticketCategories = this.ticketCategories;
        events[eventIndex].seatConfiguration = this.seatConfiguration;
        events[eventIndex].promo = this.promo;
        localStorage.setItem('pf-events', JSON.stringify(events));
        alert('Event updated successfully!');
      } else {
        alert('Selected event not found.');
      }
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
    (document.getElementById('event-poster') as HTMLInputElement).value = ''; // Clear file input
  }

  openNotifications() {
    alert('There are no new notifications 😊');
  }
}
