//--------------------REQUEST--------------------
export interface RegisterRequest {
  id?: string;
  uname: string;
  email: string;
  password: string;
  joinDate?: string;
}

export interface LoginRequest {
  uname: string;
  password: string;
}

export interface SendOTPRequest {
  email : string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface CheckUnameEmailRequest {
  uname: string;
  email: string;
}

export interface CheckUnameRequest {
  uname: string;
}

export interface UpdateUsernameRequest {
  newUsername: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

//--------------------RESPONSE--------------------

export interface RegisterResponse {
  msg: string;
}

export interface LoginResponse {
  msg: string;
  acesstoken: string;
  user: {
    uname: string;
    email: string;
    id: string;
  };
}

export interface OTPSendResponse {
  msg: string;
}

export interface OTPVerifyResponse {
  msg?: string;
}

export interface UnameCheckResponse {
  msg: string;
}

export interface UnameEmailCheckResponse {
  msg?: string;
}

export interface UpdateUsernameResponse {
  msg: string;
  newUsername: string;
  acesstoken?: string;
}

export interface ChangePasswordResponse {
  msg: string;
}