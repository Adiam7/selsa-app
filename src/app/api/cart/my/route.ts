//file:- /app/api/cart/route.ts
// src/api/cart/my/route.ts (✅ FETCH AUTH USER CART)

// src/app/api/cart/my/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/cart/my/`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('🔴 error fetching authenticated cart:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const body = await request.json();

  // For example: Add item to cart
  return NextResponse.json({ message: 'Item added', item: body });
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