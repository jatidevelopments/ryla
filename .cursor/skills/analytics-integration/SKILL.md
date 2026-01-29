---
name: analytics-integration
description: Integrates PostHog analytics tracking following RYLA analytics patterns. Use when adding analytics events, setting up funnels, verifying tracking, or when the user mentions analytics or PostHog.
---

# Analytics Integration

Integrates PostHog analytics tracking following RYLA analytics patterns.

## Quick Start

When adding analytics:

1. **Import Library** - `import { capture, identify } from '@ryla/analytics'`
2. **Identify User** - Call `identify()` after login
3. **Capture Events** - Use `capture()` for user actions
4. **Verify Tracking** - Check PostHog dashboard
5. **Set Up Funnels** - Configure conversion funnels

## Library Location

**Location**: `libs/analytics/src/`

**Import:**
```typescript
import { capture, identify, USER_EVENTS } from '@ryla/analytics';
```

## Key Events

| Event | When | Properties |
|-------|------|------------|
| `user.signed_up` | Registration | source, plan |
| `user.activated` | First key action | time_to_activate |
| `feature.used` | Feature interaction | feature, count |
| `subscription.created` | Payment | plan, amount |
| `error.occurred` | User-facing error | type, message |

## Usage Patterns

### Identify User

```typescript
import { identify } from '@ryla/analytics';

// After login
identify(userId, {
  email: user.email,
  plan: user.plan,
  createdAt: user.createdAt,
});
```

### Capture Event

```typescript
import { capture, USER_EVENTS } from '@ryla/analytics';

// Simple event
capture(USER_EVENTS.ACTIVATED, {
  time_to_activate: 120, // seconds
});

// Custom event
capture('character.created', {
  characterId: 'char-123',
  method: 'presets', // or 'prompt'
  flowType: 'presets',
});
```

### Event Naming

- **Format**: `snake_case`
- **Pattern**: `feature.action`
- **Examples**:
  - `user.signed_up`
  - `character.created`
  - `image.generated`
  - `subscription.created`

## Metrics (A-E Framework)

Every feature must move one of these metrics:

- **A**: Activation (signup → first action)
- **B**: Retention (D7/D30)
- **C**: Core Value (North Star usage)
- **D**: Conversion (trial → paid)
- **E**: CAC (acquisition cost)

### Example: Activation Event

```typescript
// Track activation (first key action)
capture('user.activated', {
  time_to_activate: timeSinceSignup,
  first_action: 'character_created',
});
```

### Example: Conversion Event

```typescript
// Track subscription creation
capture('subscription.created', {
  plan: 'pro',
  amount: 29.99,
  source: 'funnel',
});
```

## Funnel Setup

### Character Creation Funnel

```typescript
// Step 1: Wizard started
capture('wizard.started', {
  method: 'presets', // or 'prompt'
});

// Step 2: Base image generated
capture('wizard.base_image_generated', {
  generation_time: 25000, // ms
});

// Step 3: Character created
capture('character.created', {
  method: 'presets',
  time_to_complete: 180000, // ms
});
```

### PostHog Funnel Configuration

1. Go to PostHog → Insights → Funnels
2. Add steps:
   - `wizard.started`
   - `wizard.base_image_generated`
   - `character.created`
3. Set conversion window (e.g., 1 hour)

## Component Integration

### React Component

```tsx
'use client';

import { capture } from '@ryla/analytics';
import { useEffect } from 'react';

export function CharacterWizard() {
  useEffect(() => {
    // Track wizard start
    capture('wizard.started', {
      method: 'presets',
    });
  }, []);
  
  const handleComplete = () => {
    capture('character.created', {
      method: 'presets',
      time_to_complete: Date.now() - startTime,
    });
  };
  
  return (/* ... */);
}
```

### Server Component

```tsx
import { capture } from '@ryla/analytics';

export default async function Page() {
  // Server-side tracking
  capture('page.viewed', {
    page: 'studio',
    userId: user.id,
  });
  
  return (/* ... */);
}
```

## Error Tracking

### Track Errors

```typescript
import { capture } from '@ryla/analytics';

try {
  await generateImage(config);
} catch (error) {
  capture('error.occurred', {
    type: 'image_generation',
    message: error.message,
    userId: user.id,
  });
  throw error;
}
```

## Best Practices

### 1. Identify After Login

```typescript
// ✅ Good: Identify after authentication
useEffect(() => {
  if (user) {
    identify(user.id, { email: user.email });
  }
}, [user]);
```

### 2. Use Consistent Event Names

```typescript
// ✅ Good: Consistent naming
capture('character.created', { ... });
capture('character.updated', { ... });
capture('character.deleted', { ... });

// ❌ Bad: Inconsistent naming
capture('createCharacter', { ... });
capture('character_update', { ... });
```

### 3. Include Relevant Properties

```typescript
// ✅ Good: Include context
capture('image.generated', {
  characterId: 'char-123',
  type: 'studio',
  count: 4,
  generationTime: 15000,
});

// ❌ Bad: Missing context
capture('image.generated', {});
```

### 4. Track User Journey

```typescript
// ✅ Good: Track complete journey
capture('wizard.started', { method: 'presets' });
capture('wizard.step_completed', { step: 1 });
capture('wizard.completed', { time: 180000 });
```

### 5. Verify Tracking

```typescript
// ✅ Good: Verify in development
if (process.env.NODE_ENV === 'development') {
  console.log('Event captured:', event, properties);
}
```

## Testing

### Mock Analytics in Tests

```typescript
// test/setup.ts
import { vi } from 'vitest';

vi.mock('@ryla/analytics', () => ({
  capture: vi.fn(),
  identify: vi.fn(),
  USER_EVENTS: {
    ACTIVATED: 'user.activated',
  },
}));
```

### Verify Events

```typescript
import { capture } from '@ryla/analytics';

it('should track character creation', () => {
  await createCharacter();
  
  expect(capture).toHaveBeenCalledWith('character.created', {
    characterId: expect.any(String),
  });
});
```

## Related Resources

- **Analytics Rule**: `.cursor/rules/analytics.mdc`
- **Analytics Library**: `libs/analytics/`
- **Tracking Plan**: `docs/analytics/TRACKING-PLAN.md`
