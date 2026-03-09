/**
 * Enhanced Payment Error Handling
 * Provides specific error messages and recovery strategies
 */

export type PaymentErrorType = 
  | 'card_declined'
  | 'insufficient_funds'
  | 'invalid_card'
  | 'network_error'
  | 'authentication_required'
  | 'processing_error'
  | 'rate_limit'
  | 'unknown';

export interface PaymentError {
  type: PaymentErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  suggestedAction?: string;
}

/**
 * Maps Stripe error codes to user-friendly messages
 */
export function mapStripeError(stripeError: any): PaymentError {
  const { code, type, message } = stripeError;

  switch (code) {
    case 'card_declined':
      return {
        type: 'card_declined',
        message: message,
        userMessage: 'Your card was declined. Please try a different payment method.',
        recoverable: true,
        retryable: false,
        suggestedAction: 'Try a different card or contact your bank'
      };

    case 'insufficient_funds':
      return {
        type: 'insufficient_funds',
        message: message,
        userMessage: 'Insufficient funds on your card. Please use a different payment method.',
        recoverable: true,
        retryable: false,
        suggestedAction: 'Use a different card or add funds to your account'
      };

    case 'incorrect_number':
    case 'invalid_number':
    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
    case 'invalid_cvc':
      return {
        type: 'invalid_card',
        message: message,
        userMessage: 'Please check your card details and try again.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Double-check card number, expiry date, and security code'
      };

    case 'authentication_required':
      return {
        type: 'authentication_required',
        message: message,
        userMessage: 'Additional authentication required. Please complete the verification.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Complete the 3D Secure verification'
      };

    case 'rate_limit_error':
      return {
        type: 'rate_limit',
        message: message,
        userMessage: 'Too many payment attempts. Please wait a moment and try again.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Wait 30 seconds before trying again'
      };

    case 'processing_error':
      return {
        type: 'processing_error',
        message: message,
        userMessage: 'Payment processing failed. Please try again.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Wait a moment and retry, or use a different payment method'
      };

    default:
      // Network-related errors
      if (type === 'validation_error' && message?.includes('network')) {
        return {
          type: 'network_error',
          message: message,
          userMessage: 'Connection error. Please check your internet and try again.',
          recoverable: true,
          retryable: true,
          suggestedAction: 'Check your internet connection and retry'
        };
      }

      return {
        type: 'unknown',
        message: message || 'Unknown payment error',
        userMessage: 'Payment failed. Please try again or contact support.',
        recoverable: true,
        retryable: true,
        suggestedAction: 'Try again or contact customer support'
      };
  }
}

/**
 * Retry logic for payment operations
 */
export async function retryPaymentOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry certain types of errors
      const paymentError = mapStripeError(error);
      if (!paymentError.retryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Payment status checker for long-running operations
 */
export async function checkPaymentStatus(
  paymentIntentId: string,
  timeoutMs: number = 30000
): Promise<'succeeded' | 'failed' | 'timeout'> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(`/api/payments/status/${paymentIntentId}`);
      const { status } = await response.json();
      
      if (status === 'succeeded' || status === 'failed') {
        return status;
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.warn('Payment status check failed:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return 'timeout';
}