# [EPIC] EP-010: Subscription Management

## Overview

In-app subscription management allowing users to view their plan, manage billing, upgrade/downgrade, and cancel subscriptions.

> **Note**: Initial payment/checkout is handled in EP-003 (funnel). This epic handles post-purchase subscription management.

---

## Business Impact

**Target Metric**: B - Retention, D - Conversion

**Hypothesis**: When users can easily manage their subscription and see plan benefits, they will retain longer and upgrade more often.

**Success Criteria**:
- Churn rate: **<10%** monthly
- Upgrade rate: **>5%** of users on lower plans
- Self-service cancellation: **>90%** (reduces support)

---

## Features

### F1: Subscription Status Display

- Current plan name and price
- Billing cycle (monthly/annual)
- Next billing date
- Credits remaining (links to EP-009)
- Plan status (active, cancelled, past_due)

### F2: Plan Comparison

- View all available plans
- Feature comparison table
- Current plan highlighted
- Clear upgrade/downgrade CTAs

**Plans:**
| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Free | $0 | 10/once | Basic generation, watermark |
| Starter | $29/mo | 100/mo | No watermark, email support |
| Pro | $49/mo | 300/mo | Priority generation, HQ default |
| Unlimited | $99/mo | ∞ | All features, priority support |

### F3: Upgrade Flow

- Select new plan
- Proration calculation shown
- Confirm upgrade
- Immediate access to new benefits
- Credit balance adjusted

### F4: Downgrade Flow

- Select lower plan
- Show what features will be lost
- Effective at end of billing period
- Offer retention incentive (optional)

### F5: Cancellation Flow

- Cancel subscription option
- Reason selection (feedback)
- Show what they'll lose
- Retention offer (discount/pause)
- Confirm cancellation
- Access until end of billing period

### F6: Billing History

- List of past invoices
- Download invoice PDF
- Payment method used
- Amount and date

### F7: Payment Method Management

- View current payment method (last 4 digits)
- Update payment method via Stripe
- Handle failed payments

---

## Acceptance Criteria

### AC-1: Status Display

- [ ] User can see current plan name
- [ ] Billing date is displayed
- [ ] Credits remaining is shown
- [ ] Plan status is clear (active/cancelled)

### AC-2: View Plans

- [ ] All plans are displayed with features
- [ ] Current plan is highlighted
- [ ] Prices are clear
- [ ] Upgrade/downgrade buttons work

### AC-3: Upgrade

- [ ] User can select higher plan
- [ ] Proration is shown before confirm
- [ ] Upgrade is immediate
- [ ] Credits are updated
- [ ] Confirmation email sent

### AC-4: Downgrade

- [ ] User can select lower plan
- [ ] Lost features are shown
- [ ] Downgrade effective at period end
- [ ] User retains current access until then

### AC-5: Cancellation

- [ ] User can cancel subscription
- [ ] Reason is collected
- [ ] Retention offer is shown
- [ ] Cancellation confirmed
- [ ] Access retained until period end
- [ ] Cancellation email sent

### AC-6: Billing

- [ ] User can view past invoices
- [ ] Invoices can be downloaded
- [ ] Payment method is displayed
- [ ] User can update payment method

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `subscription_viewed` | Subscription page opened | `current_plan` |
| `plans_compared` | Plan comparison viewed | `current_plan` |
| `upgrade_started` | Upgrade button clicked | `from_plan`, `to_plan` |
| `upgrade_completed` | Upgrade successful | `from_plan`, `to_plan`, `amount` |
| `downgrade_started` | Downgrade initiated | `from_plan`, `to_plan` |
| `downgrade_completed` | Downgrade confirmed | `from_plan`, `to_plan` |
| `cancellation_started` | Cancel button clicked | `plan`, `tenure_days` |
| `cancellation_reason_selected` | Reason provided | `reason` |
| `retention_offer_shown` | Offer displayed | `offer_type` |
| `retention_offer_accepted` | User accepts offer | `offer_type` |
| `cancellation_completed` | Subscription cancelled | `plan`, `reason`, `tenure_days` |
| `payment_method_updated` | Card updated | - |

---

## User Stories

