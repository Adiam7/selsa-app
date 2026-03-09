// src/app/api/cart/guest-create/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
 

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/cart/guest-create/`, {
      method: 'POST',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('❌ Failed to create guest cart from backend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
