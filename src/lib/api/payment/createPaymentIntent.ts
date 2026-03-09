// lib/api/payment/createPaymentIntent.ts
import { apiClient } from '../client';

interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  orderId?: number;
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

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

/**
 * Create a Stripe payment intent on the backend
 * This initiates the payment process with Stripe
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  try {
    const response = await apiClient.post(
      '/payments/create-intent/',
      {
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        cart_id: data.cartId,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        shipping_address: data.shippingAddress,
        shipping_city: data.shippingCity,
        shipping_state: data.shippingState,
        shipping_zip: data.shippingZip,
        shipping_method: data.shippingMethod,
      }
    );

    if (!response.data?.client_secret) {
      throw new Error('Failed to create payment intent');
    }

    return {
      clientSecret: response.data.client_secret,
      paymentIntentId: response.data.payment_intent_id,
      amount: response.data.amount,
      currency: response.data.currency,
    };
  } catch (error: any) {
    // Error handled silently
    throw new Error(
      error?.response?.data?.error || error?.message || 'Failed to create payment intent'
    );
  }
};

/**
 * Confirm payment with backend after Stripe confirms
 */
interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: number;
}

export const confirmPayment = async (data: ConfirmPaymentRequest): Promise<{ orderId: number; status: string }> => {
  try {
    const response = await apiClient.post(
      '/payments/confirm-payment/',
      {
        payment_intent_id: data.paymentIntentId,
        order_id: data.orderId,
      }
    );

    return {
      orderId: response.data.order_id,
      status: response.data.status,
    };
  } catch (error: any) {
    // Error handled silently
    throw new Error(
      error?.response?.data?.error || error?.message || 'Failed to confirm payment'
    );
  }
};
