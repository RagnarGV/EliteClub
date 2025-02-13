import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios from 'axios';

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

  constructor(private http: HttpClient) {}

  getSchedule(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl + '/schedule');
  }

  getWaitlist(): Observable<Waitlist[]> {
    return this.http.get<Waitlist[]>(this.apiUrl + '/Waitlist');
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
      await axios.post(`${this.apiUrl}/waitlist`, userData);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }
}
