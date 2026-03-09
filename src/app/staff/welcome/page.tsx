import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function normalizeBackendBaseUrl(raw: string): string {
  let value = (raw || "").trim();
  if (!value) return "http://localhost:8000";
  value = value.replace(/\/+$/, "");
  if (value.endsWith("/api")) {
    value = value.slice(0, -4);
  }
  return value || "http://localhost:8000";
}

function backendBaseUrl(): string {
  return normalizeBackendBaseUrl(
    process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8000"
  );
}

function isStaffLike(user: any): boolean {
  if (!user) return false;
  if (user.is_superuser || user.isSuperuser) return true;
  if (user.is_staff || user.isStaff) return true;
  return false;
}

async function fetchMyProfile(accessToken: string) {
  const url = `${backendBaseUrl()}/api/accounts/me/profile/`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Profile check failed (${res.status})`);
  }

  return res.json().catch(() => null);
}

export default async function StaffWelcomePage() {
  const session = await getServerSession(authOptions);
  const callbackUrl = "/staff/welcome";

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = session.user as any;
  const accessToken = user?.accessToken as string | undefined;

  const staffName =
    (typeof user?.name === "string" && user.name.trim()) ||
    (typeof user?.username === "string" && user.username.trim()) ||
    (typeof user?.email === "string" && user.email.includes("@")
      ? user.email.split("@")[0]
      : "staff");

  let hasAccess = isStaffLike(user);

  if (accessToken) {
    try {
      const profile = await fetchMyProfile(accessToken);
      if (isStaffLike(profile)) {
        hasAccess = true;
      }
    } catch {
      // Fall back to session claims.
    }
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">You do not have access to this area.</CardTitle>
            <CardDescription>This page is for staff only.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl">Welcome, {staffName}</CardTitle>
            <Badge variant="secondary">Access active</Badge>
          </div>
          <CardDescription>
            We’re glad to have you on the team. Your staff account is ready—use the dashboard to manage orders,
            fulfillment, and day-to-day operations.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <div className="font-medium">Next steps</div>
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Open the dashboard to see what needs attention.</li>
                <li>Review recent orders and confirm fulfillment status.</li>
                <li>Check products and inventory before publishing changes.</li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <div className="font-medium">Signed in as</div>
              <div className="mt-1 text-sm text-muted-foreground break-all">
                {(session.user as any)?.email || (session.user as any)?.name || ""}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Button asChild>
            <Link href="/admin/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to store</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
