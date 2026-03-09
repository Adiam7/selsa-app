/**
 * Stripe Payment Form Component
 * Integrates Stripe Elements for credit card payments
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe, Stripe, PaymentRequest } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * All Stripe-backed payment methods supported by the checkout.
 * Maps 1:1 with the PaymentMethodType values from the config that use provider: 'stripe'.
 */
export type SupportedStripeMethod =
  | 'card'
  // Wallets
  | 'apple' | 'google' | 'apple-pay' | 'google-pay'
  // BNPL
  | 'klarna' | 'klarna-uk' | 'afterpay' | 'affirm'
  // European
  | 'ideal' | 'bancontact' | 'sofort' | 'giropay' | 'eps' | 'sepa-debit'
  // UK
  | 'bacs' | 'faster-payments';

/** Maps a checkout PaymentMethodType identifier to the Stripe payment_method_types value(s). */
export function mapToStripeMethodTypes(method: string): string[] | null {
  const map: Record<string, string[]> = {
    'card':             ['card'],
    'apple':            ['card'],       // Apple Pay is processed as card via PaymentRequest
    'google':           ['card'],       // Google Pay is processed as card via PaymentRequest
    'apple-pay':        ['card'],
    'google-pay':       ['card'],
    'klarna':           ['klarna'],
    'klarna-uk':        ['klarna'],
    'afterpay':         ['afterpay_clearpay'],
    'affirm':           ['affirm'],
    'ideal':            ['ideal'],
    'bancontact':       ['bancontact'],
    'sofort':           ['sofort'],
    'giropay':          ['giropay'],
    'eps':              ['eps'],
    'sepa-debit':       ['sepa_debit'],
    'bacs':             ['bacs_debit'],
    'faster-payments':  ['fp_x'],       // Stripe uses "link" or bank-transfer; adapt as needed
  };
  return map[method] ?? null;
}

/** Check whether a checkout PaymentMethodType is Stripe-backed. */
export function isStripeMethod(method: string): boolean {
  return mapToStripeMethodTypes(method) !== null;
}

interface BillingDetails {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  countryCode?: string;
  orderId?: string;
  cartId?: number;
  customerEmail?: string;
  customerName?: string;
  paymentMethod?: SupportedStripeMethod;
  billingDetails?: BillingDetails;
  supportedPaymentMethods?: string[];
  /** When true, renders Stripe's built-in accordion layout for method selection. */
  useAccordionLayout?: boolean;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

interface StripeFormContentProps extends StripePaymentFormProps {
  clientSecret: string;
  sessionExpired: boolean;
  onSessionExpired: () => void;
}

/**
 * Inner component that uses Stripe hooks
 */
function StripeFormContent(props: StripeFormContentProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletReady, setWalletReady] = useState(false);
  const [walletChecked, setWalletChecked] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  const {
    orderId,
    amount,
    currency: currencyProp,
    cartId,
    customerEmail,
    customerName,
    paymentMethod,
    countryCode,
    clientSecret,
    sessionExpired,
    onSessionExpired,
    onSuccess,
    onError,
  } = props;

  const currency = (currencyProp || 'usd').toLowerCase();

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    // Only show Payment Request button when user explicitly chose Apple/Google.
    const wantsWallet = paymentMethod === 'apple' || paymentMethod === 'google' || paymentMethod === 'apple-pay' || paymentMethod === 'google-pay';
    if (!wantsWallet) {
      setPaymentRequest(null);
      setWalletReady(false);
      setWalletChecked(false);
      return;
    }

    setWalletChecked(false);

    const cc = (countryCode || 'US').toUpperCase();
    const safeCountry = /^[A-Z]{2}$/.test(cc) ? cc : 'US';

