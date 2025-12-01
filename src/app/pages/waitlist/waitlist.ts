import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './waitlist.html',
  styleUrl: './waitlist.css',
})
export class WaitlistComponent { 
  email: string = '';
  phoneNumber: string = '';
  
  waitlistCapacity: number = 5; 
  currentWaitlistCount: number = 0;
  isUserOnWaitlist: boolean = false; 

  constructor(private router: Router) { }

  goBack() {
    this.router.navigate(['/home']);
  }

  get isWaitlistClosed(): boolean {
    return this.currentWaitlistCount >= this.waitlistCapacity;
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

    this.currentWaitlistCount++;
    this.isUserOnWaitlist = true;
    
    alert('Thank you for joining the waitlist! We will notify you if tickets become available.');
  }

  leaveWaitlist() {
    if (confirm('Are you sure you want to leave the waitlist?')) {
      this.currentWaitlistCount--;
      this.isUserOnWaitlist = false;
      this.email = ''; 
      this.phoneNumber = '';
      alert('You have successfully left the waitlist.');
    }
  }
}