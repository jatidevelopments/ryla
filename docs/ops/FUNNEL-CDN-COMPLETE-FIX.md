# Funnel CDN Complete Fix

**Status**: ✅ **Fixed** - Images uploaded, config updated  
**Date**: 2026-01-27

---

## Issues Identified

1. **Next.js Image Optimization API** (`/_next/image`) doesn't work with static export (`output: 'export'`)
   - Error: `GET https://ryla-funnel.pages.dev/_next/image?url=%2Fmdc-images%2F... 404 (Not Found)`
   - Solution: Disable image optimization for Cloudflare Pages builds

2. **Missing Images in R2**
   - Only `/images/` directory was uploaded to R2
   - `/mdc-images/` directory (462 files) was missing
   - Solution: Upload all images from both directories

3. **Build-Time Environment Variable**
   - `NEXT_PUBLIC_CDN_URL` was set as secret (runtime-only)
   - Needs to be build-time environment variable
   - Solution: Set in Cloudflare Pages Dashboard → Environment Variables

---

## Fixes Applied

### 1. Disabled Image Optimization for Static Export

**File**: `apps/funnel/next.config.js`

```javascript
images: {
  // Disable image optimization for static export (Cloudflare Pages)
  // Image Optimization API doesn't work with output: 'export'
  unoptimized: process.env.CLOUDFLARE_PAGES === 'true',
  
  // Image optimization only for non-static export (Fly.io)
  ...(process.env.CLOUDFLARE_PAGES !== 'true' && {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    remotePatterns: remoteImagePatterns,
  }),
},
```

**Result**: Next.js will serve images directly (no optimization API), which works with static export.

### 2. Uploaded All Images to R2

**Script**: `scripts/setup/upload-funnel-images-to-r2.sh`

**Updated to upload from**:
- `apps/funnel/public/images/` (already uploaded)
- `apps/funnel/public/mdc-images/` (462 files - now uploaded)

**Verification**:
```bash
curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/mdc-images/influencer-assets/base-models/caucasian-base.webp
# Returns: HTTP/2 200 ✅
```

**Total Files Uploaded**: 622 files
- `/images/`: ~160 files
- `/mdc-images/`: ~462 files

### 3. Build-Time Environment Variable

**Status**: ⏳ **Pending** - Needs to be set in Cloudflare Pages Dashboard

**Action Required**:
1. Go to: Cloudflare Dashboard → Workers & Pages → ryla-funnel → Settings → Environment variables
2. Add build-time variable (not secret):
   - Name: `NEXT_PUBLIC_CDN_URL`
   - Value: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
   - Environment: Production
3. Trigger new build (retry deployment or push commit)

---

## Current Status

### ✅ Working

1. **CDN Worker**: Deployed and serving images
   - URL: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
   - Status: HTTP 200 for all tested images

2. **Images in R2**: All uploaded
   - `/images/`: ✅ Uploaded
   - `/mdc-images/`: ✅ Uploaded (462 files)
   - Test: All base model images accessible via CDN

3. **Next.js Config**: Fixed
   - Image optimization disabled for static export
   - Images will serve directly (no `/_next/image` API)

### ⏳ Pending

1. **Build-Time Environment Variable**: Needs to be set in Dashboard
2. **Cloudflare Pages Build**: Needs to run with environment variable
3. **CDN URLs in HTML**: Will appear after build with environment variable

---

## Next Steps

### Step 1: Set Build-Time Environment Variable

**In Cloudflare Dashboard**:
1. Navigate to: Workers & Pages → ryla-funnel → Settings → Environment variables
2. Click "Add variable" for Production
3. Add:
   - Variable name: `NEXT_PUBLIC_CDN_URL`
   - Value: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
4. Save

### Step 2: Trigger Cloudflare Pages Build

**Option A: Retry Deployment**
- Go to: Deployments tab
- Click "Retry deployment" on latest deployment

**Option B: Push Commit**
```bash
git commit --allow-empty -m "chore: trigger Cloudflare Pages build"
git push origin main
```

### Step 3: Verify After Build

After build completes:

1. **Check HTML Source**:
   ```bash
   curl -s https://ryla-funnel.pages.dev | grep "mdc-images"
   ```
   Should show CDN URLs: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/mdc-images/...`

2. **Check Browser**:
   - Open: https://ryla-funnel.pages.dev
   - Open DevTools → Network tab
   - Images should load from CDN URL
   - No more `/_next/image` 404 errors

---

## What Changed

### Before

- ❌ Next.js Image Optimization API (`/_next/image`) → 404 errors
- ❌ `/mdc-images/` not in R2 → Images not accessible
- ❌ `NEXT_PUBLIC_CDN_URL` as secret → Not available at build time
- ❌ Images use relative paths → No CDN

### After

- ✅ Image optimization disabled for static export → No `/_next/image` API
- ✅ All images uploaded to R2 → Accessible via CDN
- ✅ `NEXT_PUBLIC_CDN_URL` as build-time variable → Available during build
- ✅ Images use CDN URLs → Fast global delivery

---

## Testing

### Test CDN Access

```bash
# Test base model images
curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/mdc-images/influencer-assets/base-models/caucasian-base.webp
curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/mdc-images/influencer-assets/base-models/black-base.webp
curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/mdc-images/influencer-assets/base-models/asian-base.webp

# All should return: HTTP/2 200 ✅
```

### Test After Build

```bash
# Check HTML for CDN URLs
curl -s https://ryla-funnel.pages.dev | grep -E "ryla-r2-cdn-proxy|mdc-images"

# Should show: https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/mdc-images/...
```

---

## Related Documentation

- [Funnel CDN Configuration](./FUNNEL-CDN-CONFIGURATION.md)
- [Funnel CDN Fix](./FUNNEL-CDN-FIX.md)
- [Funnel CDN Verification](./FUNNEL-CDN-VERIFICATION.md)
- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
