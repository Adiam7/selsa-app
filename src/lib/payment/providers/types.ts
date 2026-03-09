/**
 * Payment Provider Infrastructure Types
 * Supports all major payment methods globally
 */

export type PaymentRegion = 'global' | 'europe' | 'us' | 'uk' | 'netherlands' | 'germany' | 'belgium';

export type PaymentMethodType = 
  // Global baseline methods
  | 'card' 
  | 'paypal' 
  | 'apple-pay' 
  | 'google-pay'
  
  // European methods
  | 'ideal'           // Netherlands
  | 'bancontact'      // Belgium  
  | 'sofort'          // Germany/Austria
  | 'giropay'         // Germany
  | 'eps'             // Austria
  | 'sepa-debit'      // EU-wide
  | 'klarna'          // EU/US BNPL
  
  // US methods
  | 'affirm'          // US BNPL
  | 'afterpay'        // US BNPL  
  | 'amazon-pay'      // US trust & speed
  
  // UK methods
  | 'bacs'            // UK bank transfer
  | 'faster-payments' // UK instant payments
  | 'klarna-uk';      // UK BNPL

export type PaymentProvider = 'stripe' | 'paypal' | 'adyen' | 'mollie' | 'amazon' | 'klarna';

export interface PaymentMethodConfig {
  id: PaymentMethodType;
  provider: PaymentProvider;
  name: string;
  icon: string;
  regions: PaymentRegion[];
  currencies: string[];
  minimumAmount?: number; // in cents
  maximumAmount?: number; // in cents
  enabled: boolean;
  testMode: boolean;
  requiresRedirect: boolean;
  processingTime: 'instant' | 'minutes' | 'hours' | 'days';
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethodType;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  redirectUrl?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

export interface PaymentProvider {
  name: string;
  supportedMethods: PaymentMethodType[];
  createIntent(params: CreateIntentParams): Promise<PaymentIntent>;
  confirmPayment(params: ConfirmPaymentParams): Promise<PaymentResult>;
  handleWebhook(payload: any): Promise<void>;
}

export interface CreateIntentParams {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  customerEmail?: string;
  metadata?: Record<string, any>;
  returnUrl: string;
  cancelUrl?: string;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethodId?: string;
  returnUrl?: string;
}

export interface GeoLocationData {
  country: string;
  countryCode: string;
  region: PaymentRegion;
  currency: string;
}

export interface PaymentMethodAvailability {
  method: PaymentMethodType;
  available: boolean;
  reason?: string;
  provider: PaymentProvider;
  config: PaymentMethodConfig;
}