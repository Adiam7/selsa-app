// src/features/payment/components/StripePaymentForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, AlertCircle } from 'lucide-react';
import styles from './StripePaymentForm.module.css';

interface StripePaymentFormProps {
  amount: number;
  orderId: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
    },
  },
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe not loaded. Please try again.');
      return;
    }

    if (!cardComplete) {
      setError('Please enter valid card details.');
      return;
    }

    setLocalProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create a payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Confirm the payment with the server-side secret
      const response = await fetch('/api/payment/confirm-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          orderId,
          amount: Math.round(amount * 100), // Convert to cents
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      if (result.status === 'succeeded' || result.status === 'requires_action') {
        if (result.status === 'requires_action' && result.clientSecret) {
          // Handle 3D Secure or other authentication
          const { error: confirmError, paymentIntent } =
            await stripe.confirmCardPayment(result.clientSecret);

          if (confirmError) {
            throw new Error(confirmError.message);
          }

          if (paymentIntent?.status === 'succeeded') {
            onPaymentSuccess(paymentIntent.id);
          }
        } else {
          onPaymentSuccess(result.paymentIntentId);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLocalProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="card-element" className={styles.label}>{t('Card Details')}</label>
        <div className={styles.cardElement}>
          <CardElement
            id="card-element"
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
      </div>
      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={isProcessing || localProcessing || !stripe || !elements}
        className={styles.submitButton}
      >
        {isProcessing || localProcessing ? (
          <>
            <svg
              className={styles.spinner}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.25"
              />
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.75"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <Lock size={20} />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
      <div className={styles.securityInfo}>
        <Lock size={16} />
        <span>{t('Your payment information is encrypted and secure')}</span>
      </div>
    </form>
  );
};
