import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  
  waitlistCapacity: number = 5; 
  currentWaitlistCount: number = 0;
  isUserOnWaitlist: boolean = false; 

  // TODO: This should be passed dynamically to the component
  private eventId = '663a3b3c4b5b6c7d8e9f0a1b'; 

  constructor(private router: Router, private apiService: ApiService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
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