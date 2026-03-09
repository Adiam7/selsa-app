/**
 * Favorites Toggle API Route Handler
 * Professional-grade implementation with auth middleware and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, fetchBackend, handleBackendError } from '@/lib/middleware/authMiddleware';

/**
 * POST /api/favorites/toggle - Toggle favorite status for an item
 */
export async function POST(req: NextRequest) {
  try {
    // Validate authentication and get token
    const { accessToken, userId, error } = await withAuth(req, true);
    if (error) return error;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Fetch from backend
    const data = await fetchBackend(
      '/api/favorites/toggle/',
      { method: 'POST', body: JSON.stringify(body) },
      accessToken
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleBackendError(err);
  }
}
