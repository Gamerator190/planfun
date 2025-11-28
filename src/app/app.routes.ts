import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home'; // ⬅️ tambahkan ini
import { MovieDetailComponent } from './pages/movie-detail/movie-detail';
import { ScheduleComponent } from './pages/schedule/schedule';
import { SeatPickerComponent } from './pages/seat-picker/seat-picker';
import { MyTicketsComponent } from './pages/my-tickets/my-tickets';
import { CheckoutComponent } from './pages/checkout/checkout'; // ⬅️ tambahkan ini
import { ETicketComponent } from './pages/e-ticket/e-ticket';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent }, // ⬅️ route baru

    // ⬇ TAMBAHKAN INI
  { path: 'movie/:id', component: MovieDetailComponent },

// ... route lain
  { path: 'movie/:id/schedule', component: ScheduleComponent },
  { path: 'movie/:id/schedule/:time/seats', component: SeatPickerComponent }, // ⬅ ini
  { path: 'tiket-saya', component: MyTicketsComponent }, // ⬅️ ini baru
  { path: 'checkout/:id/:time/:seats', component: CheckoutComponent },

  // ⬇ route baru untuk detail tiket (E-Ticket)
  { path: 'tiket-saya/:index', component: ETicketComponent },
];
