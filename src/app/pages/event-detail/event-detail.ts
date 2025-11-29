import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css',
})
export class EventDetailComponent implements OnInit {
  event: any = null;

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

    this.event = events.find((m: any) => m.id === id);

    if (!this.event) {
      alert('Event not found');
      this.router.navigate(['/home']);
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  beliTiket() {
    this.router.navigate(['/event', this.event.id, 'schedule']);
  }
}
