/**
 * Professional-grade auth middleware for Next.js API routes
 * Handles token extraction, validation, and error handling
 * 
 * Usage:
 *   export async function GET(req: NextRequest) {
 *     const { session, accessToken, error } = await withAuth(req);
 *     if (error) return error;
 *     // Use session and accessToken
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Auth middleware result type
 */
export interface AuthResult {
  session: Awaited<ReturnType<typeof getServerSession>> | null;
  accessToken: string | null;
  userId: string | null;
  error: NextResponse | null;
}

/**
 * Extract token from NextAuth session cookie or session
 */
async function getTokenFromSession(req?: NextRequest): Promise<string | null> {
  try {
    // First try to get from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      const token = (session.user as any)?.accessToken;
      if (token) {
        console.log('[getTokenFromSession] Found token in session');
        return token;
      }
    }

    // If no session, try getting from cookies
    if (req) {
      const cookies = req.headers.get('cookie');
      if (cookies) {
        // Try to extract from NextAuth session token if present
        console.log('[getTokenFromSession] Checking cookies for session');
        // NextAuth stores the session in an encrypted cookie
        // We'll rely on getServerSession which handles this
      }
    }

    return null;
  } catch (err) {
    console.error('[getTokenFromSession] Error:', err);
    return null;
  }
}

/**
 * Middleware to validate authentication on API routes
 * Extracts and validates JWT token from NextAuth session
 * 
 * @param req - Next.js request object
 * @param requireAuth - Whether authentication is required (default: true)
 * @returns Object with session, accessToken, userId, and error
 */
export async function withAuth(
  req: NextRequest,
  requireAuth: boolean = true
): Promise<AuthResult> {
  try {
    // Get NextAuth session
    const session = await getServerSession(authOptions);

    console.log('[withAuth] Session exists:', !!session);
    console.log('[withAuth] Session data:', session ? { user: session.user?.email } : 'null');
    console.log('[withAuth] User exists:', !!session?.user);
    console.log('[withAuth] Session keys:', session?.user ? Object.keys(session.user) : []);

    // Check if authenticated
    if (!session?.user) {
      if (requireAuth) {
        console.warn('[withAuth] No session - returning 401');
        return {
          session: null,
          accessToken: null,
          userId: null,
          error: NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 }
          ),
        };
      }

      return {
        session: null,
        accessToken: null,
        userId: null,
        error: null,
      };
    }

    // Extract access token from session
    const accessToken = (session.user as any)?.accessToken;
    const userId = (session.user as any)?.id || session.user?.email;

    if (!accessToken && requireAuth) {
      
      return {
        session,
        accessToken: null,
        userId: null,
        error: NextResponse.json(
          { error: 'Unauthorized', message: 'No access token found in session' },
          { status: 401 }
        ),
      };
    }

    return {
      session,
      accessToken: accessToken || null,
      userId: userId || null,
      error: null,
    };
  } catch (err) {
    console.error('[withAuth] Unexpected error:', err);
    console.error('[withAuth] Error details:', err instanceof Error ? err.message : 'Unknown');
    return {
      session: null,
      accessToken: null,
      userId: null,
      error: NextResponse.json(
        { error: 'Internal Server Error', message: (err as Error)?.message },
        { status: 500 }
      ),
    };
  }
}

/**
 * Helper to make authenticated requests to backend
 * 
 * @param endpoint - Backend endpoint (without base URL)
 * @param options - Fetch options (method, body, etc.)
 * @param accessToken - JWT access token
 * @returns Parsed response
 */
export async function fetchBackend(
  endpoint: string,
  options: RequestInit = {},
  accessToken: string
) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:8000';
  const url = `${backendUrl}${endpoint}`;

  console.log('[fetchBackend] URL:', url);
  console.log('[fetchBackend] Method:', options.method || 'GET');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  console.log('[fetchBackend] Response status:', response.status);

  // Handle empty responses (204 No Content, 304 Not Modified, etc.)
  if (response.status === 204 || response.status === 304) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('[fetchBackend] Error response:', {
      status: response.status,
      data,
    });

    throw {
      status: response.status,
      data: data || { error: 'Backend error' },
    };
  }

  return data;
}

/**
 * Error handler for backend requests
 * Converts backend errors to proper NextResponse
 */
export function handleBackendError(err: any): NextResponse {
  console.error('[handleBackendError] Error:', err);

  if (err?.status) {
    return NextResponse.json(
      {
        error: 'Backend Error',
        message: err.data?.error || err.data?.message || 'Request failed',
        ...err.data,
      },
      { status: err.status }
    );
  }

  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: err instanceof Error ? err.message : 'Unknown error',
    },
    { status: 500 }
  );
}
