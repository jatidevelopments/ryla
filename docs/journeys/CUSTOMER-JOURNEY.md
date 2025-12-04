# Customer Journey

## Overview

Macro journey from awareness to advocacy.

---

## AAARRR Funnel

```
Awareness → Acquisition → Activation → Revenue → Retention → Referral
```

---

## Stage Definitions

### 1. Awareness
**Goal**: Target knows we exist

| Touchpoint | Channel | Metric |
|------------|---------|--------|
| Ad view | Paid | Impressions |
| Content view | Organic | Page views |
| Social mention | Social | Reach |
| Word of mouth | Referral | — |

**Events**: `awareness.ad_viewed`, `awareness.content_viewed`

---

### 2. Acquisition
**Goal**: Target visits and signs up

| Touchpoint | Action | Metric |
|------------|--------|--------|
| Landing page | View | Visitors |
| Signup form | Start | Form starts |
| Signup complete | Submit | Signups |

**Events**: `landing.viewed`, `signup.started`, `signup.completed`

**Funnel**: Landing → Signup Start → Signup Complete

---

### 3. Activation
**Goal**: User experiences core value

| Touchpoint | Action | Metric |
|------------|--------|--------|
| Onboarding | Complete | Onboarding rate |
| First action | Complete | Activation rate |
| Aha moment | Reach | Time to value |

**Events**: `onboarding.completed`, `user.activated`, `aha_moment.reached`

**Key Metric**: Time to first value (TTFV)

---

### 4. Revenue
**Goal**: User pays

| Touchpoint | Action | Metric |
|------------|--------|--------|
| Paywall | View | Paywall views |
| Trial | Start | Trial starts |
| Payment | Complete | Conversions |

**Events**: `paywall.viewed`, `trial.started`, `subscription.created`

**Funnel**: Active → Paywall → Trial → Paid

---

### 5. Retention
**Goal**: User returns and stays

| Touchpoint | Action | Metric |
|------------|--------|--------|
| Return visit | Login | D1/D7/D30 |
| Feature use | Engage | DAU/MAU |
| Subscription renewal | Renew | Churn rate |

**Events**: `session.started`, `user.returned_d7`, `subscription.renewed`

**Key Metrics**: D7 retention, Monthly churn

---

### 6. Referral
**Goal**: User brings others

| Touchpoint | Action | Metric |
|------------|--------|--------|
| Referral prompt | View | Prompt views |
| Share | Click | Shares |
| Referral signup | Complete | Viral coefficient |

**Events**: `referral.prompted`, `referral.shared`, `referral.converted`

**Key Metric**: Viral coefficient (K)

---

## Journey Map Template

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                              │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│ AWARENESS│ACQUISITION│ACTIVATION│ REVENUE  │RETENTION │  REFERRAL   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│          │          │          │          │          │              │
│ Ad/SEO   │ Landing  │ Onboard  │ Paywall  │ Return   │ Share        │
│    ↓     │    ↓     │    ↓     │    ↓     │    ↓     │    ↓         │
│ Content  │ Signup   │ 1st Use  │ Trial    │ Engage   │ Invite       │
│    ↓     │    ↓     │    ↓     │    ↓     │    ↓     │    ↓         │
│ Social   │ Verify   │ Aha!     │ Pay      │ Renew    │ Advocate     │
│          │          │          │          │          │              │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ Metric E │ Metric E │ Metric A │ Metric D │ Metric B │ Metric E     │
│ (CAC)    │ (CAC)    │          │          │          │ (CAC)        │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

---

## Optimization Priority

```
Activation → Retention → Acquisition → Revenue → Referral
```

1. **Fix activation first** — no point acquiring users who don't activate
2. **Then retention** — keep activated users
3. **Then acquisition** — bring more users to working funnel
4. **Then revenue** — monetize engaged users
5. **Then referral** — viral growth on top

---

## Analytics Mapping

| Stage | Business Metric | Key Event |
|-------|-----------------|-----------|
| Awareness | E (CAC) | `awareness.*` |
| Acquisition | E (CAC) | `signup.completed` |
| Activation | A | `user.activated` |
| Revenue | D | `subscription.created` |
| Retention | B | `user.returned_d7` |
| Referral | E (CAC) | `referral.converted` |

