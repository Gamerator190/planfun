import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeatPickerComponent } from '../seat-picker/seat-picker';

import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { ReportService, ReportData } from '../../services/report.service';
import { Chart, ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Promo {
  code: string;
  discountPercent: number;
  expiryDate: string;
  applicableTicketTypes: { [key: string]: boolean };
}

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
  promo?: Promo[];
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

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, SeatPickerComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('reportChart') reportChart: ElementRef<HTMLCanvasElement> | undefined;
  private chart: Chart | undefined;

  activeChoice: 'create-event' | 'edit-event' | 'analytics-reports' | '' = 'analytics-reports';

  showChoice(choice: 'create-event' | 'edit-event' | 'analytics-reports' | '') {
    this.activeChoice = choice;
  }

  userName = 'Organizer';
  showMenu = false;
  userEvents: Event[] = [];
  selectedEventId: number | null = null;
  promo: Promo[] = [];
  bookedSeats: string[] = [];
  unreadCount: number = 0;
  private notificationSubscription: Subscription | undefined;

  // Report properties
  reportType: 'ticketSales' | 'revenue' | 'seatOccupancy' = 'ticketSales';
  reportingPeriod: 'daily' | 'weekly' | 'monthly' = 'daily';
  generatedReportData: ReportData | null = null;
  insufficientDataMessage: string | null = null;

  ticketCategories = [{ name: 'General Admission', shortName: 'GEN', price: 25000 }];
  seatConfiguration = [
    { row: 'A', category: 'GEN' },
    { row: 'B', category: 'GEN' },
    { row: 'C', category: 'GEN' },
    { row: 'D', category: 'GEN' },
    { row: 'E', category: 'GEN' },
    { row: 'F', category: 'GEN' },
    { row: 'G', category: 'GEN' },
    { row: 'H', category: 'GEN' },
    { row: 'I', category: 'GEN' },
    { row: 'J', category: 'GEN' },
    { row: 'AA', category: 'GEN' },
    { row: 'BB', category: 'GEN' },
    { row: 'CC', category: 'GEN' },
    { row: 'DD', category: 'GEN' },
    { row: 'EE', category: 'GEN' },
  ];

  onEventSelect(event: any) {
    const eventId = Number(event.target.value);
    if (eventId) {
      this.selectedEventId = eventId;
      const selectedEvent = this.userEvents.find((e) => e.id === eventId);
      if (selectedEvent) {
        this.ticketCategories = selectedEvent.ticketCategories
          ? JSON.parse(JSON.stringify(selectedEvent.ticketCategories))
          : [{ name: 'General Admission', shortName: 'GEN', price: 25000 }];
        this.seatConfiguration = selectedEvent.seatConfiguration
          ? JSON.parse(JSON.stringify(selectedEvent.seatConfiguration))
          : [
              { row: 'A', category: 'GEN' },
              { row: 'B', category: 'GEN' },
              { row: 'C', category: 'GEN' },
              { row: 'D', category: 'GEN' },
              { row: 'E', category: 'GEN' },
              { row: 'F', category: 'GEN' },
              { row: 'G', category: 'GEN' },
              { row: 'H', category: 'GEN' },
              { row: 'I', category: 'GEN' },
              { row: 'J', category: 'GEN' },
              { row: 'AA', category: 'GEN' },
              { row: 'BB', category: 'GEN' },
              { row: 'CC', category: 'GEN' },
              { row: 'DD', category: 'GEN' },
              { row: 'EE', category: 'GEN' },
            ];
        this.promo = selectedEvent.promo ? JSON.parse(JSON.stringify(selectedEvent.promo)) : [];
        this.bookedSeats = selectedEvent.bookedSeats || [];
      }
    } else {
      this.selectedEventId = null;
      this.ticketCategories = [{ name: 'General Admission', shortName: 'GEN', price: 25000 }];
      this.seatConfiguration = [
        { row: 'A', category: 'GEN' },
        { row: 'B', category: 'GEN' },
        { row: 'C', category: 'GEN' },
        { row: 'D', category: 'GEN' },
        { row: 'E', category: 'GEN' },
        { row: 'F', category: 'GEN' },
        { row: 'G', category: 'GEN' },
        { row: 'H', category: 'GEN' },
        { row: 'I', category: 'GEN' },
        { row: 'J', category: 'GEN' },
        { row: 'AA', category: 'GEN' },
        { row: 'BB', category: 'GEN' },
        { row: 'CC', category: 'GEN' },
        { row: 'DD', category: 'GEN' },
        { row: 'EE', category: 'GEN' },
      ];
      this.promo = [];
      this.bookedSeats = [];
    }
  }

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private reportService: ReportService,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('pf-current-user');

    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      this.userName = user.name || 'Organizer';

      const eventsJson = localStorage.getItem('pf-events');
      if (eventsJson) {
        const allEvents: Event[] = JSON.parse(eventsJson);
        this.userEvents = allEvents.filter((event) => event.email === user.email);
      }
    } catch {
      this.userName = 'Organizer';
    }

    this.notificationSubscription = this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

    this.notificationService.updateUnreadCount();

    this.generateReport();
  }

  ngAfterViewInit(): void {
    if (this.generatedReportData) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    localStorage.removeItem('pf-current-user');
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  addCategory() {
    this.ticketCategories.push({ name: '', shortName: '', price: 0 });
  }

  removeCategory(index: number) {
    if (this.ticketCategories.length > 1) {
      this.ticketCategories.splice(index, 1);
    } else {
      alert('You must have at least one category.');
    }
  }

  addPromo() {
    const applicableTicketTypes = this.ticketCategories.reduce(
      (acc, cat) => {
        acc[cat.shortName] = false;
        return acc;
      },
      {} as { [key: string]: boolean },
    );

    this.promo.push({
      code: '',
      discountPercent: 0,
      expiryDate: '',
      applicableTicketTypes: applicableTicketTypes,
    });
  }

  removePromo(index: number) {
    this.promo.splice(index, 1);
  }

  updateSeatConfiguration() {
    this.seatConfiguration = [...this.seatConfiguration];
  }

  submitForm() {
    if (this.activeChoice === 'create-event') {
      const title = (document.getElementById('event-title') as HTMLInputElement).value;
      const location = (document.getElementById('event-location') as HTMLInputElement).value;
      const date = (document.getElementById('event-date') as HTMLInputElement).value;
      const time = (document.getElementById('event-time') as HTMLInputElement).value;
      const description = (document.getElementById('event-description') as HTMLTextAreaElement)
        .value;

      let userEmail: string | undefined;
      const currentUserJson = localStorage.getItem('pf-current-user');
      if (currentUserJson) {
        try {
          const user = JSON.parse(currentUserJson);
          userEmail = user.email;
        } catch (e) {
          console.error('Error parsing current user from localStorage', e);
        }
      }

      const posterFile = (document.getElementById('event-poster') as HTMLInputElement).files?.[0];

      if (!title || !location || !date || !time || !description) {
        alert('Please fill in all required fields: Title, Location, Date, Time, and Description.');
        return;
      }

      const eventsJson = localStorage.getItem('pf-events');
      if (eventsJson) {
        try {
          const events: Event[] = JSON.parse(eventsJson);
          if (events.some((event) => event.date === date)) {
            alert('There is already an ongoing event on that date.');
            return;
          }
        } catch (e) {
          console.error('Error parsing events from localStorage', e);
        }
      }

      const totalSeats = this.seatConfiguration ? this.seatConfiguration.length * 30 : 0;
      const bookedSeatsCount = this.bookedSeats ? this.bookedSeats.length : 0;
      const calculatedAvailableSeats = totalSeats - bookedSeatsCount;

      let posterBase64: string | undefined = undefined;
      const reader = new FileReader();

      reader.onload = () => {
        posterBase64 = reader.result as string;
        this.saveEvent({
          title,
          location,
          date,
          time,
          description,
          email: userEmail,
          poster: posterBase64,
          ticketCategories: this.ticketCategories,
          seatConfiguration: this.seatConfiguration,
          promo: this.promo,
          availableSeats: calculatedAvailableSeats,
        });
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Could not read event poster file.');
        this.saveEvent({
          title,
          location,
          date,
          time,
          description,
          email: userEmail,
          ticketCategories: this.ticketCategories,
          seatConfiguration: this.seatConfiguration,
          promo: this.promo,
          availableSeats: calculatedAvailableSeats,
        });
      };

      if (posterFile) {
        reader.readAsDataURL(posterFile);
      } else {
        this.saveEvent({
          title,
          location,
          date,
          time,
          description,
          email: userEmail,
          ticketCategories: this.ticketCategories,
          seatConfiguration: this.seatConfiguration,
          promo: this.promo,
          availableSeats: calculatedAvailableSeats,
        });
      }
    } else if (this.activeChoice === 'edit-event') {
      if (this.selectedEventId === null) {
        alert('Please select an event to edit.');
        return;
      }

      const eventsJson = localStorage.getItem('pf-events');
      let events: Event[] = [];
      if (eventsJson) {
        try {
          events = JSON.parse(eventsJson);
        } catch (e) {
          console.error('Error parsing events from localStorage', e);
        }
      }

      const eventIndex = events.findIndex((e) => e.id === this.selectedEventId);
      if (eventIndex !== -1) {
        events[eventIndex].ticketCategories = this.ticketCategories;
        events[eventIndex].seatConfiguration = this.seatConfiguration;
        events[eventIndex].promo = this.promo;
        localStorage.setItem('pf-events', JSON.stringify(events));
        alert('Event updated successfully!');
      } else {
        alert('Selected event not found.');
      }
    }
  }

  private saveEvent(eventData: Omit<Event, 'id'>) {
    const eventsJson = localStorage.getItem('pf-events');
    let events: Event[] = [];
    if (eventsJson) {
      try {
        events = JSON.parse(eventsJson);
      } catch (e) {
        console.error('Error parsing events from localStorage', e);
      }
    }

    const newEvent: Event = {
      id:
        events.length > 0
          ? Math.max(...events.map((e) => (typeof e.id === 'number' ? e.id : 0))) + 1
          : 1,
      ...eventData,
      isNew: true,
    };

    events.push(newEvent);
    localStorage.setItem('pf-events', JSON.stringify(events));

    alert('Event created successfully!');
    this.clearCreateEventForm();
  }

  private clearCreateEventForm() {
    (document.getElementById('event-title') as HTMLInputElement).value = '';
    (document.getElementById('event-location') as HTMLInputElement).value = '';
    (document.getElementById('event-date') as HTMLInputElement).value = '';
    (document.getElementById('event-time') as HTMLInputElement).value = '';
    (document.getElementById('event-description') as HTMLTextAreaElement).value = '';
    (document.getElementById('event-poster') as HTMLInputElement).value = '';
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  generateReport() {
    this.insufficientDataMessage = null;
    this.generatedReportData = null;

    let result: ReportData;
    switch (this.reportType) {
      case 'ticketSales':
        result = this.reportService.generateTicketSales(this.reportingPeriod);
        break;
      case 'revenue':
        result = this.reportService.generateRevenue(this.reportingPeriod);
        break;
      case 'seatOccupancy':
        result = this.reportService.generateSeatOccupancy(this.reportingPeriod);
        break;
      default:
        return;
    }

    if (result.message) {
      this.insufficientDataMessage = result.message;
    } else {
      this.generatedReportData = result;
      if (this.reportChart) {
        this.createChart();
      }
    }
  }

  createChart() {
    if (!this.reportChart || !this.generatedReportData) {
      return;
    }

    const canvas = this.reportChart.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: this.generatedReportData.chartType as ChartType,
      data: {
        labels: this.generatedReportData.labels,
        datasets: [
          {
            label: this.generatedReportData.type,
            data: this.generatedReportData.series,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  downloadReportAsPdf() {
    const data = document.querySelector('.report-display');
    if (data) {
      html2canvas(data as HTMLElement).then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(contentDataURL, 'PNG', 0, 0, width, height);
        pdf.save('report.pdf');
      });
    }
  }
}
