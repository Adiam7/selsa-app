// src/app/api/cart/guest/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cartId = req.nextUrl.searchParams.get('cart_id');

  if (!cartId) {
    return NextResponse.json({ error: 'Missing cart_id' }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/cart/guest/?cart_id=${cartId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('❌ Failed to fetch guest cart from backend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
