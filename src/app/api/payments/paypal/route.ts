import { NextRequest, NextResponse } from 'next/server';

type PayPalEnv = 'sandbox' | 'live';

type CreatePayPalOrderRequest = {
  action: 'create';
  amount: string; // "12.34"
  currency: string; // "USD"
  cartId: number;
  customerEmail?: string;
  returnUrl: string;
  cancelUrl: string;
};

type CapturePayPalOrderRequest = {
  action: 'capture';
  orderId: string;
};

async function getPayPalAccessToken(env: PayPalEnv, clientId: string, clientSecret: string) {
  const base = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || 'Failed to authenticate with PayPal');
  }

  return { base, accessToken: data.access_token as string };
}

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const env = ((process.env.PAYPAL_ENV || 'sandbox').toLowerCase() === 'live' ? 'live' : 'sandbox') as PayPalEnv;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
        },
        { status: 501 }
      );
    }

    const body = (await request.json()) as CreatePayPalOrderRequest | CapturePayPalOrderRequest;

    const { base, accessToken } = await getPayPalAccessToken(env, clientId, clientSecret);

    if (body.action === 'create') {
      const { amount, currency, cartId, customerEmail, returnUrl, cancelUrl } = body;
      if (!amount || !currency || !cartId || !returnUrl || !cancelUrl) {
        return NextResponse.json(
          { success: false, error: 'Missing required payment information' },
          { status: 400 }
        );
      }

      const createRes = await fetch(`${base}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              custom_id: String(cartId),
              amount: {
                currency_code: currency.toUpperCase(),
                value: amount,
              },
            },
          ],
          payer: customerEmail ? { email_address: customerEmail } : undefined,
          application_context: {
            return_url: returnUrl,
            cancel_url: cancelUrl,
            user_action: 'PAY_NOW',
          },
        }),
        cache: 'no-store',
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        return NextResponse.json(
          { success: false, error: createData?.message || 'Failed to create PayPal order' },
          { status: 400 }
        );
      }

      const approvalUrl = (createData?.links || []).find((l: any) => l.rel === 'approve')?.href;
      if (!approvalUrl) {
        return NextResponse.json(
          { success: false, error: 'PayPal approval URL not found' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        redirectUrl: approvalUrl,
        orderId: createData.id,
      });
    }

    if (body.action === 'capture') {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
      }

      const capRes = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      const capData = await capRes.json();
      if (!capRes.ok) {
        return NextResponse.json(
          { success: false, error: capData?.message || 'Failed to capture PayPal order' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        status: capData?.status,
        orderId: capData?.id,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('PayPal payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'PayPal payment failed' },
      { status: 500 }
    );
  }
}
