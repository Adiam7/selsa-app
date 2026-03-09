// types/user.ts

export interface User {
  id: number;
  email: string;
  username: string;
  isEmailVerified: boolean;
}

export interface SessionUser extends User {
  accessToken?: string;
  exp?: number;
  iat?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}