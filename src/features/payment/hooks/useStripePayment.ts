// src/features/payment/hooks/useStripePayment.ts
'use client';

import { useState, useCallback } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '@/lib/api/payment/createPaymentIntent';

interface UseStripePaymentProps {
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

interface PaymentOptions {
  amount: number;
  currency?: string;
  orderId: number;
  cartId: number;
  email: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingMethod: string;
}

export const useStripePayment = ({ onSuccess, onError }: UseStripePaymentProps = {}) => {
  const stripe = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(
    async (options: PaymentOptions) => {
      if (!stripe) {
        const err = 'Stripe not initialized';
        setError(err);
        onError?.(err);
        return null;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Step 1: Create payment intent on backend
        const paymentIntent = await createPaymentIntent({
          amount: options.amount,
          currency: options.currency || 'USD',
          orderId: options.orderId,
          cartId: options.cartId,
          email: options.email,
          firstName: options.firstName,
          lastName: options.lastName,
          shippingAddress: options.shippingAddress,
          shippingCity: options.shippingCity,
          shippingState: options.shippingState,
          shippingZip: options.shippingZip,
          shippingMethod: options.shippingMethod,
        });

        // Step 2: Confirm payment with backend
        const result = await confirmPayment({
          paymentIntentId: paymentIntent.paymentIntentId,
          orderId: options.orderId,
        });

        setIsProcessing(false);
        onSuccess?.(paymentIntent.paymentIntentId);
        return result;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : 'Payment processing failed';
        setError(errorMessage);
        setIsProcessing(false);
        onError?.(errorMessage);
        return null;
      }
    },
    [stripe, onSuccess, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processPayment,
    isProcessing,
    error,
    clearError,
    stripe,
  };
};
