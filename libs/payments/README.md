# @ryla/payments

Unified payment abstraction layer supporting multiple payment providers with a consistent API.

## Features

- ✅ **Multiple Providers**: Stripe, Finby, PayPal, TrustPay, Shift4
- ✅ **Subscriptions & One-Time Payments**: Support for both payment types
- ✅ **Unified API**: Same interface across all providers
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Webhook Handling**: Built-in webhook parsing and verification
- ✅ **Customer Management**: Optional customer creation and retrieval
- ✅ **Payment Status**: Query payment status across providers
- ✅ **Chargeback Handling**: Chargeback event support across all providers

## Installation

```bash
pnpm add @ryla/payments
```

## Quick Start

```typescript
import { createPaymentProvider } from '@ryla/payments';

// Create a provider
const stripe = createPaymentProvider('stripe', {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
});

// Create a checkout session
const session = await stripe.createCheckoutSession({
  priceId: 'price_xxx',
  userId: 'user_123',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// Redirect user to session.url
```

## Providers

### Stripe ✅

**Status**: Fully implemented  
**Supports**: Subscriptions & One-Time Payments

```typescript
const stripe = createPaymentProvider('stripe', {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY, // Optional
});

// Subscription (default)
const subscriptionSession = await stripe.createCheckoutSession({
  priceId: 'price_sub_xxx',
  userId: 'user_123',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// One-time payment
const paymentSession = await stripe.createCheckoutSession({
  priceId: 'price_one_xxx',
  userId: 'user_123',
  mode: 'payment', // Enable one-time payment
  successUrl: '/success',
  cancelUrl: '/cancel',
});
```

**Features:**
- ✅ Subscriptions (default mode)
- ✅ One-time payments (`mode: 'payment'`)
- ✅ Billing portal
- ✅ Refunds
- ✅ Customer management
- ✅ Webhook verification

### Finby ✅

**Status**: Fully implemented  
**Supports**: 
- API v3: One-Time Payments only (popup-based)
- API v1: Subscriptions & One-Time Payments (REST-based)

```typescript
// Finby API v3 (popup-based) - One-time payments only
const finbyV3 = createPaymentProvider('finby', {
  projectId: process.env.FINBY_PROJECT_ID!,
  secretKey: process.env.FINBY_SECRET_KEY!,
  apiVersion: 'v3',
});

// One-time payment
const session = await finbyV3.createCheckoutSession({
  productId: 123,
  amount: 2999, // in cents
  email: 'user@example.com',
  successUrl: '/success',
  cancelUrl: '/cancel',
  billingCity: 'New York',
  billingCountry: 'US',
  billingPostcode: '10001',
  billingStreet: '123 Main St',
});

// Finby API v1 (REST-based) - Subscriptions & One-time payments
const finbyV1 = createPaymentProvider('finby', {
  apiKey: process.env.FINBY_API_KEY!,
  merchantId: process.env.FINBY_MERCHANT_ID!,
  webhookSecret: process.env.FINBY_WEBHOOK_SECRET!,
  apiVersion: 'v1',
});

// Subscription
const subscriptionSession = await finbyV1.createCheckoutSession({
  priceId: 'price_xxx',
  userId: 'user_123',
  email: 'user@example.com',
  mode: 'subscription', // or metadata: { isSubscription: 'true' }
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// One-time payment
const paymentSession = await finbyV1.createCheckoutSession({
  priceId: 'price_yyy',
  userId: 'user_123',
  email: 'user@example.com',
  successUrl: '/success',
  cancelUrl: '/cancel',
});
```

**Features:**
- ✅ One-time payments (API v3 & v1)
- ✅ Subscriptions (API v1 only)
- ✅ Subscription management (get, cancel)
- ✅ Webhook verification (both APIs)
- ✅ Reference generation utilities

### PayPal ✅

**Status**: Fully implemented  
**Supports**: Subscriptions & One-Time Payments

```typescript
const paypal = createPaymentProvider('paypal', {
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  webhookId: process.env.PAYPAL_WEBHOOK_ID!,
  url: process.env.PAYPAL_API_URL!, // 'https://api.sandbox.paypal.com' or 'https://api.paypal.com'
  environment: 'sandbox', // or 'live'
});

// Subscription
const subscriptionSession = await paypal.createCheckoutSession({
  priceId: 'plan_xxx', // PayPal plan ID
  userId: 'user_123',
  metadata: { isSubscription: 'true' },
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// One-time payment
const paymentSession = await paypal.createCheckoutSession({
  priceId: 'price_yyy',
  userId: 'user_123',
  amount: 2999, // in cents
  metadata: { isSubscription: 'false' },
  successUrl: '/success',
  cancelUrl: '/cancel',
});
```

**Features:**
- ✅ Subscriptions
- ✅ One-time payments
- ✅ Subscription management
- ✅ Payment status checking
- ✅ Refunds
- ✅ Webhook verification
- ✅ Access token caching

### TrustPay ✅

**Status**: Fully implemented  
**Supports**: Subscriptions & One-Time Payments

