import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-ticket-scanner',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './ticket-scanner.html',
  styleUrl: './ticket-scanner.css'
})
export class TicketScannerComponent implements OnInit {
  ticketId: string = '';
  ticket: any | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    const idFromUrl = this.route.snapshot.paramMap.get('ticketId');
    if (idFromUrl) {
      this.ticketId = idFromUrl;
      this.validateTicket();
    }
  }

  validateTicket() {
    console.log('validateTicket called with ticketId:', this.ticketId);
    
    if (!this.ticketId || this.ticketId.trim() === '') {
      alert('Please enter a Ticket ID.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.ticket = null;
    this.cdr.detectChanges();

    console.log('Making API call for ticket:', this.ticketId.trim());

    this.apiService.getTicketForValidation(this.ticketId.trim())
      .pipe(timeout(5000))
      .subscribe({
        next: (res) => {
          console.log('API response received:', res);
          if (res.success) {
            this.ticket = res.ticket;
          } else {
            this.errorMessage = res.message;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('API error:', err);
          this.errorMessage = err.error?.message || 'Request failed or timed out. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  admit() {
    if (this.ticket && this.ticket.status === 'active') {
      this.apiService.admitTicket(this.ticket._id).subscribe({
        next: (res) => {
          if (res.success) {
            this.ticket.status = 'used';
            
            // Update localStorage with the new status
            const rawTickets = localStorage.getItem('pf-tickets');
            if (rawTickets) {
              try {
                let allTickets = JSON.parse(rawTickets);
                const ticketIndex = allTickets.findIndex((t: any) => t._id === this.ticket._id);
                if (ticketIndex > -1) {
                  allTickets[ticketIndex].status = 'used';
                  localStorage.setItem('pf-tickets', JSON.stringify(allTickets));
                }
              } catch (e) {
                console.error('Error updating localStorage:', e);
              }
            }
            
            alert('Ticket has been admitted successfully!');
            
            // Clear the ticket display and reset for next scan
            this.ticket = null;
            this.ticketId = '';
            this.errorMessage = null;
            this.cdr.detectChanges();
          } else {
            alert(`Failed to admit ticket: ${res.message}`);
          }
        },
        error: (err) => {
          alert(`An error occurred: ${err.error?.message}`);
        }
      });
    }
  }

  formatRupiah(value: number): string {
    return value?.toLocaleString('id-ID') || '0';
  }
}
