/**
 * Enhanced Stripe Payment Provider
 * Supports all global, European, US, and UK payment methods
 */

import Stripe from 'stripe';
import { 
  PaymentProvider, 
  PaymentIntent, 
  PaymentResult, 
  CreateIntentParams, 
  ConfirmPaymentParams,
  PaymentMethodType 
} from './types';

export class StripeProvider implements PaymentProvider {
  public readonly name = 'stripe';
  private stripe: Stripe;
  
  public readonly supportedMethods: PaymentMethodType[] = [
    // Global baseline
    'card',
    'apple-pay', 
    'google-pay',
    
    // European methods
    'ideal',           // Netherlands
    'bancontact',      // Belgium  
    'sofort',          // Germany/Austria
    'giropay',         // Germany
    'eps',             // Austria
    'sepa-debit',      // EU-wide
    'klarna',          // EU BNPL
    
    // US methods
    'affirm',          // US BNPL
    'afterpay',        // US BNPL
    
    // UK methods
    'bacs',            // UK bank transfer
    'faster-payments'  // UK instant payments (via Open Banking)
  ];

  constructor(secretKey: string, options?: Stripe.StripeConfig) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      ...options
    });
  }

  /**
   * Create payment intent for various payment methods
   */
  async createIntent(params: CreateIntentParams): Promise<PaymentIntent> {
    const {
      amount,
      currency,
      paymentMethod,
      customerEmail,
      metadata = {},
      returnUrl,
      cancelUrl
    } = params;

    try {
      const stripeParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: currency.toLowerCase(),
        metadata: {
          paymentMethod,
          customerEmail: customerEmail || '',
          ...metadata
        }
      };

      // Configure payment method types based on the selected method
      stripeParams.payment_method_types = this.getStripePaymentMethodTypes(paymentMethod);

      // Add automatic payment methods for better conversion
      stripeParams.automatic_payment_methods = {
        enabled: true,
        allow_redirects: 'always'
      };

      // Configure method-specific parameters
      const methodSpecificParams = this.getMethodSpecificParams(paymentMethod, returnUrl, cancelUrl);
      Object.assign(stripeParams, methodSpecificParams);

      const intent = await this.stripe.paymentIntents.create(stripeParams);

      return {
        id: intent.id,
        clientSecret: intent.client_secret!,
        status: intent.status as any,
        amount: intent.amount,
        currency: intent.currency.toUpperCase(),
        paymentMethod,
        metadata: intent.metadata
      };

    } catch (error: any) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult> {
    const { paymentIntentId, paymentMethodId, returnUrl } = params;

    try {
      const confirmParams: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      if (returnUrl) {
        confirmParams.return_url = returnUrl;
      }

      const intent = await this.stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

      return {
        success: intent.status === 'succeeded',
        paymentIntentId: intent.id,
        requiresAction: intent.status === 'requires_action',
        actionUrl: intent.next_action?.redirect_to_url?.url,
        error: intent.status === 'requires_payment_method' ? 'Payment failed' : undefined
      };

    } catch (error: any) {
      return {
        success: false,
        paymentIntentId,
        error: error.message
      };
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(payload: any): Promise<void> {
    const sig = payload.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload.body, sig, webhookSecret);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'payment_intent.requires_action':
          await this.handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

    } catch (error: any) {
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Get Stripe payment method types for our payment method
   */
  private getStripePaymentMethodTypes(paymentMethod: PaymentMethodType): string[] {
    const methodMap: Record<PaymentMethodType, string[]> = {
      'card': ['card'],
      'apple-pay': ['card'], // Apple Pay is handled by Payment Request API
      'google-pay': ['card'], // Google Pay is handled by Payment Request API
      'ideal': ['ideal'],
      'bancontact': ['bancontact'],
      'sofort': ['sofort'],
      'giropay': ['giropay'],
      'eps': ['eps'],
      'sepa-debit': ['sepa_debit'],
      'klarna': ['klarna'],
      'klarna-uk': ['klarna'],
      'affirm': ['affirm'],
      'afterpay': ['afterpay_clearpay'],
      'bacs': ['bacs_debit'],
      'faster-payments': ['link'] // Use Stripe Link for instant payments
    };

    return methodMap[paymentMethod] || ['card'];
  }

  /**
   * Get method-specific parameters for payment intent
   */
  private getMethodSpecificParams(
    paymentMethod: PaymentMethodType, 
    returnUrl: string,
    cancelUrl?: string
  ): Partial<Stripe.PaymentIntentCreateParams> {
    const params: Partial<Stripe.PaymentIntentCreateParams> = {};

    switch (paymentMethod) {
      case 'ideal':
        params.statement_descriptor = 'iDEAL Payment';
        break;
        
      case 'bancontact':
        params.statement_descriptor = 'Bancontact Payment';
        break;
        
      case 'sofort':
        params.statement_descriptor = 'SOFORT Payment';
        break;
        
      case 'giropay':
        params.statement_descriptor = 'Giropay Payment';
        break;
        
      case 'eps':  
        params.statement_descriptor = 'EPS Payment';
        break;
        
      case 'sepa-debit':
        params.confirmation_method = 'manual';
        params.statement_descriptor = 'SEPA Direct Debit';
        break;
        
      case 'klarna':
      case 'klarna-uk':
        params.statement_descriptor = 'Klarna Purchase';
        break;
        
      case 'affirm':
        params.statement_descriptor = 'Affirm Purchase';
        break;
        
      case 'afterpay':
        params.statement_descriptor = 'Afterpay Purchase';
        break;
        
      case 'bacs':
        params.confirmation_method = 'manual';
        params.statement_descriptor = 'BACS Direct Debit';
        break;
        
      case 'faster-payments':
        params.statement_descriptor = 'UK Payment';
        break;
    }

    return params;
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
    console.log(`Payment ${intent.id} succeeded for amount ${intent.amount}`);
    // Add your order completion logic here
    // e.g., update order status, send confirmation email, etc.
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(intent: Stripe.PaymentIntent): Promise<void> {
    console.log(`Payment ${intent.id} failed:`, intent.last_payment_error?.message);
    // Add your failure handling logic here
    // e.g., notify customer, retry logic, etc.
  }

  /**
   * Handle payment requiring additional action
   */
  private async handlePaymentRequiresAction(intent: Stripe.PaymentIntent): Promise<void> {
    console.log(`Payment ${intent.id} requires additional action`);
    // Add your action handling logic here
    // e.g., redirect customer, show 3D Secure, etc.
  }
}

/**
 * Create and configure Stripe provider
 */
export function createStripeProvider(secretKey?: string): StripeProvider {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!key) {
    throw new Error('Stripe secret key not found. Please set STRIPE_SECRET_KEY environment variable.');
  }

  return new StripeProvider(key, {
    typescript: true,
    stripeAccount: process.env.STRIPE_ACCOUNT_ID,
  });
}