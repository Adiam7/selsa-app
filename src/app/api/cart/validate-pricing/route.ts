/**
 * API Route: Cart Pricing Validation
 * Validates current pricing for cart items
 */

import { NextRequest, NextResponse } from 'next/server';

interface CartItem {
  id: number;
  variant_id: number;
  quantity: number;
  product_price: number;
  product_name: string;
}

interface PricingValidationRequest {
  items: CartItem[];
}

export async function POST(request: NextRequest) {
  try {
    const { items }: PricingValidationRequest = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    // Forward to Django backend for pricing validation
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/cart/validate-pricing/`, {
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
        { error: data.error || 'Pricing validation failed' },
        { status: response.status }
      );
    }

    // Return the validation result
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Pricing validation error:', error);
    
    // Return safe default on error
    return NextResponse.json({
      valid: true,
      changes: [],
      error: 'Pricing validation service temporarily unavailable'
    });
  }
}