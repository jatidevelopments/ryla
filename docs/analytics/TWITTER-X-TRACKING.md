# Twitter/X Pixel Tracking Implementation

## Overview

Twitter/X pixel tracking has been implemented in the `@ryla/analytics` shared library and integrated into the funnel app. This follows the same pattern as Facebook and TikTok tracking for consistency.

## Pixel Information

- **Pixel ID**: Set via `NEXT_PUBLIC_TWITTER_PIXEL_ID` environment variable
- **Pixel Name**: RYLA Twitter Pixel
- **Environment Variable**: `NEXT_PUBLIC_TWITTER_PIXEL_ID` (required)

## Implementation

### Analytics Library (`@ryla/analytics`)

#### Components

1. **TwitterProvider** (`libs/analytics/src/TwitterProvider.tsx`)
   - Loads Twitter/X pixel script (`twq`)
   - Handles initialization and environment detection
   - Opts out in development unless `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true`
   - Uses Next.js `Script` component with `afterInteractive` strategy

2. **TwitterPageView** (`libs/analytics/src/TwitterPageView.tsx`)
   - Automatically tracks pageviews on route changes
   - Wrapped in Suspense for Next.js compatibility
   - Uses `usePathname` and `useSearchParams` hooks

#### Functions

1. **Core Tracking** (`libs/analytics/src/twitter.ts`)
   - `trackTwitter(eventName, properties)` - Track any Twitter/X event
   - `trackTwitterPageView()` - Track pageview
   - `isTwitterAvailable()` - Check if Twitter pixel is loaded

2. **Event Mappings** (`libs/analytics/src/twitter-events.ts`)
   - `trackTwitterEvent(eventName, properties)` - Maps internal events to Twitter events
   - Helper functions for common events:
     - `trackTwitterPurchase()`
     - `trackTwitterCompleteRegistration()`
     - `trackTwitterStartTrial()`
     - `trackTwitterViewContent()`
     - `trackTwitterLead()`
     - `trackTwitterAddToCart()`
     - `trackTwitterInitiateCheckout()`

## Twitter/X Standard Events

Twitter/X supports these standard events (similar to Facebook):

| Event | Description | When to Use |
|-------|-------------|-------------|
| `PageView` | Page view | Automatic on route change |
| `Purchase` | Purchase completed | After successful payment |
| `CompleteRegistration` | User registration | After signup |
| `Lead` | Lead generated | After form submission |
| `AddToCart` | Item added to cart | When user adds to cart |
| `InitiateCheckout` | Checkout started | When payment form opens |
| `ViewContent` | Content viewed | When viewing product/content |
| `StartTrial` | Trial started | When trial begins |

## Event Mappings

Internal events are automatically mapped to Twitter/X standard events:

| Internal Event | Twitter/X Event |
|---------------|-----------------|
| `user.signed_up` | `CompleteRegistration` |
| `user.activated` | `CompleteRegistration` |
| `subscription.created` | `Purchase` |
| `trial.started` | `StartTrial` |
| `paywall.viewed` | `ViewContent` |
| `core.action_started` | `ViewContent` |
| `core.action_completed` | `ViewContent` |
| `onboarding.completed` | `CompleteRegistration` |

## Usage

### Basic Setup

```tsx
// In app/layout.tsx or AnalyticsProviders.tsx
import { TwitterProvider, TwitterPageView } from '@ryla/analytics';

export default function Layout({ children }) {
  return (
    <TwitterProvider>
      <Suspense fallback={null}>
        <TwitterPageView />
      </Suspense>
      {children}
    </TwitterProvider>
  );
}
```

### Track Events

```tsx
import {
  trackTwitterPurchase,
  trackTwitterLead,
  trackTwitterCompleteRegistration,
  trackTwitterViewContent,
} from '@ryla/analytics';

// Track purchase
trackTwitterPurchase({
  value: 29.99,
  currency: 'USD',
  content_id: 'subscription',
  content_name: 'Monthly Plan'
});

// Track lead
trackTwitterLead();

// Track registration
trackTwitterCompleteRegistration();

// Track content view
trackTwitterViewContent({
  content_id: 'product-123',
  content_name: 'AI Influencer Package'
});
```

