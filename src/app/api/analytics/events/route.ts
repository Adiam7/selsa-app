/**
 * Analytics Events API Route Handler
 * Receives buffered user-journey events from the client-side AnalyticsService.
 *
 * Currently logs events server-side. When a dedicated analytics backend
 * (e.g. PostHog, Mixpanel, or a Django endpoint) is available, forward the
 * payload here instead of (or in addition to) logging.
 */

import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  eventId: string;
  eventName: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  category: 'navigation' | 'interaction' | 'conversion' | 'error';
  properties?: Record<string, unknown>;
  pageUrl?: string;
  referrer?: string;
}

interface AnalyticsPayload {
  events: AnalyticsEvent[];
}

/**
 * POST /api/analytics/events
 * Accepts a batch of analytics events from the client.
 */
export async function POST(req: NextRequest) {
  try {
    const body: AnalyticsPayload = await req.json();

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid payload: expected { events: [...] }' },
        { status: 400 },
      );
    }

    // Log in development for debugging; in production this would forward
    // to an external analytics service or a backend ingestion endpoint.
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Analytics] Received ${body.events.length} event(s):`,
        body.events.map((e) => e.eventName),
      );
    }

    // TODO: forward to external analytics provider or Django backend
    // e.g. await fetch(ANALYTICS_BACKEND_URL, { method: 'POST', body: JSON.stringify(body) });

    return NextResponse.json(
      { ok: true, received: body.events.length },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Analytics] Failed to process events:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics events' },
      { status: 500 },
    );
  }
}
