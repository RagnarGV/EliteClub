import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { GalleryComponent } from './gallery/gallery.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { WaitlistComponent } from './waitlist/waitlist.component';
import { TocComponent } from './toc/toc.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { SpecialEventsComponent } from './special-events/special-events.component';
import { DownloadComponent } from './download/download.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'waitlist', component: WaitlistComponent },
  { path: 'toc', component: TocComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'download', component: DownloadComponent },
  { path: 'special-events', component: SpecialEventsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
