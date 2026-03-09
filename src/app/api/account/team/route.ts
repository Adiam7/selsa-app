import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

async function getAuthHeaders(session: any) {
  const token = (session?.user as any)?.accessToken as string | undefined;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET /api/account/team — list team members
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/accounts/team/`, {
      headers: await getAuthHeaders(session),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Backend endpoint not yet available — return empty list
    return NextResponse.json([]);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/account/team — invite a member
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${BACKEND_URL}/api/accounts/team/invite/`, {
      method: "POST",
      headers: await getAuthHeaders(session),
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: 201 });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      data.error ? data : { error: "Failed to invite member" },
      { status: res.status }
    );
  } catch {
    return NextResponse.json(
      { error: "Team invite endpoint is not yet available on the backend." },
      { status: 501 }
    );
  }
}

// DELETE /api/account/team — remove a member
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/accounts/team/${memberId}/`, {
      method: "DELETE",
      headers: await getAuthHeaders(session),
    });

    if (res.ok || res.status === 204) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Failed to remove member" }, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Team management endpoint is not yet available on the backend." },
      { status: 501 }
    );
  }
}

// PATCH /api/account/team — update member role
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${BACKEND_URL}/api/accounts/team/${body.memberId}/`, {
      method: "PATCH",
      headers: await getAuthHeaders(session),
      body: JSON.stringify({ role: body.role }),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Failed to update role" }, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Team management endpoint is not yet available on the backend." },
      { status: 501 }
    );
  }
}
