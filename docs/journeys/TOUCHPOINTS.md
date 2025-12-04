# Touchpoints

## Overview

Mapping customer journey stages to screens, actions, and analytics events.

---

## Touchpoint Matrix

| Journey Stage | Screen | User Action | Event | Business Metric |
|---------------|--------|-------------|-------|-----------------|
| **Awareness** | | | | |
| Ad click | External | Click ad | `utm.landed` | E (CAC) |
| Content view | Blog | Read article | `content.viewed` | E (CAC) |
| **Acquisition** | | | | |
| Landing view | Landing | View page | `landing.viewed` | E (CAC) |
| Signup start | Signup | Click signup | `signup.started` | E (CAC) |
| Signup complete | Signup | Submit form | `signup.completed` | E (CAC) |
| **Activation** | | | | |
| Onboarding start | Onboarding | Begin flow | `onboarding.started` | A |
| Onboarding step | Onboarding | Complete step | `onboarding.step_completed` | A |
| First action | Core | Use feature | `user.activated` | A |
| **Revenue** | | | | |
| Paywall view | Paywall | See upgrade | `paywall.viewed` | D |
| Trial start | Checkout | Start trial | `trial.started` | D |
| Payment | Checkout | Pay | `subscription.created` | D |
| **Retention** | | | | |
| Return visit | Dashboard | Login | `session.started` | B |
| Feature use | Core | Engage | `feature.used` | B |
| D7 return | Dashboard | Return day 7 | `user.returned_d7` | B |
| **Referral** | | | | |
| Share prompt | Settings | See prompt | `referral.prompted` | E |
| Share action | Settings | Click share | `referral.shared` | E |
| Friend signup | Signup | Via referral | `referral.converted` | E |

---

## Critical Touchpoints

### Must-Track (MVP)

| Touchpoint | Why Critical | Event |
|------------|--------------|-------|
| Signup complete | Acquisition gate | `signup.completed` |
| First core action | Activation signal | `user.activated` |
| D7 return | Retention signal | `user.returned_d7` |
| Payment complete | Revenue signal | `subscription.created` |

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

