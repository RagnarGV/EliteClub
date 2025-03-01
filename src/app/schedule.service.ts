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
  private apiUrl = 'https://eliteclub-api.onrender.com/api';
  //private apiUrl = 'http://localhost:3000/api';
  constructor() {}

  async getSchedule() {
    const response = await axios.get(this.apiUrl + '/schedule');
    return response.data;
  }

  async getWaitlist() {
    const response = await axios.get(this.apiUrl + '/waitlist');
    return response.data;
  }

  async getGalleryItems() {
    const response = await axios.get(this.apiUrl + '/gallery');
    return response.data;
  }

  async checkVerification(phoneNumber: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/verify/${phoneNumber}`);
      console.log(response);
      return response.data.user;
    } catch (error) {
      console.error('Error checking verification:', error);
      throw error;
    }
  }

  async triggerVerification(phoneNumber: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/verify`, { phoneNumber });
    } catch (error) {
      console.error('Error triggering verification:', error);
      throw error;
    }
  }

  async saveUser(userData: any): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/users`, userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async addToWaitlist(userData: any): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/waitlist`, userData);
    } catch (error: any) {
      if (error.status === 400) {
        alert('Phone number already exists');
      }
    }
  }

  async getReviews() {
    const response = await axios.get(`${this.apiUrl}/reviews`);
    return response.data;
  }
}
