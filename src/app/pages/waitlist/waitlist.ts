import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './waitlist.html',
  styleUrl: './waitlist.css',
})
export class WaitlistComponent implements OnInit { 
  email: string = '';
  phoneNumber: string = '';
  
  waitlistCapacity: number = 50;  
  currentWaitlistCount: number = 0;
  isUserOnWaitlist: boolean = false;
  eventId: string = '';
  eventTitle: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.eventId) {
      alert('Event ID is missing.');
      this.router.navigate(['/home']);
      return;
    }

    
    this.apiService.getEventById(this.eventId).subscribe({
      next: (res) => {
        if (res.success) {
          this.eventTitle = res.event.title;
          
          this.waitlistCapacity = 50;
        }
      },
      error: (err) => {
        console.error('Failed to fetch event details', err);
      }
    });

    this.fetchWaitlistStatus();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  get isWaitlistClosed(): boolean {
    return this.currentWaitlistCount >= this.waitlistCapacity;
  }

  fetchWaitlistStatus() {
    this.apiService.getWaitlistForEvent(this.eventId).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentWaitlistCount = res.count;
          if (isPlatformBrowser(this.platformId)) {
            const userJson = localStorage.getItem('pf-current-user');
            if(userJson) {
              const user = JSON.parse(userJson);
              this.isUserOnWaitlist = res.waitlist.some((entry: any) => entry.user === user._id);
              if(this.isUserOnWaitlist) {
                const userEntry = res.waitlist.find((entry: any) => entry.user === user._id);
                this.email = userEntry.email;
                this.phoneNumber = userEntry.phoneNumber;
              }
            }
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to get waitlist status', err);
      }
    });
  }

  submitWaitlist() {
    if (!this.email && !this.phoneNumber) {
      alert('Please provide at least one contact method (email or phone number).');
      return;
    }

    if (this.isWaitlistClosed) {
      alert('The waitlist is currently full. Please try again later.');
      return;
    }

    this.apiService.joinWaitlist({ eventId: this.eventId, email: this.email, phoneNumber: this.phoneNumber }).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Thank you for joining the waitlist! We will notify you if tickets become available.');
          this.fetchWaitlistStatus();
        } else {
          alert('Failed to join waitlist.');
        }
      },
      error: (err) => {
        alert('An error occurred while joining the waitlist.');
      }
    });
  }

  leaveWaitlist() {
    if (confirm('Are you sure you want to leave the waitlist?')) {
      this.apiService.leaveWaitlist(this.eventId).subscribe({
        next: (res) => {
          if (res.success) {
            alert('You have successfully left the waitlist.');
            this.email = '';
            this.phoneNumber = '';
            this.fetchWaitlistStatus();
          } else {
            alert('Failed to leave waitlist.');
          }
        },
        error: (err) => {
          alert('An error occurred while leaving the waitlist.');
        }
      });
    }
  }
}