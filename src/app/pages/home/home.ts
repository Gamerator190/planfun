import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  duration: string;
  ageRating: string;
  poster: string;
  isNew?: boolean;
  isImax?: boolean;
  releaseDate?: string;
  synopsis?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  userName = 'Guest';
  showMenu = false;
  userRole = '';

  constructor(public router: Router) {}

  movies: Movie[] = [
    {
      id: 1,
      title: 'Digital Innovation Conference 2025',
      genre: 'Conference · Technology',
      rating: 9.3,
      duration: '6 Hours',
      ageRating: 'All',
      isNew: true,
      poster: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
      releaseDate: '2025',
      synopsis:
        'Digital Innovation Conference 2025 presents two full days of inspiration, bringing together industry leaders, young innovators, and technology professionals from various fields. The event covers digital transformation, the latest AI developments, cloud technology, data analytics, and the implementation of IoT-based solutions in the real world. Participants will gain deep insights through keynote sessions, panel discussions, and technology showcases from startups and leading companies. This conference is a great opportunity for students who want to understand how technology shapes the future of the global industry.',
    },
    {
      id: 2,
      title: 'Creative Technology Workshop Series',
      genre: 'Workshop · Creative Tech',
      rating: 8.9,
      duration: '4 Hours',
      ageRating: 'All',
      isNew: true,
      poster: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
      releaseDate: '2025',
      synopsis:
        'This workshop series is designed to sharpen creativity through a modern technology approach. In 4 intensive sessions, participants will learn the basics to hands-on practice in AR/VR, creative coding, digital media art, and visual interaction. Each session is directly guided by creative practitioners experienced in the technology design industry. Participants will also be invited to create simple interactive works that can be used as a portfolio. This workshop is ideal for students who want to explore the fusion of art, design, and technology in more depth.',
    },
    {
      id: 3,
      title: 'Leadership & Career Development Conference',
      genre: 'Conference · Leadership',
      rating: 9.0,
      duration: '5 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181395/pexels-photo-1181395.jpeg',
      releaseDate: '2025',
      synopsis:
        'This conference brings together company leaders, professional coaches, and accomplished alumni to discuss how to build strong leadership character in the modern era. Participants will learn effective communication techniques, conflict management, long-term career planning, and the mindset needed to succeed in a competitive work environment. In addition to talk show sessions, the event also includes self-development workshops and one-on-one mentoring. It is ideal for students preparing to enter the professional world.',
    },
    {
      id: 4,
      title: 'Entrepreneurship Skills Workshop',
      genre: 'Workshop · Entrepreneurship',
      rating: 8.7,
      duration: '4 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181508/pexels-photo-1181508.jpeg',
      releaseDate: '2025',
      synopsis:
        'This workshop provides essential foundations for aspiring young entrepreneurs who want to start a business or startup. Participants will learn how to develop ideas into tangible products, understand market needs, create solid business models, and master pitching techniques to investors. Guided by mentors from renowned startups and incubators, this workshop offers hands-on experience through pitching simulations and business canvas development. It is ideal for students looking to build a business from an early stage.',
    },
    {
      id: 5,
      title: 'Student Art & Music Concert Night',
      genre: 'Concert · Art & Music',
      rating: 8.8,
      duration: '3 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
      releaseDate: '2025',
      synopsis:
        'A grand night of art appreciation on campus that brings together musicians, dancers, visual artists, and creative communities on one stage. Student Art & Music Concert Night features acoustic music, bands, modern dance, photography exhibitions, and art installations created by students. With artistic lighting and a warm festival atmosphere, this event creates an intimate yet lively experience. Visitors can enjoy visual works accompanied by live music performed by the campus’ best talents.',
    },
    {
      id: 6,
      title: 'Future Industry Insight Conference',
      genre: 'Conference · Industry 4.0',
      rating: 9.1,
      duration: '6 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181465/pexels-photo-1181465.jpeg',
      releaseDate: '2025',
      synopsis:
        'This conference takes participants on a journey into the future of Industry 4.0—covering automation, robotics, big data, smart manufacturing, and the digital transformation of large enterprises. Through sessions led by industry professionals, attendees gain deep insights into major changes in the world of work and the technologies that support them. The event also serves as a networking platform for students and practitioners to explore the latest career opportunities in the modern industrial world.',
    },
    {
      id: 7,
      title: 'Campus Tech Career Fair',
      genre: 'Career · Job Fair',
      rating: 8.5,
      duration: '7 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/936137/pexels-photo-936137.jpeg',
      releaseDate: '2024',
      synopsis:
        'The largest campus career fair featuring dozens of leading technology companies, startups, and software houses. Participants can meet HR and recruiters directly, attend CV consultation sessions, mock interviews, and talks about careers in technology. Many companies offer internship, part-time, and full-time opportunities for final-year students. This event is a golden opportunity to start building professional connections early.',
    },
    {
      id: 8,
      title: 'Digital Marketing Bootcamp for Students',
      genre: 'Bootcamp · Marketing',
      rating: 8.6,
      duration: '6 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181670/pexels-photo-1181670.jpeg',
      releaseDate: '2024',
      synopsis:
        'An intensive three-day bootcamp with hands-on practice. Participants learn digital marketing strategies ranging from social media advertising, content marketing, SEO, branding, to analytics. Each session includes case studies and mini projects that help participants understand how digital campaigns work in the real world. This bootcamp is suitable for students who want to deepen their digital marketing skills, which are currently in high demand by companies.',
    },
    {
      id: 9,
      title: 'UI/UX Design Hackathon Day',
      genre: 'Hackathon · Design',
      rating: 8.4,
      duration: '12 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
      releaseDate: '2024',
      synopsis:
        'A full-day hackathon event challenging participants to design solutions for real-world problems. Participants will work in teams to create user flows, wireframes, and interactive prototypes. Mentors from the UI/UX industry will provide direct guidance and feedback. At the end of the session, each team presents their design results to a panel of professional judges. This event is ideal for students looking to quickly and competitively build their design portfolios.',
    },
    {
      id: 10,
      title: 'AI & Data Science Student Summit',
      genre: 'Summit · AI & Data',
      rating: 9.0,
      duration: '5 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181678/pexels-photo-1181678.jpeg',
      releaseDate: '2024',
      synopsis:
        'This summit brings together speakers from AI communities, technology companies, and data science researchers. Participants will learn about machine learning, data visualization, AI ethics, and the implementation of AI models in industry. In addition to seminar sessions, there are also demos of student-built AI projects and networking sessions among communities. This event is perfect for students interested in exploring the world of data and artificial intelligence.',
    },
    {
      id: 11,
      title: 'Sustainable Innovation Forum',
      genre: 'Forum · Sustainability',
      rating: 8.7,
      duration: '4 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/155907/pexels-photo-155907.jpeg',
      releaseDate: '2024',
      synopsis:
        'This forum focuses on sustainability and green innovation as its main themes. Participants will learn how modern technology helps address environmental challenges such as renewable energy, waste solutions, and the development of eco-friendly products. The event also features inspiring social organizations and green startups. This forum provides a discussion space for students who want to contribute to a more sustainable future.',
    },
    {
      id: 12,
      title: 'Startup Pitch & Networking Night',
      genre: 'Pitching · Networking',
      rating: 8.8,
      duration: '3 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1181570/pexels-photo-1181570.jpeg',
      releaseDate: '2024',
      synopsis:
        'An event that brings together young founders with mentors, investors, and startup communities. Participants who already have ideas or prototypes can join pitching sessions and present their solutions. After pitching, the event continues with casual networking to expand connections. This event is ideal for students who want to enter the startup world and seek collaboration or incubation opportunities.',
    },
    {
      id: 13,
      title: 'Community Service & Social Impact Day',
      genre: 'Community · Social Impact',
      rating: 8.3,
      duration: '6 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1498925/pexels-photo-1498925.jpeg',
      releaseDate: '2024',
      synopsis:
        'A community service event that invites students to directly make a social impact. Programs include child education, environmental cleanup, health campaigns, and community empowerment. Besides making a real contribution, participants also learn about empathy, collaborative work, and the role of students as agents of change. It is suitable for those who want to gain social experience while broadening their horizons.',
    },
    {
      id: 14,
      title: 'Graduation Gala & Appreciation Night',
      genre: 'Gala · Celebration',
      rating: 9.2,
      duration: '4 Hours',
      ageRating: 'All',
      poster: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
      releaseDate: '2024',
      synopsis:
        'An elegant evening celebrating students’ journeys and achievements throughout their studies. The event includes an awards session, musical performances, group photos, and a gala dinner. With its grand decor and proud atmosphere, the Graduation Gala is an unforgettable moment before students embark on a new chapter in their lives. The event also serves as a platform to recognize campus organizations, committee members, and accomplished individuals.',
    },
  ];

  ngOnInit(): void {
    const userJson = localStorage.getItem('tix-current-user');

    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userJson);
      this.userName = user.name || 'Movie Lover';
      this.userRole = user.role || '';
    } catch {
      this.userName = 'Movie Lover';
    }

    // simpan movie list ke localstorage agar bisa diakses detail
    localStorage.setItem('tix-movie-list', JSON.stringify(this.movies));
  }

  toggleUserMenu() {
    this.showMenu = !this.showMenu;
  }

  openNotifications() {
    alert('There are no new notifications 😊');
  }

  goMovie(id: number) {
    this.router.navigate(['/movie', id]);
  }

  goAdmin() {
    this.router.navigate(['/admin-dashboard']);
  }

  goOrganizer() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    localStorage.removeItem('tix-current-user');
    this.router.navigate(['/login']);
  }
}
