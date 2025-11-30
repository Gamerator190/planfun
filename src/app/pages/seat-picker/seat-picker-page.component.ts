import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeatPickerComponent } from './seat-picker';

@Component({
  selector: 'app-seat-picker-page',
  standalone: true,
  imports: [CommonModule, SeatPickerComponent],
  templateUrl: './seat-picker-page.component.html',
  styleUrls: ['./seat-picker-page.component.css'],
})
export class SeatPickerPageComponent implements OnInit {
  eventId!: number;
  time!: string;
  ticketCategories: any[] = [];
  seatConfiguration: any[] = [];
  bookedSeats: string[] = []; // Added bookedSeats property

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.time = String(this.route.snapshot.paramMap.get('time'));

    const eventsJson = localStorage.getItem('pf-events');
    if (eventsJson) {
      const events = JSON.parse(eventsJson);
      const currentEvent = events.find((event: any) => event.id === this.eventId);

      if (currentEvent) {
        this.ticketCategories = currentEvent.ticketCategories || [];
        this.seatConfiguration = currentEvent.seatConfiguration || [];
        this.bookedSeats = currentEvent.bookedSeats || []; // Populate bookedSeats
      }
    }
  }

  handleGoBack() {
    this.router.navigate(['/event', this.eventId]);
  }

  handleContinue({ seatData, categoryTable }: { seatData: string; categoryTable: any }) {
    this.router.navigate(['/checkout', this.eventId, this.time, seatData, { categoryTable: JSON.stringify(categoryTable) }]);
  }
}
