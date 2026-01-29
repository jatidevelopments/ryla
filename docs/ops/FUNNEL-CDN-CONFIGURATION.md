# Funnel App: CDN Configuration for Cloudflare Pages

**Status**: ✅ **CDN Worker Deployed** | ⏳ **Images Need Upload to R2**  
**Date**: 2026-01-24

---

## ✅ Completed

### 1. CDN Worker Deployed
- **Worker Name**: `ryla-r2-cdn-proxy`
- **Worker URL**: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
- **R2 Bucket**: `ryla-images` (bound)
- **Status**: ✅ Deployed and active

### 2. CDN URL Configured
- **Environment Variable**: `NEXT_PUBLIC_CDN_URL`
- **Value**: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
- **Location**: Cloudflare Pages → `ryla-funnel` → Environment Variables
- **Status**: ✅ Set for production

---

## ⏳ Pending: Upload Images to R2

### Current Situation

The funnel app uses `withCdn()` to prefix image paths with the CDN URL. However, images need to be uploaded to the R2 bucket for the CDN to serve them.

**Current Image Locations:**
- `apps/funnel/public/images/company-logos/sprite.webp` (1.9MB)
- `apps/funnel/public/images/company-logos/sprite.png` (26MB - not used)
- Other images in `apps/funnel/public/images/`

**CDN Path Mapping:**
- Local: `/images/company-logos/sprite.webp`
- CDN: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp`
- R2 Key: `images/company-logos/sprite.webp`

### Upload Images to R2

**Option 1: Manual Upload via Cloudflare Dashboard**

1. **Go to R2 Dashboard**
   - Navigate to: Cloudflare Dashboard → R2 → `ryla-images` bucket

2. **Upload Images**
   - Create folder structure: `images/company-logos/`
   - Upload `sprite.webp` to `images/company-logos/sprite.webp`
   - Upload other images maintaining the same folder structure

3. **Verify Upload**
   ```bash
   curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp
   ```

**Option 2: Upload via Wrangler CLI**

```bash
# Upload sprite.webp
wrangler r2 object put ryla-images/images/company-logos/sprite.webp \
  --file=apps/funnel/public/images/company-logos/sprite.webp \
  --content-type=image/webp

# Upload all images from public directory
cd apps/funnel/public
find images -type f -exec wrangler r2 object put ryla-images/{} --file={} \;
```

**Option 3: Script to Sync Images**

Create a script to sync images from `apps/funnel/public/images/` to R2:

```bash
#!/bin/bash
# scripts/setup/upload-funnel-images-to-r2.sh

BUCKET="ryla-images"
SOURCE_DIR="apps/funnel/public/images"

echo "📤 Uploading funnel images to R2..."

find "$SOURCE_DIR" -type f | while read -r file; do
  # Get relative path from public directory
  rel_path="${file#$SOURCE_DIR/}"
  
  # Determine content type
  ext="${file##*.}"
  case "$ext" in
    webp) content_type="image/webp" ;;
    png) content_type="image/png" ;;
    jpg|jpeg) content_type="image/jpeg" ;;
    svg) content_type="image/svg+xml" ;;
    *) content_type="application/octet-stream" ;;
  esac
  
  echo "  Uploading: $rel_path"
  wrangler r2 object put "$BUCKET/images/$rel_path" \
    --file="$file" \
    --content-type="$content_type"
done

echo "✅ Images uploaded to R2"
```

---

## 🔄 Redeploy Funnel App

After uploading images to R2, trigger a new deployment to ensure the CDN URL is used:

```bash
# Option 1: Trigger via git push (if using GitHub integration)
git commit --allow-empty -m "chore: trigger redeploy for CDN"
git push origin main

# Option 2: Manual redeploy
bash scripts/setup/deploy-cloudflare-pages.sh funnel
```

---

## 🧪 Testing CDN

### 1. Test CDN Worker

```bash
# Test sprite.webp
curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp

