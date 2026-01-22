# Social Media Pixel Tracking - Best Practices for Next.js

## Overview

This document outlines best practices for implementing Facebook Pixel, TikTok Pixel, and Twitter/X Pixel in Next.js applications, based on official documentation, community best practices, and reference implementations.

## Core Principles

### 1. Use Next.js Script Component

**Always use `next/script` instead of `document.createElement` or inline scripts.**

**Why:**
- Optimizes loading and execution
- Prevents blocking critical rendering
- Improves Core Web Vitals
- Better performance and SEO

**Strategy Selection:**
- `afterInteractive` (recommended for pixels) - Loads after page becomes interactive
- `lazyOnload` - Loads during idle time (for non-critical tracking)
- `beforeInteractive` - Only for critical scripts that must run before hydration

```tsx
// ✅ Good: Using Script component
<Script id="pixel-script" strategy="afterInteractive">
  {`/* pixel code */`}
</Script>

// ❌ Bad: Using document.createElement
const script = document.createElement('script');
script.innerHTML = `/* pixel code */`;
document.head.appendChild(script);
```

### 2. Prevent Double-Loading

**Always implement guards to prevent scripts from loading multiple times.**

**Why:**
- Prevents duplicate events
- Avoids performance issues
- Prevents tracking errors

**Implementation Pattern:**
```tsx
// Guard 1: Prevent script execution
if (window.__pixelScriptExecuted) return;
window.__pixelScriptExecuted = true;

// Guard 2: Prevent initialization
if (window.__pixelInitStarted) return;
window.__pixelInitStarted = true;

// Guard 3: Prevent init call
if (window.__pixelInitialized) return;
window.__pixelInitialized = true;
```

### 3. Track Route Changes

**Fire PageView events on client-side navigation, not just initial load.**

**Why:**
- Next.js uses client-side routing
- Route changes don't trigger full page reloads
- Ensures accurate pageview tracking

**Implementation:**
```tsx
// Use usePathname hook (App Router)
const pathname = usePathname();
useEffect(() => {
  trackPageView();
}, [pathname]);
```

### 4. Environment-Aware Loading

**Disable tracking in development by default, enable via env var.**

**Why:**
- Prevents test data pollution
- Improves development performance
- Allows opt-in testing

**Pattern:**
```tsx
const isProduction = process.env.NODE_ENV === "production";
const enableInDev = process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS === "true";

if (!isProduction && !enableInDev) {
  return <>{children}</>;
}
```

### 5. Event Deduplication

**Use event IDs to prevent duplicate events when tracking both client and server-side.**

**Why:**
- Prevents double-counting conversions
- Improves data accuracy
- Required for server-side tracking

**Implementation:**
```tsx
const sentEventIds = new Set<string>();

function withDedup(eventId?: string, fn?: () => void) {
  if (!eventId) return fn?.();
  if (sentEventIds.has(eventId)) return;
  sentEventIds.add(eventId);
  fn?.();
}
```

### 6. Queue System for Early Events

**Queue events if pixel script hasn't loaded yet.**

**Why:**
- Events fired before script loads are lost
- Ensures all events are tracked
- Improves reliability

