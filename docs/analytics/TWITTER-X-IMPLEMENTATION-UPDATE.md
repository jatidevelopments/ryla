# Twitter/X Pixel Implementation Update

## Overview

The Twitter/X pixel implementation has been updated to use Twitter's conversion tracking format with event IDs, matching the official Twitter/X pixel implementation pattern.

## Changes Made

### 1. Base Pixel Initialization

**Before:**
```javascript
twq('init', pixelId);
twq('track', 'PageView');
```

**After:**
```javascript
twq('config', pixelId); // Uses 'config' instead of 'init'
// PageView is tracked automatically
```

### 2. Purchase Events

**Before:**
```javascript
twq('track', 'Purchase', {
  value: 29.99,
  currency: 'USD'
});
```

**After (with event ID):**
```javascript
twq('event', 'tw-qwgn6-qwgn7', {
  value: 29.99,
  conversion_id: 'order-123', // For deduplication
  phone_number: '+1234567890' // Optional, E164 format
});
```

**Fallback (if event ID not set):**
```javascript
twq('track', 'Purchase', {
  value: 29.99,
  currency: 'USD'
});
```

### 3. Lead Events

**Before:**
```javascript
twq('track', 'Lead');
```

**After (with event ID):**
```javascript
twq('event', 'tw-qwgn6-qwgn8', {
  email_address: 'user@example.com',
  phone_number: '+1234567890' // Optional, E164 format
});
```

**Fallback (if event ID not set):**
```javascript
twq('track', 'Lead', {
  email_address: 'user@example.com'
});
```

## New Functions

### `trackTwitterEvent(eventId, properties)`

Tracks events using Twitter/X conversion tracking format with event IDs.

```typescript
import { trackTwitterEvent } from '@ryla/analytics';

trackTwitterEvent('tw-qwgn6-qwgn7', {
  value: 29.99,
  conversion_id: 'order-123'
});
```

### Updated `trackTwitterPurchase()`

Now supports both event ID format and standard format:

```typescript
import { trackTwitterPurchase } from '@ryla/analytics';

// Uses NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID if set
trackTwitterPurchase({
  value: 29.99,
  currency: 'USD',
  conversion_id: 'order-123', // For deduplication
  phone_number: '+1234567890' // Optional
});
```

### Updated `trackTwitterLead()`

Now supports both event ID format and standard format:

```typescript
import { trackTwitterLead } from '@ryla/analytics';

// Uses NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID if set
trackTwitterLead({
  email_address: 'user@example.com',
  phone_number: '+1234567890' // Optional
});
```

## Environment Variables

### Required

```bash
# Base pixel ID (e.g., 'qwgn6')
NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6

# Purchase event ID (e.g., 'tw-qwgn6-qwgn7')
NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7

# Lead event ID (e.g., 'tw-qwgn6-qwgn8')
NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8
```

### Optional

```bash
# Enable tracking in development
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true

# Enable debug logging
NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true
```

## Implementation Details

### TwitterProvider

- Uses `twq('config', pixelId)` instead of `twq('init', pixelId)`
- PageView is tracked automatically after config
- All guards remain in place

### Event Tracking

- Purchase events use `twq('event', eventId, {...})` format
- Lead events use `twq('event', eventId, {...})` format
- Falls back to standard `twq('track', ...)` if event IDs not set
- Supports `conversion_id` for deduplication
- Supports `email_address` and `phone_number` for lead events

### Funnel Integration

All funnel events have been updated:
- **Purchase**: Uses `conversion_id` for deduplication
- **Lead**: Can include `email_address` when available
- **ViewContent**: Uses standard format
- **AddToCart**: Uses standard format

## Migration Notes

### If Event IDs Not Set

The implementation gracefully falls back to standard event names:
- Purchase → `twq('track', 'Purchase', {...})`
- Lead → `twq('track', 'Lead', {...})`

This ensures backward compatibility.

### Breaking Changes

None. The implementation is backward compatible:
- If event IDs are not set, uses standard format
- All existing code continues to work
- New event ID format is opt-in via environment variables

## Testing

1. **Set Event IDs in Infisical:**
   ```bash
   infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/funnel --env=dev
   infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/funnel --env=dev
   infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/funnel --env=dev
   ```

2. **Enable Dev Analytics:**
   ```bash
   infisical secrets set NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true --path=/apps/funnel --env=dev
   ```

3. **Test in Browser:**
   - Use Twitter Pixel Helper extension
   - Check console for debug logs (if enabled)
   - Verify events in Twitter Events Manager

## Related Documentation

- Environment Setup: `docs/analytics/TWITTER-X-ENV-SETUP.md`
- Tracking Guide: `docs/analytics/TWITTER-X-TRACKING.md`
- Integration Plan: `docs/analytics/TWITTER-X-INTEGRATION-PLAN.md`
- Best Practices: `docs/analytics/SOCIAL-MEDIA-PIXEL-BEST-PRACTICES.md`
