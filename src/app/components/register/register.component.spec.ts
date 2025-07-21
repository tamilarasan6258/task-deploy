import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';

const mockActivatedRoute = { snapshot: { queryParams: {} } };
const authSpy = jasmine.createSpyObj('AuthService', ['sendOtp', 'verifyOtp', 'registerUser']);
const routerMock = jasmine.createSpyObj('Router', ['navigate']);

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let cdr: ChangeDetectorRef;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register', 'sendOTP', 'checkUsernameEmail', 'verifyOTP']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
  imports: [RegisterComponent, FormsModule, RouterLink, RouterLinkActive],
  providers: [
    { provide: ActivatedRoute, useValue: mockActivatedRoute },
    { provide: AuthService, useValue: authSpy },
    { provide: Router, useValue: routerMock },
    ChangeDetectorRef
  ]
}).compileComponents();


    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    cdr = TestBed.inject(ChangeDetectorRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email correctly', () => {
    component.email = 'test@example.com';
    expect(component.validateEmail()).toBeTrue();
    component.email = 'invalid';
    expect(component.validateEmail()).toBeFalse();
  });

  it('should validate password correctly', () => {
    component.password = 'Aa1@aaaa';
    expect(component.validatePassword()).toBeTrue();

    component.password = 'aaa';
    expect(component.validatePassword()).toBeFalse();
  });

  it('should register user successfully', () => {
    const mockRes = { msg: 'Registered successfully' };
    authServiceSpy.register.and.returnValue(of(mockRes));

    component.uname = 'testuser';
    component.email = 'test@example.com';
    component.password = 'Aa1@aaaa';

    component.register();

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.msg).toBe(mockRes.msg);
  });

  it('should handle registration error', () => {
    authServiceSpy.register.and.returnValue(throwError({ error: { msg: 'Registration failed' } }));

    component.register();

    expect(component.msg).toBe('Registration failed');
  });

  it('should send OTP when username/email is valid', () => {
    const checkRes = { msg: 'OK' };
    const otpRes = { msg: 'OTP sent' };

    authServiceSpy.checkUsernameEmail.and.returnValue(of(checkRes));
    authServiceSpy.sendOTP.and.returnValue(of(otpRes));

    component.uname = 'validuser';
    component.email = 'valid@example.com';

    component.sendOTP();

    expect(authServiceSpy.checkUsernameEmail).toHaveBeenCalled();
    expect(authServiceSpy.sendOTP).toHaveBeenCalled();
    expect(component.otpMsg).toBe('OTP sent');
  });

  it('should show error if username/email exists', () => {
    const errResponse = { error: { msg: 'Username already exists' } };
    authServiceSpy.checkUsernameEmail.and.returnValue(throwError(errResponse));

    component.uname = 'duplicateuser';
    component.email = 'dup@example.com';

    component.sendOTP();

    expect(component.usernameError).toBe('Username already exists');
    expect(component.emailError).toBe('');
  });

  it('should verify OTP successfully', () => {
    authServiceSpy.verifyOTP.and.returnValue(of({ msg: 'OTP verified' }));

    component.email = 'test@example.com';
    component.otp = '123456';

    component.verifyOtp();

    expect(component.otpVerified).toBeTrue();
    expect(component.otpVerificationMessage).toBe('OTP verified successfully');
  });

  it('should fail OTP verification with attempts tracking', () => {
    const errResponse = { error: { msg: 'Invalid OTP' } };
    authServiceSpy.verifyOTP.and.returnValue(throwError(errResponse));

    component.email = 'test@example.com';
    component.otp = 'wrong';

    component.verifyOtp();

    expect(component.otpVerified).toBeFalse();
    expect(component.otpVerificationMessage).toContain('attempts remaining.');
    expect(component.otpAttempts).toBeGreaterThan(0);
  });

  it('should show lock message after too many OTP attempts', () => {
    const errResponse = { error: { msg: 'Invalid OTP' } };
    authServiceSpy.verifyOTP.and.returnValue(throwError(errResponse));

    component.otpAttempts = 4;
    component.verifyOtp();

    expect(component.otpVerificationMessage).toContain('Too many failed attempts');
  });

  it('should clear username error on input change', () => {
    component.usernameError = 'Error';
    component.onUsernameChange();
    expect(component.usernameError).toBe('');
  });

  it('should clear email error on input change', () => {
    component.emailError = 'Error';
    component.onEmailChange();
    expect(component.emailError).toBe('');
  });
});