# Expected response:
# HTTP/2 200
# Content-Type: image/webp
# Cache-Control: public, max-age=31536000, immutable
# Access-Control-Allow-Origin: *
```

### 2. Test Funnel App

1. **Visit**: https://ryla-funnel.pages.dev
2. **Check Browser Console**:
   - Look for CDN debug logs (if `NEXT_PUBLIC_DEBUG_CDN=true`)
   - Verify images load from CDN URL
   - Check Network tab for image requests

3. **Verify Image URLs**:
   - Images should load from: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/...`
   - Not from: `https://ryla-funnel.pages.dev/...`

### 3. Enable CDN Debug Mode

Temporarily enable debug mode to see CDN usage:

```bash
wrangler pages secret put NEXT_PUBLIC_DEBUG_CDN --project-name=ryla-funnel
# Enter: true
```

Then check browser console for CDN logs.

---

## 🎯 Custom Domain Setup (Optional)

### Set Up `cdn.ryla.ai`

1. **Add Custom Domain to Worker**
   - Go to: Workers & Pages → `ryla-r2-cdn-proxy` → Settings → Triggers
   - Click "Add Custom Domain"
   - Enter: `cdn.ryla.ai`
   - Cloudflare will auto-provision SSL

2. **Update CDN URL**
   ```bash
   wrangler pages secret put NEXT_PUBLIC_CDN_URL --project-name=ryla-funnel
   # Enter: https://cdn.ryla.ai
   ```

3. **Update Worker Routes** (if needed)
   ```bash
   # Update wrangler.toml
   [[routes]]
   pattern = "cdn.ryla.ai/*"
   zone_name = "ryla.ai"
   ```

---

## 📊 Performance Benefits

### Before (No CDN)
- Images served from Pages deployment
- Single origin (Cloudflare Pages)
- No edge caching for images

### After (With CDN)
- Images served from R2 via CDN Worker
- Global edge caching (1 year TTL)
- Faster load times globally
- Reduced bandwidth on Pages deployment

### Expected Improvements
- **Image Load Time**: 50-70% faster globally
- **Bandwidth**: Reduced on Pages deployment
- **Cache Hit Rate**: ~95% after warm-up
- **TTFB**: 100-200ms faster for cached images

---

## 🔍 Troubleshooting

### Images Not Loading

1. **Check R2 Bucket**
   ```bash
   wrangler r2 object list ryla-images --prefix=images/
   ```

2. **Check CDN Worker**
   ```bash
   curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp
   ```

3. **Check Environment Variable**
   ```bash
   wrangler pages secret list --project-name=ryla-funnel
   ```

4. **Check Browser Console**
   - Look for 404 errors
   - Check Network tab for failed requests
   - Verify image URLs are using CDN

### CDN Not Being Used

1. **Verify Environment Variable**
   - Check Cloudflare Dashboard → Environment Variables
   - Ensure `NEXT_PUBLIC_CDN_URL` is set

2. **Check Build Output**
   - Images should reference CDN URL in HTML
   - Check page source for image URLs

3. **Enable Debug Mode**
   ```bash
   wrangler pages secret put NEXT_PUBLIC_DEBUG_CDN --project-name=ryla-funnel
   # Enter: true
   ```
   - Check browser console for CDN logs

---

## 📝 Next Steps

1. ⏳ **Upload Images to R2**
   - Upload `sprite.webp` and other images
   - Maintain folder structure: `images/company-logos/...`

2. ⏳ **Test CDN**
   - Verify images load from CDN
   - Check browser console for errors
   - Test from different locations

3. ⏳ **Monitor Performance**
   - Check Cloudflare Analytics
   - Monitor CDN cache hit rate
   - Track image load times

4. ⏳ **Set Up Custom Domain** (Optional)
   - Configure `cdn.ryla.ai`
   - Update CDN URL environment variable

---

## Related Documentation

- [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md)
- [R2 Storage Setup](./CLOUDFLARE-R2-SETUP.md)
- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
- [Funnel Deployment Status](./FUNNEL-CLOUDFLARE-DEPLOYMENT-STATUS.md)
