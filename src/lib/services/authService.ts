/**
 * Senior-level Authentication Service
 * src/lib/services/authService.ts
 */

import { signIn, signOut, getSession } from 'next-auth/react';
import { logger } from '@/lib/logger/logger';
import { AppError, UnauthorizedError, ValidationError, parseError } from '@/lib/errors/AppError';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class AuthService {
  /**
   * Credentials-based login
   */
  async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate input
      this.validateCredentials(credentials);

      logger.logAuthEvent('login', undefined, { email: credentials.email });

      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (!result?.ok) {
        logger.warn('Login failed', 'AUTH', { error: result?.error });
        throw new UnauthorizedError(result?.error || 'Invalid credentials');
      }

      logger.logAuthEvent('login', undefined, { status: 'success' });
      return { success: true, message: 'Login successful' };
    } catch (error) {
      const appError = parseError(error);
      logger.error(`Login error: ${appError.message}`, 'AUTH', appError);
      return { success: false, message: appError.message, error: appError.code };
    }
  }

  /**
   * Google OAuth login
   */
  async loginWithGoogle(redirectUrl?: string): Promise<AuthResponse> {
    try {
      logger.logAuthEvent('login', undefined, { provider: 'google' });

      const result = await signIn('google', {
        redirect: true,
        callbackUrl: redirectUrl || '/',
      });

      return { success: true, message: 'Google login initiated' };
    } catch (error) {
      const appError = parseError(error);
      logger.error(`Google login error: ${appError.message}`, 'AUTH', appError);
      return { success: false, message: appError.message, error: appError.code };
    }
  }

  /**
   * Apple OAuth login
   */
  async loginWithApple(redirectUrl?: string): Promise<AuthResponse> {
    try {
      logger.logAuthEvent('login', undefined, { provider: 'apple' });

      const result = await signIn('apple', {
        redirect: true,
        callbackUrl: redirectUrl || '/',
      });

      return { success: true, message: 'Apple login initiated' };
    } catch (error) {
      const appError = parseError(error);
      logger.error(`Apple login error: ${appError.message}`, 'AUTH', appError);
      return { success: false, message: appError.message, error: appError.code };
    }
  }

  /**
   * Logout
   */
  async logout(redirectUrl?: string): Promise<AuthResponse> {
    try {
      const session = await getSession();
      const userId = (session?.user as any)?.id;

      logger.logAuthEvent('logout', userId);

      await signOut({
        redirect: true,
        callbackUrl: redirectUrl || '/auth/login',
      });

      return { success: true, message: 'Logout successful' };
    } catch (error) {
      const appError = parseError(error);
      logger.error(`Logout error: ${appError.message}`, 'AUTH', appError);
      return { success: false, message: appError.message, error: appError.code };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    try {
      const session = await getSession();
      return session;
    } catch (error) {
      logger.error('Failed to get session', 'AUTH', error);
      return null;
    }
  }

  /**
   * Validate credentials
   */
  private validateCredentials(credentials: LoginCredentials): void {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  }

  /**
   * Get user ID from session
   */
  async getUserId(): Promise<string | null> {
    try {
      const session = await getSession();
      return (session?.user as any)?.id || null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
