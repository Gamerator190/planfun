import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verification.html',
  styleUrls: ['./verification.css']
})
export class Verification implements OnInit {
  verificationCode = '';
  errorMessage = '';
  successMessage = '';
  email: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
  }

  verify() {
    if (!this.email) {
      this.errorMessage = 'Email not found. Please register again.';
      return;
    }
    this.apiService.verify(this.email, this.verificationCode).subscribe({
      next: (response) => {
        console.log('Verification successful', response);
        // On success, navigate to login page with a success message
        this.router.navigate(['/login'], { queryParams: { verified: true } });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Verification failed. Please try again.';
      }
    });
  }

  sendEmailAgain() {
    if (!this.email) {
      this.errorMessage = 'Email not found. Cannot resend verification code.';
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.resendVerification(this.email).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'A new verification code has been sent to your email.';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to resend verification code. Please try again later.';
      }
    });
  }
}