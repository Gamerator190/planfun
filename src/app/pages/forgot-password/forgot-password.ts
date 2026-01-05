import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  sendResetLink() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    
    this.apiService.forgotPassword(this.email)
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (res) => {
        this.successMessage = res.message || 'If an account with that email exists, a password reset link has been sent.';
        this.email = ''; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'An error occurred. Please try again later.';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
