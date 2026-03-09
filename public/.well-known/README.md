# .well-known

This directory is used for domain verification files.

## Apple Pay (Stripe)

Stripe requires hosting the Apple Pay domain verification file at:

`/.well-known/apple-developer-merchantid-domain-association`

Steps:

1. Download the verification file from Stripe Dashboard.
2. Save it as:
   `public/.well-known/apple-developer-merchantid-domain-association`
3. Deploy and verify in Stripe.

Do not rename the file.
