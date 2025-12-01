import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartType } from 'chart.js';

interface Event {
  id: number | string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  email?: string;
  poster?: string;
  isNew?: boolean;
  isSpecial?: boolean;
  promo?: any[];
  ticketCategories?: { name: string; shortName: string; price: number }[];
  seatConfiguration?: { row: string; category: string }[];
  bookedSeats?: string[];
  availableSeats: number;
}

interface Ticket {
  event: Event;
  poster: string;
  time: string;
  seats: string[];
  total: number;
  purchaseDate: string;
  seatDetails?: any[];
  categoryTable?: Record<string, { name: string; price: number }>;
  appliedPromo?: any;
  discountAmount?: number;
  isRead: boolean;
}

export interface ReportData {
  type: 'ticketSales' | 'revenue' | 'seatOccupancy' | 'auditoriumBookings' | 'eventsHosted' | 'utilizationStatistics';
  period: string;
  labels: string[]; 
  series: number[]; 
  tableData: { label: string, value: any }[]; 
  message?: string; 
  chartType?: ChartType;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private _getCurrentUserEmail(): string | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem('pf-current-user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.email || null;
      } catch (e) {
        console.error('Error parsing current user from localStorage:', e);
        return null;
      }
    }
    return null;
  }

  private _getCurrentUserRole(): string | null {
    if (!this.isBrowser) return null;
    const userJson = localStorage.getItem('pf-current-user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.role || null;
      } catch (e) {
        console.error('Error parsing current user from localStorage:', e);
        return null;
      }
    }
    return null;
  }

  private getTicketsFromLocalStorage(): Ticket[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem('pf-tickets');
    try {
      const allTickets: Ticket[] = raw ? JSON.parse(raw) : [];
      const currentUserEmail = this._getCurrentUserEmail();
      const currentUserRole = this._getCurrentUserRole();

      if (currentUserRole === 'auditorium_admin') {
        return allTickets; 
      } else if (currentUserEmail) {
        return allTickets.filter(ticket => ticket.event?.email === currentUserEmail);
      }
      return allTickets;
    } catch (e) {
      console.error('Error parsing tickets from localStorage:', e);
      return [];
    }
  }

  private getEventsFromLocalStorage(): Event[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem('pf-events');
    try {
      const allEvents: Event[] = raw ? JSON.parse(raw) : [];
      const currentUserEmail = this._getCurrentUserEmail();
      const currentUserRole = this._getCurrentUserRole();

      if (currentUserRole === 'auditorium_admin') {
        return allEvents; 
      } else if (currentUserEmail) {
        return allEvents.filter(event => event.email === currentUserEmail);
      }
      return allEvents;
    } catch (e) {
      console.error('Error parsing events from localStorage:', e);
      return [];
    }
  }

  private _parsePurchaseDate(dateString: string): Date | null {
    let purchaseDate = new Date(dateString);

    if (isNaN(purchaseDate.getTime())) {
      const parts = dateString.split(',');
      if (parts.length === 2) {
        const dateParts = parts[0].split('/');
        const timeParts = parts[1].trim().split('.');
        if (dateParts.length === 3 && timeParts.length === 3) {
          const year = +dateParts[2];
          const month = +dateParts[1] - 1;
          const day = +dateParts[0];
          const hours = +timeParts[0];
          const minutes = +timeParts[1];
          const seconds = +timeParts[2];
          purchaseDate = new Date(year, month, day, hours, minutes, seconds);
        }
      }
    }

    if (isNaN(purchaseDate.getTime())) {
      return null;
    }
    return purchaseDate;
  }

  private filterTicketsByPeriod(tickets: Ticket[], period: string): Ticket[] {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    return tickets.filter(ticket => {
      const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
      if (!purchaseDate) return false;
      
      const diffDays = Math.floor(Math.abs((now.getTime() - purchaseDate.getTime()) / oneDay));

      switch (period) {
        case 'daily':
          return diffDays <= 1;
        case 'weekly':
          return diffDays <= 7;
        case 'monthly':
          return diffDays <= 30;
        default:
          return true;
      }
    });
  }

  generateTicketSales(period: string): ReportData {
    const tickets = this.getTicketsFromLocalStorage();
    const filteredTickets = this.filterTicketsByPeriod(tickets, period);

    if (filteredTickets.length === 0) {
      return {
        type: 'ticketSales',
        period,
        labels: [],
        series: [],
        tableData: [],
        message: 'No ticket sales data available for the selected period. Please try a different report type, period, or ensure there is data for the selected criteria.',
      };
    }

    const labels: string[] = [];
    const series: number[] = [];
    const salesByTime: { [key: string]: number } = {};

    if (period === 'daily') {
      for (let i = 0; i < 24; i++) {
        const hourLabel = `${String(i).padStart(2, '0')}:00`;
        labels.push(hourLabel);
        salesByTime[hourLabel] = 0;
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const hour = purchaseDate.getHours();
          const hourLabel = `${String(hour).padStart(2, '0')}:00`;
          salesByTime[hourLabel]++;
        }
      });
    } else if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        labels.push(dayLabel);
        salesByTime[dayLabel] = 0;
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const dayLabel = purchaseDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          if(salesByTime.hasOwnProperty(dayLabel)) {
            salesByTime[dayLabel]++;
          }
        }
      });
    } else { 
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dayLabel = i.toString();
        labels.push(dayLabel);
        salesByTime[dayLabel] = 0;
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const dayLabel = purchaseDate.getDate().toString();
          if(salesByTime.hasOwnProperty(dayLabel)){
            salesByTime[dayLabel]++;
          }
        }
      });
    }

    for (const label of labels) {
      series.push(salesByTime[label] || 0);
    }

    return {
      type: 'ticketSales',
      period,
      labels,
      series,
      tableData: [{ label: 'Total Tickets Sold', value: filteredTickets.length }],
      chartType: 'bar',
    };
  }

  generateRevenue(period: string): ReportData {
    const tickets = this.getTicketsFromLocalStorage();
    const filteredTickets = this.filterTicketsByPeriod(tickets, period);

    if (filteredTickets.length === 0) {
      return {
        type: 'revenue',
        period,
        labels: [],
        series: [],
        tableData: [],
        message: 'No revenue data available for the selected period. Please try a different report type, period, or ensure there is data for the selected criteria.',
      };
    }

    const labels: string[] = [];
    const series: number[] = [];
    const revenueByTime: { [key: string]: number } = {};
    let totalRevenue = 0;

    if (period === 'daily') {
      for (let i = 0; i < 24; i++) {
        const hourLabel = `${String(i).padStart(2, '0')}:00`;
        labels.push(hourLabel);
        revenueByTime[hourLabel] = 0;
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const hour = purchaseDate.getHours();
          const hourLabel = `${String(hour).padStart(2, '0')}:00`;
          revenueByTime[hourLabel] += ticket.total;
          totalRevenue += ticket.total;
        }
      });
    } else if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        labels.push(dayLabel);
        revenueByTime[dayLabel] = 0;
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const dayLabel = purchaseDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          if(revenueByTime.hasOwnProperty(dayLabel)) {
            revenueByTime[dayLabel] += ticket.total;
            totalRevenue += ticket.total;
          }
        }
      });
    } else { 
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dayLabel = i.toString();
        labels.push(dayLabel);
        revenueByTime[dayLabel] = 0;
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const dayLabel = purchaseDate.getDate().toString();
          if(revenueByTime.hasOwnProperty(dayLabel)){
            revenueByTime[dayLabel] += ticket.total;
            totalRevenue += ticket.total;
          }
        }
      });
    }

    for (const label of labels) {
      series.push(revenueByTime[label] || 0);
    }

    return {
      type: 'revenue',
      period,
      labels,
      series,
      tableData: [{ label: 'Total Revenue', value: totalRevenue }],
      chartType: 'line',
    };
  }

  generateSeatOccupancy(period: string): ReportData {
    const events = this.getEventsFromLocalStorage();
    const tickets = this.getTicketsFromLocalStorage();

    if (events.length === 0) {
      return {
        type: 'seatOccupancy',
        period,
        labels: [],
        series: [],
        tableData: [],
        message: 'No event capacity data available to calculate seat occupancy. Please try a different report type, period, or ensure there is data for the selected criteria.',
      };
    }

    const labels: string[] = [];
    const series: number[] = [];
    const tableData: { label: string, value: any }[] = [];

    events.forEach(event => {
      const eventTickets = tickets.filter(ticket => ticket.event.id === event.id);
      const bookedSeats = eventTickets.reduce((acc, ticket) => acc + ticket.seats.length, 0);
      const totalSeats = event.seatConfiguration ? event.seatConfiguration.length * 30 : 0;
      const occupancy = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

      labels.push(event.title);
      series.push(occupancy);
      tableData.push({ label: event.title, value: `${occupancy.toFixed(2)}%` });
    });

    return {
      type: 'seatOccupancy',
      period,
      labels,
      series,
      tableData,
      chartType: 'pie',
    };
  }

  private filterEventsByPeriod(events: Event[], period: string): Event[] {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    return events.filter(event => {
      const eventDate = new Date(event.date);
      if (isNaN(eventDate.getTime())) return false;

      const diffDays = Math.floor(Math.abs((now.getTime() - eventDate.getTime()) / oneDay));

      switch (period) {
        case 'daily':
          return diffDays <= 1;
        case 'weekly':
          return diffDays <= 7;
        case 'monthly':
          return diffDays <= 30;
        default:
          return true;
      }
    });
  }

  generateEventsHosted(period: string): ReportData {
    const events = this.getEventsFromLocalStorage();
    const filteredEvents = this.filterEventsByPeriod(events, period);

    if (filteredEvents.length === 0) {
      return {
        type: 'eventsHosted',
        period,
        labels: [],
        series: [],
        tableData: [],
        message: 'No events hosted data available for the selected period. Please try a different report type, period, or ensure there is data for the selected criteria.',
      };
    }

    const labels: string[] = [];
    const series: number[] = [];
    const eventsByTime: { [key: string]: number } = {};

    if (period === 'daily') {
        for (let i = 0; i < 24; i++) {
            const hourLabel = `${String(i).padStart(2, '0')}:00`;
            labels.push(hourLabel);
            eventsByTime[hourLabel] = 0;
        }
        filteredEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const hour = eventDate.getHours();
            const hourLabel = `${String(hour).padStart(2, '0')}:00`;
            eventsByTime[hourLabel]++;
        });
    } else if (period === 'weekly') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            labels.push(dayLabel);
            eventsByTime[dayLabel] = 0;
        }
        filteredEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const dayLabel = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if(eventsByTime.hasOwnProperty(dayLabel)) {
                eventsByTime[dayLabel]++;
            }
        });
    } else { 
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayLabel = i.toString();
            labels.push(dayLabel);
            eventsByTime[dayLabel] = 0;
        }
        filteredEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const dayLabel = eventDate.getDate().toString();
            if(eventsByTime.hasOwnProperty(dayLabel)){
                eventsByTime[dayLabel]++;
            }
        });
    }

    for (const label of labels) {
      series.push(eventsByTime[label] || 0);
    }

    return {
      type: 'eventsHosted',
      period,
      labels,
      series,
      tableData: [{ label: 'Total Events Hosted', value: filteredEvents.length }],
      chartType: 'bar',
    };
  }
}