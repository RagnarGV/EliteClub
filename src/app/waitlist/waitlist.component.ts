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
    window.scrollTo(0, 0);
    this.getWaitlist();
    this.getTodayGames();
  }
  async getTodayGames() {
    this.waitlistService.getSchedule().then((response) => {
      response.forEach((day: { day: string; games: any[] }) => {
        day.games.forEach((game: { date: string }) => {
          if (
            day.day ===
            new Date().toLocaleDateString('en-US', { weekday: 'long' })
          ) {
            console.log(game);
            this.todayGames.push(game);
          }
        });
      });
    });
  }
  async getWaitlist() {
    this.waitlistService.getWaitlist().then((response) => {
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
