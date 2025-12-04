# [EPIC] EP-003: Payment & Subscription

## Overview

Finby-based payment system for subscription management, enabling users to pay for premium features.

---

## Business Impact

**Target Metric**: [x] D - Conversion

**Hypothesis**: When we provide a simple, trustworthy payment flow with clear value proposition, users will convert to paid subscribers.

**Success Criteria**:
- Paywall → Payment initiated: **>50%**
- Payment success rate: **>90%**
- Time to payment: **<2 minutes**

---

## Features

### F1: Pricing Display
- Show subscription plans
- Highlight recommended plan
- Feature comparison
- Price display with currency

### F2: Finby Checkout
- Create Finby payment session
- Redirect to Finby hosted payment page
- Handle success redirect
- Handle cancel redirect

### F3: Webhook Handling
- Receive Finby webhooks
- Process subscription created
- Process payment succeeded
- Handle subscription cancelled

### F4: Subscription Status
- Check user subscription status
- Gate features based on plan
- Show subscription in UI
- Handle expired subscriptions

### F5: Subscription Management
- View current subscription
- Cancel subscription
- Handle renewals

---

## Acceptance Criteria

### AC-1: Pricing Page
- [ ] Plans are clearly displayed
- [ ] Features per plan are listed
- [ ] Prices are accurate
- [ ] CTA buttons work

### AC-2: Checkout Flow
- [ ] Clicking "Subscribe" creates Finby session
- [ ] User is redirected to Finby payment page
- [ ] Success redirects to success page
- [ ] Cancel returns to pricing

### AC-3: Payment Processing
- [ ] Webhook receives payment events
- [ ] Subscription is recorded in database
- [ ] User gains access to paid features
- [ ] Confirmation shown to user

### AC-4: Feature Gating
- [ ] Free users see upgrade prompts
- [ ] Paid users can access all features
- [ ] Expired subscriptions lose access
- [ ] Grace period handling (if any)

### AC-5: Subscription Management
- [ ] User can view subscription status
- [ ] User can cancel subscription
- [ ] Cancellation takes effect at period end

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `pricing_viewed` | Pricing page loaded | `plans_shown` |
| `plan_selected` | User clicks plan | `plan_id`, `price` |
| `checkout_started` | Redirect to Finby | `plan_id` |
| `checkout_completed` | Payment success | `plan_id`, `amount` |
| `checkout_abandoned` | User cancels | `plan_id` |
| `subscription_created` | Webhook received | `plan_id`, `customer_id` |
| `subscription_cancelled` | User cancels | `plan_id`, `reason` |

---

## Pricing Tiers (MVP)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 character, 3 images, watermarked |
| **Creator** | $29/mo | Unlimited characters, 50 images/mo, no watermark |

*Note: Keep simple for MVP. Add tiers later based on data.*

---

## User Stories

### ST-010: View Pricing
**As a** user who wants premium features  
**I want to** see pricing options  
**So that** I can choose the right plan

### ST-011: Subscribe
**As a** user ready to pay  
**I want to** complete payment securely  
**So that** I can access premium features

### ST-012: Manage Subscription
**As a** paying subscriber  
**I want to** manage my subscription  
**So that** I can cancel if needed

---

## Technical Notes

### Finby Integration
```typescript
// libs/business/src/services/payment.service.ts

export const paymentService = {
  createCheckoutSession: async (userId: string, productId: string) => {
    const response = await fetch('https://api.finby.eu/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FINBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: process.env.FINBY_MERCHANT_ID,
        product_id: productId,
        success_url: `${baseUrl}/payment/success?session_id={SESSION_ID}`,
        cancel_url: `${baseUrl}/pricing`,
        metadata: { user_id: userId },
      }),
    })
    return response.json()
  },
  
  handleWebhook: async (event: FinbyWebhookEvent) => {
    switch (event.type) {
      case 'payment.completed':
        // Create subscription record
        break
      case 'subscription.cancelled':
        // Mark subscription as cancelled
        break
    }
  },
}
```

### Database Schema
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  finby_customer_id TEXT,
  finby_subscription_id TEXT,
  plan_id TEXT,
  status TEXT, -- 'active', 'cancelled', 'past_due'
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Non-Goals (Phase 2+)

- Multiple pricing tiers (3+)
- Annual pricing discount
- Promo codes / coupons
- Team/enterprise plans
- Usage-based billing
- Refund self-service

---

## Dependencies

- Finby merchant account configured
- Webhook endpoint deployed
- Supabase database ready
- User authentication (EP-002)
