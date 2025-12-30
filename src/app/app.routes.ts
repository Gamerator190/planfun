import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { PaymentComponent } from './pages/payment/payment';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { Verification } from './pages/verification/verification'; 
import { EventDetailComponent } from './pages/event-detail/event-detail';
import { SeatPickerPageComponent } from './pages/seat-picker/seat-picker-page.component';
import { NotificationsComponent } from './pages/notifications/notifications';
import { CheckoutComponent } from './pages/checkout/checkout'; 
import { ETicketComponent } from './pages/e-ticket/e-ticket';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Dashboard } from './pages/dashboard/dashboard';
import { WaitlistComponent } from './pages/waitlist/waitlist';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verification', component: Verification },
  { path: 'home', component: HomeComponent },

  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'dashboard', component: Dashboard },

  { path: 'event/:id', component: EventDetailComponent },
  { path: 'waitlist', component: WaitlistComponent },

  { path: 'event/:id/:time/seats', component: SeatPickerPageComponent },
  { path: 'notifications', component: NotificationsComponent }, 
  { path: 'checkout/:id/:time/:seats', component: CheckoutComponent },

  { path: 'notifications/:index', component: ETicketComponent },
  { path: 'payment', component: PaymentComponent }, 
];
