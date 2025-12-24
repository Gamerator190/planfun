import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/home']);
      return;
    }

    this.apiService.getEventById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const foundEvent = res.event;
          const totalSeats = foundEvent.seatConfiguration ? foundEvent.seatConfiguration.length * 30 : 0;
          const bookedSeatsCount = foundEvent.bookedSeats ? foundEvent.bookedSeats.length : 0;

          this.event = {
            ...foundEvent,
            id: foundEvent._id,
            availableSeats: totalSeats - bookedSeatsCount,
          };
        } else {
          alert('Event not found');
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Error fetching event', err);
        alert('Error fetching event');
        this.router.navigate(['/home']);
      }
    });
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
