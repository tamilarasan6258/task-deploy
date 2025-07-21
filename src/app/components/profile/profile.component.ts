import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../header/header.component';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,HeaderComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})

export class ProfileComponent implements OnInit {
  user!: User;
  changePasswordForm: FormGroup;
  showChangePassword: boolean = false;
  hideCurrentPassword: boolean= true;
  hideNewPassword: boolean= true;
  hideConfirmPassword: boolean= true;
  usernameTaken: boolean= false;

  // Username editing properties
  editingUsername: boolean = false;
  editableUsername: string = '';
  usernameError: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = {
        id: currentUser.id,
        name: currentUser.name || 'User',
        email: currentUser.email || '',
        joinDate: new Date().toLocaleDateString() 
      };
    } else {
      this.router.navigate(['/']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
    if (!this.showChangePassword) {
      this.changePasswordForm.reset();
    }
  }

  onChangePassword(): void {
    if (this.changePasswordForm.valid) {
      const formData = this.changePasswordForm.value;
      
      // Clear any previous errors
      this.usernameError = '';
      
      // Use auth service method with proper headers
      this.authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      ).subscribe({
        next: (response) => {
          console.log('Password changed successfully:', response);
          this.showToast('Password changed successfully!', 'success');
          this.changePasswordForm.reset();
          this.showChangePassword = false;
        },
        error: (error) => {
          console.error('Error changing password:', error);
          
          let errorMessage = 'Failed to change password.';
          if (error.status === 400 && error.error?.msg) {
            errorMessage = error.error.msg;
          } 
          else if (error.status === 401) {
            errorMessage = 'Session expired. Please login again.';
          } 
          else if (error.status === 404) {
            errorMessage = 'User not found.';
          }
          
          this.showToast(errorMessage, 'error');
        }
      });
    } else {
      this.showToast('Please fill in all fields correctly.', 'error');
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    // this.router.navigate(['/']);
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`toast-${type}`]
    };

    this.snackBar.open(message, 'Close', config);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    if (field?.hasError('mismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  // Username editing methods
  startEditingUsername(): void {
    this.editingUsername = true;
    this.editableUsername = this.user.name;
    this.usernameError = '';
    this.usernameTaken = false;
  }

  onUsernameInput(): void {
    // Clear errors when user starts typing new username
    if (this.usernameTaken || this.usernameError) {
      this.usernameError = '';
      this.usernameTaken = false;
    }
  }

  cancelEditingUsername(): void {
    this.editingUsername = false;
    this.editableUsername = '';
    this.usernameError = '';
    this.usernameTaken = false;
  }

  saveUsername(): void {
    // Clear any previous errors and reset state
    this.usernameError = '';
    this.usernameTaken = false;
  
    if (!this.editableUsername || this.editableUsername.trim() === '') {
      this.usernameError = 'Username cannot be empty';
      this.usernameTaken = true;
      return;
    }

    if (this.editableUsername.trim() === this.user.name) {
      this.cancelEditingUsername();
      return;
    }
    
  this.authService.checkUsername({ uname: this.editableUsername.trim() }).subscribe({
    next: (response) => {
      this.proceedWithUsernameUpdate();
    },
    error: (error) => {
      console.error('Username check FAILED:', error);
      
      if (error.status === 409) {
        this.usernameError = error.error?.msg || 'Username already exists';
        this.usernameTaken = true;
      } 
      else if (error.status === 400) {
        this.usernameError = error.error?.msg || 'Invalid username';
        this.usernameTaken = true;
      } 
      else if (error.status === 500) {
        this.usernameError = 'Server error. Please try again.';
        this.usernameTaken = true;
      } 
      else {
        this.usernameError = 'An unexpected error occurred.';
        this.usernameTaken = true;
      }
          
      // Force Angular change detection
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 10);
    }
  });
}

  private proceedWithUsernameUpdate(): void {
    const newUsername = this.editableUsername.trim();
    
    console.log(`Proceeding with username update: "${newUsername}"`);

    this.authService.updateUsername(newUsername).subscribe({
      next: (response) => {
        this.user.name = newUsername;
        this.editingUsername = false;
        this.editableUsername = '';
        this.usernameError = '';
        this.usernameTaken = false;
        
        this.authService.updateUserData({ name: newUsername });
        
        console.log('Showing success message and updating UI');
        this.showToast('Username updated successfully!', 'success');
      },
      error: (error) => {
        console.error('Username update ERROR:', error);
        
        let errorMessage = 'Failed to update username';
        if (error.status === 409) {
          errorMessage = error.error?.msg || 'Username already exists';
          this.usernameError = errorMessage;
          this.usernameTaken = true;
        } 
        else if (error.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } 
        else if (error.status === 400) {
          errorMessage = error.error?.msg || 'Invalid username';
          this.usernameError = errorMessage;
          this.usernameTaken = true;
        } 
        else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.showToast(errorMessage, 'error');
      }
    });
  }
}