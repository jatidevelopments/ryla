# Tracking Plan

## Event Schema

### Format
```
<feature>.<action>
```

### Properties
- Always include: `timestamp`, `user_id`, `session_id`
- Feature-specific properties typed consistently

---

## Core Events

### User Lifecycle

| Event | Trigger | Properties |
|-------|---------|------------|
| `user.signed_up` | Registration complete | `source`, `plan`, `referral_code` |
| `user.activated` | First core action | `time_to_activate_seconds`, `action_type` |
| `user.returned` | Session after 24h+ gap | `days_since_last`, `return_source` |
| `user.churned` | 30 days inactive | `last_action`, `lifetime_days` |

### Onboarding

| Event | Trigger | Properties |
|-------|---------|------------|
| `onboarding.started` | First screen shown | `variant` |
| `onboarding.step_completed` | Step done | `step_number`, `step_name` |
| `onboarding.completed` | All steps done | `duration_seconds`, `steps_skipped` |
| `onboarding.abandoned` | Left mid-flow | `last_step`, `duration_seconds` |

### Core Feature

| Event | Trigger | Properties |
|-------|---------|------------|
| `core.action_started` | User initiates | `action_type`, `input_size` |
| `core.action_completed` | Success | `action_type`, `duration_ms`, `output_size` |
| `core.action_failed` | Error | `action_type`, `error_type`, `error_message` |

### Conversion

| Event | Trigger | Properties |
|-------|---------|------------|
| `paywall.viewed` | Paywall shown | `trigger`, `plan_shown` |
| `trial.started` | Trial begins | `plan`, `duration_days` |
| `subscription.created` | Payment success | `plan`, `amount`, `currency` |
| `subscription.cancelled` | User cancels | `reason`, `lifetime_days` |

### Errors

| Event | Trigger | Properties |
|-------|---------|------------|
| `error.occurred` | User-facing error | `type`, `message`, `page`, `action` |
| `error.api` | API error | `endpoint`, `status`, `message` |

---

## Funnels

### Signup Funnel
```
1. landing.viewed
2. signup.started
3. signup.completed
4. user.signed_up
```

### Activation Funnel
```
1. user.signed_up
2. onboarding.started
3. onboarding.completed
4. user.activated
```

### Core Value Funnel
```
1. user.activated
2. core.action_started
3. core.action_completed
4. (repeat engagement)
```

### Conversion Funnel
```
1. paywall.viewed
2. trial.started
3. subscription.created
```

---

## Implementation

### Capture Function
```typescript
// src/shared/analytics/capture.ts
export function capture(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Usage
```typescript
import { capture } from '@/shared/analytics/capture';

// On signup
capture('user.signed_up', { source: 'landing', plan: 'free' });

// On core action
capture('core.action_completed', { 
  action_type: 'generate',
  duration_ms: 1234,
  output_size: 500
});
```

---

## Analytics Acceptance Criteria Template

```markdown
## Analytics AC

### Events
- [ ] `event.name` fires when [trigger]
- [ ] Properties include: [list]

### Funnels
- [ ] Funnel [name] shows steps correctly
- [ ] Drop-off tracking works

### Verification
- [ ] Playwright test confirms event fires
- [ ] PostHog shows event in live view
```

---

## Playwright Analytics Test

```typescript
// playwright/tests/analytics.e2e.ts
import { test, expect } from '@playwright/test';

test('signup fires user.signed_up event', async ({ page }) => {
  const events: any[] = [];
  
  await page.route('**/e/**', route => {
    const body = route.request().postData();
    if (body) events.push(JSON.parse(body));
    route.continue();
  });

  await page.goto('/signup');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'Test123!');
  await page.click('[data-testid="submit"]');

  await page.waitForURL('/dashboard');
  
  const signupEvent = events.find(e => e.event === 'user.signed_up');
  expect(signupEvent).toBeTruthy();
  expect(signupEvent.properties.source).toBe('signup_form');
});
```