```typescript
const trustpay = createPaymentProvider('trustpay', {
  url: process.env.TRUSTPAY_API_URL!,
  tokenUrl: process.env.TRUSTPAY_TOKEN_URL!,
  tpUsername: process.env.TRUSTPAY_USERNAME!,
  tpSecret: process.env.TRUSTPAY_SECRET!,
});

// Subscription checkout
const subscriptionSession = await trustpay.createCheckoutSession({
  priceId: 'plan_xxx',
  userId: 'user_123',
  email: 'user@example.com',
  mode: 'subscription',
  amount: 2999, // in cents
  currency: 'EUR',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// One-time payment
const paymentSession = await trustpay.createCheckoutSession({
  priceId: 'product_xxx',
  userId: 'user_123',
  email: 'user@example.com',
  amount: 2999,
  currency: 'EUR',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// Recurring payment using card token
const recurring = await trustpay.createRecurringPayment({
  cardToken: 'token_xxx',
  amount: 2999,
  currency: 'EUR',
  customerId: 'customer_xxx',
});

// Recover failed recurring payment
const recovery = await trustpay.recoverRecurringPayment({
  paymentId: 'payment_xxx',
  retryAttempt: 1,
  cardToken: 'token_xxx',
});
```

**Features:**
- ✅ Subscriptions & One-time payments
- ✅ Card tokenization for recurring payments
- ✅ Server-initiated payments
- ✅ Recurring payment recovery with retry logic
- ✅ Customer management
- ✅ Payment status checking
- ✅ Webhook handling (multiple types)
- ✅ Chargeback handling

### Shift4 ✅

**Status**: Fully implemented  
**Supports**: Subscriptions & One-Time Payments

```typescript
const shift4 = createPaymentProvider('shift4', {
  apiUrl: process.env.SHIFT4_API_URL!,
  secretKey: process.env.SHIFT4_SECRET_KEY!,
  publishableKey: process.env.SHIFT4_PUBLISHABLE_KEY!,
  webhookSecret: process.env.SHIFT4_WEBHOOK_SECRET!,
  tosUrl: process.env.SHIFT4_TOS_URL, // Optional
});

// Subscription checkout
const subscriptionSession = await shift4.createCheckoutSession({
  priceId: 'plan_xxx',
  userId: 'user_123',
  email: 'user@example.com',
  mode: 'subscription',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// One-time charge checkout
const chargeSession = await shift4.createCheckoutSession({
  priceId: 'product_xxx',
  userId: 'user_123',
  email: 'user@example.com',
  amount: 2999, // in cents
  currency: 'USD',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// Charge using payment token
const charge = await shift4.createChargeFromToken({
  token: 'token_xxx',
  amount: 2999,
  currency: 'USD',
  customerId: 'customer_xxx',
});
```

**Features:**
- ✅ Subscriptions & One-time payments
- ✅ Customer creation and management
- ✅ Signed checkout requests (HMAC SHA256)
- ✅ Token-based payments
- ✅ Subscription management
- ✅ Payment status checking
- ✅ Webhook verification
- ✅ Chargeback handling

## Core API

### Checkout Sessions

All providers support creating checkout sessions:

```typescript
const session = await provider.createCheckoutSession({
  priceId: 'price_xxx', // Provider-specific price/plan ID
  userId: 'user_123',
  email: 'user@example.com', // Optional
  successUrl: '/success',
  cancelUrl: '/cancel',
  metadata: { /* custom data */ },
  
  // Provider-specific options
  mode: 'subscription' | 'payment', // Stripe, Finby v1
  amount: 2999, // Finby v3, PayPal (in cents)
  // ... other provider-specific params
});

// Redirect user to session.url
```

### Subscriptions

```typescript
// Get subscription
const subscription = await provider.getSubscription('sub_xxx');

// Cancel subscription
await provider.cancelSubscription('sub_xxx', immediately: false);
```

### Webhooks

```typescript
// Parse webhook event
const event = await provider.parseWebhookEvent(rawBody, signature);

switch (event.type) {
  case 'checkout.completed':
    // Handle successful checkout
    break;
  case 'subscription.created':
    // Handle new subscription
    break;
  case 'payment.succeeded':
    // Handle successful payment
    break;
  // ... other event types
}
```

### Customer Management

```typescript
// Create customer (if supported)
const customer = await provider.createCustomer?.({
  email: 'user@example.com',
  userId: 'user_123',
  metadata: { /* custom data */ },
});

// Get customer (if supported)
const customer = await provider.getCustomer?.(customerId);
```

### Payment Status

```typescript
// Get payment status (if supported)
const status = await provider.getPaymentStatus?.(paymentId);
```

## Webhook Events

All providers normalize events to a common format:

```typescript
type PaymentEvent =
  | { type: 'checkout.completed'; data: { userId: string; subscriptionId: string; ... } }
  | { type: 'subscription.created'; data: { subscriptionId: string; ... } }
  | { type: 'subscription.updated'; data: { subscriptionId: string; status: string; ... } }
  | { type: 'subscription.cancelled'; data: { subscriptionId: string; ... } }
  | { type: 'subscription.renewed'; data: { subscriptionId: string; ... } }
  | { type: 'subscription.suspended'; data: { subscriptionId: string; ... } }
  | { type: 'subscription.activated'; data: { subscriptionId: string; ... } }
  | { type: 'payment.succeeded'; data: { invoiceId: string; amount: number; ... } }
  | { type: 'payment.failed'; data: { invoiceId: string; error?: string; ... } }
  | { type: 'refund.created'; data: { refundId: string; amount: number; ... } }
  | { type: 'chargeback.created'; data: { chargeId: string; amount: number; ... } };
```

