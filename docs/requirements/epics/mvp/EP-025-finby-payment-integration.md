# [EPIC] EP-025: Finby Payment Integration for MVP

## Overview

Full Finby payment integration for the MVP web app, enabling users to purchase subscriptions and credits through Finby payment gateway. This epic implements the same payment infrastructure used in the funnel app, adapted for the MVP product context.

> **Note**: This epic replaces the test-mode credit purchases and implements real payment processing. EP-003 (funnel) handles funnel payments, while this epic handles in-app purchases for the MVP product.

---

## Business Impact

**Target Metric**: D - Conversion

**Hypothesis**: When users can purchase subscriptions and credits through a trusted payment gateway (Finby), conversion rates will increase and revenue will grow.

**Success Criteria**:
- Payment success rate: **>90%**
- Subscription activation: **<30 seconds** from payment
- Credit purchase completion: **>85%**
- Webhook processing: **<5 seconds** latency
- Zero payment data loss

---

## Scope Note

| Concern | Owner | Epic |
|---------|-------|------|
| **Funnel Payments** (initial conversion) | Funnel team | EP-003 |
| **MVP In-App Payments** (subscriptions, credits) | Product team | EP-025 (this epic) |

This epic handles:
- Subscription purchases from within the web app
- Credit pack purchases (one-time payments)
- Payment webhook processing
- Payment status tracking
- Integration with EP-009 (credits) and EP-010 (subscriptions)

---

## Features

### F1: Subscription Purchase Flow

- User selects subscription plan (from EP-010)
- Create Finby checkout session (API v1 for subscriptions)
- Redirect to Finby hosted payment page
- Handle success/cancel/error redirects
- Process webhook to activate subscription
- Grant monthly credits (via EP-009)

**Plans Supported:**
- Starter ($29/mo) - 100 credits/month
- Pro ($49/mo) - 300 credits/month
- Unlimited ($99/mo) - Unlimited credits

### F2: Credit Purchase Flow

- User selects credit package (from buy-credits page)
- Create Finby checkout session (API v3 for one-time payments)
- Redirect to Finby popup payment page
- Handle success/cancel/error redirects
- Process webhook to grant credits
- Update credit balance immediately

**Credit Packages:**
- Small Pack: 50 credits - $9.99
- Medium Pack: 150 credits - $24.99
- Large Pack: 300 credits - $44.99
- XL Pack: 500 credits - $69.99
- XXL Pack: 1000 credits - $119.99

### F3: Payment Webhook Handler

- Receive Finby payment notifications
- Verify webhook signature
- Process subscription created events
- Process payment succeeded events
- Process payment failed events
- Grant credits on successful payment
- Update subscription status
- Handle errors and retries

### F4: Payment Status Tracking

- Track payment status in database
- Display payment status in UI
- Handle pending payments
- Show payment history
- Link payments to subscriptions/credits

### F5: Payment Callback Pages

- Success page with confirmation
- Cancel page with retry option
- Error page with support contact
- Handle payment reference lookup
- Show appropriate messaging

### F6: Integration with Existing Systems

- Integrate with EP-009 credit system
- Integrate with EP-010 subscription management
- Update credit balance on payment success
- Update subscription status on payment success
- Send notifications (via EP-007)
- Track analytics events

---

## Acceptance Criteria

### AC-1: Subscription Purchase

- [ ] User can select a subscription plan from pricing page
- [ ] Clicking "Subscribe" creates Finby checkout session
- [ ] User is redirected to Finby payment page
- [ ] Payment success redirects to success page
- [ ] Payment cancel returns to pricing page
- [ ] Webhook processes subscription creation
- [ ] Subscription is activated in database
- [ ] Monthly credits are granted
- [ ] User receives confirmation email

### AC-2: Credit Purchase

- [ ] User can select credit package from buy-credits page
- [ ] Clicking "Buy" creates Finby checkout session
- [ ] User is redirected to Finby popup payment page
- [ ] Payment success redirects to success page
- [ ] Payment cancel returns to buy-credits page
- [ ] Webhook processes payment success
- [ ] Credits are granted immediately
- [ ] Credit balance updates in real-time
- [ ] User receives confirmation notification

### AC-3: Webhook Processing

- [ ] Webhook endpoint receives Finby notifications
- [ ] Webhook signature is verified
- [ ] Subscription events are processed correctly
- [ ] Payment events are processed correctly
- [ ] Credits are granted on success
- [ ] Subscription status is updated
- [ ] Failed payments are logged
- [ ] Errors are handled gracefully
- [ ] Webhook responds with 200 OK

### AC-4: Payment Status Tracking

- [ ] Payment status is stored in database
- [ ] User can view payment history
- [ ] Payment status is displayed in UI
- [ ] Pending payments are tracked
- [ ] Payment references are linked correctly
- [ ] Payment history shows all transactions

### AC-5: Callback Pages

- [ ] Success page shows confirmation message
- [ ] Success page shows credits/subscription details
- [ ] Cancel page allows retry
- [ ] Error page shows support contact
- [ ] All pages handle missing references gracefully
- [ ] Pages redirect appropriately after timeout

