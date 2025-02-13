import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import {
  AngularFireAuth,
  AngularFireAuthModule,
} from '@angular/fire/compat/auth';
import {
  Auth,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
} from '@angular/fire/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-otp-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AngularFireModule,
    AngularFireAuthModule,
  ],
  templateUrl: './otp-auth.component.html',
  styleUrl: './otp-auth.component.scss',
})
export class OtpAuthComponent implements OnInit {
  phoneNumber: string = '';
  otpCode: string = '';
  verificationId: any;
  verificationSent: boolean = false;
  authMessage: string = '';
  recaptchaVerifier: any;

  constructor(private afAuth: AngularFireAuth, private auth: Auth) {}

  ngOnInit(): void {}

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
      .then((userCredential) => {
        this.authMessage = 'OTP verified! User authenticated.';
      })
      .catch((error) => {
        this.authMessage = `Verification failed: ${error.message}`;
      });
  }
}
