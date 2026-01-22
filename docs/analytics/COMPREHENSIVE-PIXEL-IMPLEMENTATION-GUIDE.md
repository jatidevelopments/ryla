# Comprehensive Social Media Pixel Implementation Guide

## Overview

This guide provides a complete reference for implementing Facebook Pixel, TikTok Pixel, and Twitter/X Pixel in Next.js applications, following industry best practices and official platform recommendations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Implementation Patterns](#implementation-patterns)
3. [Platform-Specific Guides](#platform-specific-guides)
4. [Testing & Verification](#testing--verification)
5. [Troubleshooting](#troubleshooting)
6. [Performance Optimization](#performance-optimization)
7. [Security & Privacy](#security--privacy)

## Architecture Overview

### Provider Pattern

All pixel implementations follow a consistent provider pattern:

```
Provider Component
├── Script Loading (Next.js Script component)
├── Initialization Guards (prevent double-loading)
├── Environment Detection (dev/prod)
└── Children (app content)
```

### Component Structure

```
@ryla/analytics/
├── FacebookProvider.tsx      # FB Pixel provider
├── TikTokProvider.tsx        # TikTok Pixel provider
├── TwitterProvider.tsx       # Twitter/X Pixel provider
├── FacebookPageView.tsx      # Auto pageview (if needed)
├── TikTokPageView.tsx        # Auto pageview tracking
├── TwitterPageView.tsx       # Auto pageview tracking
├── facebook.ts               # FB tracking functions
├── tiktok.ts                 # TikTok tracking functions
├── twitter.ts                # Twitter tracking functions
├── facebook-events.ts        # FB event mappings (if needed)
├── tiktok-events.ts          # TikTok event mappings
└── twitter-events.ts         # Twitter event mappings
```

## Implementation Patterns

### 1. Script Loading Pattern

**All providers use Next.js Script component with `afterInteractive` strategy:**

```tsx
<Script id="pixel-script" strategy="afterInteractive">
  {`
    // Pixel initialization code with guards
  `}
</Script>
```

**Why `afterInteractive`:**
- Loads after page becomes interactive
- Non-blocking for critical rendering
- Optimal for tracking pixels
- Better Core Web Vitals scores

### 2. Guard Pattern

**Five-layer guard system prevents double-loading:**

```tsx
// Guard 1: Prevent script execution
if (window.__pixelScriptExecuted) return;
window.__pixelScriptExecuted = true;

// Guard 2: Prevent init start
if (window.__pixelInitStarted) return;
window.__pixelInitStarted = true;

// Guard 3: Validate pixel ID
if (!/^[pattern]+$/.test(pixelId)) {
  console.error('Invalid pixel ID');
  return;
}

// Guard 4: Prevent init call
if (window.__pixelInitialized) return;
window.__pixelInitialized = true;

// Guard 5: Prevent duplicate PageView
if (!window.__pixelPageViewTracked) {
  trackPageView();
  window.__pixelPageViewTracked = true;
}
```

### 3. Environment Detection Pattern

**Consistent environment handling across all providers:**

```tsx
const isProduction = process.env.NODE_ENV === "production";
const enableInDev = 
  config.enableInDev || 
  process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

if (!isProduction && !enableInDev) {
  return <>{children}</>; // Skip in dev
}
```

### 4. Route Change Tracking Pattern

**Automatic pageview tracking on navigation:**

```tsx
// TwitterPageView.tsx, TikTokPageView.tsx
function PixelPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}

export function PixelPageView() {
  return (
    <Suspense fallback={null}>
      <PixelPageViewInner />
    </Suspense>
  );
}
```

### 5. Event Tracking Pattern

**Safe event tracking with availability checks:**

```tsx
// Core tracking function
export function trackPixel(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!isPixelAvailable()) {
    if (DEBUG_MODE) {
      console.log(`[Pixel] ${eventName}:`, properties);
    }
    return;
  }

  try {
    window.pixelFunction('track', eventName, properties);
  } catch (error) {
    console.warn("Pixel track failed:", error);
  }
}
```

### 6. Queue Pattern

**Queue events if pixel not loaded:**

```tsx
const queue: Array<() => void> = [];

function safeTrack(...args: any[]) {
  if (typeof window.pixelFunction === "function") {
    window.pixelFunction(...args);
    flushQueue();
  } else {
    queue.push(() => window.pixelFunction?.(...args));
  }
}

function flushQueue() {
  while (queue.length) queue.shift()?.();
}
```

### 7. Deduplication Pattern

**Prevent duplicate events:**

```tsx
const sentEventIds = new Set<string>();

function withDedup(eventId?: string, fn?: () => void) {
  if (!eventId) return fn?.();
  if (sentEventIds.has(eventId)) return;
  sentEventIds.add(eventId);
  fn?.();
}
```

## Platform-Specific Guides

### Facebook Pixel

**Provider:** `FacebookProvider`
**Tracking:** `trackFacebook*` functions
**PageView:** Automatic on init + manual via `trackFacebookPageView()`

**Key Features:**
- Pixel ID: Numeric only
- Initialization: `fbq('init', pixelId)`
- Events: `fbq('track', eventName, params)`
- Noscript: Included in provider

**Standard Events:**
- `PageView` - Automatic
- `Lead` - Form submissions
- `Purchase` - Completed purchases
- `AddToCart` - Items added to cart
- `ViewContent` - Content viewed

**Example:**
```tsx
import { FacebookProvider, trackFacebookPurchase } from '@ryla/analytics';

// In layout
<FacebookProvider>
  {children}
</FacebookProvider>

// Track purchase
trackFacebookPurchase(29.99, 'USD', 'event-id-123');
```

### TikTok Pixel

**Provider:** `TikTokProvider`
**Tracking:** `trackTikTok*` functions
**PageView:** Automatic via `ttq.page()` + `TikTokPageView` component

**Key Features:**
- Pixel ID: Alphanumeric
- Initialization: `ttq.load(pixelId)`
- Events: `ttq.track(eventName, properties)`
- PII Hashing: Required for email/phone (SHA-256)

**Standard Events:**
- `PageView` - Via `ttq.page()`
- `CompleteRegistration` - User signups
- `Purchase` - Completed purchases
- `StartTrial` - Trial starts
- `ViewContent` - Content viewed
- `Lead` - Form submissions

**PII Hashing:**
```tsx
import { identifyTikTok, hashSHA256 } from '@ryla/analytics';

const hashedEmail = await hashSHA256(email);
identifyTikTok({ email: hashedEmail });
```

**Example:**
```tsx
import { TikTokProvider, TikTokPageView, trackTikTokPurchase } from '@ryla/analytics';

// In layout
<TikTokProvider>
  <TikTokPageView />
  {children}
</TikTokProvider>

// Track purchase
trackTikTokPurchase({
  value: 29.99,
  currency: 'USD',
  content_id: 'product-123',
  content_name: 'Product Name'
});
```

### Twitter/X Pixel

**Provider:** `TwitterProvider`
**Tracking:** `trackTwitter*` functions
**PageView:** Automatic on init + `TwitterPageView` component

**Key Features:**
- Pixel ID: Alphanumeric
- Initialization: `twq('init', pixelId)`
- Events: `twq('track', eventName, params)`
- No PII Hashing: Not required (unlike TikTok)

**Standard Events:**
- `PageView` - Automatic on init
- `Purchase` - Completed purchases
- `CompleteRegistration` - User signups
- `Lead` - Form submissions
- `AddToCart` - Items added to cart
- `InitiateCheckout` - Checkout started
- `ViewContent` - Content viewed

**Example:**
```tsx
import { TwitterProvider, TwitterPageView, trackTwitterPurchase } from '@ryla/analytics';

// In layout
<TwitterProvider>
  <TwitterPageView />
  {children}
</TwitterProvider>

// Track purchase
trackTwitterPurchase({
  value: 29.99,
  currency: 'USD',
  content_id: 'product-123',
  content_name: 'Product Name',
  event_id: 'unique-id' // For deduplication
});
```

## Testing & Verification

### Browser Extensions

1. **Facebook Pixel Helper**
   - Chrome extension
   - Shows pixel status, events, errors
   - Verify pixel ID and events

2. **TikTok Pixel Helper**
   - Chrome extension
   - Shows pixel status and events
   - Verify pixel ID and events

3. **Twitter Pixel Helper**
   - Chrome extension
   - Shows pixel status and events
   - Verify pixel ID and events

### Platform Dashboards

1. **Facebook Events Manager**
   - View real-time events
   - Check event parameters
   - Monitor event delivery

2. **TikTok Events Manager**
   - View events in dashboard
   - Check event parameters
   - Monitor delivery status

3. **Twitter Events Manager**
   - View events in dashboard
   - Check event parameters
   - Monitor delivery status

### Browser DevTools

**Network Tab:**
- Check script loading (200 status)
- Verify requests to pixel domains
- Check for blocked requests

**Console:**
- Check for pixel errors
- Verify debug logs (if enabled)
- Check for CSP violations

**Application Tab:**
- Check cookies set by pixels
- Verify localStorage usage
- Check for pixel data

## Troubleshooting

### Pixel Not Loading

**Symptoms:**
- No events in platform dashboard
- Pixel helper shows "Not Found"
- Network tab shows failed requests

**Solutions:**
1. Check pixel ID in environment variables
2. Verify CSP allows pixel domains
3. Check browser console for errors
4. Verify script loads in Network tab
5. Check if ad blocker is blocking

### Events Not Firing

**Symptoms:**
- Pixel loads but events don't appear
- Events in console but not in dashboard

**Solutions:**
1. Check if pixel is initialized
2. Verify event names are correct
3. Check event parameters format
4. Verify route change tracking works
5. Check for JavaScript errors

### Duplicate Events

**Symptoms:**
- Same event appears multiple times
- Event count higher than expected

**Solutions:**
1. Check guard implementation
2. Verify event deduplication
3. Check for multiple providers
4. Verify route change tracking
5. Check server-side + client-side tracking

### Performance Issues

**Symptoms:**
- Slow page loads
- High script execution time
- Poor Core Web Vitals

**Solutions:**
1. Use `afterInteractive` strategy
2. Verify script loading optimization
3. Check for multiple pixel loads
4. Monitor script execution time
5. Consider lazy loading non-critical pixels

## Performance Optimization

### Script Loading

1. **Use Next.js Script Component**
   - Optimized loading
   - Better performance
   - Prevents blocking

2. **Choose Right Strategy**
   - `afterInteractive` for pixels
   - `lazyOnload` for optional tracking
   - Avoid `beforeInteractive` unless necessary

3. **Minimize Script Size**
   - Use official pixel scripts
   - Avoid custom wrappers
   - Remove unused code

### Event Tracking

1. **Queue Early Events**
   - Queue if pixel not loaded
   - Flush when available
   - Prevent event loss

2. **Batch Events**
   - Group similar events
   - Reduce API calls
   - Improve performance

3. **Debounce Rapid Events**
   - Prevent spam
   - Reduce load
   - Improve accuracy

## Security & Privacy

### Content Security Policy

**Required Domains:**

**Facebook:**
- `connect.facebook.net` (script-src, connect-src)
- `www.facebook.com` (img-src, connect-src)

**TikTok:**
- `analytics.tiktok.com` (script-src, connect-src, img-src)

**Twitter/X:**
- `static.ads-twitter.com` (script-src)
- `analytics.twitter.com` (connect-src, img-src)
- `ads-api.twitter.com` (connect-src)

### Privacy Compliance

1. **GDPR/CCPA Compliance**
   - Only load after consent
   - Respect opt-out requests
   - Document data collection

2. **PII Handling**
   - Hash PII for TikTok
   - Don't send unhashed PII
   - Follow platform guidelines

3. **Cookie Consent**
   - Check consent before loading
   - Respect cookie preferences
   - Document cookie usage

## Related Documentation

- Best Practices: `docs/analytics/SOCIAL-MEDIA-PIXEL-BEST-PRACTICES.md`
- Facebook: `docs/analytics/FACEBOOK-TRACKING.md` (if exists)
- TikTok: `docs/analytics/TIKTOK-TRACKING.md`
- Twitter/X: `docs/analytics/TWITTER-X-TRACKING.md`
- Integration Plan: `docs/analytics/TWITTER-X-INTEGRATION-PLAN.md`
