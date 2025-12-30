import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'attendee';
  phone = '';
  organization = '';
  isLoading = false;

  constructor(private router: Router, private apiService: ApiService) {}

  register() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      alert('All fields are required!');
      return;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Password confirmation does not match.');
      return;
    }

    this.isLoading = true;

    const newUser = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone,
      organization: this.organization,
    };

    this.apiService.signup(newUser).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
        console.log('Registration successful', res);
        this.router.navigate(['/verification'], { queryParams: { email: this.email } });
        } else {
          alert(`Registration failed: ${res.message}`);
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert(`An error occurred: ${err.error?.message || err.message}`);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
