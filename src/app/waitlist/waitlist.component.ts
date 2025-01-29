// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   ReactiveFormsModule,
//   FormBuilder,
//   FormGroup,
//   Validators,
// } from '@angular/forms';
// @Component({
//   selector: 'app-waitlist',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './waitlist.component.html',
//   styleUrl: './waitlist.component.scss',
// })
// export class WaitlistComponent {
//   waitlistForm: FormGroup;
//   waitlist: Array<{
//     firstName: string;
//     lastInitial: string;
//     phoneNumber: string;
//     gameType: boolean;
//     smsUpdates: boolean;
//   }> = [];

//   constructor(private fb: FormBuilder) {
//     this.waitlistForm = this.fb.group({
//       firstName: ['', [Validators.required]],
//       lastInitial: ['', [Validators.required, Validators.maxLength(1)]],
//       phoneNumber: [
//         '',
//         [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
//       ],
//       gameType: [false, [Validators.requiredTrue]],
//       smsUpdates: [false],
//     });
//   }

//   onSubmit() {
//     if (this.waitlistForm.valid) {
//       // Push the form data into the waitlist array
//       this.waitlist.push(this.waitlistForm.value);
//       console.log('Form submitted:', this.waitlistForm.value);

//       // Optionally, reset the form after submission
//       this.waitlistForm.reset();
//     } else {
//       console.log('Form is invalid');
//     }
//   }
// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ScheduleService } from '../schedule.service';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './waitlist.component.html',
  styleUrl: './waitlist.component.scss',
  providers: [ScheduleService],
})
export class WaitlistComponent {
  waitlistForm: FormGroup;
  waitlist: Array<{
    firstName: string;
    lastInitial: string;
    phoneNumber: string;
    gameType: boolean;
    smsUpdates: boolean;
  }> = [];
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private waitlistService: ScheduleService
  ) {
    this.waitlistForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastInitial: ['', [Validators.required, Validators.maxLength(1)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      gameType: [false, [Validators.requiredTrue]],
      smsUpdates: [false],
    });
  }

  async onSubmit() {
    if (this.waitlistForm.valid) {
      const formData = this.waitlistForm.value;

      try {
        const isVerified = await this.waitlistService.checkVerification(
          formData.phoneNumber
        );

        if (isVerified) {
          // Add user to the waitlist and save to the database
          this.waitlist.push(formData);
          await this.waitlistService.saveUser(formData);

          // Optionally, reset the form
          this.waitlistForm.reset();
        } else {
          this.errorMessage =
            'To join the waitlist for the first time, please verify your phone number. Text "verify" to 647-494-9290, or call 647-494-9290 for automated phone verification.';
        }
      } catch (error) {
        console.error('Error:', error);
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    } else {
      console.log('Form is invalid');
    }
  }
}
