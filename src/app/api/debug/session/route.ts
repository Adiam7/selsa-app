/**
 * Debug endpoint to check NextAuth session state
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('[DEBUG] Session route called');
    
    // Get NextAuth session
    const session = await getServerSession(authOptions);
    
    console.log('[DEBUG] Session exists:', !!session);
    console.log('[DEBUG] Session:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    return NextResponse.json({
      session: JSON.stringify(session, null, 2),
      userKeys: Object.keys(session.user || {}),
      hasAccessToken: !!(session.user as any)?.accessToken,
      accessTokenPreview: (session.user as any)?.accessToken ? (session.user as any).accessToken.substring(0, 30) + '...' : 'none',
    });
  } catch (err) {
    console.error('[DEBUG] Error:', err);
    return NextResponse.json({ 
      error: (err as Error)?.message,
      fullError: JSON.stringify(err, null, 2)
    }, { status: 500 });
  }
}
