/**
 * Favorites API Route Handler
 * Professional-grade implementation with auth middleware and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, fetchBackend, handleBackendError } from '@/lib/middleware/authMiddleware';

/**
 * GET /api/favorites - Fetch user's favorites
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

    // Fetch from backend
    const data = await fetchBackend('/api/favorites/', { method: 'GET' }, accessToken);

    return NextResponse.json(data);
  } catch (err) {
    return handleBackendError(err);
  }
}

/**
 * POST /api/favorites - Create/add a favorite
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    // Fetch from backend
    const data = await fetchBackend(
      '/api/favorites/',
      { method: 'POST', body: JSON.stringify(body) },
      accessToken
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleBackendError(err);
  }
}

/**
 * DELETE /api/favorites - Remove a favorite
 */
export async function DELETE(req: NextRequest) {
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

    const body = await req.json();
    const { content_type, object_id } = body;

    // Fetch from backend
    const data = await fetchBackend(
      `/api/favorites/remove/?content_type=${encodeURIComponent(content_type)}&object_id=${encodeURIComponent(object_id)}`,
      { method: 'DELETE' },
      accessToken
    );

    return NextResponse.json(data || {}, { status: 204 });
  } catch (err) {
    return handleBackendError(err);
  }
}
