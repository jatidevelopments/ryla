# Analytics Library

Shared analytics utilities and event tracking.

## Import
```typescript
import { capture, identify, ... } from '@ryla/analytics';
```

## Structure
```
libs/analytics/src/
├── capture.ts     # Event capture function
├── identify.ts    # User identification
├── events.ts      # Event type definitions
├── funnels.ts     # Funnel definitions
└── index.ts       # Public exports
```

## Usage
```typescript
import { capture, identify } from '@ryla/analytics';

// Identify user
identify(userId, { email, plan });

// Capture event
capture('feature.used', { feature: 'export', format: 'pdf' });
```

## Events
See `docs/analytics/TRACKING-PLAN.md` for full event schema.

## Testing
See Playwright analytics tests in `playwright/tests/analytics/`.

