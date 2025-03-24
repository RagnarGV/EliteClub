import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../schedule.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-special-events',
  imports: [CommonModule],
  templateUrl: './special-events.component.html',
  styleUrl: './special-events.component.scss',
})
export class SpecialEventsComponent implements OnInit {
  specialEvents: any[] = [];
  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.getSpecialEvents();
  }

  getSpecialEvents() {
    this.scheduleService.getSpecialEvents().then((data) => {
      data.forEach((event: any) => {
        if (event.is_live) {
          this.specialEvents.push(event);
        }
      });
      console.log(this.specialEvents);
    });
  }
}
