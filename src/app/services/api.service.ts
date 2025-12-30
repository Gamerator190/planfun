import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return { headers, withCredentials: true };
  }

  // Auth
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials, this.getHeaders());
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData, this.getHeaders());
  }

  verify(email: string, verificationCode: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify-email`, { email, verificationCode }, this.getHeaders());
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/resend-verification`, { email }, this.getHeaders());
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, this.getHeaders());
  }
  
  checkAuth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/check-auth`, this.getHeaders());
  }

  // Events
  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/events`, eventData, this.getHeaders());
  }

  getEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/events`, this.getHeaders());
  }

  getEventById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/${id}`, this.getHeaders());
  }

  updateEvent(id: string, eventData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/events/${id}`, eventData, this.getHeaders());
  }

  // Tickets
  createTicket(ticketData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tickets`, ticketData, this.getHeaders());
  }

  getUserTickets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tickets`, this.getHeaders());
  }

  // Waitlist
  joinWaitlist(waitlistData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/waitlist`, waitlistData, this.getHeaders());
  }

  getWaitlistForEvent(eventId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/waitlist/${eventId}`, this.getHeaders());
  }

  leaveWaitlist(eventId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/waitlist/${eventId}`, this.getHeaders());
  }
}
