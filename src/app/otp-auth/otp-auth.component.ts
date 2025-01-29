import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import axios from 'axios';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-otp-auth',
  standalone: true,
  imports: [CommonModule, AngularFireAuthModule, AngularFireModule],
  templateUrl: './otp-auth.component.html',
  styleUrl: './otp-auth.component.scss',
})
export class OtpAuthComponent {
  phoneNumber: string = '';
  otpCode: string = '';
  verificationId: any;
  verificationSent: boolean = false;
  authMessage: string = '';

  constructor(private afAuth: AngularFireAuth) {}

  sendOTP() {
    const recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
      }
    );

    this.afAuth
      .signInWithPhoneNumber(this.phoneNumber, recaptchaVerifier)
      .then((confirmationResult) => {
        this.verificationId = confirmationResult;
        this.verificationSent = true;
        this.authMessage = 'OTP sent successfully.';
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

    const credential = firebase.auth.PhoneAuthProvider.credential(
      this.verificationId.verificationId,
      this.otpCode
    );

    this.afAuth
      .signInWithCredential(credential)
      .then((userCredential) => {
        this.authMessage = 'OTP verified! Saving user...';
        this.saveUserToDatabase(userCredential.user);
      })
      .catch((error) => {
        this.authMessage = `Verification failed: ${error.message}`;
      });
  }

  saveUserToDatabase(user: any) {
    axios
      .post('http://localhost:5000/api/users', {
        uid: user.uid,
        phone: user.phoneNumber,
      })
      .then(() => {
        this.authMessage = 'User saved successfully!';
      })
      .catch((error) => {
        this.authMessage = `Database error: ${error.message}`;
      });
  }
}
