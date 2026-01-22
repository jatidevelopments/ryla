# [EPIC] EP-003: Payment & Subscription

**Status**: Completed
**Phase**: P10
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Payment system for subscription management. Part of the **Funnel/Landing workstream** (separate from MVP product).

---

## Scope Note

| Concern | Owner |
|---------|-------|
| **MVP Product** (EP-001, EP-004, EP-005) | Product team |
| **Funnel/Landing** (EP-003, EP-006) | Funnel team |

This epic handles the conversion from free user to paid subscriber.

---

## Bug Context (Nov 2025)

> ⚠️ **Known Issue**: A bug after character creation prevented users from proceeding to payment.
> The 81% payment drop-off data may reflect this bug, not actual conversion issues.
> Payment optimization should wait for clean data after bug fix.

---

## Business Impact

**Target Metric**: [x] D - Conversion

**Hypothesis**: When we provide a simple, trustworthy payment flow, users will convert to paid subscribers.

**Success Criteria**:
- Payment success rate: **>90%**
- Subscription activation: **<30 seconds**
- Targets for conversion TBD after bug fix

---

## Features

### F1: Payment Trust Elements (NEW - CRITICAL)

**Required to fix 81% drop-off:**

- **Testimonials** - 2-3 real quotes from beta users
- **User count** - "Join 500+ creators" (or accurate number)
- **What you get** - Clear feature breakdown for $29
- **Money-back guarantee** - "7-day refund, no questions asked"
- **Secure badges** - SSL, payment processor logos
- **Familiar UI** - Stripe Checkout (not custom form)

### F2: Pricing Display

- Show subscription plans
- **Clear "What you get" section**
- Highlight recommended plan
- Feature comparison
- Price display with currency

### F3: Stripe Checkout (Changed from Finby)
- Create Finby payment session
- Redirect to Finby hosted payment page
- Handle success redirect
- Handle cancel redirect

- Receive Stripe webhooks
- Process subscription created
- Process payment succeeded
- Handle subscription cancelled

### F5: Subscription Status
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

### AC-1: Trust Elements (NEW - P0)

- [ ] **Testimonials visible** on payment page (2-3 quotes)
- [ ] **User count shown** ("Join X creators")
- [ ] **"What you get" breakdown** is clear and visible
- [ ] **Money-back guarantee** displayed prominently
- [ ] **Secure payment badges** visible (SSL, Stripe logo)
- [ ] **Familiar checkout UI** (Stripe Checkout, not custom)

### AC-2: Pricing Page

- [ ] Plans are clearly displayed
- [ ] **"What you get" section** shows all features
- [ ] Features per plan are listed
- [ ] Prices are accurate
- [ ] CTA buttons work

### AC-3: Checkout Flow

- [ ] Clicking "Subscribe" creates Stripe session
- [ ] User is redirected to Stripe Checkout
- [ ] Success redirects to success page
- [ ] Cancel returns to pricing

### AC-4: Payment Processing

- [ ] Webhook receives payment events
- [ ] Subscription is recorded in database
- [ ] User gains access to paid features
- [ ] Confirmation shown to user

### AC-5: Feature Gating
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
| `trust_element_viewed` | Trust section visible | `element_type` |
| `testimonial_viewed` | Testimonial in viewport | `testimonial_id` |
| `plan_selected` | User clicks plan | `plan_id`, `price` |
| `checkout_started` | Redirect to Stripe | `plan_id` |
| `checkout_completed` | Payment success | `plan_id`, `amount` |
| `checkout_abandoned` | User cancels | `plan_id`, `step_abandoned` |
| `email_entered` | Email field completed | `email_domain` |
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
**I want to** see pricing options with clear value  
**So that** I understand what I'm paying for

### ST-011: Trust Before Paying (NEW)

**As a** user hesitant about an unfamiliar service  
**I want to** see social proof and guarantees  
**So that** I feel confident entering my payment info

**AC**: AC-1

### ST-012: Subscribe

**As a** user ready to pay  
**I want to** complete payment through a familiar interface  
**So that** I feel secure and can access premium features

### ST-013: Manage Subscription

**As a** paying subscriber  
**I want to** manage my subscription  
**So that** I can cancel if needed

---

## Technical Notes

### Stripe Integration (Changed from Finby)

**Why Stripe?** 
- Recognized brand = user trust
- Familiar checkout UI
- Better conversion rates
- Users feel safe entering payment info

```typescript
// libs/business/src/services/payment.service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const paymentService = {
  createCheckoutSession: async (userId: string, priceId: string) => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { user_id: userId },
      // Trust signals in checkout
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    });
    return session;
  },
  
  handleWebhook: async (event: Stripe.Event) => {
    switch (event.type) {
      case 'checkout.session.completed':
        // Create subscription record
        break;
      case 'customer.subscription.deleted':
        // Mark subscription as cancelled
        break;
    }
  },
}
```

### Database Schema

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT,
  status TEXT, -- 'active', 'cancelled', 'past_due'
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Trust Elements UI (NEW)

```tsx
// Payment page trust section
<TrustSection>
  <Testimonials>
    <Quote author="Sarah M." role="Content Creator">
      "Created my first AI model in 10 minutes. Already earning on Fanvue!"
    </Quote>
    <Quote author="Mike T." role="Side Hustler">
      "Way easier than I expected. The quality is insane."
    </Quote>
  </Testimonials>
  
  <UserCount>
    <span className="font-bold">500+</span> creators already using RYLA
  </UserCount>
  
  <Guarantee>
    <ShieldIcon />
    <span>7-day money-back guarantee. No questions asked.</span>
  </Guarantee>
  
  <SecureBadges>
    <StripeLogo />
    <SSLBadge />
    <span>Secure 256-bit encryption</span>
  </SecureBadges>
</TrustSection>
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

- **Stripe account configured** (changed from Finby)
- Webhook endpoint deployed
- Supabase database ready
- User authentication (EP-002)
- **Testimonials collected** from beta users
- **User count** tracking implemented

---

## Priority Note

> **This epic is part of the Funnel workstream**, separate from MVP Product.
> Payment optimization should be based on clean data after bug fix.
> Focus on reliable payment processing first, optimization second.
