/**
 * Senior-level Custom Authentication Hook
 * src/hooks/useAuth.ts
 */

'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { authService, type AuthResponse, type LoginCredentials } from '@/lib/services/authService';
import { logger } from '@/lib/logger/logger';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === 'authenticated';
  const isLoading_ = status === 'loading';

  const handleError = useCallback((err: string) => {
    setError(err);
    logger.error(err, 'useAuth');
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      const result = await authService.loginWithCredentials(credentials);
      
      if (!result.success) {
        handleError(result.message);
      }

      setIsLoading(false);
      return result;
    },
    [handleError]
  );

  const loginWithGoogle = useCallback(
    async (redirectUrl?: string): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      const result = await authService.loginWithGoogle(redirectUrl);
      
      if (!result.success) {
        handleError(result.message);
      }

      setIsLoading(false);
      return result;
    },
    [handleError]
  );

  const loginWithApple = useCallback(
    async (redirectUrl?: string): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      const result = await authService.loginWithApple(redirectUrl);
      
      if (!result.success) {
        handleError(result.message);
      }

      setIsLoading(false);
      return result;
    },
    [handleError]
  );

  const logout = useCallback(
    async (redirectUrl?: string): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);

      const result = await authService.logout(redirectUrl);
      
      if (!result.success) {
        handleError(result.message);
      }

      setIsLoading(false);
      return result;
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await update();
    } catch (err) {
      handleError('Failed to refresh session');
    }
  }, [update, handleError]);

  return {
    // Session state
    session,
    user: session?.user,
    userId: (session?.user as any)?.id,
    isAuthenticated,
    isLoading: isLoading_,

    // Auth methods
    login,
    loginWithGoogle,
    loginWithApple,
    logout,

    // Error handling
    error,
    clearError,

    // Utilities
    refreshSession,
  };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(requiredRoles: string[]) {
  const { user } = useAuth();
  const userRole = (user as any)?.role;

  return {
    hasRole: userRole ? requiredRoles.includes(userRole) : false,
    userRole,
  };
}

/**
 * Hook to check authentication on mount and handle redirects
 */
export function useRequireAuth(redirectPath?: string) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isReady, setIsReady] = useState(false);

  const handleUnauthenticated = useCallback(() => {
    if (typeof window !== 'undefined' && redirectPath) {
      window.location.href = redirectPath + `?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  }, [redirectPath]);

  return {
    isAuthenticated,
    isReady: isReady || status !== 'loading',
    isLoading: status === 'loading',
    handleUnauthenticated,
  };
}
