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
  selectedGame: any;
  tocSettings: any;
  tocSettingsId: any;
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
  }
  onChangeGame() {
    this.todayGames = [];
    this.waitlist = [];
    this.selectedGame = this.waitlistForm.controls['game'].value;
    if (this.selectedGame === 'toc') {
      console.log(this.selectedGame);
      this.getTocDays();
    } else if (this.selectedGame === 'cash') {
      this.tocSettings = '';
      this.waitlistForm.controls['toc_day'].reset;
      this.getWaitlist();
      this.getTodayGames();
    }
  }

  onTocDaySelect() {
    this.todayGames = [];
    this.waitlist = [];
    console.log(this.waitlistForm.controls['game'].value);
    this.waitlistService
      .getTocSettingsById(this.waitlistForm.controls['toc_day'].value)
      .then((data: any) => {
        this.todayGames.push(data);
      });
    this.getTocWaitlist(this.waitlistForm.controls['toc_day'].value);
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
            console.log(game);
            this.todayGames.push(game);
          }
        });
      });
    });
  }

  async getTocDays() {
    this.waitlistService.getTocSettings().then((response) => {
      console.log(response);
      this.tocSettings = response.filter((data: any) => data.is_live == true);
    });
  }
  async getTocWaitlist(id: any) {
    this.waitlistService.getTOC(id).then((response) => {
      console.log(response);
      this.waitlist = response;
    });
  }

  async getWaitlist() {
    this.waitlistService.getWaitlist().then((response) => {
      console.log(response);
      this.waitlist = response;
    });
  }

  async onSubmit() {
    this.tocSettingsId = this.waitlistForm.controls['toc_day'].value;
    if (this.selectedGame == 'cash') {
      console.log('Hi');
      if (this.waitlistForm.valid) {
        const formData = this.waitlistForm.value;
        console.log(formData);
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
            console.log(this.firstUserModal);
          }
        } catch (error) {
          console.error('Error:', error);
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      } else {
        console.log('Form is invalid');
      }
    } else {
      if (this.waitlistForm.valid) {
        console.log('Hi');
        const formData = this.waitlistForm.value;

        console.log(formData);
        try {
          const isVerified = await this.waitlistService.checkVerification(
            formData.phone
          );
          if (isVerified) {
            await this.waitlistService.addToTOCWaitlist(
              this.tocSettingsId,
              formData
            );
            this.waitlistForm.reset();
            this.waitlistForm.controls['phone'].setValue('+1');
            this.getTocWaitlist(this.tocSettingsId);
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
    //   console.log('Form is invalid');
    // }
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
