import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChartType } from 'chart.js';

interface Ticket {
  eventId: string;
  eventTitle: string;
  eventDate: string; // Add eventDate here
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
  status?: 'active' | 'used' | 'cancelled'; 
  _id?: string; // MongoDB ID for the ticket document itself
}

interface Event {
  id: number | string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  email?: string; // Ensure email is part of Event for filtering
  poster?: string;
  isNew?: boolean;
  isSpecial?: boolean;
  promo?: any[];
  ticketCategories?: { name: string; shortName: string; price: number; maxTickets: number }[];
  seatConfiguration?: { row: string; category: string }[];
  bookedSeats?: string[];
  availableSeats: number;
  createdAt?: string; // Add createdAt
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
      } else if (currentUserRole === 'organizer' && currentUserEmail) {
        const organizerEvents = this.getEventsFromLocalStorage().filter(event => event.email === currentUserEmail);
        const organizerEventIds = new Set(organizerEvents.map(event => event.id));
        return allTickets.filter(ticket => organizerEventIds.has(ticket.eventId));
      }
      // For attendees or unauthenticated, no tickets specific to them from this service.
      // Or if somehow current user is not admin or organizer, return empty.
      return []; 
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
        const filtered = allEvents.filter(event => event.email === currentUserEmail);
        return filtered;
      }
      return [];
    } catch (e) {
      console.error('Error parsing events from localStorage:', e);
      return [];
    }
  }

  private _parsePurchaseDate(dateString: string): Date | null {
    const purchaseDate = new Date(dateString);

    if (isNaN(purchaseDate.getTime())) {
      console.warn('Failed to parse date string:', dateString);
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

  generateTicketSales(period: string, startDate?: string, endDate?: string): ReportData {
    const tickets = this.getTicketsFromLocalStorage();
    let filteredTickets: Ticket[];

    if (period === 'custom') {
      if (!startDate || !endDate) {
        return {
          type: 'ticketSales',
          period,
          labels: [],
          series: [],
          tableData: [],
          message: 'Please select start and end dates for custom range.',
        };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTickets = tickets.filter(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        return purchaseDate && purchaseDate >= start && purchaseDate <= end;
      });
    } else {
      filteredTickets = this.filterTicketsByPeriod(tickets, period);
    }

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
    } else if (period === 'custom') {
      const start = new Date(startDate!);
      const end = new Date(endDate!);
      const current = new Date(start);
      while (current <= end) {
        const dayLabel = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dayLabel);
        salesByTime[dayLabel] = 0;
        current.setDate(current.getDate() + 1);
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const dayLabel = purchaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  generateRevenue(period: string, startDate?: string, endDate?: string): ReportData {
    const tickets = this.getTicketsFromLocalStorage();
    let filteredTickets: Ticket[];

    if (period === 'custom') {
      if (!startDate || !endDate) {
        return {
          type: 'revenue',
          period,
          labels: [],
          series: [],
          tableData: [],
          message: 'Please select start and end dates for custom range.',
        };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTickets = tickets.filter(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        return purchaseDate && purchaseDate >= start && purchaseDate <= end;
      });
    } else {
      filteredTickets = this.filterTicketsByPeriod(tickets, period);
    }

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
    } else if (period === 'custom') {
      const start = new Date(startDate!);
      const end = new Date(endDate!);
      const current = new Date(start);
      while (current <= end) {
        const dayLabel = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dayLabel);
        revenueByTime[dayLabel] = 0;
        current.setDate(current.getDate() + 1);
      }
      filteredTickets.forEach(ticket => {
        const purchaseDate = this._parsePurchaseDate(ticket.purchaseDate);
        if(purchaseDate){
          const dayLabel = purchaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  generateSeatOccupancy(period: string, startDate?: string, endDate?: string): ReportData {
    const events = this.getEventsFromLocalStorage();
    let filteredEvents = events;

    if (period === 'custom') {
      if (!startDate || !endDate) {
        return {
          type: 'seatOccupancy',
          period,
          labels: [],
          series: [],
          tableData: [],
          message: 'Please select start and end dates for custom range.',
        };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      });
    }

    const tickets = this.getTicketsFromLocalStorage();

    if (filteredEvents.length === 0) {
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

    filteredEvents.forEach(event => {
      const eventTickets = tickets.filter(ticket => ticket.eventId === event.id);
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
    // To compare dates without time, set 'now' to 00:00:00
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events.filter(event => {
      const dateParts = event.date.split('-');
      if (dateParts.length !== 3) {
        return false;
      }
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2], 10);

      const eventDate = new Date(year, month, day);

      if (isNaN(eventDate.getTime())) {
        return false;
      }

      const eventTime = eventDate.getTime();
      const todayTime = today.getTime();

      let includeEvent = false;
      switch (period) {
        case 'daily': // Events happening today (or occurred today)
          includeEvent = eventTime === todayTime;
          break;
        case 'weekly': // Events happening within the last 7 days (including today)
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          includeEvent = eventTime >= sevenDaysAgo.getTime() && eventTime <= todayTime;
          break;
        case 'monthly': // Events happening within the last 30 days (including today)
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          includeEvent = eventTime >= thirtyDaysAgo.getTime() && eventTime <= todayTime;
          break;
        case 'custom': // If custom range is active, assume all events are considered here, and filter will happen elsewhere (or by UI)
          includeEvent = true;
          break;
        default:
          includeEvent = true;
          break;
      }
      return includeEvent;
    });
  }

  generateEventsHosted(period: string, startDate?: string, endDate?: string): ReportData {
    const events = this.getEventsFromLocalStorage();
    let filteredEvents: Event[];

    if (period === 'custom') {
      if (!startDate || !endDate) {
        return {
          type: 'eventsHosted',
          period,
          labels: [],
          series: [],
          tableData: [],
          message: 'Please select start and end dates for custom range.',
        };
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredEvents = events.filter(event => {
        if (!event.createdAt) return false;
        const createdDate = new Date(event.createdAt);
        return createdDate >= start && createdDate <= end;
      });
    } else {
      filteredEvents = events.filter(event => {
        if (!event.createdAt) return false;
        const createdDate = new Date(event.createdAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const createdTime = createdDate.getTime();
        const todayTime = today.getTime();

        let includeEvent = false;
        switch (period) {
          case 'daily':
            includeEvent = createdTime >= todayTime && createdTime < todayTime + 24 * 60 * 60 * 1000;
            break;
          case 'weekly':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            includeEvent = createdTime >= sevenDaysAgo.getTime() && createdTime <= now.getTime();
            break;
          case 'monthly':
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            includeEvent = createdTime >= thirtyDaysAgo.getTime() && createdTime <= now.getTime();
            break;
          default:
            includeEvent = true;
            break;
        }
        return includeEvent;
      });
    }

    if (filteredEvents.length === 0) {
      return {
        type: 'eventsHosted',
        period,
        labels: [],
        series: [],
        tableData: [],
        message: 'No events created data available for the selected period. Please try a different report type, period, or ensure there is data for the selected criteria.',
      };
    }

    const labels: string[] = [];
    const series: number[] = [];
    const eventsByTime: { [key: string]: number } = {};

    if (period === 'daily') {
        labels.push('Today');
        series.push(filteredEvents.length);
    } else if (period === 'weekly') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            labels.push(dayLabel);
            eventsByTime[dayLabel] = 0;
        }
        filteredEvents.forEach(event => {
            const createdDate = new Date(event.createdAt!);
            const dayLabel = createdDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if(eventsByTime.hasOwnProperty(dayLabel)) {
                eventsByTime[dayLabel]++;
            }
        });
    } else if (period === 'custom') {
        const start = new Date(startDate!);
        const end = new Date(endDate!);
        const current = new Date(start);
        while (current <= end) {
            const dayLabel = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels.push(dayLabel);
            eventsByTime[dayLabel] = 0;
            current.setDate(current.getDate() + 1);
        }
        filteredEvents.forEach(event => {
            const createdDate = new Date(event.createdAt!);
            const dayLabel = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            const createdDate = new Date(event.createdAt!);
            const dayLabel = createdDate.getDate().toString();
            if(eventsByTime.hasOwnProperty(dayLabel)){
                eventsByTime[dayLabel]++;
            }
        });
    }

    if (period !== 'daily') {
        for (const label of labels) {
            series.push(eventsByTime[label] || 0);
        }
    }

    return {
      type: 'eventsHosted',
      period,
      labels,
      series,
      tableData: [{ label: 'Total Events Created', value: filteredEvents.length }],
      chartType: 'bar',
    };
  }
}