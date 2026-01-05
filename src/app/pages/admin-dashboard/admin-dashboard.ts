import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { ReportService, ReportData } from '../../services/report.service';
import { Chart, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  standalone: true
})
export class AdminDashboard implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('reportChart') reportChart: ElementRef<HTMLCanvasElement> | undefined;
  private chart: Chart | undefined;

  activeChoice: 'analytics-reports' | 'register' | '' = 'analytics-reports';
  isAdmin: boolean = false;

  userName = 'Admin';
  showMenu = false;
  unreadCount: number = 0;
  private notificationSubscription: Subscription | undefined;

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = 'organizer';
  phone = '';
  organization = '';
  isLoading = false;

  reportType:
    | 'ticketSales'
    | 'revenue'
    | 'seatOccupancy'
    | 'auditoriumBookings'
    | 'eventsHosted'
    | 'utilizationStatistics' = 'auditoriumBookings';
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('pf-current-user');

      if (!userJson) {
        this.router.navigate(['/login']);
        return;
      }

      try {
        const user = JSON.parse(userJson);
        this.userName = user.name || 'Admin';
        this.isAdmin = user.role === 'auditorium_admin';
      } catch {
        this.userName = 'Admin';
        this.isAdmin = false;
      }

      this.notificationService.updateUnreadCount();
    } else {
      this.userName = 'Admin (SSR)';
      this.isAdmin = false;
    }

    this.notificationSubscription = this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

    if (this.isAdmin) {
      this.reportType = 'auditoriumBookings';
    }
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

  showChoice(choice: 'analytics-reports' | 'register' | '') {
    this.activeChoice = choice;
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('pf-current-user');
        }
        this.router.navigate(['/login']);
      },
      error: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('pf-current-user');
        }
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

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  register() {
    if (
      !this.name ||
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.role ||
      !this.phone
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
    
    const newUser = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone,
      organization: this.organization,
    };

    this.isLoading = true;

    this.apiService.signup(newUser).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          alert('Registration successful!');
          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          this.role = 'organizer';
          this.phone = '';
          this.organization = '';
          this.showChoice('');
        } else {
          alert(`Registration failed: ${res.message}`);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.error || err.error?.message || 'An unknown error occurred.';
        alert(`An error occurred: ${errorMessage}`);
      }
    });
  }

  generateReport() {
    this.insufficientDataMessage = null;
    this.generatedReportData = null;

    const isCustom = this.reportingPeriod === 'custom';
    const start = isCustom ? this.startDate : undefined;
    const end = isCustom ? this.endDate : undefined;

    let result: ReportData;
    switch (this.reportType) {
      case 'ticketSales':
      case 'auditoriumBookings':
        result = this.reportService.generateTicketSales(this.reportingPeriod, start, end);
        break;
      case 'revenue':
        result = this.reportService.generateRevenue(this.reportingPeriod, start, end);
        break;
      case 'seatOccupancy':
      case 'utilizationStatistics':
        result = this.reportService.generateSeatOccupancy(this.reportingPeriod, start, end);
        break;
      case 'eventsHosted':
        result = this.reportService.generateEventsHosted(this.reportingPeriod, start, end);
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
