/**
 * API Route: Payment Status Checker
 * Checks the status of a Stripe PaymentIntent
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 501 }
      );
    }

    if (!id || !id.startsWith('pi_')) {
      return NextResponse.json(
        { error: 'Invalid payment intent ID' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    return NextResponse.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      last_payment_error: paymentIntent.last_payment_error ? {
        code: paymentIntent.last_payment_error.code,
        message: paymentIntent.last_payment_error.message,
      } : null,
    });
  } catch (error: any) {
    console.error('Payment status check failed:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Payment status check failed' },
      { status: 500 }
    );
  }
}