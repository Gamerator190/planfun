declare const QRCode: any;

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-e-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './e-ticket.html',
  styleUrl: './e-ticket.css',
})
export class ETicketComponent implements OnInit, AfterViewInit {
  ticket: any | null = null;
  index = 0;

  @ViewChild('qrcodeCanvas', { static: false }) qrcodeCanvas!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.index = Number(this.route.snapshot.paramMap.get('index') || 0);

    this.apiService.getUserTickets().subscribe({
      next: (res) => {
        if (res.success && res.tickets.length > this.index) {
          this.ticket = res.tickets[this.index];
          if (!this.ticket.seatDetails) {
            this.ticket.seatDetails = this.ticket.seats.map((s: any) => ({
              seat: s,
              typeCode: 'REG',
            }));
          }
          this.generateQRCode();
        } else {
          this.router.navigate(['/notifications']);
        }
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
        this.router.navigate(['/notifications']);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.ticket && this.qrcodeCanvas) {
      this.generateQRCode();
    }
  }

  generateQRCode(): void {
    if (this.ticket && this.qrcodeCanvas && this.qrcodeCanvas.nativeElement) {
      this.qrcodeCanvas.nativeElement.innerHTML = ''; // Clear previous QR code
      const qrData = JSON.stringify({
        ticketId: this.ticket._id,
        eventName: this.ticket.event.title,
        purchaseDate: this.ticket.purchaseDate,
      });

      new QRCode(this.qrcodeCanvas.nativeElement, {
        text: qrData,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  }

  getTypeLabel(code: string): string {
    return this.ticket?.categoryTable?.[code]?.name || code;
  }

  getTypePrice(code: string): number {
    return this.ticket?.categoryTable?.[code]?.price ?? 0;
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    this.router.navigate(['/notifications']);
  }

  get isCancelDisabled(): boolean {
    if (!this.ticket || !this.ticket.event) return true;
    const eventDate = new Date(this.ticket.event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  }

  cancelBooking() {
    if (!this.ticket) return;

    if (this.isCancelDisabled) {
      alert('Booking can only be cancelled 7 days or more prior to the event.');
      return;
    }
    
    if (confirm('Are you sure you want to cancel this booking?')) {
      // this.apiService.deleteTicket(this.ticket._id).subscribe({
      //   next: (res) => {
      //     if(res.success){
      //       alert('Booking cancelled successfully!');
      //       this.router.navigate(['/notifications']);
      //     } else {
      //       alert('Failed to cancel booking.');
      //     }
      //   },
      //   error: (err) => {
      //     alert('An error occurred while cancelling booking.');
      //   }
      // });
      alert('Booking cancellation is not yet implemented in the backend.');
    }
  }
}
