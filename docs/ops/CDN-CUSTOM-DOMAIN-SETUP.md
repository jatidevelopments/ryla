# CDN Custom Domain Setup

**Status**: ⏳ **Action Required**  
**Date**: 2026-01-27

---

## Issue

The CDN worker is currently using the default Cloudflare Workers subdomain which includes the account username:
- **Current**: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
- **Target**: `https://cdn.ryla.ai`

---

## Solution: Add Custom Domain

### Option 1: Cloudflare Dashboard (Recommended)

1. **Go to Worker Settings**
   - Navigate to: [Workers & Pages → ryla-r2-cdn-proxy → Settings → Triggers](https://dash.cloudflare.com/?to=/:account/workers/services/view/ryla-r2-cdn-proxy/triggers)

2. **Add Custom Domain**
   - Click "Add Custom Domain" button
   - Enter: `cdn.ryla.ai`
   - Click "Add Custom Domain"
   - Cloudflare will automatically provision SSL certificate

3. **Verify DNS**
   - If `ryla.ai` is on Cloudflare: DNS is automatically configured
   - If `ryla.ai` is elsewhere: Add CNAME record
     - Name: `cdn`
     - Value: `ryla-r2-cdn-proxy.janistirtey1.workers.dev` (temporary, until custom domain is active)

4. **Wait for SSL**
   - SSL certificate provisioning takes 1-5 minutes
   - Status will show "Active" when ready

### Option 2: Wrangler CLI

```bash
cd workers/ryla-r2-cdn-proxy

# Add custom domain
wrangler routes add cdn.ryla.ai/* --worker ryla-r2-cdn-proxy
```

**Note**: This requires the domain to be on Cloudflare. If not, use Option 1 (Dashboard).

---

## After Custom Domain is Active

### 1. Update Environment Variables

**In Cloudflare Pages Dashboard**:

**For Landing (`ryla-landing`)**:
1. Go to: Workers & Pages → ryla-landing → Settings → Environment variables
2. Update build-time variable:
   - Name: `NEXT_PUBLIC_CDN_URL`
   - Value: `https://cdn.ryla.ai` (change from workers.dev URL)
   - Environment: Production

**For Funnel (`ryla-funnel`)**:
1. Go to: Workers & Pages → ryla-funnel → Settings → Environment variables
2. Update build-time variable:
   - Name: `NEXT_PUBLIC_CDN_URL`
   - Value: `https://cdn.ryla.ai` (change from workers.dev URL)
   - Environment: Production

### 2. Trigger New Builds

After updating environment variables, trigger new builds:
- **Landing**: Retry deployment or push commit
- **Funnel**: Retry deployment or push commit

### 3. Verify

```bash
# Test custom domain
curl -I https://cdn.ryla.ai/background.jpg

# Should return: HTTP/2 200
# Headers should include:
# - Content-Type: image/jpeg
# - Cache-Control: public, max-age=31536000, immutable
# - Access-Control-Allow-Origin: *
```

---

## Update Documentation

After custom domain is active, update all references:

**Files to Update**:
- `docs/ops/LANDING-PERFORMANCE-FIX.md`
- `docs/ops/FUNNEL-CDN-COMPLETE-FIX.md`
- `docs/ops/FUNNEL-CDN-CONFIGURATION.md`
- Any other docs referencing the workers.dev URL

**Search and Replace**:
- Old: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
- New: `https://cdn.ryla.ai`

---

## Benefits

1. **Professional URL**: No username in domain
2. **Branding**: Consistent with `ryla.ai` domain
3. **SSL**: Automatic HTTPS via Cloudflare
4. **Performance**: Same edge caching and performance

---

## Troubleshooting

### Custom Domain Not Working

1. **Check DNS**:
   ```bash
   dig cdn.ryla.ai
   # Should return CNAME to Cloudflare
   ```

2. **Check SSL Status**:
   - Go to: Workers & Pages → ryla-r2-cdn-proxy → Settings → Triggers
   - Check SSL certificate status (should be "Active")

3. **Check Worker Logs**:
   ```bash
   cd workers/ryla-r2-cdn-proxy
   wrangler tail
   ```

### Images Still Using Old URL

1. **Verify Environment Variable**: Check it's set to `https://cdn.ryla.ai`
2. **Trigger New Build**: Environment variables only apply to new builds
3. **Clear Browser Cache**: Old URLs might be cached

---

## Related Documentation

- [Cloudflare CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md)
- [Funnel CDN Configuration](./FUNNEL-CDN-CONFIGURATION.md)
- [Landing Performance Fix](./LANDING-PERFORMANCE-FIX.md)
