/**
 * Enhanced Stripe Payment API - Support for all regional payment methods
 * Handles European, US, UK, and Global payment methods
 */

import { NextRequest, NextResponse } from 'next/server';
import { createStripeProvider } from '@/lib/payment/providers/stripe-provider';
import { PaymentMethodType } from '@/lib/payment/providers/types';
import { isPaymentMethodAvailable } from '@/lib/payment/providers/geo-detection';

type CreateEnhancedIntentRequest = {
  amount: number; // in cents
  currency: string; // ISO 4217 currency code
  paymentMethod: PaymentMethodType;
  customerEmail?: string;
  customerCountry: string; // ISO 3166-1 alpha-2 country code
  returnUrl: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
  
  // European specific fields
  idealBank?: string; // For iDEAL
  sofortCountry?: string; // For SOFORT
  
  // SEPA specific fields  
  sepaMandate?: {
    customerName: string;
    customerEmail: string;
    iban?: string;
  };
  
  // UK specific fields
  bacsMandate?: {
    customerName: string;
    customerEmail: string;
    sortCode?: string;
    accountNumber?: string;
  };
};

type PaymentMethodSupport = {
  available: boolean;
  reason?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  processingTime?: string;
  requiresRedirect?: boolean;
};

/**
 * POST /api/payments/stripe/enhanced
 * Create payment intent for any supported regional payment method
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateEnhancedIntentRequest = await request.json();
    const {
      amount,
      currency,
      paymentMethod,
      customerEmail,
      customerCountry,
      returnUrl,
      cancelUrl,
      metadata = {},
      idealBank,
      sofortCountry,
      sepaMandate,
      bacsMandate
    } = body;

    // Input validation
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid amount'
      }, { status: 400 });
    }

    if (!paymentMethod || !customerCountry || !returnUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: paymentMethod, customerCountry, returnUrl'
      }, { status: 400 });
    }

    // Check if payment method is available in customer's region
    const availability = await checkPaymentMethodAvailability(paymentMethod, customerCountry, currency, amount);
    
    if (!availability.available) {
      return NextResponse.json({
        success: false,
        error: availability.reason || 'Payment method not available'
      }, { status: 400 });
    }

    // Create Stripe provider
    const stripeProvider = createStripeProvider();

    // Prepare enhanced metadata
    const enhancedMetadata = {
      paymentMethod,
      customerCountry,
      customerEmail: customerEmail || '',
      origin: 'enhanced_api',
      ...metadata
    };

    // Add method-specific metadata
    if (idealBank) enhancedMetadata.idealBank = idealBank;
    if (sofortCountry) enhancedMetadata.sofortCountry = sofortCountry;
    if (sepaMandate) enhancedMetadata.sepaMandate = JSON.stringify(sepaMandate);
    if (bacsMandate) enhancedMetadata.bacsMandate = JSON.stringify(bacsMandate);

    // Create payment intent
    const intent = await stripeProvider.createIntent({
      amount,
      currency,
      paymentMethod,
      customerEmail,
      returnUrl,
      cancelUrl,
      metadata: enhancedMetadata
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: intent.id,
        clientSecret: intent.clientSecret,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        paymentMethod: intent.paymentMethod
      },
      availability,
      nextSteps: getNextStepsForPaymentMethod(paymentMethod)
    });

  } catch (error: any) {
    console.error('Enhanced Stripe API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create payment intent'
    }, { status: 500 });
  }
}

/**
 * GET /api/payments/stripe/enhanced?method={method}&country={country}&currency={currency}&amount={amount}
 * Check payment method availability and requirements
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') as PaymentMethodType;
    const country = searchParams.get('country');
    const currency = searchParams.get('currency');
    const amount = parseInt(searchParams.get('amount') || '0');

    if (!method || !country || !currency) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: method, country, currency'
      }, { status: 400 });
    }

    const availability = await checkPaymentMethodAvailability(method, country, currency, amount);
    const nextSteps = getNextStepsForPaymentMethod(method);
    const requirements = getPaymentMethodRequirements(method);

    return NextResponse.json({
      success: true,
      method,
      availability,
      nextSteps,
      requirements
    });

  } catch (error: any) {
    console.error('Payment method check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check payment method'
    }, { status: 500 });
  }
}

/**
 * Check if payment method is available for given parameters
 */
