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
import { of, delay, Observable } from 'rxjs';
@Component({
  selector: 'app-toc',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule,
    AngularFireAuthModule,
  ],
  templateUrl: './toc.component.html',
  styleUrl: './toc.component.scss',
})
export class TocComponent implements OnInit {
  waitlistForm: FormGroup;
  waitlist: any[] = [];
  errorMessage: string = '';
  firstUserModal: boolean = false;
  phoneNumber: string = '';
  otpCode: string = '';
  verificationId: any;
  verificationSent: boolean = false;
  authMessage: string = '';
  recaptchaVerifier: any;
  todayGames: any[] = [];
  seats: any = 0;
  tocSettingsId: any;
  isCLubOpen: boolean = false;
  startTime: string = '';
  isWaitlistOpen: boolean = false;
  tocSettings: any;
  constructor(
    private afAuth: AngularFireAuth,
    private auth: Auth,
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
      gameType: ['', [Validators.required]],
      smsUpdates: [false],
    });
  }
  ngOnInit(): void {
    this.getTodayGames();

    const today = new Date();
    const currentTime = today.getTime(); // in ms

    this.waitlistService.getTocSettings().then((response) => {
      response.forEach((day: any) => {
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

        if (day.day_date === dayName && day.is_live == true) {
          const clubStartTimeStr = day.time; // e.g., "7:00 pm"
          this.isCLubOpen = true;
          // Parse time string to Date
          const clubStartDateTime = new Date();
          const [time, modifier] = clubStartTimeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier.toLowerCase() === 'pm' && hours !== 12) hours += 12;
          if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;
          clubStartDateTime.setHours(hours - 2, minutes, 0, 0); // 2 hours before
          this.startTime = this.getStartTime(clubStartTimeStr);
          // Compare

          if (currentTime >= clubStartDateTime.getTime()) {
            this.isWaitlistOpen = true;
          }
        }
      });
    });

    this.getTocDays();
  }

  getStartTime(schedule: string) {
    let [timePart, modifier] = schedule.split(/(am|pm)/i);
    let [hours, minutes] = timePart.split(':');
    console.log(hours);
    return Number(hours) - 2 + ':' + minutes + ' ' + modifier;
  }

  async getTodayGames() {
    this.waitlistService.getTocSettings().then((response) => {
      response.forEach((day: any) => {
        if (
          day.day_date ===
            new Date().toLocaleDateString('en-US', { weekday: 'long' }) &&
          day.is_live == true
        ) {
          this.tocSettingsId = day.id;
          this.todayGames.push(day);
          this.getTocWaitlist(this.tocSettingsId);
        }
      });
    });
  }

  async getTocDays() {
    this.waitlistService.getTocSettings().then((response) => {
      this.tocSettings = response.filter((x: any) => x.is_live == true);
      console.log(this.tocSettings);
    });
  }

  async getTocWaitlist(id: any) {
    this.waitlistService.getTOC(id).then((response) => {
      console.log(response);
      this.waitlist = response;
    });
  }

  async onSubmit() {
    if (this.waitlistForm.valid) {
      const formData = this.waitlistForm.value;

      try {
        const isVerified = await this.waitlistService.checkVerification(
          formData.phone
        );

        if (isVerified) {
          // Add user to the waitlist and save to the database
          await this.waitlistService.addToWaitlist(formData);

          // Optionally, reset the form
          this.waitlistForm.reset();
          this.getWaitlist();
        } else {
          this.phoneNumber = this.waitlistForm.controls['phone'].value;
          this.firstUserModal = true;
        }
      } catch (error) {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    } else {
      console.log('Form is invalid');
    }
  }
  getWaitlist() {
    throw new Error('Method not implemented.');
  }

  async sendOTP() {
    if (!this.phoneNumber.startsWith('+')) {
      this.authMessage =
        'Enter phone number with country code (e.g., +15551234567)';
      return;
    }
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible', // Set to 'normal' instead of 'invisible' for testing
        callback: (response: any) => {
          console.log('reCAPTCHA solved:', response);
        },
      }
    );

    firebase
      .auth()
      .signInWithPhoneNumber(this.phoneNumber, this.recaptchaVerifier)
      .then((confirmationResult) => {
        this.verificationId = confirmationResult;
        console.log(confirmationResult);
        this.verificationSent = true;
        this.authMessage = 'OTP sent successfully!';
      })
      .catch((error) => {
        this.authMessage = `Error: ${error}`;
      });
  }

  verifyOTP() {
    const formData = this.waitlistForm.value;
    if (!this.otpCode) {
      this.authMessage = 'Please enter the OTP.';
      return;
    }

    const credential = PhoneAuthProvider.credential(
      this.verificationId.verificationId,
      this.otpCode
    );

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(async (userCredential) => {
        await this.waitlistService.saveUser(formData);
        await this.waitlistService.addToWaitlist(formData);
        this.authMessage = 'OTP verified! User authenticated.';
        this.firstUserModal = false;
        this.waitlistForm.reset();
        this.getWaitlist();
      })
      .catch((error) => {
        this.authMessage = `Verification failed: ${error.message}`;
      });
  }
}
