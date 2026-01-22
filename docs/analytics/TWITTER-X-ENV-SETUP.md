# Twitter/X Pixel Environment Variables Setup

## Required Environment Variables

Add these to Infisical under `/apps/funnel` path:

### Base Pixel Configuration

```bash
# Twitter/X Pixel ID (base config ID, e.g., 'qwgn6')
NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6
```

### Event IDs (Twitter/X Conversion Tracking)

```bash
# Purchase Event ID (e.g., 'tw-qwgn6-qwgn7')
NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7

# Lead Event ID (e.g., 'tw-qwgn6-qwgn8')
NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8
```

### Optional Configuration

```bash
# Enable tracking in development (optional)
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true

# Enable debug logging for Twitter Pixel (optional)
NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true
```

## Infisical Setup Commands

### Add to Infisical

```bash
# Set base pixel ID
infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/funnel --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/funnel --env=staging
infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/funnel --env=prod

# Set purchase event ID
infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/funnel --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/funnel --env=staging
infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/funnel --env=prod

# Set lead event ID
infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/funnel --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/funnel --env=staging
infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/funnel --env=prod

# Optional: Enable dev analytics
infisical secrets set NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true --path=/apps/funnel --env=dev

# Optional: Enable debug mode
infisical secrets set NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true --path=/apps/funnel --env=dev
```

### Verify Setup

```bash
# List all Twitter-related secrets
infisical secrets --path=/apps/funnel --env=dev | grep TWITTER

# Test export
infisical export --path=/apps/funnel --env=dev | grep TWITTER
```

## How It Works

### Base Pixel Code

The implementation uses Twitter/X's conversion tracking format:

```javascript
// Base code (in TwitterProvider)
twq('config', 'qwgn6'); // Uses NEXT_PUBLIC_TWITTER_PIXEL_ID
```

### Purchase Events

Purchase events use the event ID format:

```javascript
// Purchase event (in trackTwitterPurchase)
twq('event', 'tw-qwgn6-qwgn7', {
  value: 29.99,
  conversion_id: 'order-123', // For deduplication
  phone_number: '+1234567890' // Optional, E164 format
});
```

### Lead Events

Lead events use the event ID format:

```javascript
// Lead event (in trackTwitterLead)
twq('event', 'tw-qwgn6-qwgn8', {
  email_address: 'user@example.com',
  phone_number: '+1234567890' // Optional, E164 format
});
```

## Fallback Behavior

If event IDs are not set, the implementation falls back to standard event names:

- Purchase: `twq('track', 'Purchase', {...})`
- Lead: `twq('track', 'Lead', {...})`

This ensures backward compatibility and works even if event IDs are not configured.

## Related Documentation

- Twitter/X Tracking: `docs/analytics/TWITTER-X-TRACKING.md`
- Integration Plan: `docs/analytics/TWITTER-X-INTEGRATION-PLAN.md`
- Best Practices: `docs/analytics/SOCIAL-MEDIA-PIXEL-BEST-PRACTICES.md`
- Infisical Setup: `docs/technical/INFISICAL-SETUP.md`
