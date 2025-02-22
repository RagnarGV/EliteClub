import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ScheduleService, Schedule } from '../schedule.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  providers: [ScheduleService],
})
export class ScheduleComponent {
  schedule: any[] = [];

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.getSchedule();
  }
  getSchedule() {
    this.scheduleService.getSchedule().subscribe((data) => {
      console.log(data);
      this.schedule = data;
    });
  }
}
