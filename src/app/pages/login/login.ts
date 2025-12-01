import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

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

  constructor(private router: Router) {}

  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem('pf-users');
    if (!usersJson) return [];
    try {
      return JSON.parse(usersJson) as User[];
    } catch {
      return [];
    }
  }

  login() {
    if (!this.email || !this.password) {
      alert('Email and password are required!');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const users = this.getUsersFromStorage();
      const found = users.find((u) => u.email === this.email && u.password === this.password);

      this.isLoading = false;

      if (!found) {
        alert('Email or password is incorrect / not registered.');
        return;
      }

      localStorage.setItem('pf-current-user', JSON.stringify(found));

      const role = found.role || 'attendee';
      if (role === 'organizer') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'auditorium_admin') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    }, 600);
  }

  login2() {
    if (!this.phone || !this.password) {
      alert('Phone number and password are required!');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const users = this.getUsersFromStorage();
      const found = users.find((u) => u.phone === this.phone && u.password === this.password);

      this.isLoading = false;

      if (!found) {
        alert('Phone number or password is incorrect / not registered.');
        return;
      }

      localStorage.setItem('pf-current-user', JSON.stringify(found));

      const role = found.role || 'attendee';
      if (role === 'organizer') {
        this.router.navigate(['/dashboard']);
      } else if (role === 'auditorium_admin') {
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    }, 600);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