### AC-6: Integration

- [ ] Credits are granted via EP-009 system
- [ ] Subscriptions are managed via EP-010 system
- [ ] Notifications are sent via EP-007
- [ ] Analytics events are tracked
- [ ] Credit balance updates immediately
- [ ] Subscription status updates immediately

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `subscription_purchase_started` | User clicks subscribe | `plan_id`, `price` |
| `subscription_purchase_completed` | Payment success | `plan_id`, `amount`, `subscription_id` |
| `subscription_purchase_failed` | Payment failed | `plan_id`, `error` |
| `credit_purchase_started` | User clicks buy credits | `package_id`, `credits`, `price` |
| `credit_purchase_completed` | Payment success | `package_id`, `credits`, `amount` |
| `credit_purchase_failed` | Payment failed | `package_id`, `error` |
| `payment_webhook_received` | Webhook received | `event_type`, `reference` |
| `payment_webhook_processed` | Webhook processed | `event_type`, `success` |
| `payment_webhook_failed` | Webhook error | `event_type`, `error` |

---

## User Stories

### ST-100: Purchase Subscription

**As a** user who wants premium features  
**I want to** purchase a subscription through Finby  
**So that** I can access paid features and get monthly credits

**AC**: AC-1

### ST-101: Purchase Credits

**As a** user who needs more credits  
**I want to** purchase a credit pack through Finby  
**So that** I can continue generating content

**AC**: AC-2

### ST-102: View Payment Status

**As a** user who made a payment  
**I want to** see my payment status and history  
**So that** I know if my payment was successful

**AC**: AC-4

### ST-103: Handle Payment Callback

**As a** user returning from payment  
**I want to** see clear confirmation or error messages  
**So that** I know what happened with my payment

**AC**: AC-5

---

## Technical Notes

### Finby Integration

**API Versions:**
- **API v1**: Subscriptions (REST-based)
- **API v3**: One-time payments (popup-based)

**Implementation Pattern (from funnel):**

```typescript
// apps/web/app/api/finby/setup-payment/route.ts
import { createPaymentProvider } from '@ryla/payments';

const finby = createPaymentProvider('finby', {
  // For subscriptions (API v1)
  apiKey: process.env.FINBY_API_KEY,
  merchantId: process.env.FINBY_MERCHANT_ID,
  webhookSecret: process.env.FINBY_WEBHOOK_SECRET,
  apiVersion: 'v1',
  
  // For one-time payments (API v3)
  projectId: process.env.FINBY_PROJECT_ID,
  secretKey: process.env.FINBY_SECRET_KEY,
  apiVersion: 'v3',
});

// Subscription checkout
const subscriptionSession = await finby.createCheckoutSession({
  priceId: 'price_starter_monthly',
  userId: user.id,
  email: user.email,
  mode: 'subscription',
  successUrl: `${baseUrl}/payment/success?type=subscription`,
  cancelUrl: `${baseUrl}/pricing`,
  notificationUrl: `${baseUrl}/api/finby/webhook`,
});

// Credit purchase checkout
const creditSession = await finby.createCheckoutSession({
  productId: package.finbyProductId,
  amount: package.price * 100, // in cents
  email: user.email,
  successUrl: `${baseUrl}/payment/success?type=credits`,
  cancelUrl: `${baseUrl}/buy-credits`,
  notificationUrl: `${baseUrl}/api/finby/webhook`,
});
```

### Webhook Handler

```typescript
// apps/web/app/api/finby/webhook/route.ts
import { createFinbyV1WebhookHandler, createFinbyV3WebhookHandler } from '@ryla/payments';
import { grantCredits } from '@ryla/payments';
import { db } from '@ryla/data';

// API v1 webhook (subscriptions)
const v1Handler = createFinbyV1WebhookHandler({
  webhookSecret: process.env.FINBY_WEBHOOK_SECRET!,
  onSubscriptionCreated: async (event) => {
    // Create subscription record
    await createSubscription({
      userId: event.data.userId,
      planId: event.data.planId,
      finbySubscriptionId: event.data.subscriptionId,
      status: 'active',
    });
    
    // Grant monthly credits
    const credits = getCreditsForPlan(event.data.planId);
    await grantCredits(db, {
      userId: event.data.userId,
      amount: credits,
      type: 'subscription_grant',
      referenceType: 'subscription',
      referenceId: event.data.subscriptionId,
    });
  },
  onPaymentSucceeded: async (event) => {
    // Handle subscription renewal or one-time payment
    if (event.data.isSubscription) {
      // Renewal - grant credits
      await grantCredits(db, {
        userId: event.data.userId,
        amount: getCreditsForPlan(event.data.planId),
        type: 'subscription_grant',
        referenceType: 'subscription_renewal',
        referenceId: event.data.subscriptionId,
      });
    } else {
      // One-time credit purchase
      await grantCredits(db, {
        userId: event.data.userId,
        amount: event.data.credits,
        type: 'purchase',
        referenceType: 'credit_purchase',
        referenceId: event.data.paymentId,
      });
    }
  },
});

// API v3 webhook (one-time payments)
const v3Handler = createFinbyV3WebhookHandler({
  projectId: process.env.FINBY_PROJECT_ID!,
  secretKey: process.env.FINBY_SECRET_KEY!,
  onPaymentSucceeded: async (event) => {
    // Grant credits based on reference
    const reference = event.data.subscriptionId; // Finby v3 uses subscriptionId for reference
    const { userId, packageId } = parseReference(reference);
    
    const package = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (package) {
      await grantCredits(db, {
        userId,
        amount: package.credits,
        type: 'purchase',
        referenceType: 'credit_purchase',
        referenceId: event.data.invoiceId,
      });
    }
  },
});
```

