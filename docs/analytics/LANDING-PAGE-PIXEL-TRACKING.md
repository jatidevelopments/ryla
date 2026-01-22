# Landing Page Social Media Pixel Tracking

## Overview

The landing page (`apps/landing`) now includes social media pixel tracking for Facebook, TikTok, and Twitter/X, following the same best practices as the funnel app.

## Implementation

### Analytics Providers

The landing page uses the same `AnalyticsProviders` component pattern as the funnel:

```tsx
// apps/landing/components/AnalyticsProviders.tsx
<ClientPostHogProvider>
  <TikTokProvider>
    <TwitterProvider>
      <FacebookProvider>
        <PostHogPageView />
        <FacebookPageView />
        <TikTokPageView />
        <TwitterPageView />
        {children}
      </FacebookProvider>
    </TwitterProvider>
  </TikTokProvider>
</ClientPostHogProvider>
```

### Integration

The `AnalyticsProviders` component is integrated in the root layout:

```tsx
// apps/landing/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProviders>
          <StructuredData />
          {children}
        </AnalyticsProviders>
      </body>
    </html>
  );
}
```

## Pageview Tracking

### Automatic Pageview Tracking

All pixels track pageviews automatically:

1. **Facebook Pixel**
   - Tracks PageView on initial load (via `fbq('init')`)
   - Tracks PageView on route changes (via `FacebookPageView` component)

2. **TikTok Pixel**
   - Tracks PageView on initial load (via `ttq.page()`)
   - Tracks PageView on route changes (via `TikTokPageView` component)

3. **Twitter/X Pixel**
   - Tracks PageView automatically after `twq('config')`
   - Tracks PageView on route changes (via `TwitterPageView` component)

4. **PostHog**
   - Tracks pageviews on route changes (via `PostHogPageView` component)

### Route Change Detection

All PageView components use Next.js App Router hooks:

```tsx
const pathname = usePathname();
const searchParams = useSearchParams();

useEffect(() => {
  trackPageView();
}, [pathname, searchParams]);
```

This ensures pageviews are tracked when users navigate between pages (e.g., `/` → `/contact`, `/privacy`, etc.).

## Environment Variables

### Required (Infisical: `/apps/landing`)

```bash
# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2633023407061165

# TikTok Pixel
NEXT_PUBLIC_TIKTOK_PIXEL_ID=D56GRRRC77UAQNS9K9O0

# Twitter/X Pixel
NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6
NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7
NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8

# PostHog (if using)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Optional

```bash
# Enable tracking in development
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true

# Debug modes
NEXT_PUBLIC_DEBUG_FB_PIXEL=true
NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true
```

## Infisical Setup

### Add Secrets to Infisical

```bash
# Set pixel IDs for landing page
infisical secrets set NEXT_PUBLIC_FACEBOOK_PIXEL_ID=2633023407061165 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TIKTOK_PIXEL_ID=D56GRRRC77UAQNS9K9O0 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_PIXEL_ID=qwgn6 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_PURCHASE_EVENT_ID=tw-qwgn6-qwgn7 --path=/apps/landing --env=dev
infisical secrets set NEXT_PUBLIC_TWITTER_LEAD_EVENT_ID=tw-qwgn6-qwgn8 --path=/apps/landing --env=dev

# Repeat for staging and prod environments
infisical secrets set ... --env=staging
infisical secrets set ... --env=prod
```

### Verify Setup

```bash
# List all landing page secrets
infisical secrets --path=/apps/landing --env=dev

# Test export
infisical export --path=/apps/landing --env=dev | grep PIXEL
```

## Event Tracking

### Landing Page Events

The landing page primarily tracks:

1. **PageView** - Automatic on all pages
   - Homepage (`/`)
   - Contact (`/contact`)
   - Privacy (`/privacy`)
   - Terms (`/terms`)
   - Imprint (`/imprint`)

2. **ViewContent** - Can be added for specific sections
   - Hero section views
   - Feature section views
   - Pricing section views

3. **Lead** - Can be added for form submissions
   - Contact form submissions
   - Newsletter signups

### Adding Custom Events

To track custom events on the landing page:

```tsx
import { 
  trackFacebookViewContent,
  trackTikTokViewContent,
  trackTwitterViewContent,
  trackFacebookLead,
  trackTikTokLead,
  trackTwitterLead,
} from '@ryla/analytics';

// Track content view
trackFacebookViewContent({ content_id: 'pricing-section' });
trackTikTokViewContent({ content_id: 'pricing-section' });
trackTwitterViewContent({ content_id: 'pricing-section' });

// Track lead
trackFacebookLead();
trackTikTokLead();
trackTwitterLead({ email_address: 'user@example.com' });
```

## Best Practices

### 1. Consistent Pixel IDs

- Use the same pixel IDs across landing page and funnel for unified tracking
- Or use separate pixel IDs if you want to track them separately

### 2. Route Change Tracking

- All PageView components automatically track route changes
- No manual tracking needed for navigation

### 3. Environment-Aware

- Tracking disabled in development by default
- Enable with `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true` for testing

### 4. Performance

- All pixels use `afterInteractive` strategy
- Non-blocking script loading
- Minimal performance impact

## Testing

### Development Testing

1. Enable dev analytics:
   ```bash
   infisical secrets set NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true --path=/apps/landing --env=dev
   ```

2. Enable debug mode:
   ```bash
   infisical secrets set NEXT_PUBLIC_DEBUG_FB_PIXEL=true --path=/apps/landing --env=dev
   infisical secrets set NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true --path=/apps/landing --env=dev
   ```

3. Run the app:
   ```bash
   infisical run --path=/apps/landing --path=/shared --env=dev -- pnpm nx serve landing
   ```

4. Check browser console for debug logs
5. Use pixel helper extensions to verify

### Production Testing

1. Deploy to staging/production
2. Use pixel helper extensions:
   - Facebook Pixel Helper
   - TikTok Pixel Helper
   - Twitter Pixel Helper
3. Verify events in platform dashboards
4. Check Network tab for pixel requests

## Pages Tracked

The following landing page routes automatically track pageviews:

- `/` - Homepage
- `/contact` - Contact page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/imprint` - Imprint/legal

All route changes are automatically tracked via the PageView components.

## Related Documentation

- Best Practices: `docs/analytics/SOCIAL-MEDIA-PIXEL-BEST-PRACTICES.md`
- Implementation Guide: `docs/analytics/COMPREHENSIVE-PIXEL-IMPLEMENTATION-GUIDE.md`
- Twitter/X Setup: `docs/analytics/TWITTER-X-ENV-SETUP.md`
- Infisical Setup: `docs/technical/INFISICAL-SETUP.md`
