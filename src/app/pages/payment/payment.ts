import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentComponent implements OnInit {
  ticket: any | null = null;
  paymentOption: 'creditCard' | 'eWallet' | 'bankTransfer' = 'creditCard';

  creditCard = {
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };

  eWallet = {
    provider: '',
    accountNumber: '',
    pin: ''
  };

  bankTransfer = {
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    const ticketDataString = this.route.snapshot.paramMap.get('ticketData');
    if (ticketDataString) {
      try {
        this.ticket = JSON.parse(ticketDataString);
      } catch (e) {
        console.error('Error parsing ticket data from route:', e);
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  validatePaymentDetails(): boolean {
    if (this.paymentOption === 'creditCard') {
      if (!this.creditCard.cardholderName || !this.creditCard.cardNumber || !this.creditCard.expiryDate || !this.creditCard.cvv) {
        alert('Please fill in all credit card details.');
        return false;
      }
      
      const cardNumberDigits = this.creditCard.cardNumber.replace(/\s/g, '');
      if (!/^\d{16,19}$/.test(cardNumberDigits)) {
        alert('Please enter a valid card number.');
        return false;
      }
      
      if (!/^\d{3,4}$/.test(this.creditCard.cvv)) {
        alert('Please enter a valid CVV.');
        return false;
      }
    } else if (this.paymentOption === 'eWallet') {
      if (!this.eWallet.provider || !this.eWallet.accountNumber || !this.eWallet.pin) {
        alert('Please fill in all e-wallet details.');
        return false;
      }
      if (!/^\d{6}$/.test(this.eWallet.pin)) {
        alert('E-Wallet PIN must be 6 digits.');
        return false;
      }
    } else if (this.paymentOption === 'bankTransfer') {
      if (!this.bankTransfer.bankName || !this.bankTransfer.accountNumber || !this.bankTransfer.accountHolder) {
        alert('Please fill in all bank transfer details.');
        return false;
      }
      if (!/^\d+$/.test(this.bankTransfer.accountNumber)) {
        alert('Account number must contain only digits.');
        return false;
      }
    }
    return true;
  }

  processPayment() {
    if (!this.ticket) return;

    
    if (!this.validatePaymentDetails()) {
      return;
    }

    
    this.apiService.createTicket(this.ticket).subscribe({
      next: (res) => {
        if (res.success) {
          
          if (isPlatformBrowser(this.platformId)) {
            const rawTickets = localStorage.getItem('pf-tickets');
            let tickets = [];
            if (rawTickets) {
              try {
                tickets = JSON.parse(rawTickets);
              } catch (e) {
                console.error('Could not parse existing tickets, starting fresh.');
              }
            }
            
            
            const currentUserJson = localStorage.getItem('pf-current-user');
            let userId = null;
            if (currentUserJson) {
              try {
                const user = JSON.parse(currentUserJson);
                userId = user.id || user._id;
              } catch (e) {
                console.error('Error parsing current user');
              }
            }
            const newTicketForStorage = {
              ...res.ticket,
              eventTitle: this.ticket.eventTitle,
              poster: this.ticket.poster,
              eventDate: this.ticket.eventDate,
              time: this.ticket.time, 
              userId: userId,
            };
            tickets.push(newTicketForStorage);
            localStorage.setItem('pf-tickets', JSON.stringify(tickets));
          }
          

          alert(`Payment successful via ${this.getPaymentMethodLabel()}!`);
          this.notificationService.updateUnreadCount();
          this.router.navigate(['/home']);
        } else {
          alert(`Payment failed: ${res.message}`);
        }
      },
      error: (err) => {
        alert(`An error occurred during payment: ${err.error?.message || err.message}`);
      }
    });
  }

  getPaymentMethodLabel(): string {
    switch (this.paymentOption) {
      case 'creditCard':
        return 'Credit Card';
      case 'eWallet':
        return `${this.eWallet.provider.toUpperCase()}`;
      case 'bankTransfer':
        return this.bankTransfer.bankName;
      default:
        return 'Unknown';
    }
  }

  formatRupiah(value: number): string {
    return value.toLocaleString('id-ID');
  }

  goBack() {
    if (this.ticket) {
      this.router.navigate(
        [
          '/checkout',
          this.ticket.eventId,
          this.ticket.time,
          this.ticket.seats.join(','),
        ],
        {
          state: { categoryTable: this.ticket.categoryTable } 
        }
      );
    } else {
      this.router.navigate(['/home']);
    }
  }
}
