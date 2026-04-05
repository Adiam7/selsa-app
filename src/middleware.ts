import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection middleware.
 * Redirects unauthenticated users away from protected routes.
 * Checks for the presence of a session token cookie set by next-auth.
 */

const protectedPrefixes = [
  '/checkout',
  '/orders',
  '/profile',
  '/admin',
  '/dashboard',
  '/staff',
  '/account',
];

const publicPrefixes = [
  '/checkout/auth',   // login during checkout is public
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
  '/icons',
  '/images',
  '/locales',
];

function isPublic(pathname: string): boolean {
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isProtected(pathname: string): boolean {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Only gate protected routes
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Check for next-auth session cookie
  const sessionToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and images.
     * This keeps the middleware lightweight — it only runs on page navigations.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
