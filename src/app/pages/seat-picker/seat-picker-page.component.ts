import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatPickerComponent } from './seat-picker';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-seat-picker-page',
  standalone: true,
  imports: [CommonModule, SeatPickerComponent],
  templateUrl: './seat-picker-page.component.html',
  styleUrls: ['./seat-picker-page.component.css'],
})
export class SeatPickerPageComponent implements OnInit, OnDestroy {
  eventId: string | null = null;
  time!: string;
  ticketCategories: any[] = [];
  seatConfiguration: any[] = [];
  bookedSeats: string[] = [];
  private updateHandler = () => this.updateBookedSeats();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.time = String(this.route.snapshot.paramMap.get('time'));

    if (!this.eventId) {
      alert('Error: Event ID is missing.');
      this.router.navigate(['/home']);
      return;
    }

    this.apiService.getEventById(this.eventId).subscribe({
      next: (res) => {
        if (res.success) {
          const currentEvent = res.event;
          this.ticketCategories = currentEvent.ticketCategories || [];
          this.seatConfiguration = currentEvent.seatConfiguration || [];
          this.bookedSeats = currentEvent.bookedSeats || [];
          this.cdr.detectChanges();
          
          if (isPlatformBrowser(this.platformId)) {
            window.addEventListener('focus', this.updateHandler);
          }
        } else {
          alert('Error fetching event data.');
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

  handleGoBack() {
    this.router.navigate(['/event', this.eventId]);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('focus', this.updateHandler);
    }
  }

  private updateBookedSeats(): void {
    if (this.eventId) {
      this.apiService.getEventById(this.eventId).subscribe({
        next: (res) => {
          if (res.success) {
            this.bookedSeats = res.event.bookedSeats || [];
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error updating booked seats', err);
        }
      });
    }
  }

  handleContinue({ seatData, categoryTable }: { seatData: string; categoryTable: any }) {
    this.router.navigate(
      [
        '/checkout',
        this.eventId,
        this.time,
        seatData,
      ],
      {
        state: { categoryTable: categoryTable }
      }
    );
  }
}
