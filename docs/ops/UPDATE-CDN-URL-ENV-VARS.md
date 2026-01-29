# Update CDN URL Environment Variables

**Status**: ⏳ **Action Required**  
**Date**: 2026-01-27

---

## Custom Domain Active ✅

The custom domain `cdn.ryla.ai` has been successfully added to the CDN worker.

**Old URL**: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`  
**New URL**: `https://cdn.ryla.ai`

---

## Update Environment Variables

### For Landing Page (`ryla-landing`)

1. **Go to Cloudflare Pages Dashboard**:
   - Navigate to: [Workers & Pages → ryla-landing → Settings → Environment variables](https://dash.cloudflare.com/?to=/:account/pages/view/ryla-landing)

2. **Update Build-Time Variable**:
   - Find: `NEXT_PUBLIC_CDN_URL`
   - Change value from: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
   - To: `https://cdn.ryla.ai`
   - **Important**: Must be a build-time variable (not secret)
   - Environment: Production

3. **Trigger New Build**:
   - Go to: Deployments tab
   - Click "Retry deployment" on latest deployment
   - Or push a commit to trigger automatic build

### For Funnel App (`ryla-funnel`)

1. **Go to Cloudflare Pages Dashboard**:
   - Navigate to: [Workers & Pages → ryla-funnel → Settings → Environment variables](https://dash.cloudflare.com/?to=/:account/pages/view/ryla-funnel)

2. **Update Build-Time Variable**:
   - Find: `NEXT_PUBLIC_CDN_URL`
   - Change value from: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
   - To: `https://cdn.ryla.ai`
   - **Important**: Must be a build-time variable (not secret)
   - Environment: Production

3. **Trigger New Build**:
   - Go to: Deployments tab
   - Click "Retry deployment" on latest deployment
   - Or push a commit to trigger automatic build

---

## Verification

After builds complete, verify images are using the new CDN URL:

### Landing Page
```bash
curl -s https://ryla-landing.pages.dev | grep -o 'https://cdn.ryla.ai[^"]*' | head -5
```

### Funnel App
```bash
curl -s https://ryla-funnel.pages.dev | grep -o 'https://cdn.ryla.ai[^"]*' | head -5
```

**Expected**: Should see `https://cdn.ryla.ai/...` URLs in HTML source.

---

## Benefits

✅ **No username in URL** - Professional branding  
✅ **Consistent domain** - Matches `ryla.ai`  
✅ **Same performance** - All edge caching benefits maintained  
✅ **Automatic SSL** - HTTPS via Cloudflare

---

## Related Documentation

- [CDN Custom Domain Setup](./CDN-CUSTOM-DOMAIN-SETUP.md)
- [Landing Performance Fix](./LANDING-PERFORMANCE-FIX.md)
- [Funnel CDN Configuration](./FUNNEL-CDN-CONFIGURATION.md)
