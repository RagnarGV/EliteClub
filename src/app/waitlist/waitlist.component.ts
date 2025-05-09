import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ScheduleService, Waitlist } from '../schedule.service';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import {
  AngularFireAuth,
  AngularFireAuthModule,
} from '@angular/fire/compat/auth';
import { Auth, PhoneAuthProvider } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule,
    AngularFireAuthModule,
  ],

  templateUrl: './waitlist.component.html',
  styleUrl: './waitlist.component.scss',
  providers: [ScheduleService],
})
export class WaitlistComponent implements OnInit {
  waitlistForm: FormGroup;
  waitlist: Waitlist[] = [];
  errorMessage: string = '';
  firstUserModal: boolean = false;
  phoneNumber: string = '';
  otpCode: string = '';
  verificationId: any;
  verificationSent: boolean = false;
  authMessage: string = '';
  recaptchaVerifier: any;
  todayGames: any[] = [];
  selectedGame: any;
  tocSettings: any;
  tocSettingsId: any;
  todaySchedule: any;
  startTime: any;
  isCLubOpen: boolean = false;
  isWaitlistOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private waitlistService: ScheduleService
  ) {
    this.waitlistForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastInitial: ['', [Validators.required, Validators.maxLength(1)]],
      phone: [
        { value: '+1', disabled: false },
        [Validators.required, Validators.pattern(/^\+1[0-9]{10}$/)],
      ],
      game: ['cash', Validators.required],
      toc_day: [''],
      gameType: ['', [Validators.required]],
      smsUpdates: [false],
    });
  }
  ngOnInit(): void {
    window.scrollTo(0, 0);
    //this.waitlistForm.controls['game'].setValue('cash')
    this.getWaitlist();
    this.getTodayGames();

    this.waitlistService.getSchedule().then((response) => {
      response.forEach((day: any) => {
        if (
          day.is_live == true &&
          day.day ===
            new Date().toLocaleDateString('en-US', { weekday: 'long' })
        ) {
          this.todaySchedule = day;
          console.log(this.todaySchedule);
          this.startTime = this.getStartTime(this.todaySchedule.time);
          this.isCLubOpen = true;
          if (this.isClubLiveToday(day.day, day.time)) {
            this.isWaitlistOpen = true;
          }
        }
      });
    });
  }
  getStartTime(schedule: string) {
    const [startStr, endStr] = schedule.split('-').map((s) => s.trim());
    let [timePart, modifier] = startStr.split(/(am|pm)/i);
    let [hours, minutes] = timePart.split(':');
    console.log(minutes);
    return Number(hours) - 1 + ':' + minutes + ' ' + modifier;
  }
  isClubLiveToday(dayName: string, timeRange: string): boolean {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const dayIndexMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const todayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentDay = dayIndexMap[dayName];

    // Time range parsing
    const [startStr, endStr] = timeRange.split('-').map((s) => s.trim());

    const to24Hour = (time: string): Date => {
      const date = new Date(now);
      let [timePart, modifier] = time.split(/(am|pm)/i);
      let [hours, minutes] = timePart.trim().split(':').map(Number);

      if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;

      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    let startTime = to24Hour(startStr);
    let endTime = to24Hour(endStr);

    // If end time is earlier, it means it goes to next day (e.g., 7:00 PM - 4:00 AM)
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Adjust start and end dates to match the intended weekday
    const dayDiff = currentDay - startTime.getDay();
    startTime.setDate(startTime.getDate() + dayDiff);
    endTime.setDate(endTime.getDate() + dayDiff);

    return oneHourLater >= startTime && oneHourLater <= endTime;
  }

  onPhoneNumberChanged() {
    this.firstUserModal = false;
  }

  async getTodayGames() {
    this.waitlistService.getSchedule().then((response) => {
      response.forEach((day: { day: string; games: any[] }) => {
        day.games.forEach((game: { date: string }) => {
          if (
            day.day ===
            new Date().toLocaleDateString('en-US', { weekday: 'long' })
          ) {
            this.todayGames.push(game);
          }
        });
      });
    });
  }

  // async getTocDays() {
  //   this.waitlistService.getTocSettings().then((response) => {
  //     this.tocSettings = response.filter((data: any) => data.is_live == true);
  //   });
  // }
  // async getTocWaitlist(id: any) {
  //   this.waitlistService.getTOC(id).then((response) => {
  //     this.waitlist = response;
  //   });
  // }

  async getWaitlist() {
    this.waitlistService.getWaitlist().then((response) => {
      this.waitlist = response;
    });
  }

  async onSubmit() {
    this.tocSettingsId = this.waitlistForm.controls['toc_day'].value;

    if (this.waitlistForm.valid) {
      const formData = this.waitlistForm.value;

      try {
        const isVerified = await this.waitlistService.checkVerification(
          formData.phone
        );
        if (isVerified) {
          await this.waitlistService.addToWaitlist(formData);
          this.waitlistForm.reset();
          this.waitlistForm.controls['phone'].setValue('+1');
          this.getWaitlist();
        } else {
          this.phoneNumber = this.waitlistForm.controls['phone'].value;
          this.firstUserModal = true;
        }
      } catch (error) {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    }
  }
  // if (this.waitlistForm.valid) {
  //   const formData = this.waitlistForm.value;

  //   try {
  //     const isVerified = await this.waitlistService.checkVerification(
  //       formData.phone
  //     );

  //     if (isVerified) {
  //       // Add user to the waitlist and save to the database
  //       await this.waitlistService.addToWaitlist(formData);

  //       // Optionally, reset the form
  //       this.waitlistForm.reset();
  //       this.getWaitlist();
  //     } else {
  //       this.phoneNumber = this.waitlistForm.controls['phone'].value;
  //       this.firstUserModal = true;
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     this.errorMessage = 'An error occurred. Please try again later.';
  //   }
  // } else {

  // }

  async sendOTP() {
    if (!this.phoneNumber.startsWith('+')) {
      this.authMessage =
        'Enter phone number with country code (e.g., +15551234567)';
      return;
    }

    this.waitlistService
      .triggerVerification(this.phoneNumber)
      .then((confirmationResult: any) => {
        this.verificationSent = true;
        this.authMessage = 'OTP sent successfully!';
      })
      .catch((error: any) => {
        this.authMessage = `Error: ${error}`;
      });
  }

  verifyOTP() {
    const formData = this.waitlistForm.value;
    if (!this.otpCode) {
      this.authMessage = 'Please enter the OTP.';
      return;
    }

    this.waitlistService
      .verifyOTP(this.phoneNumber, this.otpCode)
      .then(async (userCredential) => {
        await this.waitlistService.saveUser(formData);
        await this.waitlistService.addToWaitlist(formData);
        this.authMessage = 'OTP verified! User authenticated.';
        this.firstUserModal = false;
        this.waitlistForm.reset();
        this.getWaitlist();
      })
      .catch((error: any) => {
        this.authMessage = `Verification failed: ${error.message}`;
      });
  }
}
