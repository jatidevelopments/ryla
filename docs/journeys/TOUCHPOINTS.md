# Touchpoints

## Overview

This document provides a high-level overview of touchpoints across the customer journey. For detailed app-specific touchpoints, see the app-specific journey documentation.

---

## App-Specific Touchpoint Documentation

| App | Documentation | Focus |
|-----|---------------|-------|
| **Web App** | [`web-app-journey.md`](./web-app-journey.md) | Activation, Retention, Core Value |
| **Admin App** | [`admin-app-journey.md`](./admin-app-journey.md) | Operational touchpoints |
| **Funnel App** | [`funnel-app-journey.md`](./funnel-app-journey.md) | Acquisition, Conversion |
| **Landing App** | [`landing-app-journey.md`](./landing-app-journey.md) | Awareness, Acquisition |

---

## High-Level Touchpoint Matrix

| Journey Stage | Primary App | Key Touchpoint | Event | Business Metric |
|---------------|-------------|----------------|-------|-----------------|
| **Awareness** | Landing | Homepage view | `landing.viewed` | E (CAC) |
| **Acquisition** | Funnel | Wizard started | `funnel.started` | E (CAC) |
| **Acquisition** | Web | Signup completed | `signup.completed` | E (CAC) |
| **Activation** | Web | First character created | `influencer.created` | A |
| **Activation** | Web | First image generated | `studio.generation_completed` | A |
| **Revenue** | Funnel | Payment completed | `funnel.payment.completed` | D |
| **Retention** | Web | Return visit | `session.started` | B |
| **Retention** | Web | Generate content | `studio.generation_started` | B |
| **Core Value** | Web | Image generated | `studio.generation_completed` | C |
| **Core Value** | Web | Template used | `templates.template_used` | C |

---

## Critical Touchpoints by App

### Web App Critical Touchpoints

| Touchpoint | Why Critical | Event | See Documentation |
|------------|--------------|-------|-------------------|
| First character created | Activation signal | `influencer.created` | [`web-app-journey.md`](./web-app-journey.md) |
| First image generated | Activation signal | `studio.generation_completed` | [`web-app-journey.md`](./web-app-journey.md) |
| D7 return | Retention signal | `session.started` (D7) | [`web-app-journey.md`](./web-app-journey.md) |

### Funnel App Critical Touchpoints

| Touchpoint | Why Critical | Event | See Documentation |
|------------|--------------|-------|-------------------|
| Wizard completed | Activation signal | `funnel.wizard.completed` | [`funnel-app-journey.md`](./funnel-app-journey.md) |
| Payment completed | Revenue signal | `funnel.payment.completed` | [`funnel-app-journey.md`](./funnel-app-journey.md) |

### Landing App Critical Touchpoints

| Touchpoint | Why Critical | Event | See Documentation |
|------------|--------------|-------|-------------------|
| CTA clicked | Acquisition signal | `landing.cta.clicked` | [`landing-app-journey.md`](./landing-app-journey.md) |
| Funnel redirected | Conversion signal | `landing.funnel.redirected` | [`landing-app-journey.md`](./landing-app-journey.md) |

### Nice-to-Track (Post-MVP)

| Touchpoint | Value | Event |
|------------|-------|-------|
| Feature discovery | Usage patterns | `feature.discovered` |
| Help viewed | Friction points | `help.viewed` |
| Settings changed | Engagement depth | `settings.changed` |

---

## Touchpoint → Funnel Mapping

### Signup Funnel

```
landing.viewed → signup.started → signup.completed
     100%            X%               Y%
```

### Activation Funnel

```
signup.completed → onboarding.started → onboarding.completed → user.activated
      100%               X%                    Y%                   Z%
```

### Conversion Funnel

```
user.activated → paywall.viewed → trial.started → subscription.created
     100%             X%              Y%                Z%
```

### Retention Funnel

```
user.activated → session.started (D1) → session.started (D7) → session.started (D30)
     100%              X%                      Y%                     Z%
```

---

## Touchpoint Properties

### Standard Properties (All Events)

```javascript
{
  user_id: string,
  session_id: string,
  timestamp: ISO8601,
  screen: string,
  device: 'mobile' | 'desktop',
  browser: string,
  utm_source?: string,
  utm_medium?: string,
  utm_campaign?: string
}
```

### Touchpoint-Specific Properties

| Event | Additional Properties |
|-------|----------------------|
| `signup.completed` | `method` (email/oauth), `referral_code` |
| `user.activated` | `time_to_activate_seconds`, `action_type` |
| `paywall.viewed` | `trigger`, `plan_shown` |
| `subscription.created` | `plan`, `amount`, `currency`, `trial_days` |
| `user.returned_d7` | `days_since_signup`, `sessions_count` |

---

## Friction Points to Monitor

| Touchpoint | Friction Signal | Action |
|------------|-----------------|--------|
| Signup | High abandon rate | Simplify form |
| Onboarding | Step 2 drop | Improve UX |
| First action | Low completion | Better guidance |
| Paywall | High bounce | Improve value prop |
| D1 return | < 50% | Improve onboarding |

---

## Touchpoint Alerts

Configure alerts when:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Signup conversion drops | < 10% | Investigate |
| Activation rate drops | < 40% | Review onboarding |
| D7 retention drops | < 20% | Analyze churn |
| Conversion rate drops | < 5% | Review pricing/value |

---

## Adding Touchpoints

1. Identify journey stage
2. Define screen and action
3. Create event name (feature.action format)
4. Add to tracking plan
5. Add properties
6. Add to relevant funnel
7. Configure alerts if critical

