import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../schedule.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit {
  galleryItems: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
  }> = [];

  constructor(private galleryService: ScheduleService) {}

  ngOnInit() {
    this.fetchGalleryItems();
  }

  async fetchGalleryItems() {
    try {
      this.galleryItems = await this.galleryService.getGalleryItems();
    } catch (error) {
      console.error('Failed to fetch gallery items', error);
    }
  }
}
