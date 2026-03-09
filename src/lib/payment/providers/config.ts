/**
 * Payment Method Configurations by Region
 * Complete list of supported payment methods worldwide
 */

import { PaymentMethodConfig, PaymentRegion } from './types';

export const PAYMENT_METHOD_CONFIGS: Record<string, PaymentMethodConfig> = {
  // ===== GLOBAL BASELINE METHODS (Required everywhere) =====
  
  'card': {
    id: 'card',
    provider: 'stripe',
    name: 'Credit/Debit Cards',
    icon: '/icons/cards.svg',
    regions: ['global'],
    currencies: ['USD', 'EUR', 'GBP'],
    enabled: true,
    testMode: false,
    requiresRedirect: false,
    processingTime: 'instant'
  },

  'paypal': {
    id: 'paypal',
    provider: 'paypal',
    name: 'PayPal',
    icon: '/icons/paypal.svg', 
    regions: ['global'],
    currencies: ['USD', 'EUR', 'GBP'],
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'apple-pay': {
    id: 'apple-pay',
    provider: 'stripe',
    name: 'Apple Pay',
    icon: '/icons/apple-pay.svg',
    regions: ['global'],
    currencies: ['USD', 'EUR', 'GBP'],
    enabled: true,
    testMode: false,
    requiresRedirect: false,
    processingTime: 'instant'
  },

  'google-pay': {
    id: 'google-pay', 
    provider: 'stripe',
    name: 'Google Pay',
    icon: '/icons/google-pay.svg',
    regions: ['global'],
    currencies: ['USD', 'EUR', 'GBP'],
    enabled: true,
    testMode: false,
    requiresRedirect: false,
    processingTime: 'instant'
  },

  // ===== EUROPEAN METHODS (EU-specific must-haves) =====
  
  'ideal': {
    id: 'ideal',
    provider: 'stripe', // Also supported by Mollie, Adyen
    name: 'iDEAL',
    icon: '/icons/ideal.svg',
    regions: ['europe', 'netherlands'],
    currencies: ['EUR'],
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'bancontact': {
    id: 'bancontact',
    provider: 'stripe',
    name: 'Bancontact',
    icon: '/icons/bancontact.svg',
    regions: ['europe', 'belgium'],
    currencies: ['EUR'], 
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'sofort': {
    id: 'sofort',
    provider: 'stripe',
    name: 'SOFORT Banking',
    icon: '/icons/sofort.svg',
    regions: ['europe', 'germany'],
    currencies: ['EUR'],
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'giropay': {
    id: 'giropay',
    provider: 'stripe',
    name: 'Giropay', 
    icon: '/icons/giropay.svg',
    regions: ['europe', 'germany'],
    currencies: ['EUR'],
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'eps': {
    id: 'eps',
    provider: 'stripe',
    name: 'EPS',
    icon: '/icons/eps.svg',
    regions: ['europe'],
    currencies: ['EUR'],
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'sepa-debit': {
    id: 'sepa-debit', 
    provider: 'stripe',
    name: 'SEPA Direct Debit',
    icon: '/icons/sepa.svg',
    regions: ['europe'],
    currencies: ['EUR'],
    minimumAmount: 100, // €1.00 minimum
    enabled: true,
    testMode: false,
    requiresRedirect: false,
    processingTime: 'days' // SEPA takes 1-3 business days
  },

  'klarna': {
    id: 'klarna',
    provider: 'klarna',
    name: 'Klarna Pay Later',
    icon: '/icons/klarna.svg',
    regions: ['europe', 'us'],
    currencies: ['EUR', 'USD', 'GBP'],
    minimumAmount: 500, // €5.00 / $5.00 minimum
    maximumAmount: 100000, // €1000 / $1000 maximum
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  // ===== UNITED STATES METHODS (US-specific must-haves) =====
  
  'affirm': {
    id: 'affirm',
    provider: 'stripe',
    name: 'Affirm Buy Now Pay Later',
    icon: '/icons/affirm.svg',
    regions: ['us'],
    currencies: ['USD'],
    minimumAmount: 5000, // $50 minimum
    maximumAmount: 3000000, // $30,000 maximum
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'afterpay': {
    id: 'afterpay',
    provider: 'stripe',
    name: 'Afterpay Buy Now Pay Later',
    icon: '/icons/afterpay.svg',
    regions: ['us'],
    currencies: ['USD'],
    minimumAmount: 100, // $1 minimum
    maximumAmount: 200000, // $2,000 maximum
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'amazon-pay': {
    id: 'amazon-pay',
    provider: 'amazon',
    name: 'Amazon Pay',
    icon: '/icons/amazon-pay.svg',
    regions: ['us', 'global'],
    currencies: ['USD', 'EUR', 'GBP'],
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  // ===== UNITED KINGDOM METHODS (UK-specific must-haves) =====
  
  'bacs': {
    id: 'bacs',
    provider: 'stripe',
    name: 'BACS Direct Debit',
    icon: '/icons/bacs.svg',
    regions: ['uk'],
    currencies: ['GBP'],
    minimumAmount: 100, // £1.00 minimum
    enabled: true,
    testMode: false,
    requiresRedirect: false,
    processingTime: 'days' // BACS takes 2-3 business days
  },

  'faster-payments': {
    id: 'faster-payments',
    provider: 'stripe',
    name: 'UK Faster Payments',
    icon: '/icons/faster-payments.svg',
    regions: ['uk'],
    currencies: ['GBP'],
    maximumAmount: 25000000, // £250,000 maximum
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  },

  'klarna-uk': {
    id: 'klarna-uk',
    provider: 'klarna',
    name: 'Klarna Pay Later (UK)',
    icon: '/icons/klarna.svg',
    regions: ['uk'],
    currencies: ['GBP'],
    minimumAmount: 500, // £5.00 minimum
    maximumAmount: 100000, // £1000 maximum
    enabled: true,
    testMode: false,
    requiresRedirect: true,
    processingTime: 'instant'
  }
};

// Regional payment method mappings
export const REGIONAL_PAYMENT_METHODS: Record<PaymentRegion, string[]> = {
  global: ['card', 'paypal', 'apple-pay', 'google-pay'],
  
  europe: [
    'card', 'paypal', 'apple-pay', 'google-pay', // Global baseline
    'ideal', 'bancontact', 'sofort', 'giropay', 'eps', 'sepa-debit', 'klarna' // EU-specific
  ],
  
  us: [
    'card', 'paypal', 'apple-pay', 'google-pay', // Global baseline  
    'klarna', 'affirm', 'afterpay', 'amazon-pay' // US-specific
  ],
  
  uk: [
    'card', 'paypal', 'apple-pay', 'google-pay', // Global baseline
    'bacs', 'faster-payments', 'klarna-uk' // UK-specific
  ],
  
  netherlands: [
    'card', 'paypal', 'apple-pay', 'google-pay', // Global baseline
    'ideal', 'klarna', 'sepa-debit' // NL priority
  ],
  
  germany: [
    'card', 'paypal', 'apple-pay', 'google-pay', // Global baseline  
    'sofort', 'giropay', 'klarna', 'sepa-debit' // DE priority
  ],
  
  belgium: [
    'card', 'paypal', 'apple-pay', 'google-pay', // Global baseline
    'bancontact', 'klarna', 'sepa-debit' // BE priority
  ]
};

// Currency mappings by region
export const REGIONAL_CURRENCIES: Record<PaymentRegion, string> = {
  global: 'USD',
  europe: 'EUR', 
  us: 'USD',
  uk: 'GBP',
  netherlands: 'EUR',
  germany: 'EUR', 
  belgium: 'EUR'
};

// Get payment methods for specific region
export function getPaymentMethodsForRegion(region: PaymentRegion, currency?: string): PaymentMethodConfig[] {
  const methodIds = REGIONAL_PAYMENT_METHODS[region] || REGIONAL_PAYMENT_METHODS.global;
  const targetCurrency = currency || REGIONAL_CURRENCIES[region];
  
  return methodIds
    .map(id => PAYMENT_METHOD_CONFIGS[id])
    .filter(config => 
      config.enabled && 
      config.currencies.includes(targetCurrency) &&
      (config.regions.includes(region) || config.regions.includes('global'))
    );
}