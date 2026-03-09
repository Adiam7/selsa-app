# Payments setup (Stripe + PayPal)

This project supports:

- **Stripe**: Card + **Apple Pay** + **Google Pay** + (optionally) **Klarna / Afterpay-Clearpay / Affirm**
- **PayPal**: Redirect + capture flow

## 1) Environment variables

Frontend (Next.js):

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional, used as a return URL fallback)

PayPal:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV` (`sandbox` or `live`, defaults to `sandbox`)

## 2) Apple Pay (Stripe)

Apple Pay requires **domain verification** in Stripe.

- In Stripe Dashboard, enable Apple Pay for your account.
- Add/verify your domain in **Settings → Payment methods → Apple Pay**.
- Stripe will ask you to host an Apple verification file at:
  - `https://YOUR_DOMAIN/.well-known/apple-developer-merchantid-domain-association`

Place that file in:

- `public/.well-known/apple-developer-merchantid-domain-association`

Notes:

- Apple Pay requires **HTTPS** in production.
- Local testing typically needs an HTTPS tunnel (e.g. ngrok) or a real HTTPS domain.

## 3) Google Pay (Stripe)

- Enable Google Pay in Stripe Dashboard.
- Test on Chrome with a Google Pay-capable profile.

Notes:

- Like Apple Pay, it generally requires HTTPS for reliable testing.

## 4) Checkout behavior in this repo

- Apple Pay / Google Pay are handled via Stripe **Payment Request Button** when available.
- If the wallet is not available on the user’s device/browser, the UI shows a warning and falls back to the Stripe Payment Element.

Key files:

- `src/components/StripePaymentForm.tsx`
- `src/app/api/payments/stripe/route.ts`
- `src/app/api/payments/paypal/route.ts`
