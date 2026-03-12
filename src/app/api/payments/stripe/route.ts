import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * POST /api/payments/stripe
 * Creates a Stripe PaymentIntent and returns a client_secret.
 *
 * IMPORTANT: Never send raw card numbers to your server.
 * Card/wallet/BNPL details are collected via Stripe Elements in the browser.
 */

type CreateIntentRequest = {
  amount: number;
  currency?: string; // e.g. "usd"
  preferredPaymentMethod?: string; // any SupportedStripeMethod value from the checkout
  amountInCents?: boolean;
  preflight?: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  stripePaymentMethodTypes?: string[]; // explicit Stripe types override
};

/**
 * Currency allow-lists for payment methods that only support specific currencies.
 * Card-based methods (card, apple-pay, google-pay) work with all currencies.
 */
const CURRENCY_RESTRICTIONS: Record<string, Set<string>> = {
  klarna:             new Set(['eur', 'dkk', 'gbp', 'nok', 'sek', 'czk', 'ron', 'pln', 'chf', 'usd', 'aud', 'cad', 'nzd']),
  afterpay_clearpay:  new Set(['aud', 'cad', 'gbp', 'nzd', 'eur']),
  affirm:             new Set(['usd', 'cad']),
  ideal:              new Set(['eur']),
  bancontact:         new Set(['eur']),
  sofort:             new Set(['eur']),
  giropay:            new Set(['eur']),
  eps:                new Set(['eur']),
  sepa_debit:         new Set(['eur']),
  bacs_debit:         new Set(['gbp']),
};

/**
 * Maps a preferred payment method identifier (checkout-side) to the
 * Stripe `payment_method_types` values.
 *
 * Returns `null` when `automatic_payment_methods` should be used instead,
 * or when the requested method doesn't support the given currency.
 */
function mapPreferredMethodToStripeTypes(
  preferred?: string,
  currency?: string
): Stripe.PaymentIntentCreateParams['payment_method_types'] | null {
  if (!preferred) return null;

  const map: Record<string, string[]> = {
    // Global / wallets
    'card':             ['card'],
    'apple':            ['card'],
    'google':           ['card'],
    'apple-pay':        ['card'],
    'google-pay':       ['card'],
    // BNPL
    'klarna':           ['klarna'],
    'klarna-uk':        ['klarna'],
    'afterpay':         ['afterpay_clearpay'],
    'affirm':           ['affirm'],
    // European
    'ideal':            ['ideal'],
    'bancontact':       ['bancontact'],
    'sofort':           ['sofort'],
    'giropay':          ['giropay'],
    'eps':              ['eps'],
    'sepa-debit':       ['sepa_debit'],
    // UK
    'bacs':             ['bacs_debit'],
  };

  const stripeTypes = map[preferred];
  if (!stripeTypes) return null;

  // Validate currency compatibility to avoid noisy Stripe API errors
  if (currency) {
    const cur = currency.toLowerCase();
    for (const sType of stripeTypes) {
      const allowed = CURRENCY_RESTRICTIONS[sType];
      if (allowed && !allowed.has(cur)) {
        console.warn(
          `[Stripe] Skipping ${sType} — currency "${cur}" not supported (allowed: ${[...allowed].join(', ')})`
        );
        return null; // fall through to automatic_payment_methods
      }
    }
  }

  return stripeTypes;
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in the environment.',
        },
        { status: 501 }
      );
    }

    const body = (await request.json()) as CreateIntentRequest;
    const rawAmount = Number(body.amount);
    const currency = (body.currency || 'usd').toLowerCase();
    const preferredPaymentMethod = body.preferredPaymentMethod;
    const preflight = Boolean(body.preflight);
    const metadata = body.metadata || {};
    const isAmountInCents = Boolean(body.amountInCents);

    if (!Number.isFinite(rawAmount)) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Minimum is 50 cents.' },
        { status: 400 }
      );
    }

    const amount = Math.round(isAmountInCents ? rawAmount : rawAmount * 100);

    if (amount < 50) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Minimum is 50 cents.' },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const requestedStripeMethodTypes = (body.stripePaymentMethodTypes || []).filter(Boolean);
    const paymentMethodTypes = requestedStripeMethodTypes.length
      ? requestedStripeMethodTypes
      : mapPreferredMethodToStripeTypes(preferredPaymentMethod, currency);

    const paymentMethodOptions: Stripe.PaymentIntentCreateParams['payment_method_options'] =
      (() => {
        switch (preferredPaymentMethod) {
          case 'klarna':
          case 'klarna-uk':
            return { klarna: { preferred_locale: 'en-US' } };
          case 'sofort':
            return { sofort: { preferred_language: 'en' } };
          default:
            return undefined;
        }
      })();

    const normalizedMetadata = Object.fromEntries(
      Object.entries({ ...metadata, preferredPaymentMethod: preferredPaymentMethod ?? '' }).map(([key, value]) => [
        key,
        value == null ? '' : String(value),
      ])
    );

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      metadata: normalizedMetadata,
      ...(paymentMethodTypes
        ? {
            payment_method_types: paymentMethodTypes,
            payment_method_options: paymentMethodOptions,
          }
        : { automatic_payment_methods: { enabled: true } }),
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    if (preflight) {
      // Cancel immediately so these test PaymentIntents don't accumulate.
      // Cancellation is allowed for intents in requires_payment_method.
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (e) {
        // Ignore cancellation failures; preflight is still informative.
        console.warn('Stripe preflight cancel failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      preflight,
    });
  } catch (error: any) {
    console.error('Stripe PaymentIntent error:', error);
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return NextResponse.json(
        { success: false, error: error?.message || 'Unsupported payment configuration' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
