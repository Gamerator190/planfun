import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { PaymentComponent } from './pages/payment/payment';
import { RegisterComponent } from './pages/register/register';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';
import { HomeComponent } from './pages/home/home';
import { EventDetailComponent } from './pages/event-detail/event-detail';
import { SeatPickerPageComponent } from './pages/seat-picker/seat-picker-page.component';
import { NotificationsComponent } from './pages/notifications/notifications';
import { CheckoutComponent } from './pages/checkout/checkout'; 
import { ETicketComponent } from './pages/e-ticket/e-ticket';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Dashboard } from './pages/dashboard/dashboard';
import { WaitlistComponent } from './pages/waitlist/waitlist';
import { TicketScannerComponent } from './pages/ticket-scanner/ticket-scanner';
import { OrganizerGuard } from './guards/organizer.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },

  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [AdminGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [OrganizerGuard] },

  { path: 'event/:id', component: EventDetailComponent },
  { path: 'waitlist', component: WaitlistComponent },

  { path: 'event/:id/:time/seats', component: SeatPickerPageComponent },
  { path: 'notifications', component: NotificationsComponent }, 
  { path: 'checkout/:id/:time/:seats', component: CheckoutComponent },

  { path: 'e-ticket/:id', component: ETicketComponent },
  { path: 'payment', component: PaymentComponent }, 

  { path: 'ticket-scanner', component: TicketScannerComponent, canActivate: [OrganizerGuard] },
  { path: 'ticket-scanner/:ticketId', component: TicketScannerComponent, canActivate: [OrganizerGuard] },
];
