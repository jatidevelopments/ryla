# Payment Type Support Matrix

## Overview

This document outlines which payment providers support subscriptions vs one-time payments.

## Support Matrix

| Provider | Subscriptions | One-Time Payments | Implementation Status |
|----------|--------------|-------------------|----------------------|
| **Stripe** | ✅ Yes | ✅ Yes | ✅ **FULLY IMPLEMENTED** - Both modes supported |
| **Finby** | ✅ Yes (v1) | ✅ Yes | API v3 (popup) only supports one-time. API v1 supports both subscriptions and one-time payments. |
| **PayPal** | ✅ Yes | ✅ Yes | ✅ **FULLY IMPLEMENTED** - Both types via metadata flag |
| **TrustPay** | ✅ Yes | ✅ Yes | ⚠️ **NOT YET IMPLEMENTED** - Will support both (based on MDC) |
| **Shift4** | ✅ Yes | ✅ Yes | ⚠️ **NOT YET IMPLEMENTED** - Will support both (based on MDC) |

## Current Implementation Details

### ✅ Stripe - **BOTH SUPPORTED**
- **Subscriptions**: ✅ Fully implemented
  - Uses `mode: 'subscription'` (default)
  - Creates recurring subscription checkout
- **One-Time Payments**: ✅ **NOW IMPLEMENTED**
  - Uses `mode: 'payment'`
  - Creates one-time payment checkout

**Usage:**
```typescript
// Subscription (default)
const subscriptionSession = await stripe.createCheckoutSession({
  priceId: 'price_xxx',
  userId: 'user_123',
  successUrl: '/success',
  cancelUrl: '/cancel',
  // mode defaults to 'subscription'
});

// One-time payment
const paymentSession = await stripe.createCheckoutSession({
  priceId: 'price_yyy',
  userId: 'user_123',
  mode: 'payment', // NEW - enables one-time payment
  successUrl: '/success',
  cancelUrl: '/cancel',
});
```

### ✅ Finby - **BOTH SUPPORTED** (API v1) / **ONE-TIME ONLY** (API v3)
- **Subscriptions**: ✅ Fully implemented in API v1
  - Use `mode: 'subscription'` or `metadata: { isSubscription: 'true' }`
  - API v3 does not support subscriptions
- **One-Time Payments**: ✅ Fully implemented in both APIs
  - API v3: Popup-based one-time payments
  - API v1: REST-based one-time payments

**Usage:**
```typescript
// Finby API v3 - One-time payment only
const finbyV3 = createPaymentProvider('finby', {
  projectId: process.env.FINBY_PROJECT_ID!,
  secretKey: process.env.FINBY_SECRET_KEY!,
  apiVersion: 'v3',
});

const session = await finbyV3.createCheckoutSession({
  productId: 123,
  amount: 2999, // in cents
  email: 'user@example.com',
  successUrl: '/success',
  cancelUrl: '/cancel',
});

// Finby API v1 - Both subscription and one-time payments
const finbyV1 = createPaymentProvider('finby', {
  apiKey: process.env.FINBY_API_KEY!,
  merchantId: process.env.FINBY_MERCHANT_ID!,
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

### ✅ PayPal - **BOTH SUPPORTED**
- **Subscriptions**: ✅ Fully implemented
- **One-Time Payments**: ✅ Fully implemented
  - Uses `metadata.isSubscription` to determine payment type
  - Subscriptions: Creates billing subscription
  - One-time: Creates order with CAPTURE intent

**Usage:**
```typescript
// Subscription
const subscriptionSession = await paypal.createCheckoutSession({
  priceId: 'plan_xxx',
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

### ⚠️ TrustPay - **BOTH WILL BE SUPPORTED** (Not Yet Implemented)
- **Subscriptions**: ✅ Will support (based on MDC implementation)
- **One-Time Payments**: ✅ Will support (based on MDC implementation)
  - Uses `product.is_subscription` flag
  - Supports card tokenization for recurring payments
  - Server-initiated payments using card hash

### ⚠️ Shift4 - **BOTH WILL BE SUPPORTED** (Not Yet Implemented)
- **Subscriptions**: ✅ Will support (based on MDC implementation)
- **One-Time Payments**: ✅ Will support (based on MDC implementation)
  - Uses `product.is_subscription` flag
  - Creates plans for subscriptions
  - Creates charges for one-time payments

## Summary

### ✅ Fully Implemented & Support Both
1. **Stripe** - ✅ Subscriptions & One-time payments
2. **PayPal** - ✅ Subscriptions & One-time payments
3. **Finby API v1** - ✅ Subscriptions & One-time payments

### ✅ Implemented But Limited
4. **Finby API v3** - ✅ One-time payments only (popup-based)

### ⚠️ Planned (Not Yet Implemented)
4. **TrustPay** - Will support both
5. **Shift4** - Will support both

## Recommendations

### Completed ✅
- ✅ Added one-time payment support to Stripe provider

### Future Work
1. **Add subscription support to Finby API v1**
   - Implement REST API v1 for subscription-based payments
   - Keep API v3 for one-time payments (funnel)

2. **Implement TrustPay and Shift4**
   - Both support subscriptions and one-time payments
   - Can follow MDC implementation patterns
