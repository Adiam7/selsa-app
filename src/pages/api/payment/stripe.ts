/**
 * Stripe Payment Processing API
 * POST /api/payment/stripe
 * 
 * Processes Stripe payments and creates payment intents
 */

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface StripePaymentRequest {
  orderId: string;
  amount: number; // in cents
  paymentMethodId: string;
  cardholderName: string;
}

interface StripePaymentResponse {
  success?: boolean;
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StripePaymentResponse>
) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, amount, paymentMethodId, cardholderName }: StripePaymentRequest = req.body;

    // Validation
    if (!orderId || !amount || !paymentMethodId || !cardholderName) {
      return res.status(400).json({
        error: 'Missing required fields: orderId, amount, paymentMethodId, cardholderName',
      });
    }

    if (amount < 50) {
      // Stripe minimum is $0.50
      return res.status(400).json({
        error: 'Amount must be at least $0.50',
      });
    }

    console.log('💳 Creating Stripe payment intent...');
    console.log('📋 Details:', { orderId, amount: amount / 100, paymentMethodId, cardholderName });

    // Derive absolute base URL for potential redirect/return_url (3DS flows)
    const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const forwardedProto = (req.headers['x-forwarded-proto'] as string) || undefined;
    const forwardedHost = (req.headers['x-forwarded-host'] as string) || undefined;
    const host = (req.headers['host'] as string) || undefined;
    const baseFromHeaders = forwardedHost || host ? `${forwardedProto || 'http'}://${forwardedHost || host}` : undefined;
    const baseUrl = envSiteUrl || baseFromHeaders || 'http://localhost:3000';

    // Ensure baseUrl is absolute with scheme; if not, omit return_url
    const isAbsolute = /^https?:\/\//i.test(baseUrl);
    const returnUrl = isAbsolute ? `${baseUrl}/orders/${orderId}` : undefined;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Order ${orderId} - ${cardholderName}`,
      metadata: {
        orderId,
        cardholderName,
      },
      // Only pass return_url if absolute; otherwise Stripe will throw an error.
      ...(returnUrl ? { return_url: returnUrl } : {}),
    });

    console.log('✅ Payment intent created:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    });

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment succeeded!');
      return res.status(200).json({
        success: true,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status,
        message: 'Payment processed successfully',
      });
    }

    // Payment requires further action
    if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
      console.log('⚠️ Payment requires further action:', paymentIntent.status);
      return res.status(200).json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        message: 'Payment requires authentication. Please complete the 3D Secure challenge.',
      });
    }

    // Unexpected status
    console.warn('⚠️ Unexpected payment status:', paymentIntent.status);
    return res.status(200).json({
      success: false,
      error: `Payment failed with status: ${paymentIntent.status}`,
    });
  } catch (error: any) {
    console.error('❌ Stripe payment error:', error.message);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: error.message,
      });
    }

    if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
    }

    if (error.type === 'StripeAPIError') {
      return res.status(500).json({
        error: 'Stripe API error. Please contact support.',
      });
    }

    // Generic error
    return res.status(500).json({
      error: error.message || 'Payment processing failed',
    });
  }
}
