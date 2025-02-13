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
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { PhoneAuthProvider } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import { response } from 'express';
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
  constructor(
    private fb: FormBuilder,
    private waitlistService: ScheduleService
  ) {
    this.waitlistForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastInitial: ['', [Validators.required, Validators.maxLength(1)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gameType: [false, [Validators.requiredTrue]],
      smsUpdates: [false],
    });
  }
  ngOnInit(): void {
    this.getWaitlist();
  }

  async getWaitlist() {
    this.waitlistService.getWaitlist().subscribe((response) => {
      console.log(response);
      this.waitlist = response;
    });
  }

  async onSubmit() {
    if (this.waitlistForm.valid) {
      const formData = this.waitlistForm.value;
      console.log(formData);
      try {
        const isVerified = await this.waitlistService.checkVerification(
          formData.phone
        );

        if (isVerified) {
          // Add user to the waitlist and save to the database
          await this.waitlistService.saveUser(formData);

          // Optionally, reset the form
          this.waitlistForm.reset();
          this.getWaitlist();
        } else {
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
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible', // Set to 'normal' instead of 'invisible' for testing
      }
    );
    // if (!this.recaptchaVerifier) {
    //   this.recaptchaVerifier = new RecaptchaVerifier(
    //     this.auth,
    //     'recaptcha-container',
    //     {
    //       size: 'invisible',
    //       callback: (response: any) => {
    //         console.log('reCAPTCHA solved:', response);
    //       },
    //     }
    //   );
    //   await this.recaptchaVerifier.render();
    // }
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
        this.authMessage = `Error: ${error.message}`;
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
        this.authMessage = 'OTP verified! User authenticated.';
      })
      .catch((error) => {
        this.authMessage = `Verification failed: ${error.message}`;
      });
  }
}
