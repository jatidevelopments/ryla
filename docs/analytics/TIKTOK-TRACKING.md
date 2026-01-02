# TikTok Pixel Tracking Implementation

## Overview

TikTok pixel tracking has been implemented in the `@ryla/analytics` shared library and integrated into the funnel app. This follows the same pattern as PostHog tracking for consistency.

## Pixel Information

- **Pixel ID**: `D56GRRRC77UAQNS9K9O0`
- **Pixel Name**: `ryla pixel`
- **Environment Variable**: `NEXT_PUBLIC_TIKTOK_PIXEL_ID` (defaults to above if not set)

## Implementation

### Analytics Library (`@ryla/analytics`)

#### Components

1. **TikTokProvider** (`libs/analytics/src/TikTokProvider.tsx`)
   - Loads TikTok pixel script
   - Handles initialization and environment detection
   - Opts out in development unless `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true`

2. **TikTokPageView** (`libs/analytics/src/TikTokPageView.tsx`)
   - Automatically tracks pageviews on route changes
   - Wrapped in Suspense for Next.js compatibility

#### Functions

1. **Core Tracking** (`libs/analytics/src/tiktok.ts`)
   - `trackTikTok(eventName, properties)` - Track any TikTok event
   - `identifyTikTok(userData)` - Identify user (email/phone/external_id)
   - `trackTikTokPageView()` - Track pageview
   - `hashSHA256(value)` - Hash PII data (email, phone) before sending

2. **Event Mappings** (`libs/analytics/src/tiktok-events.ts`)
   - `trackTikTokEvent(eventName, properties)` - Maps internal events to TikTok events
   - Helper functions for common events:
     - `trackTikTokPurchase()`
     - `trackTikTokCompleteRegistration()`
     - `trackTikTokStartTrial()`
     - `trackTikTokViewContent()`
     - `trackTikTokLead()`

#### Event Mappings

Internal events are automatically mapped to TikTok standard events:

| Internal Event | TikTok Event |
|---------------|--------------|
| `user.signed_up` | `CompleteRegistration` |
| `user.activated` | `CompleteRegistration` |
| `subscription.created` | `Purchase` |
| `trial.started` | `StartTrial` |
| `paywall.viewed` | `ViewContent` |
| `core.action_started` | `ViewContent` |
| `core.action_completed` | `ViewContent` |
| `onboarding.completed` | `CompleteRegistration` |

### Funnel App Integration

#### Layout (`apps/funnel/app/layout.tsx`)

```tsx
import { TikTokProvider, TikTokPageView } from '@ryla/analytics';

// In RootLayout:
<TikTokProvider>
  <TikTokPageView />
  {children}
</TikTokProvider>
```

#### Analytics Service (`apps/funnel/services/analytics-service.ts`)

The analytics service now includes TikTok tracking:

- `trackSignUpEvent()` → Tracks `CompleteRegistration` + identifies user
- `trackPaymentEvent()` → Tracks `Purchase` or `StartTrial`
- `identify()` → Identifies user with hashed external_id
- `track()` → Maps internal events to TikTok events

#### Direct Tracking in Hooks

1. **Signup** (`apps/funnel/features/funnel/hooks/useSignUpForm.tsx`)
   - Tracks `CompleteRegistration` on successful signup
   - Identifies user with hashed email

2. **Payment** (`apps/funnel/features/funnel/hooks/usePaymentForm.tsx`)
   - Tracks `Purchase` on successful payment

## Usage Examples

### Basic Event Tracking

```tsx
import { trackTikTok } from '@ryla/analytics';

trackTikTok('Purchase', {
  value: 29.99,
  currency: 'USD',
  contents: [{
    content_id: 'subscription',
    content_type: 'product',
    content_name: 'Monthly Subscription'
  }]
});
```

### User Identification

```tsx
import { identifyTikTok, hashSHA256 } from '@ryla/analytics';

const hashedEmail = await hashSHA256('user@example.com');
identifyTikTok({ email: hashedEmail });
```

### Using Event Mappings

```tsx
import { trackTikTokEvent } from '@ryla/analytics';

// Automatically maps 'user.signed_up' to 'CompleteRegistration'
trackTikTokEvent('user.signed_up', {
  value: 0,
  currency: 'USD'
});
```

### Helper Functions

```tsx
import { 
  trackTikTokPurchase,
  trackTikTokCompleteRegistration,
  trackTikTokStartTrial 
} from '@ryla/analytics';

trackTikTokPurchase({
  value: 29.99,
  currency: 'USD',
  content_id: 'subscription',
  content_name: 'Monthly Plan'
});
```

## Environment Variables

```bash
# TikTok Pixel ID (optional, defaults to D56GRRRC77UAQNS9K9O0)
NEXT_PUBLIC_TIKTOK_PIXEL_ID=D56GRRRC77UAQNS9K9O0

# Enable tracking in development (optional)
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true
```

## Privacy & Data Handling

- **Email/Phone Hashing**: All PII (email, phone) must be SHA-256 hashed before sending to TikTok
- **User Identification**: Use `hashSHA256()` utility function
- **External IDs**: User IDs should also be hashed when used as `external_id`

## Testing

1. **Development**: TikTok tracking is disabled by default in development
2. **Enable Dev Tracking**: Set `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true`
3. **Browser Console**: Check for `[TikTok]` log messages
4. **TikTok Events Manager**: Verify events appear in TikTok dashboard

## TikTok Events API (Server-Side)

For server-side tracking, use TikTok Events API:

```bash
POST https://business-api.tiktok.com/open_api/v1.3/event/track/
Headers:
  Access-Token: <ACCESS_TOKEN>
  Content-Type: application/json

Body:
{
  "event_source": "web",
  "event_source_id": "D56GRRRC77UAQNS9K9O0",
  "data": [{
    "event": "Purchase",
    "properties": {
      "value": 29.99,
      "currency": "USD"
    },
    "user": {
      "email": "<hashed_email>",
      "ip": "<ip_address>",
      "user_agent": "<user_agent>"
    }
  }]
}
```

**Note**: Access token must be generated in TikTok Events Manager → Settings tab.

## Files Created/Modified

### Created
- `libs/analytics/src/TikTokProvider.tsx`
- `libs/analytics/src/TikTokPageView.tsx`
- `libs/analytics/src/tiktok.ts`
- `libs/analytics/src/tiktok-events.ts`
- `docs/analytics/TIKTOK-TRACKING.md`

### Modified
- `libs/analytics/src/index.ts` - Added TikTok exports
- `apps/funnel/app/layout.tsx` - Added TikTokProvider and TikTokPageView
- `apps/funnel/services/analytics-service.ts` - Added TikTok tracking methods
- `apps/funnel/features/funnel/hooks/useSignUpForm.tsx` - Added TikTok signup tracking
- `apps/funnel/features/funnel/hooks/usePaymentForm.tsx` - Added TikTok purchase tracking

## Next Steps

1. Generate access token in TikTok Events Manager for server-side tracking
2. Test events in TikTok Events Manager dashboard
3. Set up conversion tracking for key events (Purchase, CompleteRegistration)
4. Monitor event delivery and fix any issues

