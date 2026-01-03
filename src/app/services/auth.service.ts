import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getCurrentUser(): any | null {
    if (this.isBrowser) {
      const user = localStorage.getItem('pf-current-user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    if (this.isBrowser) {
      const user = this.getCurrentUser();
      return !!user;
    }
    return false;
  }

  isOrganizer(): boolean {
    if (this.isBrowser) {
      const user = this.getCurrentUser();
      return user && user.role === 'organizer';
    }
    return false;
  }
}