**Implementation:**
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
```

### 7. Content Security Policy (CSP)

**Whitelist required domains in CSP headers.**

**Required Domains:**

**Facebook Pixel:**
- `connect.facebook.net` (script-src, connect-src)
- `www.facebook.com` (img-src, connect-src)

**TikTok Pixel:**
- `analytics.tiktok.com` (script-src, connect-src)
- `analytics.tiktok.com` (img-src)

**Twitter/X Pixel:**
- `static.ads-twitter.com` (script-src)
- `analytics.twitter.com` (connect-src, img-src)
- `ads-api.twitter.com` (connect-src, for server-side)

**Example CSP:**
```
script-src 'self' 'unsafe-inline' connect.facebook.net analytics.tiktok.com static.ads-twitter.com;
connect-src 'self' www.facebook.com analytics.tiktok.com analytics.twitter.com ads-api.twitter.com;
img-src 'self' data: www.facebook.com analytics.tiktok.com static.ads-twitter.com analytics.twitter.com;
```

### 8. Noscript Fallback

**Include noscript fallback for users with JavaScript disabled.**

**Why:**
- Tracks users without JavaScript
- Improves tracking coverage
- Best practice for all pixels

**Implementation:**
```tsx
<noscript>
  <img
    height="1"
    width="1"
    style={{ display: "none" }}
    src={`https://pixel-domain.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
    alt=""
  />
</noscript>
```

## Platform-Specific Best Practices

### Facebook Pixel

**Official Documentation:** https://developers.facebook.com/docs/meta-pixel

**Key Points:**
1. Use `fbq('init', pixelId)` for initialization
2. Use `fbq('track', eventName, params)` for events
3. Pixel ID must be numeric
4. Supports Conversion API for server-side tracking

**Standard Events:**
- `PageView` - Automatic on init
- `Lead` - Form submissions
- `Purchase` - Completed purchases
- `AddToCart` - Items added to cart
- `ViewContent` - Content viewed

**Event Parameters:**
```tsx
trackFacebookPurchase(value, currency, eventId);
trackFacebookLead(eventId);
trackFacebookViewContent({ content_id, content_name });
```

### TikTok Pixel

**Official Documentation:** https://ads.tiktok.com/help/article?aid=10028

**Key Points:**
1. Use `ttq.load(pixelId)` for initialization
2. Use `ttq.track(eventName, properties)` for events
3. Use `ttq.page()` for pageviews
4. Pixel ID is alphanumeric
5. Requires SHA-256 hashing for PII (email, phone)

**Standard Events:**
- `PageView` - Via `ttq.page()`
- `CompleteRegistration` - User signups
- `Purchase` - Completed purchases
- `StartTrial` - Trial starts
- `ViewContent` - Content viewed
- `Lead` - Form submissions

**PII Hashing:**
```tsx
// Must hash email/phone before sending
const hashedEmail = await hashSHA256(email);
identifyTikTok({ email: hashedEmail });
```

### Twitter/X Pixel

**Official Documentation:** https://business.twitter.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites

**Key Points:**
1. Use `twq('init', pixelId)` for initialization
2. Use `twq('track', eventName, params)` for events
3. Pixel ID is alphanumeric
4. No PII hashing required (unlike TikTok)

**Standard Events:**
- `PageView` - Automatic on init
- `Purchase` - Completed purchases
- `CompleteRegistration` - User signups
- `Lead` - Form submissions
- `AddToCart` - Items added to cart
- `InitiateCheckout` - Checkout started
- `ViewContent` - Content viewed

**Event Parameters:**
```tsx
trackTwitterPurchase({
  value: 29.99,
  currency: 'USD',
  content_id: 'product-123',
  content_name: 'Product Name',
  event_id: 'unique-id' // For deduplication
});
```

## Implementation Checklist

### Setup
- [ ] Pixel IDs added to environment variables
- [ ] CSP headers configured (if using CSP)
- [ ] Development tracking disabled by default
- [ ] Environment variables documented

### Code Quality
- [ ] Using Next.js Script component
- [ ] Guards implemented to prevent double-loading
- [ ] Route change tracking implemented
- [ ] Event deduplication implemented
- [ ] Queue system for early events
- [ ] Noscript fallback included
- [ ] TypeScript types defined
- [ ] Error handling implemented

### Testing
- [ ] Pixel loads in production
- [ ] PageView events fire on route changes
- [ ] Custom events fire correctly
- [ ] Events appear in platform dashboards
- [ ] No console errors
- [ ] Performance impact minimal
- [ ] CSP doesn't block pixels (if using CSP)

### Documentation
- [ ] Implementation documented
- [ ] Environment variables documented
- [ ] Usage examples provided
- [ ] Troubleshooting guide included
- [ ] Testing instructions included

## Common Pitfalls

### ❌ Don't: Load scripts in useEffect without Script component
```tsx
// Bad: Can cause hydration issues
useEffect(() => {
  const script = document.createElement('script');
  document.head.appendChild(script);
}, []);
```

### ❌ Don't: Fire events without checking if pixel is loaded
```tsx
// Bad: Events may be lost
window.fbq('track', 'Purchase');
```

### ❌ Don't: Hardcode pixel IDs
```tsx
// Bad: Not flexible
const pixelId = '123456789';
```

### ❌ Don't: Track in development without opt-in
```tsx
// Bad: Pollutes production data
trackPurchase(); // Always fires
```

### ✅ Do: Use Script component with guards
```tsx
// Good: Proper implementation
<Script id="pixel" strategy="afterInteractive">
  {`
    if (window.__pixelLoaded) return;
    window.__pixelLoaded = true;
    // pixel code
  `}
</Script>
```

### ✅ Do: Check availability before tracking
```tsx
// Good: Safe tracking
if (typeof window.fbq === 'function') {
  window.fbq('track', 'Purchase');
}
```

### ✅ Do: Use environment variables
```tsx
// Good: Flexible configuration
const pixelId = process.env.NEXT_PUBLIC_PIXEL_ID;
```

### ✅ Do: Environment-aware tracking
```tsx
// Good: Respects environment
if (isProduction || enableInDev) {
  trackPurchase();
}
```

## Performance Considerations

1. **Script Loading Strategy**
   - Use `afterInteractive` for pixels (non-blocking)
   - Avoid `beforeInteractive` unless absolutely necessary

2. **Event Batching**
   - Queue events if pixel not loaded
   - Flush queue when pixel becomes available

3. **Lazy Loading**
   - Consider lazy loading non-critical pixels
   - Use `lazyOnload` for optional tracking

4. **Minimize Script Size**
   - Use official pixel scripts (optimized)
   - Avoid custom wrappers that add overhead

## Testing Tools

### Browser Extensions
- **Facebook Pixel Helper** - Chrome extension for FB Pixel
- **TikTok Pixel Helper** - Chrome extension for TikTok Pixel
- **Twitter Pixel Helper** - Chrome extension for Twitter/X Pixel

### Platform Dashboards
- **Facebook Events Manager** - View FB Pixel events
- **TikTok Events Manager** - View TikTok Pixel events
- **Twitter Events Manager** - View Twitter/X Pixel events

### Browser DevTools
- **Network Tab** - Check script loading
- **Console** - Check for errors
- **Application Tab** - Check cookies/localStorage

## Related Documentation

- Facebook Pixel: `docs/analytics/FACEBOOK-TRACKING.md` (if exists)
- TikTok Pixel: `docs/analytics/TIKTOK-TRACKING.md`
- Twitter/X Pixel: `docs/analytics/TWITTER-X-TRACKING.md`
- Integration Plan: `docs/analytics/TWITTER-X-INTEGRATION-PLAN.md`
