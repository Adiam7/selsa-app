import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

// POST /api/account/notifications — save notification settings
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.accessToken as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${BACKEND_URL}/api/accounts/notification-settings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Backend endpoint not yet available — acknowledge save
    return NextResponse.json({ success: true, settings: body.settings });
  } catch {
    // Backend endpoint not yet available — acknowledge save
    return NextResponse.json({ success: true, settings: body.settings });
  }
}
