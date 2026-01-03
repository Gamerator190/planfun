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
  // index = 0; // No longer needed

  @ViewChild('qrcodeCanvas', { static: false }) qrcodeCanvas!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService, 
  ) {}

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id'); // Get ID from route

    if (ticketId) {
      const rawTickets = localStorage.getItem('pf-tickets');
      if (rawTickets) {
        try {
          const allTickets: any[] = JSON.parse(rawTickets);
          this.ticket = allTickets.find(t => t._id === ticketId); // Find by _id

          if (this.ticket) {
            // Ensure seatDetails is populated if it somehow wasn't (legacy data, etc.)
            if (!this.ticket.seatDetails) {
              this.ticket.seatDetails = this.ticket.seats.map((s: any) => ({
                seat: s,
                typeCode: 'REG',
              }));
            }
            // QRCode generation will happen in ngAfterViewInit now
          } else {
            console.error('Ticket not found in localStorage:', ticketId);
            this.router.navigate(['/notifications']);
          }
        } catch (e) {
          console.error('Error parsing tickets from localStorage:', e);
          this.router.navigate(['/notifications']);
        }
      } else {
        console.error('No tickets found in localStorage.');
        this.router.navigate(['/notifications']);
      }
    } else {
      console.error('Ticket ID is missing from route.');
      this.router.navigate(['/notifications']);
    }
  }

  ngAfterViewInit(): void {
    // Generate QR code here now that ticket and qrcodeCanvas are guaranteed to be available after view init
    if (this.ticket) { // Check this.ticket again to be safe
      this.generateQRCode();
    }
  }

  generateQRCode(): void {
    if (this.ticket && this.qrcodeCanvas && this.qrcodeCanvas.nativeElement) {
      this.qrcodeCanvas.nativeElement.innerHTML = ''; // Clear previous QR code
      const qrData = `${window.location.origin}/ticket-scanner/${this.ticket._id}`;

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
    if (!this.ticket) return true;
    if (this.ticket.status !== 'active') return true; // Can't cancel if not active

    const eventDate = new Date(this.ticket.event.date);
    const today = new Date();
    // Set time to 0 to compare dates only
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Allow cancellation if event is 7 or more days away
    return diffDays < 7;
  }

  cancelBooking() {
    if (!this.ticket) return;

    // The cancel button should be disabled for non-active tickets
    if (this.ticket.status !== 'active') {
      alert(`This booking cannot be cancelled as it is already ${this.ticket.status}.`);
      return;
    }
    
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.apiService.cancelTicket(this.ticket._id).subscribe({
        next: (res) => {
          if(res.success){
            // Update status in local storage
            const rawTickets = localStorage.getItem('pf-tickets');
            if (rawTickets) {
              let allTickets = JSON.parse(rawTickets);
              const ticketIndex = allTickets.findIndex((t: any) => t._id === this.ticket._id);
              if (ticketIndex > -1) {
                allTickets[ticketIndex].status = 'cancelled';
                localStorage.setItem('pf-tickets', JSON.stringify(allTickets));
              }
            }
            // Update status on the current page view
            this.ticket.status = 'cancelled';
            alert('Booking cancelled successfully!');
            this.router.navigate(['/notifications']); // Navigate to notifications page
          } else {
            alert(`Failed to cancel booking: ${res.message || 'Unknown error'}`);
          }
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          alert(`An error occurred: ${err.error?.message || 'Please try again later.'}`);
        }
      });
    }
  }
}
