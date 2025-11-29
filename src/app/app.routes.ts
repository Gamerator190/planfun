import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home'; // ⬅️ tambahkan ini
import { EventDetailComponent } from './pages/event-detail/event-detail';
import { SeatPickerComponent } from './pages/seat-picker/seat-picker';
import { MyTicketsComponent } from './pages/my-tickets/my-tickets';
import { CheckoutComponent } from './pages/checkout/checkout'; // ⬅️ tambahkan ini
import { ETicketComponent } from './pages/e-ticket/e-ticket';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent }, // ⬅️ route baru

  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'dashboard', component: Dashboard },

  // ⬇ TAMBAHKAN INI
  { path: 'event/:id', component: EventDetailComponent },

  // ... route lain
  { path: 'event/:id/seats', component: SeatPickerComponent }, // ⬅ ini
  { path: 'my-tickets', component: MyTicketsComponent }, // ⬅️ ini baru
  { path: 'checkout/:id/:time/:seats', component: CheckoutComponent },

  // ⬇ route baru untuk detail tiket (E-Ticket)
  { path: 'my-tickets/:index', component: ETicketComponent },
];
