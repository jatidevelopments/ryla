# @ryla/payments

Unified payment abstraction layer supporting multiple providers.

## Providers

- **Stripe** - Full subscription lifecycle (future)
- **Finby** - Current payment provider for funnel

## Usage

```typescript
import {
  createPaymentProvider,
  StripeProvider,
  FinbyProvider,
} from '@ryla/payments';

// Stripe (for main app)
const stripe = createPaymentProvider('stripe', {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
});

// Finby (for funnel)
const finby = createPaymentProvider('finby', {
  apiKey: process.env.FINBY_API_KEY!,
  merchantId: process.env.FINBY_MERCHANT_ID!,
});

// Create checkout session
const session = await stripe.createCheckoutSession({
  priceId: 'price_xxx',
  userId: 'user_123',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// Handle webhook
const event = await stripe.handleWebhook(rawBody, signature);
```

## Configuration

```typescript
// config/payments.ts
export const paymentsConfig = {
  defaultProvider: 'stripe',
  stripe: {
    plans: {
      free: { priceId: '', name: 'Free', monthlyPrice: 0 },
      basic: { priceId: 'price_xxx', name: 'Basic', monthlyPrice: 9.9 },
      pro: { priceId: 'price_yyy', name: 'Pro', monthlyPrice: 29.9 },
    },
  },
};
```

## Webhook Events

Both providers normalize events to:

```typescript
type PaymentEvent =
  | { type: 'checkout.completed'; userId: string; subscriptionId: string }
  | { type: 'subscription.updated'; subscriptionId: string; status: string }
  | { type: 'subscription.cancelled'; subscriptionId: string }
  | { type: 'payment.failed'; subscriptionId: string };
```
