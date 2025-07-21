import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = environment.password_apiBaseUrl;

  constructor(private http: HttpClient) { }

  requestPasswordReset(email: string) 
  {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) 
  {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/reset-password/${token}`, { newPassword });
  }
}
