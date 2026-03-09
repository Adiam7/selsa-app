import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8000";

const RegisterSchema = z
  .object({
    email: z.string().email(),
    username: z.string().trim().min(1).max(150),
    password: z.string().min(8),
    confirm_password: z.string().min(8).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.confirm_password !== undefined && val.password !== val.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm_password"],
        message: "Passwords do not match.",
      });
    }
  });

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const parsed = RegisterSchema.parse(body);

    const res = await fetch(`${BACKEND_URL}/api/accounts/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: parsed.email,
        username: parsed.username,
        password: parsed.password,
        confirm_password: parsed.confirm_password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    const message = err?.errors?.[0]?.message || err?.message || "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
