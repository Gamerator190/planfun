import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  token: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  resetPassword() {
    if (!this.password || !this.confirmPassword) {
      this.errorMessage = 'Please enter and confirm your new password.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token. Please request a new link.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    
    this.apiService.resetPassword(this.token, this.password)
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Your password has been reset successfully.';
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
