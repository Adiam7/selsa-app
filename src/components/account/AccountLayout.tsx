"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { useToast } from "@/components/Toast";
import { type UserRole, type UserPlan } from "@/lib/config/accountSidebar";

interface AccountLayoutProps {
  children: React.ReactNode;
}

/**
 * Determine user role from session
 * In production, get this from your backend
 */
function getUserRole(session: any): UserRole {
  // Only trust backend-derived flags/claims; never infer from email.
  const user = session?.user as any;
  if (!user) return "member";

  if (user.role === "admin") {
    return "admin";
  }

  if (user.is_staff || user.is_superuser || user.isAdmin) {
    return "admin";
  }
  return "member";
}

/**
 * Determine user plan from session
 * In production, get this from your backend/database
 */
function getUserPlan(session: any): UserPlan {
  // Check user subscription plan (customize based on your backend)
  if (session?.user?.plan === "enterprise") {
    return "enterprise";
  }
  if (session?.user?.plan === "pro") {
    return "pro";
  }
  return "free";
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { info, error } = useToast();
  const [userRole, setUserRole] = useState<UserRole>("member");
  const [userPlan, setUserPlan] = useState<UserPlan>("free");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account/profile");
    }
  }, [status, router]);

  // Update role and plan from session
  useEffect(() => {
    if (session?.user) {
      setUserRole(getUserRole(session));
      setUserPlan(getUserPlan(session));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: '2rem' }}>
      {/* Sidebar */}
      <div style={{ width: '288px', flexShrink: 0 }}>
        <AccountSidebar
          userRole={userRole}
          userPlan={userPlan}
          userName={session?.user?.name || "User"}
          userEmail={session?.user?.email || ""}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, paddingRight: '2rem' }}>
        {children}
      </div>
    </div>
  );
}
