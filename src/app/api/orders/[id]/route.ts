import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * GET /api/orders/:id
 * Proxies the request to the Django OrderViewSet retrieve endpoint.
 * Forwards the Authorization header when present so auth'd users
 * can access their orders.  Guest orders are accessible by ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward auth header if present (so auth'd users' ownership check works)
  const auth = req.headers.get('authorization');
  if (auth) {
    headers['Authorization'] = auth;
  }

  // Also forward cookies (session-based auth / CSRF)
  const cookie = req.headers.get('cookie');
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/orders/orders/${id}/`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error proxying order detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
