import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ScheduleService, Schedule } from '../schedule.service';
@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent {
  schedule: Schedule[] = [];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.scheduleService.getSchedule().subscribe((data) => {
      console.log(data);
      this.schedule = data;
    });
  }
}