### Using Event Mapping

```tsx
import { trackTwitterEvent } from '@ryla/analytics';

// Automatically maps to Twitter event
trackTwitterEvent('user.signed_up', {
  value: 0,
  currency: 'USD'
});
```

## Environment Variables

```bash
# Twitter/X Pixel ID (required)
NEXT_PUBLIC_TWITTER_PIXEL_ID=your_pixel_id_here

# Enable tracking in development (optional)
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true

# Debug mode (optional)
NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true
```

## Privacy & Data Handling

- **No PII Required**: Twitter/X pixel does not require hashing of email/phone like TikTok
- **Event IDs**: Use event IDs for deduplication when tracking both client-side and server-side
- **User Privacy**: Respect user consent and privacy regulations (GDPR, CCPA)

## Testing

1. **Development**: Twitter tracking is disabled by default in development
2. **Enable Dev Tracking**: Set `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true`
3. **Browser Console**: Check for `[Twitter]` log messages when debug mode is enabled
4. **Twitter Events Manager**: Verify events appear in Twitter Ads dashboard
5. **Browser DevTools**: Check Network tab for requests to `analytics.twitter.com`

## Twitter/X Pixel Helper

Use Twitter's browser extension to verify pixel implementation:
- Install "Twitter Pixel Helper" browser extension
- Navigate to your site
- Check extension for pixel initialization and events

## Best Practices

1. **Load Script Early**: Use `afterInteractive` strategy for faster initialization
2. **Track Route Changes**: Use `TwitterPageView` component for automatic pageview tracking
3. **Deduplicate Events**: Use event IDs when tracking both client and server-side
4. **Test in Production**: Always test pixel in production environment
5. **Monitor Events**: Regularly check Twitter Events Manager for event delivery

## Server-Side Tracking (Future)

For server-side tracking, use Twitter's Events API:

```bash
POST https://ads-api.twitter.com/2/measurement/conversions
Headers:
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json

Body:
{
  "conversions": [{
    "conversion_id": "pixel_id",
    "event": "Purchase",
    "value": 29.99,
    "currency": "USD",
    "event_id": "unique_event_id",
    "user": {
      "email": "<hashed_email>",
      "ip": "<ip_address>",
      "user_agent": "<user_agent>"
    }
  }]
}
```

**Note**: Access token must be generated in Twitter Ads Manager → Tools → Conversion tracking.

## Files Created/Modified

### Created
- `libs/analytics/src/TwitterProvider.tsx`
- `libs/analytics/src/TwitterPageView.tsx`
- `libs/analytics/src/twitter.ts`
- `libs/analytics/src/twitter-events.ts`
- `docs/analytics/TWITTER-X-TRACKING.md`

### Modified
- `libs/analytics/src/index.ts` - Added Twitter exports
- `apps/funnel/components/AnalyticsProviders.tsx` - Added TwitterProvider and TwitterPageView
- `apps/funnel/services/analytics-service.ts` - Added Twitter tracking methods

## Integration Checklist

- [x] TwitterProvider component created
- [x] Twitter tracking functions implemented
- [x] TwitterPageView component for auto pageview tracking
- [x] Event mapping system created
- [x] Integrated into AnalyticsProviders
- [x] Added to funnel analytics service
- [x] Documentation created
- [ ] Pixel ID configured in environment variables
- [ ] Tested in production environment
- [ ] Verified in Twitter Events Manager

## Related Documentation

- Facebook Pixel: `docs/analytics/FACEBOOK-TRACKING.md` (if exists)
- TikTok Pixel: `docs/analytics/TIKTOK-TRACKING.md`
- Analytics Overview: `docs/analytics/TRACKING-PLAN.md`
