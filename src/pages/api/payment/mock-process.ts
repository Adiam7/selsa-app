/**
 * Mock Payment API for Development
 * 
 * This handler allows testing the full checkout flow without real card charges.
 * Use these test card numbers:
 * - Visa: 4242 4242 4242 4242
 * - Amex: 3782 822463 10005
 * - Decline: 4000 0000 0000 0002
 */

import { NextApiRequest, NextApiResponse } from 'next';

type PaymentRequest = {
  orderId: string;
  amount: number;
  currency: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVC: string;
};

type PaymentResponse = {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  amount?: number;
  message?: string;
  timestamp?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse>
) {
  // SECURITY: Block this endpoint entirely in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Not found',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  const {
    orderId,
    amount,
    currency = 'USD',
    cardNumber,
    cardName,
  }: PaymentRequest = req.body;

  // Validation
  if (!orderId || !amount || !cardNumber || !cardName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    });
  }

  // This endpoint only works in development (guarded above)
  // Simulate processing delay
  setTimeout(() => {
    const mockTransactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return res.status(200).json({
      success: true,
      transactionId: mockTransactionId,
      orderId,
      amount,
      message: `Mock payment of ${currency} ${amount} processed successfully`,
      timestamp: new Date().toISOString(),
    });
  }, 2000);
}
