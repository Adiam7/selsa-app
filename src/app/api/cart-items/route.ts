//file:- /app/api/cart-items/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Do your logic here (e.g., add item to cart in DB)
  console.log("Received payload:", body);

  // For now just mock a success
  return NextResponse.json({ message: 'Item added to cart' });
}


export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const res = await fetch(`${base}/cart/cart-items/`, {
    credentials: 'include', // 🧠 this is key!
    headers: {
      'Content-Type': 'application/json',
      // Optionally forward cookies/auth headers here
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
