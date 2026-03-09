/**
 * Get Favorites by Type API Route Handler
 * Fetches favorites filtered by content type
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, fetchBackend, handleBackendError } from '@/lib/middleware/authMiddleware';

/**
 * GET /api/favorites/by_type - Get favorites filtered by content type
 */
export async function GET(req: NextRequest) {
  try {
    // Validate authentication and get token
    const { accessToken, error } = await withAuth(req, true);
    if (error) return error;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const content_type = searchParams.get('content_type');

    if (!content_type) {
      return NextResponse.json(
        { error: 'Missing content_type parameter' },
        { status: 400 }
      );
    }

    // Fetch from backend
    const data = await fetchBackend(
      `/api/favorites/by_type/?content_type=${encodeURIComponent(content_type)}`,
      { method: 'GET' },
      accessToken
    );

    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}
