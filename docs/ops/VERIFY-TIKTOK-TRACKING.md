# How to Verify TikTok Tracking in Production

## Quick Verification Checklist

- [ ] Pixel script loads on page
- [ ] `ttq` object exists in browser console
- [ ] Network requests to `analytics.tiktok.com` appear
- [ ] Events appear in TikTok Events Manager dashboard
- [ ] PageView events fire on navigation
- [ ] Purchase/CompleteRegistration events fire on conversions

## Method 1: Browser DevTools (Easiest)

### Step 1: Open Production Site
Visit: **https://goviral.ryla.ai** (funnel app where TikTok tracking is implemented)

### Step 2: Open Browser Console
1. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Go to **Console** tab

### Step 3: Check if TikTok Pixel is Loaded
Type in console:
```javascript
window.ttq
```

**Expected Result:**
- Should return an object with methods like `track`, `identify`, `page`, etc.
- If `undefined` → Pixel not loaded ❌
- If object exists → Pixel loaded ✅

### Step 4: Check Pixel ID
```javascript
window.ttq._i
```

**Expected Result:**
- Should show pixel ID: `D56GRRRC77UAQNS9K9O0`
- Check the object keys to confirm

### Step 5: Check Network Requests
1. Go to **Network** tab in DevTools
2. Filter by: `tiktok` or `analytics.tiktok.com`
3. Refresh the page

**Expected Result:**
- Should see requests to `https://analytics.tiktok.com/i18n/pixel/events.js`
- Should see POST requests to TikTok analytics endpoints when events fire

## Method 2: TikTok Pixel Helper (Browser Extension)

### Install Extension
1. Install **TikTok Pixel Helper** browser extension:
   - Chrome: [TikTok Pixel Helper](https://chrome.google.com/webstore/detail/tiktok-pixel-helper/...)
   - Or search "TikTok Pixel Helper" in Chrome Web Store

### Verify
1. Visit **https://goviral.ryla.ai**
2. Click the extension icon
3. Should show:
   - ✅ Pixel ID: `D56GRRRC77UAQNS9K9O0`
   - ✅ Events fired (PageView, etc.)

## Method 3: TikTok Events Manager Dashboard

### Access Dashboard
1. Go to [TikTok Events Manager](https://ads.tiktok.com/help/article?aid=10028)
2. Navigate to: **Assets** → **Events** → **Web Events**
3. Select pixel: **ryla pixel** (ID: `D56GRRRC77UAQNS9K9O0`)

### Check Events
1. Go to **Events** tab
2. Look for recent events:
   - **PageView** - Should fire on every page load
   - **CompleteRegistration** - Should fire on signup
   - **Purchase** - Should fire on payment
   - **StartTrial** - Should fire on trial start

### Test Events (Real-time)
1. Go to **Test Events** tab in Events Manager
2. Visit your production site
3. Perform actions (pageview, signup, purchase)
4. Events should appear in real-time (may take 1-2 minutes)

## Method 4: Manual Event Testing

### Test PageView
1. Open console on production site
2. Type:
```javascript
window.ttq.track('PageView')
```
3. Check Network tab for request to TikTok

### Test Purchase Event
```javascript
window.ttq.track('Purchase', {
  value: 29.99,
  currency: 'USD',
  content_id: 'subscription',
  content_name: 'Monthly Plan'
})
```

### Test CompleteRegistration
```javascript
window.ttq.track('CompleteRegistration')
```

## Method 5: Check Environment Variables

### Verify Pixel ID is Set
The pixel ID should be set via environment variable or use default:
- **Default**: `D56GRRRC77UAQNS9K9O0`
- **Env Var**: `NEXT_PUBLIC_TIKTOK_PIXEL_ID`

### Check in Production
1. View page source on production
2. Search for: `D56GRRRC77UAQNS9K9O0`
3. Should appear in the TikTok pixel script

## Method 6: Console Logs

### Enable Debug Logging
The implementation logs to console in development. In production, check for:
- No console errors related to TikTok
- Network requests succeed (status 200)

### Check for Errors
```javascript
// In console, check for TikTok-related errors
console.log(window.ttq)
```

## Common Issues & Solutions

### Issue: `window.ttq` is undefined
**Possible Causes:**
- Pixel script not loading
- Ad blocker blocking TikTok scripts
- Environment variable not set in production

**Solutions:**
1. Check Network tab for failed requests
2. Verify `NEXT_PUBLIC_TIKTOK_PIXEL_ID` is set in production
3. Disable ad blockers temporarily
4. Check browser console for errors

### Issue: Events not appearing in TikTok Dashboard
**Possible Causes:**
- Events firing but not syncing (can take 1-24 hours)
- Wrong pixel ID
- Events not properly formatted

**Solutions:**
1. Use **Test Events** tab for real-time verification
2. Verify pixel ID matches: `D56GRRRC77UAQNS9K9O0`
3. Check event format matches TikTok requirements

### Issue: PageView fires but other events don't
**Possible Causes:**
- Event tracking code not executing
- User actions not triggering events
- Errors in event tracking functions

**Solutions:**
1. Check browser console for `[TikTok]` log messages
2. Verify event tracking code is called (check source code)
3. Test events manually in console

## Production URLs to Test

- **Funnel App**: https://goviral.ryla.ai
  - TikTok tracking is active here
  - Test signup and payment flows

## Expected Events

| User Action | TikTok Event | When It Fires |
|------------|-------------|---------------|
| Page load | `PageView` | Every page navigation |
| User signs up | `CompleteRegistration` | After successful signup |
| User starts trial | `StartTrial` | When trial subscription created |
| User purchases | `Purchase` | When payment completed |
| User views paywall | `ViewContent` | When paywall page viewed |

## Verification Script

Run this in browser console on production site:

```javascript
// Complete TikTok tracking verification
(function() {
  console.log('=== TikTok Tracking Verification ===');
  
  // 1. Check if pixel is loaded
  if (window.ttq) {
    console.log('✅ TikTok pixel loaded');
    console.log('Pixel ID:', Object.keys(window.ttq._i || {})[0]);
  } else {
    console.error('❌ TikTok pixel NOT loaded');
    return;
  }
  
  // 2. Check pixel methods
  const methods = ['track', 'identify', 'page'];
  methods.forEach(method => {
    if (typeof window.ttq[method] === 'function') {
      console.log(`✅ Method available: ${method}`);
    } else {
      console.error(`❌ Method missing: ${method}`);
    }
  });
  
  // 3. Test event tracking
  try {
    window.ttq.track('PageView');
    console.log('✅ Test PageView event fired');
  } catch (e) {
    console.error('❌ Failed to fire test event:', e);
  }
  
  console.log('=== Verification Complete ===');
})();
```

## Next Steps After Verification

1. **If working**: Monitor TikTok Events Manager for 24-48 hours to ensure events sync
2. **If not working**: 
   - Check production environment variables
   - Verify deployment includes TikTok tracking code
   - Check for ad blockers or privacy extensions
   - Review browser console for errors

## Related Documentation

- `docs/analytics/TIKTOK-TRACKING.md` - Full implementation details
- `libs/analytics/src/TikTokProvider.tsx` - Pixel loading code
- `libs/analytics/src/tiktok.ts` - Event tracking functions

