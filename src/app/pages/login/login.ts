import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  name: string;
  email: string;
  password: string;
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

  login() {
    if (!this.email || !this.password) {
      alert('Email and password are required!');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const users = this.getUsersFromStorage();
      const found = users.find(
        (u) => u.email === this.email && u.password === this.password
      );

      this.isLoading = false;

      if (!found) {
        alert('Email or password is incorrect / not registered.');
        return;
      }

      // Save info of the currently logged-in user (optional)
      localStorage.setItem('tix-current-user', JSON.stringify(found));

      alert(`Welcome, ${found.name}! (we will redirect to the Home page later)`);

      // later if the home page is ready, you can:
      this.router.navigate(['/home']);
    }, 600);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
