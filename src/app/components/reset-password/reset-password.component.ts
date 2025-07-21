import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset/password-reset.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;
  token: string;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordResetService: PasswordResetService) 
    {
    this.token = this.route.snapshot.params['token'];
    this.createForm();

    // Capture any query param message
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
      }
    });
  }

  createForm() {
  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  this.resetForm = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.pattern(strongPasswordPattern)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validator: this.passwordMatchValidator });
  }

  get password() {
    return this.resetForm.get('password');
  }

  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const confirmPass = g.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const newPassword = this.resetForm.value.password;

    this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { message: 'Password reset successfully' }
        });
      },
      error: (err) => {
        console.error('Reset error:', err);
        this.isLoading = false;

        this.errorMessage = err.error?.message || 'Password reset URL expired. Please try again.';
      }
    });
  }
}