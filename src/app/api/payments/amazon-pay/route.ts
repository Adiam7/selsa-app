/**
 * Amazon Pay API Integration
 * US-specific payment method for trust & speed
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

type AmazonPayEnv = 'sandbox' | 'live';

type CreateAmazonPaySessionRequest = {
  action: 'create';
  amount: string; // "12.34"
  currency: string; // "USD"
  cartId: number;
  customerEmail?: string;
  returnUrl: string;
  cancelUrl: string;
  billingAddress?: {
    name: string;
    addressLine1: string;
    city: string;
    stateOrRegion: string;
    postalCode: string;
    countryCode: string;
  };
};

type CaptureAmazonPayOrderRequest = {
  action: 'capture';
  chargePermissionId: string;
  chargeId: string;
};

interface AmazonPayConfig {
  merchantId: string;
  publicKeyId: string;
  privateKey: string;
  environment: AmazonPayEnv;
  region: 'us' | 'eu' | 'jp';
}

/**
 * POST /api/payments/amazon-pay
 * Handle Amazon Pay payment flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return await handleCreateSession(body as CreateAmazonPaySessionRequest);
      case 'capture':
        return await handleCapturePayment(body as CaptureAmazonPayOrderRequest);
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Must be "create" or "capture"'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Amazon Pay API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Amazon Pay processing failed'
    }, { status: 500 });
  }
}

/**
 * Create Amazon Pay checkout session
 */
async function handleCreateSession(request: CreateAmazonPaySessionRequest): Promise<NextResponse> {
  const {
    amount,
    currency,
    cartId,
    customerEmail,
    returnUrl,
    cancelUrl,
    billingAddress
  } = request;

  // Validate required fields
  if (!amount || !currency || !cartId || !returnUrl) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: amount, currency, cartId, returnUrl'
    }, { status: 400 });
  }

  // Validate US-only for Amazon Pay
  if (currency !== 'USD') {
    return NextResponse.json({
      success: false,
      error: 'Amazon Pay is currently only available for USD transactions'
    }, { status: 400 });
  }

  const config = getAmazonPayConfig();
  
  if (!config) {
    return NextResponse.json({
      success: false,
      error: 'Amazon Pay not configured. Please contact support.'
    }, { status: 503 });
  }

  try {
    // Create unique charge permission ID
    const chargePermissionId = generateChargePermissionId();
    
    // Create Amazon Pay session payload
    const sessionPayload = {
      webCheckoutDetails: {
        checkoutReviewReturnUrl: returnUrl,
        checkoutCancelUrl: cancelUrl || returnUrl,
        checkoutResultReturnUrl: `${returnUrl}?amazon_pay=success`
      },
      paymentDetails: {
        paymentIntent: 'AuthorizeWithCapture',
        canHandlePendingAuthorization: true,
        chargeAmount: {
          amount,
          currencyCode: currency
        },
        presentmentCurrency: currency,
        allowOvercharge: false,
        allowPartialCapture: true,
        softDescriptor: 'Selsa Store Purchase'
      },
      merchantMetadata: {
        merchantReferenceId: `cart-${cartId}`,
        merchantStoreName: 'Selsa',
        noteToBuyer: 'Thank you for your purchase!',
        customInformation: customerEmail ? `Customer: ${customerEmail}` : ''
      },
      supplementaryData: JSON.stringify({
        cartId,
        customerEmail: customerEmail || null,
        timestamp: new Date().toISOString()
      }),
      addressDetails: billingAddress ? {
        name: billingAddress.name,
        addressLine1: billingAddress.addressLine1,
        city: billingAddress.city,
        stateOrRegion: billingAddress.stateOrRegion,
        postalCode: billingAddress.postalCode,
        countryCode: billingAddress.countryCode
      } : undefined
    };

    // Create signature for Amazon Pay API
    const signature = createAmazonPaySignature(sessionPayload, config);
    
    // Make request to Amazon Pay API
    const amazonResponse = await fetch(`${getAmazonPayApiUrl(config)}/checkoutSessions`, {
      method: 'POST',
      headers: {
        'Authorization': `AMZN-PAY-RSASSA-PSS ${signature}`,
        'Content-Type': 'application/json',
        'X-Amz-Pay-Idempotency-Key': chargePermissionId,
        'X-Amz-Pay-Host': getAmazonPayHost(config),
        'X-Amz-Pay-Region': config.region.toUpperCase()
      },
      body: JSON.stringify(sessionPayload)
    });

    if (!amazonResponse.ok) {
      const error = await amazonResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Amazon Pay API error: ${error.message || amazonResponse.statusText}`);
    }

    const session = await amazonResponse.json();

    return NextResponse.json({
      success: true,
      amazonPay: {
        sessionId: session.checkoutSessionId,
        webCheckoutUrl: session.webCheckoutDetails?.amazonPayRedirectUrl,
        chargePermissionId,
        amount,
        currency
      },
      instructions: [
        'You will be redirected to Amazon Pay',
        'Log in to your Amazon account',
        'Select your payment method and delivery address',
        'Review and confirm your order',
        'You will be redirected back to complete your purchase'
      ]
    });

  } catch (error: any) {
    console.error('Amazon Pay session creation failed:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to create Amazon Pay session: ${error.message}`
    }, { status: 500 });
  }
}

