import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class ScheduleComponent implements OnInit {

  movie: any = null;
  selectedDateIndex = 0;

  dates: string[] = [];

  // ✅ hanya 1 ruangan
  roomName = 'Main Auditorium';

  // ✅ setiap index mewakili 1 tanggal (sesuai index
  // di this.dates)
timesByDate: string[][] = [
  ['09:00'], // Day 1
  ['13:00'], // Day 2
  ['13:45'], // Day 3
  ['09:30'], // Day 4
  ['12:45'], // Day 5
  ['14:15'], // Day 6
  ['08:30'], // Day 7
];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const moviesJson = localStorage.getItem('tix-movie-list');
    let movies: any[] = [];

    if (moviesJson) movies = JSON.parse(moviesJson);

    this.movie = movies.find((m: any) => m.id === id);

    if (!this.movie) {
      this.router.navigate(['/home']);
      return;
    }

    this.generateDates();
  }

  generateDates() {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      this.dates.push(
        d.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      );
    }

    // Optional: kalau mau aman, pastikan panjang timesByDate sama dengan dates
    // (bisa ditambah pengecekan di sini kalau perlu)
  }

  selectDate(i: number) {
    this.selectedDateIndex = i;
  }

  goSelectSeat(time: string) {
    this.router.navigate(['/movie', this.movie.id, 'schedule', time, 'seats']);
  }

  goBack() {
    this.router.navigate(['/movie', this.movie.id]);
  }
}
