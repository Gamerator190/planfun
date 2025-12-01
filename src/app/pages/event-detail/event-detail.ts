import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  promo?: any[];
  ticketCategories?: any[];
  seatConfiguration?: { row: string; category: string }[];
  bookedSeats?: string[];
  availableSeats: number;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const eventsJson = localStorage.getItem('pf-events');
    let events: any[] = [];

    if (eventsJson) {
      events = JSON.parse(eventsJson);
    }

    const foundEvent = events.find((m: any) => m.id === id);

    if (!foundEvent) {
      alert('Event not found');
      this.router.navigate(['/home']);
      return;
    }

    const totalSeats = foundEvent.seatConfiguration ? foundEvent.seatConfiguration.length * 30 : 0;
    const bookedSeatsCount = foundEvent.bookedSeats ? foundEvent.bookedSeats.length : 0;

    this.event = {
      ...foundEvent,
      availableSeats: totalSeats - bookedSeatsCount,
    };
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  buyTicket() {
    if (this.event) {
      this.router.navigate(['/event', this.event.id, this.event.time, 'seats']);
    }
  }

  joinWaitlist() {
    this.router.navigate(['/waitlist']);
  }
}
