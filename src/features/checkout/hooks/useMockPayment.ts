/**
 * Mock Payment Hook
 * 
 * Provides a development-friendly payment processing function
 * that doesn't require real credit cards.
 */

import { useState, useCallback } from 'react';

interface PaymentData {
  orderId: string;
  amount: number;
  currency?: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVC: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

export function useMockPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(
    async (paymentData: PaymentData): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        console.log('💳 Processing payment...');
        console.log('📋 Payment data:', {
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          cardName: paymentData.cardName,
        });

        const response = await fetch('/api/payment/mock-process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: paymentData.orderId,
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            cardNumber: paymentData.cardNumber,
            cardName: paymentData.cardName,
            cardExpiry: paymentData.cardExpiry,
            cardCVC: paymentData.cardCVC,
            useMock: true,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Payment processing failed');
        }

        console.log('✅ Payment succeeded:', result);
        return {
          success: true,
          transactionId: result.transactionId,
          message: result.message,
        };
      } catch (err: any) {
        const errorMsg =
          err instanceof Error ? err.message : 'Unknown payment error';
        setError(errorMsg);
        console.error('❌ Payment error:', errorMsg);

        return {
          success: false,
          error: errorMsg,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    processPayment,
    loading,
    error,
  };
}
