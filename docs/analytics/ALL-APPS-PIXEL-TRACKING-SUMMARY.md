# Social Media Pixel Tracking - All Apps Summary

## Overview

Social media pixel tracking (Facebook, TikTok, Twitter/X) has been implemented across all RYLA applications following industry best practices and Next.js optimization guidelines.

## Implementation Status

### ✅ Funnel App (`apps/funnel`)

**Status:** Complete and Production-Ready

**Providers:**
- ✅ FacebookProvider
- ✅ TikTokProvider
- ✅ TwitterProvider
- ✅ ClientPostHogProvider

**PageView Tracking:**
- ✅ FacebookPageView (route changes)
- ✅ TikTokPageView (route changes)
- ✅ TwitterPageView (route changes)
- ✅ PostHogPageView (route changes)

**Events Tracked:**
- Purchase (multiple locations)
- Lead (signup forms, email entry)
- ViewContent (funnel entry)
- AddToCart (payment form)

**Infisical Path:** `/apps/funnel`

### ✅ Landing Page (`apps/landing`)

**Status:** Complete and Production-Ready

**Providers:**
- ✅ FacebookProvider
- ✅ TikTokProvider
- ✅ TwitterProvider
- ✅ ClientPostHogProvider

**PageView Tracking:**
- ✅ FacebookPageView (route changes)
- ✅ TikTokPageView (route changes)
- ✅ TwitterPageView (route changes)
- ✅ PostHogPageView (route changes)

**Events Tracked:**
- PageView (automatic on all pages)

**Infisical Path:** `/apps/landing`

## Pageview Tracking Best Practices

### Automatic Tracking

All pixels track pageviews in two ways:

1. **Initial Load**
   - Facebook: `fbq('track', 'PageView')` on init
   - TikTok: `ttq.page()` on init
   - Twitter/X: Automatic after `twq('config')`

2. **Route Changes**
   - All platforms: Tracked via PageView components
   - Uses `usePathname()` and `useSearchParams()` hooks
   - Automatically fires on client-side navigation

### Implementation Pattern

```tsx
// All PageView components follow this pattern
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

## Environment Variables

### Funnel App (`/apps/funnel`)

**Required:**
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- `NEXT_PUBLIC_TWITTER_PIXEL_ID`
- `NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID`
- `NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID`

**Optional:**
- `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS`
- `NEXT_PUBLIC_DEBUG_FB_PIXEL`
- `NEXT_PUBLIC_DEBUG_TWITTER_PIXEL`

### Landing Page (`/apps/landing`)

**Required:**
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- `NEXT_PUBLIC_TWITTER_PIXEL_ID`
- `NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID` (if tracking purchases)
- `NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID` (if tracking leads)

**Optional:**
- `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS`
- `NEXT_PUBLIC_DEBUG_FB_PIXEL`
- `NEXT_PUBLIC_DEBUG_TWITTER_PIXEL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

## Infisical Setup Commands

### Funnel App

```bash
# Base pixel IDs
infisical secrets set NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2633023407061165 --path=/apps/funnel --env=dev
infisical secrets set NEXT_PUBLIC_TIKTOK_PIXEL_ID=D56GRRRC77UAQNS9K9O0 --path=/apps/funnel --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/funnel --env=dev

# Twitter event IDs
infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/funnel --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/funnel --env=dev

# Optional
infisical secrets set NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true --path=/apps/funnel --env=dev
```

### Landing Page

```bash
# Base pixel IDs
infisical secrets set NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2633023407061165 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TIKTOK_PIXEL_ID=D56GRRRC77UAQNS9K9O0 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/landing --env=dev

# Twitter event IDs (if tracking conversions on landing)
infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/landing --env=dev

# Optional
infisical secrets set NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true --path=/apps/landing --env=dev
```

**Note:** Repeat for `--env=staging` and `--env=prod` as needed.

## Architecture

### Shared Library (`@ryla/analytics`)

All pixel implementations are in the shared analytics library:

```
libs/analytics/src/
├── FacebookProvider.tsx      # FB Pixel provider
├── FacebookPageView.tsx      # FB route change tracking
├── TikTokProvider.tsx        # TikTok Pixel provider
├── TikTokPageView.tsx        # TikTok route change tracking
├── TwitterProvider.tsx       # Twitter/X Pixel provider
├── TwitterPageView.tsx       # Twitter/X route change tracking
├── facebook.ts               # FB tracking functions
├── tiktok.ts                 # TikTok tracking functions
├── twitter.ts                # Twitter tracking functions
├── twitter-events.ts         # Twitter event mappings
└── tiktok-events.ts         # TikTok event mappings
```

### App Integration

**Funnel App:**
- `apps/funnel/components/AnalyticsProviders.tsx`
- Integrated in root layout or provider stack

**Landing Page:**
- `apps/landing/components/AnalyticsProviders.tsx`
- Integrated in root layout

## Best Practices Compliance

### ✅ All Apps

- [x] Use Next.js Script component
- [x] Five-layer guard system
- [x] Environment-aware loading
- [x] Route change tracking
- [x] Event deduplication
- [x] Queue system for early events
- [x] TypeScript types
- [x] Error handling
- [x] Noscript fallback (Facebook, Twitter)

## Testing Checklist

### Funnel App
- [x] Providers load without errors
- [x] PageView tracks on route changes
- [x] Purchase events fire correctly
- [x] Lead events fire correctly
- [ ] Production testing pending

### Landing Page
- [x] Providers load without errors
- [x] PageView tracks on route changes
- [x] All pages tracked (/, /contact, /privacy, /terms, /imprint)
- [ ] Production testing pending

## Next Steps

1. **Add Secrets to Infisical**
   - Add all pixel IDs to `/apps/funnel` and `/apps/landing`
   - Set for dev, staging, and prod environments

2. **Production Testing**
   - Deploy to staging
   - Verify pixel loading
   - Test with pixel helper extensions
   - Verify events in platform dashboards

3. **Monitor**
   - Check pixel loading performance
   - Monitor event delivery
   - Track conversion attribution

## Related Documentation

- Best Practices: `docs/analytics/SOCIAL-MEDIA-PIXEL-BEST-PRACTICES.md`
- Implementation Guide: `docs/analytics/COMPREHENSIVE-PIXEL-IMPLEMENTATION-GUIDE.md`
- Landing Page: `docs/analytics/LANDING-PAGE-PIXEL-TRACKING.md`
- Twitter/X Setup: `docs/analytics/TWITTER-X-ENV-SETUP.md`
- Infisical Setup: `docs/technical/INFISICAL-SETUP.md`
