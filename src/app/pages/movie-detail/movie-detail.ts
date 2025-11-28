import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetailComponent implements OnInit {
  movie: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    const moviesJson = localStorage.getItem('tix-movie-list');
    let movies: any[] = [];

    if (moviesJson) {
      movies = JSON.parse(moviesJson);
    }

    this.movie = movies.find((m: any) => m.id === id);

    if (!this.movie) {
      alert('Movie not found');
      this.router.navigate(['/home']);
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  beliTiket() {
    this.router.navigate(['/movie', this.movie.id, 'schedule']);
  }
}
