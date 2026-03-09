/**
 * API Route: Cart Inventory Validation
 * Validates stock availability for cart items
 */

import { NextRequest, NextResponse } from 'next/server';

interface CartItem {
  id: number;
  variant_id: number;
  quantity: number;
  product_price: number;
  product_name: string;
}

interface ValidationRequest {
  items: CartItem[];
}

export async function POST(request: NextRequest) {
  try {
    const { items }: ValidationRequest = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    // Forward to Django backend for validation
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/cart/validate-inventory/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if available
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
      body: JSON.stringify({ items }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Inventory validation failed' },
        { status: response.status }
      );
    }

    // Return the validation result
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Inventory validation error:', error);
    
    // Return safe default on error
    return NextResponse.json({
      valid: true,
      outOfStock: [],
      insufficientStock: [],
      priceChanges: [],
      error: 'Validation service temporarily unavailable'
    });
  }
}