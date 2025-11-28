import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  organization?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  activeChoice: 'analytics-reports' | 'register' | '' = 'analytics-reports';

  // User properties
  userName = 'Admin';
  showMenu = false;

  // Register form properties
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'organizer';
  phone = '';
  organization = '';
  isLoading = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('tix-current-user');

    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      this.userName = user.name || 'Admin';
    } catch {
      this.userName = 'Admin';
    }
  }

  showChoice(choice: 'analytics-reports' | 'register' | '') {
    this.activeChoice = choice;
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    localStorage.removeItem('tix-current-user');
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  openNotifications() {
    alert('Belum ada notifikasi baru 😊');
  }

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
    if (
      !this.name ||
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.role ||
      !this.phone ||
      !this.organization
    ) {
      alert('All fields are required!');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      alert('Invalid email address!');
      return;
    }

    if (isNaN(Number(this.phone))) {
      alert('Invalid phone number! Please enter only numbers.');
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
    const existingUser = users.find((u) => u.email === this.email || u.name === this.name);

    if (existingUser) {
      if (existingUser.email === this.email) {
        alert('This email is already registered, please use a different email.');
      } else if (existingUser.name === this.name) {
        alert('This username is already registered, please use a different username.');
      }
      return;
    }

    const newUser: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone,
      organization: this.organization,
    };

    this.isLoading = true;

    setTimeout(() => {
      users.push(newUser);
      this.saveUsersToStorage(users);

      this.isLoading = false;
      alert('Registration successful!');

      // Reset form
      this.name = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.role = 'organizer';
      this.phone = '';
      this.organization = '';
      this.showChoice('');
    }, 600);
  }
}