## Webhook Handlers

Helper functions for Next.js API routes:

### Stripe

```typescript
import { createStripeWebhookHandler } from '@ryla/payments';

const handler = createStripeWebhookHandler({
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  onCheckoutCompleted: async (event) => {
    // Handle checkout completion
  },
  onSubscriptionUpdated: async (event) => {
    // Handle subscription update
  },
});

// In Next.js API route
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  return await handler(rawBody, signature);
}
```

### Finby API v3

```typescript
import { createFinbyV3WebhookHandler } from '@ryla/payments';

const handler = createFinbyV3WebhookHandler({
  projectId: process.env.FINBY_PROJECT_ID!,
  secretKey: process.env.FINBY_SECRET_KEY!,
  onPaymentSucceeded: async (event) => {
    // Handle successful payment
  },
  onPaymentFailed: async (event) => {
    // Handle failed payment
  },
});

// In Next.js API route
export async function POST(request: Request) {
  const url = new URL(request.url);
  const signature = url.searchParams.get('Signature') || '';
  const rawBody = await request.text();
  return await handler(rawBody, signature);
}
```

## Utilities

### Finby Reference Generation

```typescript
import { generateFinbyReference, isFunnelReference } from '@ryla/payments';

// Generate a payment reference
const reference = generateFinbyReference(); // "RYLAFL-REF-1234567890-abc123"

// Check if reference belongs to funnel
if (isFunnelReference(reference)) {
  // Handle funnel payment
}
```

## Environment Variables

### Stripe
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_... # Optional
```

### Finby
```bash
# API v3 (popup-based)
FINBY_PROJECT_ID=...
FINBY_SECRET_KEY=...

# API v1 (REST-based)
FINBY_API_KEY=...
FINBY_MERCHANT_ID=...
FINBY_WEBHOOK_SECRET=...
```

### PayPal
```bash
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_API_URL=https://api.sandbox.paypal.com # or https://api.paypal.com
```

## Payment Type Support

| Provider | Subscriptions | One-Time Payments |
|----------|--------------|-------------------|
| **Stripe** | ✅ Yes | ✅ Yes |
| **Finby v3** | ❌ No | ✅ Yes |
| **Finby v1** | ✅ Yes | ✅ Yes |
| **PayPal** | ✅ Yes | ✅ Yes |
| **TrustPay** | ✅ Planned | ✅ Planned |
| **Shift4** | ✅ Planned | ✅ Planned |

See [PAYMENT-TYPE-SUPPORT.md](./docs/PAYMENT-TYPE-SUPPORT.md) for details.

## Error Handling

All providers throw standard errors that you can catch:

```typescript
try {
  const session = await provider.createCheckoutSession(params);
} catch (error) {
  if (error instanceof Error) {
    console.error('Payment error:', error.message);
    // Handle error
  }
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  PaymentProvider,
  PaymentProviderType,
  CheckoutSessionParams,
  CheckoutSession,
  Subscription,
  PaymentEvent,
  Customer,
  PaymentStatus,
} from '@ryla/payments';
```

## Examples

### Complete Subscription Flow

```typescript
import { createPaymentProvider } from '@ryla/payments';

const stripe = createPaymentProvider('stripe', {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
});

// 1. Create checkout session
const session = await stripe.createCheckoutSession({
  priceId: 'price_pro_monthly',
  userId: 'user_123',
  email: 'user@example.com',
  successUrl: 'https://app.ryla.ai/success',
  cancelUrl: 'https://app.ryla.ai/cancel',
  metadata: {
    plan: 'pro',
    source: 'web',
  },
});

// 2. Redirect user to session.url

// 3. Handle webhook (in API route)
const event = await stripe.parseWebhookEvent(rawBody, signature);

if (event.type === 'checkout.completed') {
  // Grant subscription access
  await grantSubscriptionAccess(event.data.userId, event.data.subscriptionId);
}

// 4. Manage subscription
const subscription = await stripe.getSubscription('sub_xxx');
await stripe.cancelSubscription('sub_xxx', immediately: false);
```

## Documentation

- [Payment Type Support](./docs/PAYMENT-TYPE-SUPPORT.md) - Detailed support matrix
- [MDC Payment Analysis](./docs/MDC-PAYMENT-ANALYSIS.md) - Analysis of MDC backend
- [Implementation Summary](./docs/IMPLEMENTATION-SUMMARY.md) - Implementation status

## Contributing

When adding new providers:

1. Create provider class implementing `PaymentProvider` interface
2. Add provider type to `PaymentProviderType`
3. Add config interface
4. Update factory function
5. Export from `index.ts`
6. Add tests
7. Update documentation

## License

MIT
