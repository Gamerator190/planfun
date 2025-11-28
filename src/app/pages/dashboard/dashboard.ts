import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  activeChoice: 'create-event' | 'edit-event' | 'analytics-reports' | '' = 'analytics-reports';

  showChoice(choice: 'create-event' | 'edit-event' | 'analytics-reports' | '') {
    this.activeChoice = choice;
  }

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
}
