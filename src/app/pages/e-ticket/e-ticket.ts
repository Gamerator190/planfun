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

  @ViewChild('qrcodeCanvas', { static: false }) qrcodeCanvas!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService, 
  ) {}

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id'); 

    if (ticketId) {
      const rawTickets = localStorage.getItem('pf-tickets');
      if (rawTickets) {
        try {
          const allTickets: any[] = JSON.parse(rawTickets);
          this.ticket = allTickets.find(t => t._id === ticketId); 

          if (this.ticket) {
            if (!this.ticket.seatDetails) {
              this.ticket.seatDetails = this.ticket.seats.map((s: any) => ({
                seat: s,
                typeCode: 'REG',
              }));
            }
            
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
    
    if (this.ticket) { 
      this.generateQRCode();
    }
  }

  generateQRCode(): void {
    if (this.ticket && this.qrcodeCanvas && this.qrcodeCanvas.nativeElement) {
      this.qrcodeCanvas.nativeElement.innerHTML = ''; 
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
    if (this.ticket.status !== 'active') return true; 

    const eventDate = new Date(this.ticket.event.date);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    
    return diffDays < 7;
  }

  cancelBooking() {
    if (!this.ticket) return;

    
    if (this.ticket.status !== 'active') {
      alert(`This booking cannot be cancelled as it is already ${this.ticket.status}.`);
      return;
    }
    
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.apiService.cancelTicket(this.ticket._id).subscribe({
        next: (res) => {
          if(res.success){
            
            const rawTickets = localStorage.getItem('pf-tickets');
            if (rawTickets) {
              let allTickets = JSON.parse(rawTickets);
              const ticketIndex = allTickets.findIndex((t: any) => t._id === this.ticket._id);
              if (ticketIndex > -1) {
                allTickets[ticketIndex].status = 'cancelled';
                localStorage.setItem('pf-tickets', JSON.stringify(allTickets));
              }
            }
            
            this.ticket.status = 'cancelled';
            alert('Booking cancelled successfully!');
            this.router.navigate(['/notifications']); 
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
