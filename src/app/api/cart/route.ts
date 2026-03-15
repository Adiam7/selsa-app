// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// src/api/cart/route.ts (✅ FETCH GUEST CART)
export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url);
  const cartId = searchParams.get('cart_id');

  if (!cartId) {
    return NextResponse.json({ error: 'Missing cart_id' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/cart/guest/?cart_id=${cartId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('🔴 guest cart fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🟢 POST /api/cart body:", body);

    // Example: send to backend
    const res = await fetch(`${BACKEND_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('🔴 POST /api/cart error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



export async function DELETE(request: Request) {
  const body = await request.json();

  // For example: Remove item from cart
  return NextResponse.json({ message: 'Item removed', itemId: body.id });
}
export async function PUT(request: Request) {
  const body = await request.json();

  // For example: Update item quantity in cart
  return NextResponse.json({ message: 'Item updated', item: body });
}
// export async function PATCH(request: Request) {
//   const body = await request.json();
//