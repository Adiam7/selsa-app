// src/pages/api/payment/confirm-stripe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';

interface ConfirmPaymentRequest {
  paymentMethodId: string;
  orderId: number;
  amount: number;
}

interface ConfirmPaymentResponse {
  status: string;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConfirmPaymentResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  try {
    // Verify session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ status: 'error', error: 'Unauthorized' });
    }

    const { paymentMethodId, orderId, amount } = req.body as ConfirmPaymentRequest;

    if (!paymentMethodId || !orderId || !amount) {
      return res.status(400).json({
        status: 'error',
        error: 'Missing required fields',
      });
    }

    // Forward to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const accessToken = (session.user as any)?.accessToken || (session as any)?.accessToken || '';
    
    const response = await fetch(
      `${backendUrl}/api/payments/stripe/confirm-payment/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          order_id: orderId,
          amount,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'error',
        error: data.error || 'Payment confirmation failed',
      });
    }

    return res.status(200).json({
      status: 'succeeded',
      paymentIntentId: data.payment_intent_id,
      clientSecret: data.client_secret,
    });
  } catch (error: any) {
    console.error('❌ Payment confirmation error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    });
  }
}
