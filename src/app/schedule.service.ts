import { Injectable } from '@angular/core';
import axios from 'axios';
axios.defaults.headers.common = {
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Expires: '0',
};
export interface Game {
  type: string;
  limit: string;
}

export interface Schedule {
  day: string;
  time: string;
  games: Game[];
  description: string;
}

export interface Waitlist {
  firstName: string;
  lastInitial: string;
  phone: string;
  gameType: string;
  smsUpdates: boolean;
  checkedIn: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  //private apiUrl = 'https://eliteclub-api.onrender.com/api';
  private newApiUrl = 'https://clubelite.ca/apis';
  //private apiUrl = 'http://localhost:3000/api';
  constructor() {}

  async getSchedule() {
    const response = await axios.get(this.newApiUrl + '/schedule');
    return response.data;
  }

  async getWaitlist() {
    const response = await axios.get(this.newApiUrl + '/waitlist');
    return response.data;
  }
  async getTOC(id: any) {
    const response = await axios.get(this.newApiUrl + '/toc/' + id);
    return response.data;
  }

  async getTocSettings() {
    const response = await axios.get(this.newApiUrl + '/toc-settings');
    return response.data;
  }

  async getTocSettingsById(id: any) {
    const response = await axios.get(this.newApiUrl + '/toc-settings/' + id);
    return response.data;
  }

  async getGalleryItems() {
    const response = await axios.get(this.newApiUrl + '/gallery');
    return response.data;
  }

  async getSpecialEvents() {
    const response = await axios.get(this.newApiUrl + '/special-events');
    return response.data;
  }

  async checkVerification(phoneNumber: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.newApiUrl}/verify/${phoneNumber}`
      );
      console.log(response);
      return response.data.user;
    } catch (error) {
      console.error('Error checking verification:', error);
      throw error;
    }
  }

  async triggerVerification(phoneNumber: any): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      let result = await axios.post(`${this.newApiUrl}/send-otp`, formData);
      console.log(result);
    } catch (error) {
      console.error('Error triggering verification:', error);
      throw error;
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('otp', otp);
      await axios.post(`${this.newApiUrl}/verify-otp`, formData);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async saveUser(userData: any): Promise<void> {
    try {
      await axios.post(`${this.newApiUrl}/users`, userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async addToWaitlist(userData: any): Promise<void> {
    try {
      await axios.post(`${this.newApiUrl}/waitlist`, userData);
    } catch (error: any) {
      if (error.status === 400) {
        alert('Phone number already exists');
      }
    }
  }

  async addToTOCWaitlist(id: any, userData: any): Promise<void> {
    try {
      await axios.post(`${this.newApiUrl}/toc/` + id, userData);
    } catch (error: any) {
      if (error.status === 400) {
        alert('You are already on the waitlist.');
      }
    }
  }

  async getReviews() {
    const response = await axios.get(`${this.newApiUrl}/reviews`);
    return response.data;
  }
}
