import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpBackend } from '@angular/common/http';

import {
  RegisterRequest, LoginRequest, SendOTPRequest, VerifyOTPRequest, CheckUnameEmailRequest, CheckUnameRequest, UpdateUsernameRequest, ChangePasswordRequest,
  RegisterResponse, LoginResponse, OTPSendResponse, OTPVerifyResponse, UnameEmailCheckResponse, UnameCheckResponse, UpdateUsernameResponse, ChangePasswordResponse
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = environment.auth_apiBaseUrl;
  private tokenTimer?: Subscription;
  private memorytoken: string | null = null; // to store token in memory
  private username: string | null = null; // to store username in memory
  private rawHttp: HttpClient;

  // constructor(private http: HttpClient, private router: Router) {
  //   // this.initTokenWatcher();                    //sets up a token watcher if user is already logged in
  //   this.tryRestoreSession();
  // }
  constructor(private http: HttpClient, private router: Router, handler: HttpBackend) {
    this.rawHttp = new HttpClient(handler); // ❌ Bypasses interceptors
    // this.tryRestoreSession();
  }


  restoreSession(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.memorytoken) {
        this.refreshAccessToken().subscribe({
          next: (res) => {
            this.setMemoryToken(res.accessToken);
            // this.setUserName(JSON.stringify(res.user)); // Store username in memory
            // // observer.next(res);
            // // observer.complete();
            this.initTokenWatcher();
            resolve();
          },
          error: () => {
            resolve();
          }
        });
      } else {
        this.initTokenWatcher();
        resolve();
      }
    });
  }


  // public tryRestoreSession(): void {

  //   if (!this.memorytoken) {
  //     this.refreshAccessToken().subscribe({
  //       next: (res) => {
  //         this.setMemoryToken(res.accessToken);
  //         this.initTokenWatcher();
  //         console.log('Session restored via refresh token');
  //       },
  //       error: (err) => {
  //         console.log('No valid refresh token in cookie');
  //         // this.logout();
  //       }
  //     });
  //   } else {
  //     this.initTokenWatcher();
  //   }
  // }

  setMemoryToken(token: string | null): void {
    this.memorytoken = token;
  }

  getMemoryToken(): string | null {
    return this.memorytoken;
  }

  setUserName(name: string | null): void {
    this.username = name;
  }
  getUserName(): string | null {
    return this.username;
  }

  refreshAccessToken(): Observable<{
    accessToken: string,
    user: {
      uname: string;
      email: string;
      id: string;
    }
  }> {
    return this.http.get<{
      accessToken: string,
      user: {
        uname: string;
        email: string;
        id: string;
      }
    }>(`${this.apiUrl}/refresh-token`, {
      withCredentials: true
    });
  }

  private getTokenExpiration(): number | null {
    // const token = sessionStorage.getItem('token');
    const token = this.getMemoryToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp;
    }
    catch {
      return null;
    }
  }

  // private startTokenWatcher() {
  //   const exp = this.getTokenExpiration();
  //   if (!exp) return;

  //   const expiresIn = exp * 1000 - Date.now();
  //   if (expiresIn > 0) {
  //     this.tokenTimer = timer(expiresIn).subscribe(() => this.logout());
  //   } else {
  //     this.logout();
  //   }
  // }

  private startTokenWatcher() {
    const exp = this.getTokenExpiration();
    if (!exp) return;

    const expiresIn = exp * 1000 - Date.now();

    if (expiresIn > 0) {
      this.tokenTimer = timer(expiresIn - 5000).subscribe(() => {
        this.refreshAccessToken().subscribe({
          next: res => {
            this.updateStoredToken(res.accessToken);
            this.setUserName(JSON.stringify(res.user)); // Store username in memory
            // console.log(res.user);
            console.log('Access token refreshed');
          },
          error: err => {
            console.error('Failed to refresh access token:', err);
            this.logout();
          }
        });
      });
    } else {
      this.logout();
    }
  }


  private stopTokenWatcher() {
    this.tokenTimer?.unsubscribe();
  }

  private initTokenWatcher() {
    if (this.isAuthenticated()) {
      this.startTokenWatcher();
    }
  }

  private updateStoredToken(newToken: string): void {
    this.setMemoryToken(newToken); // Update memory token
    // sessionStorage.setItem('token', newToken);
    this.stopTokenWatcher();
    this.startTokenWatcher();
  }



  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData);
  }

  login(userData: LoginRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.apiUrl}/login`, userData, { withCredentials: true }).subscribe({
        next: res => {
          this.setMemoryToken(res.acesstoken); // Store token in memory
          // sessionStorage.setItem('token', res.token);
          // sessionStorage.setItem('user', JSON.stringify(res.user));
          this.setUserName(JSON.stringify(res.user)); // Store username in memory
          this.startTokenWatcher();             //starts token auto-expiry watcher
          observer.next(res);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  sendOTP(otpData: SendOTPRequest): Observable<OTPSendResponse> {
    return this.http.post<OTPSendResponse>(`${this.apiUrl}/send-otp`, otpData);
  }

  verifyOTP(otpData: VerifyOTPRequest): Observable<OTPVerifyResponse> {
    return this.http.post<OTPVerifyResponse>(`${this.apiUrl}/verify-otp`, otpData);
  }

  checkUsernameEmail(userData: CheckUnameEmailRequest): Observable<UnameEmailCheckResponse> {
    return this.http.post<UnameEmailCheckResponse>(`${this.apiUrl}/check-username-email`, userData);
  }

  checkUsername(userData: CheckUnameRequest): Observable<UnameCheckResponse> {
    // const token = sessionStorage.getItem('token');
    const token = this.getMemoryToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('Making POST request to:', `${this.apiUrl}/check-username`);
    console.log('Request payload:', userData);
    console.log('Request headers:', headers);

    return new Observable(observer => {
      this.http.post<UnameCheckResponse>(`${this.apiUrl}/check-username`, userData, { headers }).subscribe({
        next: response => {
          console.log('checkUsername SUCCESS:', response);
          observer.next(response);
          observer.complete();
        },
        error: error => {
          console.error('checkUsername ERROR:', error);
          observer.error(error);
        }
      });
    });
  }

  updateUsername(newUsername: string): Observable<UpdateUsernameResponse> {
    // const token = sessionStorage.getItem('token');
    const token = this.getMemoryToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const payload: UpdateUsernameRequest = { newUsername };

    return new Observable(observer => {
      this.http.put<UpdateUsernameResponse>(
        `${this.apiUrl}/update-username`, payload, { headers }).subscribe({
          next: res => {
            if (res.acesstoken) {
              this.updateStoredToken(res.acesstoken);
            }
            observer.next(res);
            observer.complete();
          },
          error: err => observer.error(err)
        });
    });
  }

  updateUserData(updates: Partial<{ name: string; email: string }>): void {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const currentUser = JSON.parse(userStr);
        const updatedUser = { ...currentUser, ...updates };
        // sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.setUserName(JSON.stringify(updatedUser)); // Update username in memory
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ChangePasswordResponse> {
    // const token = sessionStorage.getItem('token');
    const token = this.getMemoryToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const payload: ChangePasswordRequest = { currentPassword, newPassword };

    return this.http.put<ChangePasswordResponse>(
      `${this.apiUrl}/change-password`, payload, { headers });
  }


  // logout(): void {
  //   // sessionStorage.setItem('sessionExpired', 'true');   //marks session as expired
  //   // sessionStorage.clear();                             //clears session storage
  //   // Clear access token from memory
  //   this.memorytoken = null;

  //   // Optionally also clear username or other info
  //   this.username = null;

  //   this.stopTokenWatcher();                            //stops token watcher
  //   this.router.navigate(['/login'], {                  //navigate to login
  //     queryParams: { message: 'Your session has expired. Please login again.' }
  //   });
  // }

  //   logout(): void {
  //   // Clear token in memory
  //   this.memorytoken = null;
  //   this.username = null;

  //   console.log('front end memory token cleared',this.memorytoken);
  //   console.log('front end username cleared',this.username);

  //   // Stop token watcher
  //   this.stopTokenWatcher();

  //   // Call backend to clear refresh token cookie
  //   this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
  //     next: () => {
  //       console.log('Refresh token cookie cleared');
  //       // Navigate to login
  //   this.router.navigate(['/login'], {
  //     queryParams: { message: 'You have been logged out.' }
  //   });
  //     },
  //     error: err => {
  //       console.error('Error clearing refresh token:', err);
  //       // Navigate to login
  //   this.router.navigate(['/login'], {
  //     queryParams: { message: 'You have been logged out.' }
  //   });
  //     }
  //   });

  //   console.log('api finished');
  //   // Navigate to login
  //   this.router.navigate(['/login'], {
  //     queryParams: { message: 'You have been logged out.' }
  //   });
  // }

  logout(): void {
    this.memorytoken = null;
    this.username = null;
    this.stopTokenWatcher();

    console.log('front end memory token cleared', this.memorytoken);
    console.log('front end username cleared', this.username);

    // ✅ Bypass interceptor here
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('✅ Refresh token cookie cleared');
        this.router.navigate(['/login'], {
          queryParams: { message: 'You have been logged out.' }
        });
      },
      error: err => {
        console.error('❌ Error clearing refresh token:', err);
        this.router.navigate(['/login'], {
          queryParams: { message: 'You have been logged out (cookie might not be cleared).' }
        });
      }
    });
  }




  isAuthenticated(): boolean {
    // const token = sessionStorage.getItem('token');
    const token = this.getMemoryToken();

    if (!token) return false;                           //checks if the token is valid(if token-valid, not expired, exists)

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));      //decoding/extracting the payload part of the JWT token(JWT token format : header.payload.signature)->to extract payload use[1]
      return payload.exp > Date.now() / 1000;                     //payload.exp-expiration time of token in seconds, Date.now()-current time
      //if the exp time is in the future the token is still valid and return true
    } catch {
      return false;
    }
  }

  getCurrentUser(): { id: string; name: string; email: string } | null {
    // const token = sessionStorage.getItem('token');
    const token = this.getMemoryToken();

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.id,
        email: payload.email,
        name: payload.uname || payload.username || payload.name || 'User'
      };
    } catch {
      return null;
    }
  }
}