async function checkPaymentMethodAvailability(
  method: PaymentMethodType,
  country: string,
  currency: string,
  amount: number
): Promise<PaymentMethodSupport> {
  // Import geo detection
  const { COUNTRY_TO_REGION } = await import('@/lib/payment/providers/geo-detection');
  const { PAYMENT_METHOD_CONFIGS } = await import('@/lib/payment/providers/config');
  
  const region = COUNTRY_TO_REGION[country.toUpperCase()] || 'global';
  const config = PAYMENT_METHOD_CONFIGS[method];

  if (!config) {
    return {
      available: false,
      reason: `Payment method ${method} is not supported`
    };
  }

  if (!config.enabled) {
    return {
      available: false,
      reason: `Payment method ${method} is temporarily disabled`
    };
  }

  // Check region availability
  const regionSupported = config.regions.includes(region) || config.regions.includes('global');
  if (!regionSupported) {
    return {
      available: false,
      reason: `${config.name} is not available in ${country}`
    };
  }

  // Check currency support
  if (!config.currencies.includes(currency.toUpperCase())) {
    return {
      available: false,
      reason: `${config.name} does not support ${currency.toUpperCase()}`
    };
  }

  // Check amount limits
  if (config.minimumAmount && amount < config.minimumAmount) {
    return {
      available: false,
      reason: `Minimum amount for ${config.name} is ${config.minimumAmount / 100} ${currency.toUpperCase()}`,
      minimumAmount: config.minimumAmount
    };
  }

  if (config.maximumAmount && amount > config.maximumAmount) {
    return {
      available: false,
      reason: `Maximum amount for ${config.name} is ${config.maximumAmount / 100} ${currency.toUpperCase()}`,
      maximumAmount: config.maximumAmount
    };
  }

  return {
    available: true,
    minimumAmount: config.minimumAmount,
    maximumAmount: config.maximumAmount,
    processingTime: config.processingTime,
    requiresRedirect: config.requiresRedirect
  };
}

/**
 * Get next steps instructions for payment method
 */
function getNextStepsForPaymentMethod(method: PaymentMethodType): string[] {
  const nextSteps: Record<PaymentMethodType, string[]> = {
    'card': [
      'Enter your card details in the secure form',
      'Complete any 3D Secure authentication if required',
      'Your payment will be processed immediately'
    ],
    
    'paypal': [
      'You will be redirected to PayPal',
      'Log in to your PayPal account',
      'Confirm the payment',
      'You will be redirected back to complete your order'
    ],
    
    'apple-pay': [
      'Touch ID or Face ID to authorize',
      'Your payment will be processed immediately'
    ],
    
    'google-pay': [
      'Authorize payment with your Google account',
      'Your payment will be processed immediately'
    ],
    
    'ideal': [
      'You will be redirected to your bank',
      'Log in to your online banking',
      'Confirm the payment',
      'You will be redirected back to complete your order'
    ],
    
    'bancontact': [
      'You will be redirected to Bancontact',
      'Use your card reader or mobile app',
      'Confirm the payment',
      'You will be redirected back to complete your order'
    ],
    
    'sofort': [
      'You will be redirected to SOFORT Banking',
      'Log in with your online banking credentials',
      'Confirm the payment',
      'You will be redirected back to complete your order'
    ],
    
    'giropay': [
      'You will be redirected to your bank',
      'Log in to your online banking',
      'Confirm the payment',
      'You will be redirected back to complete your order'
    ],
    
    'eps': [
      'You will be redirected to EPS',
      'Select your bank and log in',
      'Confirm the payment',
      'You will be redirected back to complete your order'
    ],
    
    'sepa-debit': [
      'Provide your IBAN and mandate authorization',
      'Payment will be debited from your account in 1-3 business days',
      'You will receive a confirmation email'
    ],
    
    'klarna': [
      'You will be redirected to Klarna',
      'Choose your preferred payment plan',
      'Complete Klarna verification if required',
      'You will be redirected back to complete your order'
    ],
    
    'klarna-uk': [
      'You will be redirected to Klarna',
      'Choose your preferred payment plan',
      'Complete Klarna verification if required',
      'You will be redirected back to complete your order'
    ],
    
    'affirm': [
      'You will be redirected to Affirm',
      'Get instantly approved for financing',
      'Choose your repayment plan',
      'You will be redirected back to complete your order'
    ],
    
    'afterpay': [
      'You will be redirected to Afterpay',
      'Get instantly approved',
      'Pay 25% today, the rest in 3 installments',
      'You will be redirected back to complete your order'
    ],
    
    'amazon-pay': [ 
      'You will be redirected to Amazon',
      'Log in to your Amazon account',
      'Select your payment method and address',
      'You will be redirected back to complete your order'
    ],
    
    'bacs': [
      'Provide your bank details and Direct Debit mandate',
      'Payment will be collected in 2-3 business days',
      'You will receive a confirmation email'
    ],
    
    'faster-payments': [
      'You will be redirected to your bank',
      'Log in to your online banking',
      'Confirm the instant payment',
      'You will be redirected back to complete your order'
    ]
  };

  return nextSteps[method] || ['Complete payment as instructed'];
}

/**
 * Get payment method specific requirements
 */
function getPaymentMethodRequirements(method: PaymentMethodType): string[] {
  const requirements: Record<PaymentMethodType, string[]> = {
    'ideal': ['Dutch bank account', 'Online banking access'],
    'bancontact': ['Belgian bank account', 'Card reader or Bancontact app'],
    'sofort': ['German or Austrian bank account', 'Online banking credentials'],
    'giropay': ['German bank account', 'Online banking access'],
    'eps': ['Austrian bank account', 'Online banking access'],
    'sepa-debit': ['EU bank account', 'IBAN number'],
    'bacs': ['UK bank account', 'Sort code and account number'],
    'faster-payments': ['UK bank account', 'Online banking access'],
    'klarna': ['Valid credit check', 'Email and phone number'],
    'affirm': ['US address', 'Valid credit check', 'Social Security Number'],
    'afterpay': ['Valid ID', 'Debit or credit card for first payment']
  };

  return requirements[method] || [];
}