### ST-040: View My Subscription

**As a** paying user  
**I want to** see my current subscription details  
**So that** I know what plan I'm on and when I'm billed

**AC**: AC-1

### ST-041: Compare Plans

**As a** user considering an upgrade  
**I want to** compare all available plans  
**So that** I can choose the best one for my needs

**AC**: AC-2

### ST-042: Upgrade My Plan

**As a** user who needs more credits  
**I want to** upgrade to a higher plan  
**So that** I can generate more content

**AC**: AC-3

### ST-043: Downgrade My Plan

**As a** user who needs fewer features  
**I want to** downgrade to a lower plan  
**So that** I can save money

**AC**: AC-4

### ST-044: Cancel Subscription

**As a** user who wants to stop paying  
**I want to** cancel my subscription  
**So that** I'm not charged anymore

**AC**: AC-5

### ST-045: View Billing History

**As a** user who needs receipts  
**I want to** view and download past invoices  
**So that** I have records for my expenses

**AC**: AC-6

---

## UI Wireframes

### Subscription Overview

```
┌─────────────────────────────────────────────────────┐
│  Settings > Subscription                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Current Plan                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  ⭐ Pro Plan                        $49/mo   │   │
│  │                                              │   │
│  │  Status: Active                              │   │
│  │  Next billing: January 5, 2026              │   │
│  │  Credits: 245 of 300 remaining              │   │
│  │                                              │   │
│  │  [Change Plan]  [Cancel Subscription]       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Payment Method                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  💳 Visa ending in 4242                      │   │
│  │  Expires 12/26                               │   │
│  │                                [Update Card] │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Billing History                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Dec 5, 2025  Pro Plan  $49.00  [Download]  │   │
│  │  Nov 5, 2025  Pro Plan  $49.00  [Download]  │   │
│  │  Oct 5, 2025  Starter   $29.00  [Download]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Plan Comparison

```
┌─────────────────────────────────────────────────────┐
│  Choose Your Plan                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Free   │  │ Starter │  │   Pro   │  │Unlimited│ │
│  │   $0    │  │  $29/mo │  │  $49/mo │  │  $99/mo │ │
│  │         │  │         │  │ CURRENT │  │         │ │
│  │10 creds │  │100 creds│  │300 creds│  │    ∞    │ │
│  │         │  │         │  │         │  │         │ │
│  │Watermark│  │No water │  │Priority │  │Priority │ │
│  │         │  │ Email   │  │HQ default│ │ Support │ │
│  │         │  │ support │  │         │  │         │ │
│  │         │  │         │  │         │  │         │ │
│  │[Current]│  │[Downgrde]│ │[Current]│  │[Upgrade]│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Cancellation Flow

```
┌─────────────────────────────────────────────────────┐
│  We're sorry to see you go 😢                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Why are you cancelling?                             │
│  ○ Too expensive                                     │
│  ○ Not using it enough                               │
│  ○ Missing features I need                           │
│  ○ Found a better alternative                        │
│  ○ Other: _______________                            │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  🎁 Wait! How about 50% off for 3 months?           │
│                                                      │
│  Stay on Pro for just $24.50/mo                     │
│                                                      │
│  [Accept Offer]                                      │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  [Cancel Anyway]                                     │
│                                                      │
│  You'll have access until January 5, 2026           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technical Notes

### Stripe Integration

```typescript
// Subscription management via Stripe Customer Portal
const createPortalSession = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/settings/subscription`,
  });
  return session.url;
};

// Or custom UI with Stripe API
const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations',
  });
  return subscription;
};
```

### Database Schema

```sql
-- Subscription info (synced from Stripe via webhooks)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL, -- 'free', 'starter', 'pro', 'unlimited'
  status TEXT NOT NULL, -- 'active', 'cancelled', 'past_due', 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Non-Goals (Phase 2+)

- Annual billing (monthly only for MVP)
- Team/multi-seat subscriptions
- Custom enterprise plans
- Pause subscription (only cancel)
- Refunds (handled manually)

---

## Dependencies

- Stripe account configured
- Payment checkout (EP-003)
- Credits system (EP-009)
- Emails for notifications (EP-007)

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

