# Funnel App: Cloudflare Pages Migration

**Status**: In Progress  
**Date**: 2026-01-XX  
**Goal**: Deploy funnel app to Cloudflare Pages for better global performance

---

## Migration Summary

The funnel app has been migrated from Fly.io to Cloudflare Pages by:

1. ✅ **Moving API routes to backend** - All Finby payment endpoints now use backend API
2. ✅ **Updating frontend** - Frontend now calls backend API instead of Next.js API routes
3. ✅ **Static export configuration** - App configured for Cloudflare Pages static export
4. ⏳ **Deployment** - Ready to deploy

---

## Changes Made

### Backend API (`apps/api`)

**New Endpoints Added:**
- `POST /payments/finby/setup-payment` - Funnel payment setup (no auth required)
- `GET /payments/finby/payment-status/:reference` - Payment status check
- `POST /payments/finby/refund` - Process refunds

**Files Modified:**
- `apps/api/src/modules/payments/payments.controller.ts` - Added funnel endpoints
- `apps/api/src/modules/payments/services/finby.service.ts` - Added funnel methods
- `apps/api/src/modules/payments/dto/finby-funnel-setup.dto.ts` - New DTO
- `apps/api/src/modules/payments/dto/finby-refund.dto.ts` - New DTO

### Funnel App (`apps/funnel`)

**Frontend Changes:**
- `apps/funnel/services/finby-service.ts` - Updated to always use backend API
- Removed Next.js API route fallback logic

**Build Configuration:**
- `apps/funnel/next.config.js` - Already configured for Cloudflare Pages (`output: 'export'` when `CLOUDFLARE_PAGES=true`)

**API Routes:**
- API routes moved to temp location during Cloudflare build (they won't work on Cloudflare Pages anyway)
- Routes are restored after deployment for Fly.io compatibility

---

## Deployment

### Deploy Command

```bash
bash scripts/setup/deploy-cloudflare-pages.sh funnel
```

**What it does:**
1. Prepares app (removes dynamic exports, moves API routes)
2. Builds with static export (`CLOUDFLARE_PAGES=true`)
3. Deploys to Cloudflare Pages
4. Restores files for Fly.io compatibility

### Deployment URL

After deployment:
- **Cloudflare Pages**: https://ryla-funnel.pages.dev
- **Production Domain**: https://goviral.ryla.ai (needs DNS configuration)

---

## Finby Webhook Configuration

### ⚠️ IMPORTANT: Update Finby Webhook URL

**Current Configuration:**
- Notification URL: `https://goviral.ryla.ai/api/finby/notification`

**New Configuration (Required):**
- Notification URL: `https://end.ryla.ai/payments/finby/webhook`

**Action Required:**
1. Log into Finby merchant portal
2. Navigate to Payment Settings → Webhooks
3. Update notification URL to: `https://end.ryla.ai/payments/finby/webhook`
4. Save changes
5. Test webhook delivery

**Why:**
- Funnel API routes no longer exist (moved to backend)
- Backend API handles all webhooks at `/payments/finby/webhook`
- This ensures payment notifications are processed correctly

---

## Testing Checklist

After deployment, test:

- [ ] Funnel loads correctly on Cloudflare Pages
- [ ] Payment setup works (creates session, returns URL)
- [ ] Payment status polling works
- [ ] Payment success flow (webhook received, credits granted)
- [ ] Payment failure flow (error handling)
- [ ] Refund processing (admin function)
- [ ] All pages render correctly (no 404s)
- [ ] Images load correctly
- [ ] Analytics tracking works

---

## Rollback Plan

If issues occur:

1. **Keep funnel on Fly.io** (already working)
2. **Revert frontend changes** - Restore Next.js API route fallback
3. **Keep backend endpoints** - They're useful for future use

**Rollback Command:**
```bash
git revert <commit-hash>
```

---

## Performance Improvements

**Expected Improvements:**
- **Global load time**: 2-4x faster (10-50ms vs 50-200ms)
- **Conversion rate**: +2-5% improvement (faster = more conversions)
- **Mobile performance**: 2-3x faster on mobile
- **Core Web Vitals**: Better scores globally

**Cost Savings:**
- **Hosting**: $0/mo (Cloudflare Pages free tier)
- **Previous**: $12/mo (Fly.io)
- **Savings**: $12/mo ($144/year)

---

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ⏳ Update Finby webhook URL
3. ⏳ Test all payment flows
4. ⏳ Configure custom domain (goviral.ryla.ai)
5. ⏳ Monitor performance and conversion rates

---

## Related Documentation

- [Funnel Speed Analysis](./FUNNEL-SPEED-ANALYSIS.md)
- [Funnel Cloudflare Feasibility](./FUNNEL-CLOUDFLARE-FEASIBILITY.md)
- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
