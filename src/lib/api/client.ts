/**
 * Senior-level API client with interceptors, error handling, and token management
 * src/lib/api/client.ts
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
// i18n may not be available in test/SSR environments — import defensively
let i18n: { language?: string } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  i18n = require('@/i18n').default;
} catch {
  // i18n unavailable — Accept-Language will default to 'en'
}

let volatileAccessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

function extractAccessToken(data: any): string | null {
  return (
    data?.accessToken ||
    data?.access_token ||
    data?.access ||
    data?.token ||
    null
  );
}

async function refreshAccessTokenFromApp(): Promise<string | null> {
  // Only available in the browser (needs same-origin cookies for NextAuth getToken())
  if (typeof window === 'undefined') return null;

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      const newAccess = extractAccessToken(data);
      if (!newAccess) return null;
      volatileAccessToken = newAccess;
      return newAccess;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function normalizeApiBaseUrl(raw: string): string {
  // Ensure we don't end up with '/api/api/...'
  let value = (raw || '').trim();
  if (!value) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return 'http://localhost:8000/api';
    }
    throw new Error('NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL must be set in production');
  }
  value = value.replace(/\/+$/, '');
  return value;
}

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
);

export { API_BASE_URL };

/**
 * Create authenticated API client instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Add auth token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Add i18n Accept-Language header
      const currentLanguage = i18n?.language || 'en';
      config.headers['Accept-Language'] = currentLanguage;

      const session = await getSession();

      // If this is a FormData request, don't force a Content-Type header.
      // Let the browser set `multipart/form-data; boundary=...`.
      if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        if (config.headers) {
          delete (config.headers as any)['Content-Type'];
          delete (config.headers as any)['content-type'];
        }
      }
      
      if (session && (session?.user as any)?.id) {
        // Add user context to request headers (now allowed by CORS)
        config.headers['X-User-Id'] = (session.user as any).id as string;
      }

      // Add Authorization Bearer token if available
      if (volatileAccessToken) {
        config.headers['Authorization'] = `Bearer ${volatileAccessToken}`;
      } else if (session?.user && (session.user as any)?.accessToken) {
        config.headers['Authorization'] = `Bearer ${(session.user as any).accessToken}`;
      }
    } catch (error) {
      // Silently handle session retrieval errors — auth is optional for public endpoints
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - likely expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 1) Try to refresh access token via the app's refresh route (browser-only)
        const refreshed = await refreshAccessTokenFromApp();
        if (refreshed) {
          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as any)['Authorization'] = `Bearer ${refreshed}`;
          return apiClient(originalRequest);
        }

        // 2) Fallback: attempt to refresh via NextAuth session fetch (may trigger jwt callback refresh)
        const session = await getSession();
        if (session) {
          return apiClient(originalRequest);
        }

        // 3) No session available, redirect to login
        await signOut({ redirect: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
        }
        return Promise.reject(error);
      } catch (refreshError) {
        await signOut({ redirect: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // Access forbidden — let callers handle via .catch()
    }

    // Handle network errors (no further logging needed)

    return Promise.reject(error);
  }
);

export default apiClient;