    const pr = stripe.paymentRequest({
      country: safeCountry,
      currency,
      total: {
        label: 'Total',
        amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment()
      .then((result) => {
        setWalletChecked(true);
        if (result) {
          setPaymentRequest(pr);
          setWalletReady(true);
        } else {
          setPaymentRequest(null);
          setWalletReady(false);
        }
      })
      .catch(() => {
        setWalletChecked(true);
        setPaymentRequest(null);
        setWalletReady(false);
      });

    pr.on('paymentmethod', async (ev) => {
      if (!stripe) return;

      try {
        setLoading(true);
        setError(null);

        const first = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (first.error) {
          ev.complete('fail');
          throw new Error(first.error.message);
        }

        ev.complete('success');

        // Handle 3DS if required
        if (first.paymentIntent?.status === 'requires_action') {
          const second = await stripe.confirmCardPayment(clientSecret);
          if (second.error) throw new Error(second.error.message);
          if (second.paymentIntent?.status === 'succeeded') {
            onSuccess?.(second.paymentIntent.id);
            return;
          }
        }

        if (first.paymentIntent?.status === 'succeeded') {
          onSuccess?.(first.paymentIntent.id);
          return;
        }

        throw new Error(`Payment status: ${first.paymentIntent?.status || 'unknown'}`);
      } catch (err: any) {
        const errorMsg = err?.message || 'Payment failed';
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    });
  }, [stripe, clientSecret, amount, currency, paymentMethod, countryCode, onSuccess, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      return;
    }

    if (!clientSecret) {
      setError('Payment not initialized');
      return;
    }

    if (sessionExpired) {
      const msg = 'Your payment session expired. Please refresh and try again.';
      setError(msg);
      onSessionExpired();
      return;
    }

    setLoading(true);

    try {
      // Step 1: Submit the Elements instance to validate and collect payment details.
      // This MUST happen before confirmPayment per Stripe's deferred-payment flow.
      const submitResult = await elements.submit();
      if (submitResult.error) {
        throw submitResult.error;
      }

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : undefined);
      const returnUrl = baseUrl ? `${baseUrl}/checkout` : undefined;

      // Step 2: Confirm the payment with the already-submitted Elements.
      // Because we set fields.billingDetails = 'never' on the PaymentElement,
      // we must supply billing_details here so Stripe can attach them to the PM.
      const billingDetailsData: Record<string, unknown> = {
        name: props.billingDetails?.name || customerName || '',
        email: props.billingDetails?.email || customerEmail || '',
      };
      if (props.billingDetails?.phone) {
        billingDetailsData.phone = props.billingDetails.phone;
      }
      if (props.billingDetails?.address) {
        billingDetailsData.address = {
          line1: props.billingDetails.address.line1 || '',
          line2: props.billingDetails.address.line2 || '',
          city: props.billingDetails.address.city || '',
          state: props.billingDetails.address.state || '',
          postal_code: props.billingDetails.address.postal_code || '',
          country: props.billingDetails.address.country || '',
        };
      }

      const confirmParams: Record<string, unknown> = {
        payment_method_data: {
          billing_details: billingDetailsData,
        },
      };
      if (returnUrl) {
        confirmParams.return_url = returnUrl;
      }

      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams,
        redirect: 'if_required',
      });

      if (result.error) {
        throw result.error;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        onSuccess?.(result.paymentIntent.id);
        return;
      }

      // Some methods can be processing; treat as success for now.
      if (result.paymentIntent?.status === 'processing') {
        onSuccess?.(result.paymentIntent.id);
        return;
      }

      throw new Error(`Payment status: ${result.paymentIntent?.status || 'unknown'}`);
    } catch (err: any) {
      const rawMessage = err?.message || 'Payment processing failed';
      const rawCode = err?.code || '';
      const isExpired =
        rawCode === 'payment_intent_unexpected_state' ||
        /expired|canceled|cancelled|no longer available/i.test(rawMessage);

      if (isExpired) {
        const expiredMsg = 'Your payment session expired. Please refresh and try again.';
        setError(expiredMsg);
        onSessionExpired();
        onError?.(expiredMsg);
        return;
      }

      setError(rawMessage);
      if (process.env.NODE_ENV === 'development') console.error('Stripe payment error:', rawMessage);
      onError?.(rawMessage);
    } finally {
      setLoading(false);
    }
  };

  const formId = props.useAccordionLayout ? 'stripe-payment-form' : undefined;

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
      {/* Wallet buttons (Apple Pay / Google Pay) when available */}
      {paymentRequest && walletReady && (
        <div className="space-y-2">
          <div className="text-sm text-gray-700">
            {(paymentMethod === 'apple' || paymentMethod === 'apple-pay') ? t('Pay with Apple Pay') : t('Pay with Google Pay')}
          </div>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '44px',
                },
              },
            }}
          />
          <div className="text-xs text-gray-500">{t('If the wallet button is unavailable, use the payment form below.')}</div>
        </div>
      )}

      {/* Wallet selected, but unavailable */}
      {(paymentMethod === 'apple' || paymentMethod === 'google' || paymentMethod === 'apple-pay' || paymentMethod === 'google-pay') && walletChecked && !walletReady && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-sm">
          {(paymentMethod === 'apple' || paymentMethod === 'apple-pay')
            ? t('Apple Pay is not available on this device/browser. Use the payment form below or choose another method.')
            : t('Google Pay is not available on this device/browser. Use the payment form below or choose another method.')}
        </div>
      )}

      {/* Redirect notice for methods that require redirect (iDEAL, Bancontact, SOFORT, etc.) */}
      {paymentMethod && !['card', 'apple', 'google', 'apple-pay', 'google-pay'].includes(paymentMethod) && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
          {t('You may be redirected to complete payment with your selected provider.')}
        </div>
      )}

      {/* Payment Element (cards + wallets + BNPL + regional methods) */}
      <div>
        {!props.useAccordionLayout && (
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('Payment Details')}</label>
        )}
        <div className={props.useAccordionLayout ? 'w-full' : 'w-full px-4 py-3 border border-gray-300 rounded-lg bg-white'}>
          <PaymentElement
            options={props.useAccordionLayout ? {
              layout: {
                type: 'accordion',
                defaultCollapsed: false,
                radios: false,
                spacedAccordionItems: true,
              },
              fields: {
                billingDetails: 'never',
              },
            } : {
              fields: {
                billingDetails: 'never',
              },
            }}
          />
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{t('❌')}{error}
        </div>
      )}
      {/* Submit Button — hidden when the parent checkout page provides its own */}
      {!props.useAccordionLayout && (
        <>
          <button
            type="submit"
            disabled={loading || !stripe || !elements || !clientSecret || sessionExpired}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
          <p className="text-xs text-gray-500 text-center">{t('Your payment information is securely processed by Stripe.')}</p>
        </>
      )}
    </form>
  );
}

