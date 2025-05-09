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
  tocSchedule: any;
  tocExpandedIndex: any;
  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.getSchedule();
    this.getTocSchedule();
  }
  private weekdayOrder: { [key: string]: number } = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  getSchedule() {
    this.scheduleService.getSchedule().then((data) => {
      this.loading = false;
      this.schedule = data
        .filter((data: any) => data.is_live == true)
        .sort((a: any, b: any) => {
          this.weekdayOrder[a.day] - this.weekdayOrder[b.day];
        });
      this.setExpandedIndex();
    });
  }

  getTocSchedule() {
    this.scheduleService.getTocSettings().then((data) => {
      this.loading = false;
      this.tocSchedule = data
        .filter((item: any) => item.is_live == true)
        .sort(
          (a: any, b: any) =>
            this.weekdayOrder[a.day_date] - this.weekdayOrder[b.day_date]
        );
      this.setTocExpandedIndex();
      console.log(this.tocSchedule);
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

  setTocExpandedIndex() {
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
    const tocIndex = this.tocSchedule.findIndex(
      (day: any) => day.day_date === currentDay
    );
    this.tocExpandedIndex = tocIndex !== -1 ? tocIndex : 0; // Expand matched day or default to 1st
  }
}
