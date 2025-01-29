import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { WaitlistComponent } from './waitlist/waitlist.component';
import { OtpAuthComponent } from './otp-auth/otp-auth.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'waitlist', component: WaitlistComponent },
  { path: 'otp', component: OtpAuthComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];
