import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ScheduleService, Schedule } from '../schedule.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoaderComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  providers: [ScheduleService],
})
export class ScheduleComponent {
  schedule: Schedule[] = [];
  expandedIndex: number = 0; // Default to first item
  loading: boolean = true;
  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.getSchedule();
  }

  getSchedule() {
    this.scheduleService.getSchedule().then((data) => {
      this.loading = false;
      this.schedule = data.filter((data: any) => data.is_live == true);
      this.setExpandedIndex();
    });
  }

  setExpandedIndex() {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDay = daysOfWeek[new Date().getDay()];

    // Find index of the current day in the schedule array
    const index = this.schedule.findIndex((day) => day.day === currentDay);
    this.expandedIndex = index !== -1 ? index : 0; // Expand matched day or default to 1st
  }
}
