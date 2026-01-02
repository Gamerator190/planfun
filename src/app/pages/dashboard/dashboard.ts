import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SeatPickerComponent } from '../seat-picker/seat-picker';

import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { ReportService, ReportData } from '../../services/report.service';
import { Chart, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, SeatPickerComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true // Should be standalone as per typical Angular setup
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('reportChart') reportChart: ElementRef<HTMLCanvasElement> | undefined;
  private chart: Chart | undefined;

  activeChoice: 'analytics-reports' | 'create-event' | 'edit-event' | '' = 'analytics-reports';
  userName = 'Organizer';
  showMenu = false;
  unreadCount: number = 0;
  private notificationSubscription: Subscription | undefined;

  userEvents: any[] = [];
  selectedEventId: string | null = null;

  ticketCategories: { name: string; shortName: string; price: number; maxTickets: number }[] = [
    { name: '', shortName: '', price: 0, maxTickets: 0 }
  ];
  seatConfiguration: { row: string; category: string }[] = [];
  promo: {
    code: string;
    discountPercent: number;
    expiryDate: string;
    applicableTicketTypes: { [key: string]: boolean };
  }[] = [];

  bookedSeats: string[] = [];

  // Edit event properties
  editTitle = '';
  editLocation = '';
  editDate = '';
  editTime = '';
  editDescription = '';

  reportType:
    | 'ticketSales'
    | 'revenue'
    | 'seatOccupancy'
    | 'auditoriumBookings'
    | 'eventsHosted'
    | 'utilizationStatistics' = 'ticketSales';
  reportingPeriod: 'daily' | 'weekly' | 'monthly' | 'custom' = 'daily';
  startDate: string = '';
  endDate: string = '';

  generatedReportData: ReportData | null = null;
  insufficientDataMessage: string | null = null;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private reportService: ReportService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) { // Conditionally access localStorage
      const userJson = localStorage.getItem('pf-current-user');

      if (!userJson) {
        this.router.navigate(['/login']);
        return;
      }

      try {
        const user = JSON.parse(userJson);
        this.userName = user.name || 'Organizer';

        this.apiService.getEvents().subscribe({
          next: (res) => {
            if(res.success){
              this.userEvents = res.events.filter((event: any) => event.email === user.email);
            }
          },
          error: (err) => {
            console.error('Failed to fetch events', err);
          }
        })
      } catch {
        this.userName = 'Organizer';
      }

      this.notificationService.updateUnreadCount(); // This also needs browser check inside service
    } else {
      // Handle SSR case if needed, e.g., default values
      this.userName = 'Organizer (SSR)';
    }


    this.notificationSubscription = this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

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

  showChoice(choice: 'analytics-reports' | 'create-event' | 'edit-event' | '') {
    this.activeChoice = choice;
    
    if (choice === 'create-event') {
      // Reset form data for creating a new event
      this.ticketCategories = [{ name: '', shortName: '', price: 0, maxTickets: 0 }];
      this.seatConfiguration = [
        { row: 'A', category: '' },
        { row: 'B', category: '' },
        { row: 'C', category: '' },
        { row: 'D', category: '' },
        { row: 'E', category: '' },
        { row: 'F', category: '' },
        { row: 'G', category: '' },
        { row: 'H', category: '' },
        { row: 'I', category: '' },
        { row: 'J', category: '' },
        { row: 'AA', category: '' },
        { row: 'BB', category: '' },
        { row: 'CC', category: '' },
        { row: 'DD', category: '' },
        { row: 'EE', category: '' }
      ];
      this.promo = [];
      this.selectedEventId = null;
    }
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        localStorage.removeItem('pf-current-user');
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('pf-current-user');
        this.router.navigate(['/login']);
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  addCategory() {
    this.ticketCategories.push({ name: '', shortName: '', price: 0, maxTickets: 0 });
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

  onEventSelect(event: any) {
    const selectedId = event.target.value;
    if (selectedId) {
      const selectedEvent = this.userEvents.find(e => e._id === selectedId);
      if (selectedEvent) {
        // Populate form fields with selected event data
        this.editTitle = selectedEvent.title || '';
        this.editLocation = selectedEvent.location || '';
        this.editDate = selectedEvent.date || '';
        this.editTime = selectedEvent.time || '';
        this.editDescription = selectedEvent.description || '';
        this.ticketCategories = selectedEvent.ticketCategories || [{ name: '', shortName: '', price: 0, maxTickets: 0 }];
        this.seatConfiguration = selectedEvent.seatConfiguration || [];
        this.promo = selectedEvent.promo || [];
        this.bookedSeats = selectedEvent.bookedSeats || [];
        this.cdr.detectChanges();
      }
    } else {
      // Clear form if no event selected
      this.editTitle = '';
      this.editLocation = '';
      this.editDate = '';
      this.editTime = '';
      this.editDescription = '';
      this.ticketCategories = [{ name: '', shortName: '', price: 0, maxTickets: 0 }];
      this.seatConfiguration = [];
      this.promo = [];
      this.bookedSeats = [];
      this.cdr.detectChanges();
    }
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
      
      // Convert date to a consistent format (ISO string)
      const formattedDate = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
      
      const eventData = {
        title,
        location,
        date: formattedDate, // Use the formatted date
        time,
        description,
        email: userEmail,
        ticketCategories: this.ticketCategories,
        seatConfiguration: this.seatConfiguration,
        promo: this.promo,
        isNew: true,
      };

      if(posterFile) {
        const reader = new FileReader();
        reader.onload = () => {
          this.saveEvent({ ...eventData, poster: reader.result as string });
        };
        reader.readAsDataURL(posterFile);
      } else {
        this.saveEvent(eventData);
      }

    } else if (this.activeChoice === 'edit-event') {
      if (this.selectedEventId === null) {
        alert('Please select an event to edit.');
        return;
      }
      
      const selectedEvent = this.userEvents.find((e) => e._id === this.selectedEventId);
      if (!selectedEvent) {
        alert('Selected event not found.');
        return;
      }

      // Create a full event object to send, preserving existing fields
      const updatedEventData = {
        ...selectedEvent, // Start with existing event data
        title: this.editTitle,
        location: this.editLocation,
        date: this.editDate,
        time: this.editTime,
        description: this.editDescription,
        ticketCategories: this.ticketCategories,
        seatConfiguration: this.seatConfiguration,
        promo: this.promo,
      };

      const posterFile = (document.getElementById('edit-event-poster') as HTMLInputElement).files?.[0];

      const updateEvent = (data: any) => {
        this.apiService.updateEvent(this.selectedEventId!, data).subscribe({
          next: (res) => {
            if (res.success) {
              alert('Event updated successfully!');
              this.showChoice('');
              this.ngOnInit(); // refresh data
            } else {
              alert('Failed to update event');
            }
          },
          error: (err) => {
            console.error('Error updating event:', err); // Log full error for debugging
            const errorMessage = err.error?.message || 'An unknown error occurred.';
            alert(`An error occurred while updating the event: ${errorMessage}`);
          }
        });
      };

      if(posterFile) {
        const reader = new FileReader();
        reader.onload = () => {
          updatedEventData.poster = reader.result as string;
          updateEvent(updatedEventData);
        };
        reader.readAsDataURL(posterFile);
      } else {
        updateEvent(updatedEventData);
      }
    }
  }

  private saveEvent(eventData: any) {
    this.apiService.createEvent(eventData).subscribe({
      next: (res) => {
        if(res.success) {
          alert('Event created successfully!');
          this.clearCreateEventForm();
          this.showChoice('');
          this.ngOnInit(); // refresh data
        } else {
          alert('Failed to create event');
        }
      },
      error: (err) => {
        if(err.error.message.includes('E11000 duplicate key error')){
          alert('There is already an ongoing event on that date.');
        } else {
          alert('An error occurred while creating the event.');
        }
      }
    });
  }

  private clearCreateEventForm() {
    (document.getElementById('event-title') as HTMLInputElement).value = '';
    (document.getElementById('event-location') as HTMLInputElement).value = '';
    (document.getElementById('event-date') as HTMLInputElement).value = '';
    (document.getElementById('event-time') as HTMLInputElement).value = '';
    (document.getElementById('event-description') as HTMLTextAreaElement).value = '';
    const posterInput = document.getElementById('event-poster') as HTMLInputElement;
    if (posterInput) {
      posterInput.value = '';
    }
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
