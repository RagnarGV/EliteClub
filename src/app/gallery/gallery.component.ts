import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../schedule.service';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { LoaderComponent } from '../loader/loader.component';
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class GalleryComponent implements OnInit {
  galleryItems: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
  }> = [];
  isOpen = false;
  whenClicked = [false, false];
  loading = true;
  constructor(private galleryService: ScheduleService) {}

  ngOnInit() {
    this.fetchGalleryItems();
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
  tracked(item: any, index: any) {
    return index;
  }
  async fetchGalleryItems() {
    try {
      this.galleryItems = await this.galleryService.getGalleryItems();
      this.loading = false;
    } catch (error) {
      console.error('Failed to fetch gallery items', error);
    }
  }
}
