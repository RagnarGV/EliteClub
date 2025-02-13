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
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' })),
      ]),
    ]),
    trigger('openClose', [
      // ...
      state('mouseover', style({ transform: 'Scale(1.2)' })),
      state('mouseleave', style({ transform: 'Scale(1)' })),
      transition('mouseover => mouseleave', [animate('0.1s')]),
      transition('mouseleave => mouseover', [animate('0.1s')]),
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
    } catch (error) {
      console.error('Failed to fetch gallery items', error);
    }
  }
}