/**
 * Capture Amazon Pay payment after authorization
 */
async function handleCapturePayment(request: CaptureAmazonPayOrderRequest): Promise<NextResponse> {
  const { chargePermissionId, chargeId } = request;

  if (!chargePermissionId || !chargeId) {
    return NextResponse.json({
      success: false,
      error: 'Missing required fields: chargePermissionId, chargeId'
    }, { status: 400 });
  }

  const config = getAmazonPayConfig();
  
  if (!config) {
    return NextResponse.json({
      success: false,
      error: 'Amazon Pay not configured'
    }, { status: 503 });
  }

  try {
    const capturePayload = {
      captureAmount: {
        amount: '0', // Will be set to authorized amount
        currencyCode: 'USD'
      },
      softDescriptor: 'Selsa Purchase'
    };

    const signature = createAmazonPaySignature(capturePayload, config);

    const amazonResponse = await fetch(`${getAmazonPayApiUrl(config)}/charges/${chargeId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `AMZN-PAY-RSASSA-PSS ${signature}`,
        'Content-Type': 'application/json',
        'X-Amz-Pay-Idempotency-Key': `capture-${chargeId}-${Date.now()}`,
        'X-Amz-Pay-Host': getAmazonPayHost(config),
        'X-Amz-Pay-Region': config.region.toUpperCase()
      },
      body: JSON.stringify(capturePayload)
    });

    if (!amazonResponse.ok) {
      const error = await amazonResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Amazon Pay capture failed: ${error.message || amazonResponse.statusText}`);
    }

    const captureResult = await amazonResponse.json();

    return NextResponse.json({
      success: true,
      capture: {
        captureId: captureResult.captureId,
        status: captureResult.statusDetails?.state,
        amount: captureResult.captureAmount?.amount,
        currency: captureResult.captureAmount?.currencyCode
      }
    });

  } catch (error: any) {
    console.error('Amazon Pay capture failed:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to capture Amazon Pay payment: ${error.message}`
    }, { status: 500 });
  }
}

/**
 * Get Amazon Pay configuration from environment
 */
function getAmazonPayConfig(): AmazonPayConfig | null {
  const merchantId = process.env.AMAZON_PAY_MERCHANT_ID;
  const publicKeyId = process.env.AMAZON_PAY_PUBLIC_KEY_ID;
  const privateKey = process.env.AMAZON_PAY_PRIVATE_KEY;
  const environment = (process.env.AMAZON_PAY_ENVIRONMENT || 'sandbox') as AmazonPayEnv;
  const region = (process.env.AMAZON_PAY_REGION || 'us') as 'us' | 'eu' | 'jp';

  if (!merchantId || !publicKeyId || !privateKey) {
    console.warn('Amazon Pay configuration missing. Required: AMAZON_PAY_MERCHANT_ID, AMAZON_PAY_PUBLIC_KEY_ID, AMAZON_PAY_PRIVATE_KEY');
    return null;
  }

  return {
    merchantId,
    publicKeyId,
    privateKey,
    environment,
    region
  };
}

/**
 * Get Amazon Pay API URL based on environment
 */
function getAmazonPayApiUrl(config: AmazonPayConfig): string {
  const baseUrls = {
    sandbox: {
      us: 'https://pay-api.amazon.com/sandbox',
      eu: 'https://pay-api.amazon.eu/sandbox',
      jp: 'https://pay-api.amazon.co.jp/sandbox'
    },
    live: {
      us: 'https://pay-api.amazon.com/live',
      eu: 'https://pay-api.amazon.eu/live', 
      jp: 'https://pay-api.amazon.co.jp/live'
    }
  };

  return baseUrls[config.environment][config.region];
}

/**
 * Get Amazon Pay host for headers
 */
function getAmazonPayHost(config: AmazonPayConfig): string {
  const hosts = {
    us: 'pay-api.amazon.com',
    eu: 'pay-api.amazon.eu',
    jp: 'pay-api.amazon.co.jp'
  };

  return hosts[config.region];
}

/**
 * Create signature for Amazon Pay API request
 */
function createAmazonPaySignature(payload: any, config: AmazonPayConfig): string {
  // Amazon Pay requires RSASSA-PSS signature
  // This is a simplified version - in production, use the official Amazon Pay SDK
  
  const stringToSign = JSON.stringify(payload);
  const privateKey = config.privateKey.replace(/\\n/g, '\n');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign);
  
  const signature = sign.sign(privateKey, 'base64');
  
  return `PublicKeyId=${config.publicKeyId}, Signature=${signature}`;
}

/**
 * Generate unique charge permission ID
 */
function generateChargePermissionId(): string {
  return `cp_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * GET /api/payments/amazon-pay/status
 * Check Amazon Pay availability
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const currency = searchParams.get('currency');
  
  const config = getAmazonPayConfig();
  
  return NextResponse.json({
    available: !!config && currency === 'USD' && ['US'].includes(country?.toUpperCase() || ''),
    configured: !!config,
    supportedCountries: ['US'],
    supportedCurrencies: ['USD'],
    testMode: config?.environment === 'sandbox',
    requirements: [
      'US shipping address',
      'Amazon account',
      'Valid payment method on Amazon account'
    ]
  });
}