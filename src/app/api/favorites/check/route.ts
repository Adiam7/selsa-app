/**
 * Check Favorite Status API Route Handler
 * Checks if a specific item is favorited
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, fetchBackend, handleBackendError } from '@/lib/middleware/authMiddleware';

/**
 * POST /api/favorites/check - Check if item is favorited
 */
export async function POST(req: NextRequest) {
  try {
    // Auth optional for this endpoint - not authenticated users see false
    const { accessToken, error } = await withAuth(req, false);

    const body = await req.json();
    const { content_type, object_id } = body;

    if (!accessToken) {
      // Not authenticated - return false
      return NextResponse.json(
        {
          is_favorited: false,
          content_type,
          object_id,
        },
        { status: 200 }
      );
    }

    // Fetch from backend
    const data = await fetchBackend(
      `/api/favorites/check/?content_type=${encodeURIComponent(content_type)}&object_id=${encodeURIComponent(object_id)}`,
      { method: 'GET' },
      accessToken
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error('[favorites/check] Error:', err);
    // Return not favorited on error
    return NextResponse.json(
      { is_favorited: false },
      { status: 200 }
    );
  }
}

/**
 * GET /api/favorites/check - Check if item is favorited (query params)
 */
export async function GET(req: NextRequest) {
  try {
    // Auth optional for this endpoint
    const { accessToken } = await withAuth(req, false);

    const { searchParams } = new URL(req.url);
    const content_type = searchParams.get('content_type');
    const object_id = searchParams.get('object_id');

    if (!content_type || !object_id) {
      return NextResponse.json(
        { error: 'Missing content_type or object_id' },
        { status: 400 }
      );
    }

    if (!accessToken) {
      // Not authenticated - return false
      return NextResponse.json(
        {
          is_favorited: false,
          content_type,
          object_id,
        },
        { status: 200 }
      );
    }

    // Fetch from backend
    const data = await fetchBackend(
      `/api/favorites/check/?content_type=${encodeURIComponent(content_type)}&object_id=${encodeURIComponent(object_id)}`,
      { method: 'GET' },
      accessToken
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error('[favorites/check] Error:', err);
    // Return not favorited on error
    return NextResponse.json(
      { is_favorited: false },
      { status: 200 }
    );
  }
}
