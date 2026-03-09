import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { authOptions } from "@/lib/auth";

function backendBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000"
  ).replace(/\/+$/, "");
}

function isAdminLike(user: any): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.is_staff || user.is_superuser || user.isAdmin || user.isStaff || user.isSuperuser) return true;
  return false;
}

async function fetchMyProfile(accessToken: string) {
  const url = `${backendBaseUrl()}/api/accounts/me/profile/`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    // Ensure we don't cache auth-gated HTML/layouts.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Profile check failed (${res.status})`);
  }

  return res.json().catch(() => null);
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const callbackUrl = "/admin/dashboard";

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = session.user as any;
  const accessToken = user?.accessToken as string | undefined;

  let hasAccess = isAdminLike(user);

  // Backend is the source of truth for admin/staff access.
  if (accessToken) {
    try {
      const profile = await fetchMyProfile(accessToken);
      if (isAdminLike(profile)) {
        hasAccess = true;
      }
    } catch {
      // If backend check fails, fall back to backend-derived session claims.
    }
  }

  if (!hasAccess) {
    return (
      <div className="admin-scope flex min-h-full w-full bg-background text-foreground">
        <main className="flex-1 flex items-start justify-center px-6 py-10">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-foreground">
            You do not have access to this area.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-scope flex min-h-full bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 px-8 py-8">
        <div className="w-full max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
