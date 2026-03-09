import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000";

// POST /api/auth/change-password
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session?.user as any)?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));

    const oldPassword = body.oldPassword ?? body.old_password ?? body.currentPassword ?? body.current_password;
    const newPassword = body.newPassword ?? body.new_password;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Both old and new passwords are required." }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/accounts/auth/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}