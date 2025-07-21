import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { FooterComponent } from '../footer/footer.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent,FooterComponent, ReactiveFormsModule, CommonModule, RouterModule, MatInputModule, MatButtonModule, MatCardModule,MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  msg: string = '';                     //used for login & reset flow messages
  sessionMessage: string | null = null; //used for query-param based messages(i.e. session expired)

  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  showForgotPassword = false;
  resetEmailSent = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private passwordResetService: PasswordResetService
  ) {
    this.loginForm = this.fb.group({
      uname: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      resetEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.sessionMessage = params['message'];
      }
    });
  }

  loading = false;

  //LOGIN Handler
  login() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.msg = 'Please fix the form errors before submitting';
      return;
    }

     this.loading = true; // Start loading


    const user = {
      uname: this.loginForm.value.uname,
      password: this.loginForm.value.password
    };

    this.auth.login(user).subscribe({
      next: res => {
        // console.log('Login successful:', res.acesstoken);
        this.loading = false; // Stop loading on success
        this.msg = res.msg;
        
        this.auth.setMemoryToken(res.acesstoken); // Store token in memory
        this.auth.setUserName(JSON.stringify(res.user)); // Store username in memory
        // sessionStorage.setItem('token', res.token);
        // sessionStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/dashboard']);
        // console.log('Navigating to dashboard after login');
      },
      error: err => {
        this.loading = false; // Stop loading on success
        this.msg = err.error.msg || 'Login failed';
      }
    });
  }

  //FORGOT PASSWORD Handler
  requestPasswordReset() {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      this.msg = 'Please enter a valid email address';
      return;
    }

    const email = this.forgotPasswordForm.value.resetEmail;
    this.passwordResetService.requestPasswordReset(email).subscribe({
      next: () => {
        this.resetEmailSent = true;
        this.msg = 'Password reset email sent. Please check your inbox.';
      },
      error: err => {
        this.msg = err.error.msg || 'Failed to send reset email';
      }
    });
  }

  // HELPER METHOD : Mark all fields in a form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // HELPER METHOD : Error messages for UI
  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}