/**
 * Main component - wraps with Stripe Elements provider
 */
export default function StripePaymentForm(props: StripePaymentFormProps) {
  const { t } = useTranslation();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionCreatedAt, setSessionCreatedAt] = useState<number | null>(null);

  const toFriendlyInitError = useCallback((raw: string) => {
    const msg = (raw || '').toLowerCase();

    // Stripe returns messages like "The payment method type 'affirm' is invalid" or
    // "This payment method is not enabled" when a method isn't configured.
    if (
      msg.includes('payment method type') ||
      msg.includes('not enabled') ||
      msg.includes('unsupported') ||
      msg.includes('is invalid') ||
      msg.includes('not available')
    ) {
      return t('This payment method is coming soon. Please select another payment method.');
    }

    if (msg.includes('stripe is not configured') || msg.includes('stripe_secret_key')) {
      return t('Payment is temporarily unavailable. Please try again later.');
    }

    return raw;
  }, [t]);

  useEffect(() => {
    if (STRIPE_KEY) {
      setStripePromise(loadStripe(STRIPE_KEY));
    } else {
      const friendly = t('Payment is temporarily unavailable. Please try again later.');
      if (process.env.NODE_ENV === 'development') console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set');
      setInitError(friendly);
      props.onError?.(friendly);
    }
  }, [props.onError, t]);

  const refreshIntent = useCallback(async () => {
    const currency = (props.currency || 'usd').toLowerCase();
    // When using accordion layout (automatic method selection), don't specify a method
    // so the API route uses automatic_payment_methods and Stripe shows all options.
    const method = props.useAccordionLayout ? undefined : (props.paymentMethod ?? 'card');

    // Resolve Stripe-specific payment_method_types for regional / BNPL methods
    const stripeMethodTypes = method ? mapToStripeMethodTypes(method) : null;

    const response = await fetch('/api/payments/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: props.amount,
        currency,
        ...(method ? { preferredPaymentMethod: method } : {}),
        // Pass explicit Stripe types so the API route creates the intent correctly
        ...(stripeMethodTypes ? { stripePaymentMethodTypes: stripeMethodTypes } : {}),
        metadata: {
          orderId: props.orderId ?? '',
          cartId: props.cartId ?? '',
          customerEmail: props.customerEmail ?? props.billingDetails?.email ?? '',
          customerName: props.customerName ?? props.billingDetails?.name ?? '',
          ...(method ? { preferredPaymentMethod: method } : {}),
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.client_secret) {
      throw new Error(data?.error || 'Failed to initialize payment');
    }

    setClientSecret(data.client_secret);
    setPaymentIntentId(data.payment_intent_id ?? null);
    setSessionCreatedAt(Date.now());
    setSessionExpired(false);
  }, [props.amount, props.currency, props.orderId, props.cartId, props.customerEmail, props.customerName, props.paymentMethod, props.billingDetails, props.useAccordionLayout]);

  useEffect(() => {
    let cancelled = false;

    const createIntent = async () => {
      try {
        setInitError(null);
        setClientSecret(null);
        setPaymentIntentId(null);
        setSessionExpired(false);
        setSessionCreatedAt(null);

        await refreshIntent();
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to initialize payment';
        const friendly = toFriendlyInitError(errorMsg);
        if (!cancelled) setInitError(friendly);
        props.onError?.(friendly);
      }
    };

    createIntent();
    return () => {
      cancelled = true;
    };
    // Re-create intent if amount/currency/order changes
  }, [refreshIntent, props.onError, toFriendlyInitError]);

  useEffect(() => {
    if (!sessionCreatedAt || sessionExpired) return;

    const ttlMs = 30 * 60 * 1000;
    const remaining = sessionCreatedAt + ttlMs - Date.now();

    if (remaining <= 0) {
      setSessionExpired(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setSessionExpired(true);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [sessionCreatedAt, sessionExpired]);

  if (!stripePromise) {
    return <div className="p-4 text-center text-gray-500">{t('Loading payment form...')}</div>;
  }

  if (initError) {
    return <div className="p-4 text-center text-red-600">{initError}</div>;
  }

  if (!clientSecret) {
    return <div className="p-4 text-center text-gray-500">{t('Loading payment form...')}</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
    >
      {sessionExpired ? (
        <div className="p-4 text-center text-amber-700">
          <div className="mb-2">{t('Your payment session expired. Please refresh and try again.')}</div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700"
            onClick={async () => {
              try {
                setInitError(null);
                await refreshIntent();
              } catch (err: any) {
                const errorMsg = err?.message || 'Failed to initialize payment';
                const friendly = toFriendlyInitError(errorMsg);
                setInitError(friendly);
                props.onError?.(friendly);
              }
            }}
          >
            {t('Refresh payment')}
          </button>
          {paymentIntentId ? (
            <div className="text-xs text-gray-500 mt-2">{t('Reference:')} {paymentIntentId}</div>
          ) : null}
        </div>
      ) : (
        <StripeFormContent
          {...props}
          clientSecret={clientSecret}
          sessionExpired={sessionExpired}
          onSessionExpired={() => setSessionExpired(true)}
        />
      )}
    </Elements>
  );
}
