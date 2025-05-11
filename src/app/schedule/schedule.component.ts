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
  todaySchedule: Schedule | null = null;
  todayTocSchedule: any = null;
  cashActiveIndex: number = 0;
  tocActiveIndex: any;
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
      this.setTodayScheduleIndex();
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
      this.setTodayTocScheduleIndex();
      console.log(this.tocSchedule);
    });
  }

  setTodayScheduleIndex() {
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

    const index = this.schedule.findIndex((s) => s.day === currentDay);
    this.cashActiveIndex = index !== -1 ? index : 0;
  }

  setTodayTocScheduleIndex() {
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

    const index = this.tocSchedule.findIndex(
      (t: any) => t.day_date === currentDay
    );
    this.tocActiveIndex = index !== -1 ? index : 0;
  }
}
