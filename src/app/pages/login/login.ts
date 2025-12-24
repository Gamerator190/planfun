import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';
  phone = '';
  usePhoneLogin = false;
  isLoading = false;

  constructor(private router: Router, private apiService: ApiService) {}

  login() {
    if (this.usePhoneLogin) {
      if (!this.phone || !this.password) {
        alert('Phone number and password are required!');
        return;
      }
    } else {
      if (!this.email || !this.password) {
        alert('Email and password are required!');
        return;
      }
    }

    this.isLoading = true;

    const credentials = this.usePhoneLogin
      ? { phone: this.phone, password: this.password }
      : { email: this.email, password: this.password };

    this.apiService.login(credentials).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          localStorage.setItem('pf-current-user', JSON.stringify(res.user));
          const role = res.user.role || 'attendee';
          if (role === 'organizer') {
            this.router.navigate(['/dashboard']);
          } else if (role === 'auditorium_admin') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/home']);
          }
        } else {
          alert(`Login failed: ${res.message}`);
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert(`An error occurred: ${err.error?.message || err.message}`);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
