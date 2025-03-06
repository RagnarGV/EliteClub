import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './module1/navbar/navbar.component';
import { FooterComponent } from './module1/footer/footer.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { GalleryComponent } from './gallery/gallery.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { CommonModule } from '@angular/common';
import { ReviewsComponent } from './reviews/reviews.component';
import { SpecialEventsComponent } from './special-events/special-events.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    ScheduleComponent,
    GalleryComponent,
    HomeComponent,
    AboutUsComponent,
    RouterOutlet,
    ReviewsComponent,
    SpecialEventsComponent,
  ],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'EliteClub';
  isWaitlistRoute = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isWaitlistRoute =
        this.router.url.includes('/waitlist') ||
        this.router.url.includes('/toc');
    });
  }
}
