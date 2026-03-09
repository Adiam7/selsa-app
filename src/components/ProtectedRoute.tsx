/**
 * Senior-level Protected Route Component
 * src/components/ProtectedRoute.tsx
 * 
 * Usage:
 * <ProtectedRoute fallback={<LoginPage />}>
 *   <Dashboard />
 * </ProtectedRoute>
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string[];
  onUnauthorized?: () => void;
}

export function ProtectedRoute({
  children,
  fallback,
  requiredRole,
  onUnauthorized,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      onUnauthorized?.();
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Check role-based access if required
    if (requiredRole && session?.user) {
      const userRole = (session.user as any)?.role;
      if (userRole && !requiredRole.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
    }

    setIsAuthorized(true);
  }, [status, session, requiredRole, router, onUnauthorized]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  if (!isAuthorized) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
