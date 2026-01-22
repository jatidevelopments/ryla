# Twitter/X Pixel Integration Plan

## Overview

This document outlines the integration plan for Twitter/X pixel tracking in the RYLA funnel application, following the same patterns established for Facebook and TikTok pixel tracking.

## Goals

1. Implement Twitter/X pixel tracking in `@ryla/analytics` library
2. Integrate Twitter tracking into funnel app
3. Track key conversion events (Purchase, Lead, Registration)
4. Maintain consistency with existing Facebook/TikTok implementations
5. Provide comprehensive documentation

## Architecture

### Library Structure

```
libs/analytics/src/
├── TwitterProvider.tsx      # Provider component (loads pixel script)
├── TwitterPageView.tsx      # Auto pageview tracking component
├── twitter.ts               # Core tracking functions
├── twitter-events.ts        # Event mappings and helpers
└── index.ts                # Export Twitter functions
```

### Integration Points

```
apps/funnel/
├── components/
│   └── AnalyticsProviders.tsx    # Add TwitterProvider
├── services/
│   └── analytics-service.ts      # Add Twitter tracking methods
└── features/funnel/
    ├── hooks/
    │   ├── usePaymentForm.tsx    # Add Twitter purchase tracking
    │   └── useSignUpForm.tsx     # Add Twitter registration tracking
    └── components/Steps/
        └── PaymentFormStep.tsx   # Add Twitter lead tracking
```

## Implementation Steps

### Phase 1: Core Library Implementation ✅

1. **Create TwitterProvider Component**
   - Load Twitter pixel script (`twq`)
   - Handle initialization with guards (prevent double-loading)
   - Environment detection (dev/prod)
   - Use Next.js `Script` component with `afterInteractive`

2. **Create Twitter Tracking Functions** (`twitter.ts`)
   - `isTwitterAvailable()` - Check if `twq` is loaded
   - `trackTwitter()` - Core tracking function
   - `trackTwitterPageView()` - Pageview tracking
   - Safe wrapper with queue for early events
   - Debug mode support

3. **Create Twitter Event Mappings** (`twitter-events.ts`)
   - Map internal events to Twitter standard events
   - Helper functions for common events:
     - `trackTwitterPurchase()`
     - `trackTwitterLead()`
     - `trackTwitterCompleteRegistration()`
     - `trackTwitterViewContent()`
     - `trackTwitterAddToCart()`
     - `trackTwitterInitiateCheckout()`

4. **Create TwitterPageView Component**
   - Auto-track pageviews on route changes
   - Use `usePathname` and `useSearchParams` hooks
   - Wrapped in Suspense for Next.js compatibility

5. **Update Library Exports**
   - Add Twitter exports to `libs/analytics/src/index.ts`

### Phase 2: Funnel Integration ✅

1. **Update AnalyticsProviders**
   - Add `TwitterProvider` to provider stack
   - Add `TwitterPageView` component
   - Maintain provider order (PostHog → TikTok → Twitter → Facebook)

2. **Update Analytics Service**
   - Add Twitter tracking methods to `analytics-service.ts`
   - Integrate with existing event tracking flow
   - Add Twitter event mapping for signup/payment events

3. **Add Tracking to Funnel Events**
   - **Purchase Events**: Add `trackTwitterPurchase()` in payment completion
   - **Lead Events**: Add `trackTwitterLead()` in form submissions
   - **Registration Events**: Add `trackTwitterCompleteRegistration()` in signup flow
   - **ViewContent Events**: Add `trackTwitterViewContent()` in funnel entry

### Phase 3: Documentation & Testing ✅

1. **Create Documentation**
   - Implementation guide (`TWITTER-X-TRACKING.md`)
   - Integration plan (this document)
   - Usage examples
   - Environment variable setup

2. **Testing Checklist**
   - [ ] Pixel loads correctly in production
   - [ ] PageView events fire on route changes
   - [ ] Purchase events track correctly
   - [ ] Lead events track correctly
   - [ ] Registration events track correctly
   - [ ] Events appear in Twitter Events Manager
   - [ ] No console errors in production
   - [ ] Debug mode works in development

## Event Tracking Strategy

### Purchase Events
- **Location**: `usePaymentForm.tsx`, `PaymentCallbackContent.tsx`
- **Event**: `Purchase`
- **Properties**: `value`, `currency`, `content_id`, `content_name`
- **Event ID**: Use payment reference for deduplication

### Lead Events
- **Location**: `useSignUpForm.tsx`, `PaymentFormStep.tsx`
- **Event**: `Lead`
- **Properties**: Optional `value`, `currency`
- **Event ID**: Use email or user ID for deduplication

### Registration Events
- **Location**: `useSignUpForm.tsx`
- **Event**: `CompleteRegistration`
- **Properties**: Optional `value`, `currency`
- **Event ID**: Use user ID for deduplication

### ViewContent Events
- **Location**: `ChooseCreationMethodStep.tsx` (funnel entry)
- **Event**: `ViewContent`
- **Properties**: `content_id`, `content_name`, `step_name`

## Environment Variables

Required:
```bash
NEXT_PUBLIC_TWITTER_PIXEL_ID=your_pixel_id_here
```

Optional:
```bash
NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true  # Enable in development
NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true   # Enable debug logging
```

## Testing Plan

### Development Testing
1. Set `NEXT_PUBLIC_ENABLE_DEV_ANALYTICS=true`
2. Set `NEXT_PUBLIC_DEBUG_TWITTER_PIXEL=true`
3. Check browser console for `[Twitter]` logs
4. Verify pixel script loads in Network tab
5. Test event firing in console

### Production Testing
1. Deploy to staging/production
2. Use Twitter Pixel Helper browser extension
3. Navigate through funnel
4. Verify events in Twitter Events Manager
5. Check for any console errors

### Event Verification
1. **PageView**: Should fire on every route change
2. **Purchase**: Should fire after successful payment
3. **Lead**: Should fire after form submission
4. **CompleteRegistration**: Should fire after signup
5. **ViewContent**: Should fire on funnel entry

## Success Criteria

- ✅ Twitter pixel loads without errors
- ✅ All key events track correctly
- ✅ Events appear in Twitter Events Manager
- ✅ No performance impact
- ✅ Consistent with Facebook/TikTok implementation
- ✅ Documentation complete
- ✅ Code follows existing patterns

## Rollout Plan

1. **Development**: Implement and test locally
2. **Staging**: Deploy to staging, verify events
3. **Production**: Deploy to production with monitoring
4. **Monitoring**: Watch for errors and event delivery
5. **Optimization**: Adjust based on Twitter Events Manager data

## Maintenance

- Monitor Twitter Events Manager regularly
- Check for pixel script updates
- Update documentation as needed
- Review event tracking accuracy
- Optimize event properties based on Twitter recommendations

## Related Files

- Facebook Implementation: `libs/analytics/src/FacebookProvider.tsx`
- TikTok Implementation: `libs/analytics/src/TikTokProvider.tsx`
- Analytics Service: `apps/funnel/services/analytics-service.ts`
- Analytics Providers: `apps/funnel/components/AnalyticsProviders.tsx`
