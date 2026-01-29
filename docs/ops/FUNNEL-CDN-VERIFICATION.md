# Funnel CDN Verification Status

**Date**: 2026-01-26  
**Status**: ❌ **CDN Not Active** - Build-time environment variable not set

---

## Current Status

### ✅ Working Components

1. **CDN Worker**: ✅ Deployed and functional
   - URL: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
   - Status: HTTP 200, proper cache headers
   - Test: `curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp`

2. **Images in R2**: ✅ Uploaded
   - `sprite.webp` accessible via CDN
   - Other images uploaded to R2 bucket

3. **Runtime Secret**: ✅ Set
   - `NEXT_PUBLIC_CDN_URL` set as secret (runtime-only)

### ❌ Issue

**Build-Time Environment Variable**: ❌ **NOT SET**

The HTML output shows:
```html
<link rel="preload" as="image" href="/images/company-logos/sprite.webp?v=2025-10-06"/>
```

Should be:
```html
<link rel="preload" as="image" href="https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp?v=2025-10-06"/>
```

**Root Cause**: `NEXT_PUBLIC_CDN_URL` is set as a **secret** (runtime-only), but it needs to be set as a **build-time environment variable** in Cloudflare Pages dashboard.

---

## How to Fix

### Step 1: Set Build-Time Environment Variable

**Via Cloudflare Dashboard:**

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **ryla-funnel** → **Settings** → **Environment variables**
3. Click **"Add variable"** for **Production** environment
4. Add:
   - **Variable name**: `NEXT_PUBLIC_CDN_URL`
   - **Value**: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
5. Click **"Save"**

**Important**: Make sure to add it for:
- ✅ Production (required)
- ✅ Preview (recommended)
- ✅ Branch previews (optional)

### Step 2: Trigger New Build

After setting the environment variable, trigger a new deployment:

**Option A: Via Dashboard**
- Go to: **Workers & Pages** → **ryla-funnel** → **Deployments**
- Click **"Retry deployment"** on the latest deployment
- Or push a new commit to trigger automatic deployment

**Option B: Manual Deploy**
```bash
bash scripts/setup/deploy-cloudflare-pages.sh funnel
```

### Step 3: Verify After Build

After the new build completes, verify:

1. **Check HTML Source**:
   ```bash
   curl -s https://ryla-funnel.pages.dev | grep "sprite.webp"
   ```
   Should show CDN URL, not relative path.

2. **Check Browser**:
   - Open: https://ryla-funnel.pages.dev
   - Open DevTools → Network tab
   - Filter by "sprite" or "images"
   - Images should load from: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/...`

---

## Why This Happens

### Cloudflare Pages Environment Variables

- **Secrets** (`wrangler pages secret`): Runtime-only, encrypted, not available during build
- **Environment Variables** (Dashboard): Available at build time, embedded in bundle

### Next.js Build Process

- `NEXT_PUBLIC_*` variables are embedded in the JavaScript bundle at **build time**
- They're not available at runtime if not set during build
- Static export (`output: 'export'`) means all paths are baked into HTML at build time

---

## Verification Checklist

After setting the build-time variable and triggering a new build:

- [ ] HTML source shows CDN URLs (not relative paths)
- [ ] Images load from CDN Worker URL
- [ ] Browser Network tab shows CDN requests
- [ ] No 404 errors for images
- [ ] CDN cache headers present (`Cache-Control: public, max-age=31536000`)

---

## Related Documentation

- [Funnel CDN Configuration](./FUNNEL-CDN-CONFIGURATION.md)
- [Funnel CDN Fix](./FUNNEL-CDN-FIX.md)
- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
