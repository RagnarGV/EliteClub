import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../schedule.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss',
})
export class ReviewsComponent implements OnInit {
  reviews: any;

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.getReviews();
  }

  getReviews() {
    this.scheduleService.getReviews().then((reviews) => {
      this.reviews = reviews;
    });
  }
}
