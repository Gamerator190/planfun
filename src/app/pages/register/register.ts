import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  name: string;
  email: string;
  password: string;
  role?: string;
}

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
  isLoading = false;

  constructor(private router: Router) {}

  private getUsersFromStorage(): User[] {
    const usersJson = localStorage.getItem('tix-users');
    if (!usersJson) return [];
    try {
      return JSON.parse(usersJson) as User[];
    } catch {
      return [];
    }
  }

  private saveUsersToStorage(users: User[]) {
    localStorage.setItem('tix-users', JSON.stringify(users));
  }

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

    const users = this.getUsersFromStorage();
    const already = users.find((u) => u.email === this.email);

    if (already) {
      alert('This email is already registered, please use a different email.');
      return;
    }

    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };

    this.isLoading = true;

    setTimeout(() => {
      users.push(newUser);
      this.saveUsersToStorage(users);

      this.isLoading = false;
      alert('Registration successful! Please login.');

      this.router.navigate(['/login']);
    }, 600);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