### Database Schema

```sql
-- Payment records
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'subscription', 'credit_purchase'
  reference TEXT NOT NULL UNIQUE, -- Finby payment reference
  finby_payment_id TEXT,
  finby_subscription_id TEXT, -- For subscriptions
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'cancelled'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);

-- Link payments to subscriptions/credits
ALTER TABLE subscriptions ADD COLUMN finby_subscription_id TEXT;
ALTER TABLE credit_transactions ADD COLUMN payment_id UUID REFERENCES payments(id);
```

### Reference Format

**Subscription references:**
- Format: `sub_{userId}_{planId}`
- Example: `sub_123e4567-e89b-12d3-a456-426614174000_starter`

**Credit purchase references:**
- Format: `cred_{userId}_{packageId}`
- Example: `cred_123e4567-e89b-12d3-a456-426614174000_medium`

### Environment Variables

```bash
# Finby API v1 (Subscriptions)
FINBY_API_KEY=
FINBY_MERCHANT_ID=
FINBY_WEBHOOK_SECRET=

# Finby API v3 (One-time payments)
FINBY_PROJECT_ID=
FINBY_SECRET_KEY=

# Payment URLs
NEXT_PUBLIC_SITE_URL=https://app.ryla.ai
NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/payment/success
```

---

## File Structure

```
apps/web/
  app/
    api/
      finby/
        setup-payment/
          route.ts          # Create checkout session
        webhook/
          route.ts          # Webhook handler
    payment/
      success/
        page.tsx           # Success callback page
      cancel/
        page.tsx           # Cancel callback page
      error/
        page.tsx           # Error callback page
    buy-credits/
      page.tsx             # Update to use Finby (currently test mode)
    pricing/
      page.tsx             # Update to use Finby for subscriptions
  lib/
    services/
      finby-service.ts     # Finby service wrapper
    utils/
      payment-reference.ts # Reference generation/parsing
```

---

## Integration Points

### EP-009: Credits

- Use `grantCredits()` from `@ryla/payments` to add credits
- Update credit balance on payment success
- Record credit transactions with payment reference
- Link credit transactions to payment records

### EP-010: Subscriptions

- Create subscription records on webhook
- Update subscription status on payment events
- Link subscriptions to payment records
- Handle subscription renewals

### EP-007: Emails

- Send payment confirmation emails
- Send subscription activation emails
- Send credit purchase confirmation emails
- Send payment failure notifications

---

## Non-Goals (Phase 2+)

- Multiple payment providers (Stripe, PayPal) - Finby only for MVP
- Refund self-service (manual only)
- Payment method management (handled by Finby)
- Invoice generation (handled by Finby)
- Annual billing (monthly only for MVP)
- Promo codes / coupons
- Payment retry logic (handled by Finby)

---

## Dependencies

- **@ryla/payments** library (already implemented)
- Finby account configured
- Webhook endpoint deployed
- Supabase database ready
- User authentication (EP-002)
- Credits system (EP-009)
- Subscription management (EP-010)
- Email system (EP-007)

---

## Testing Checklist

### Subscription Purchase

- [ ] Can create subscription checkout session
- [ ] Redirects to Finby payment page
- [ ] Success redirect works
- [ ] Cancel redirect works
- [ ] Webhook processes subscription creation
- [ ] Credits are granted
- [ ] Subscription is activated
- [ ] Email is sent

### Credit Purchase

- [ ] Can create credit checkout session
- [ ] Redirects to Finby popup payment page
- [ ] Success redirect works
- [ ] Cancel redirect works
- [ ] Webhook processes payment success
- [ ] Credits are granted immediately
- [ ] Credit balance updates
- [ ] Notification is sent

### Webhook Processing

- [ ] Webhook receives notifications
- [ ] Signature verification works
- [ ] Subscription events are processed
- [ ] Payment events are processed
- [ ] Errors are handled gracefully
- [ ] Webhook responds correctly

### Edge Cases

- [ ] Duplicate webhook handling
- [ ] Missing payment reference
- [ ] Invalid user ID
- [ ] Payment timeout
- [ ] Network errors
- [ ] Database errors

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

---

## References

- Funnel Finby implementation: `apps/funnel/app/api/finby/`
- Payments library: `libs/payments/`
- EP-003: Funnel payment epic
- EP-009: Credits epic
- EP-010: Subscription management epic
- Finby API docs: https://doc.finby.eu/

