# Storage Setup Guide - Cloudflare R2 + CDN

## Overview

RYLA uses **Cloudflare R2** for user-generated content (images and videos) with **Cloudflare CDN** for global delivery.

**Why Cloudflare R2:**
- ✅ Zero egress fees (critical for video-heavy apps)
- ✅ S3-compatible API (no code changes)
- ✅ Global CDN included
- ✅ Cost-effective at scale ($1.50/month vs $92-362 for AWS S3)

See [ADR-005](../decisions/ADR-005-cloudflare-r2-storage.md) for full decision rationale.

---

## Quick Start

### 1. Create Cloudflare Account

1. Sign up: https://dash.cloudflare.com
2. Add payment method (required for R2)
3. Navigate to: **R2** → **Create bucket**

### 2. Create R2 Bucket

**Method 1: Cloudflare MCP (Recommended)**
- Use `cloudflare-bindings` MCP server in Cursor
- Ask: "Create an R2 bucket named ryla-images in Europe (Warsaw) location"
- See [R2 Setup via MCP](./CLOUDFLARE-R2-SETUP.md) for details

**Method 2: Cloudflare Dashboard**
1. Go to: R2 → Create bucket
2. Name: `ryla-images`
3. Location: Choose closest to your users (e.g., `Europe (Warsaw)`)

**Method 3: Wrangler CLI**
```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Create bucket
wrangler r2 bucket create ryla-images
```

### 3. Generate API Tokens

1. Go to: **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Permissions: **Object Read & Write**
4. Save:
   - **Access Key ID**
   - **Secret Access Key**

### 4. Get Account ID

1. Go to: **Dashboard** → **Right sidebar** (under your account)
2. Copy **Account ID**

### 5. Configure Environment Variables

**For API App (Fly.io):**

```bash
flyctl secrets set --app ryla-api-prod \
  AWS_S3_ENDPOINT=https://[ACCOUNT_ID].r2.cloudflarestorage.com \
  AWS_S3_ACCESS_KEY=your_access_key_id \
  AWS_S3_SECRET_KEY=your_secret_access_key \
  AWS_S3_BUCKET_NAME=ryla-images \
  AWS_S3_REGION=auto \
  AWS_S3_FORCE_PATH_STYLE=false
```

**Replace `[ACCOUNT_ID]` with your Cloudflare Account ID.**

---

## CDN Setup

### Option A: Public Bucket (Simple - Recommended for MVP)

1. **Make Bucket Public**
   - Go to: R2 → `ryla-images` → Settings
   - Enable **Public Access**
   - Note the public URL: `https://pub-[hash].r2.dev`

2. **Use Public URL**
   - Update code to use public R2 URLs
   - Cloudflare CDN automatically caches
   - No Worker needed

**Pros:**
- ✅ Simple setup
- ✅ CDN caching automatic
- ✅ No Worker maintenance

**Cons:**
- ⚠️ All files publicly accessible (use signed URLs for sensitive content)

### Option B: Cloudflare Worker (Advanced - Recommended for Production)

**Benefits:**
- Custom domain (`cdn.ryla.ai`)
- Advanced caching rules
- Analytics and monitoring
- Compression
- Access control

**Setup:**

1. **Create Worker**
   ```bash
   wrangler init ryla-r2-cdn-proxy
   ```

2. **Worker Code** (`src/index.ts`):
   ```typescript
   export default {
     async fetch(request: Request, env: Env): Promise<Response> {
       const url = new URL(request.url);
       const objectKey = url.pathname.slice(1);
       
       if (!objectKey) {
         return new Response('Not found', { status: 404 });
       }
       
       const object = await env.R2_BUCKET.get(objectKey);
       if (!object) {
         return new Response('Not found', { status: 404 });
       }
       
       const contentType = object.httpMetadata?.contentType || 
         getContentTypeFromKey(objectKey) || 
         'application/octet-stream';
       
       return new Response(object.body, {
         headers: {
           'Content-Type': contentType,
           'Cache-Control': 'public, max-age=31536000, immutable',
           'Access-Control-Allow-Origin': '*',
         },
       });
     },
   };
   
   function getContentTypeFromKey(key: string): string {
     const ext = key.split('.').pop()?.toLowerCase();
     const mimeTypes: Record<string, string> = {
       'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
       'webp': 'image/webp', 'mp4': 'video/mp4', 'webm': 'video/webm',
     };
     return mimeTypes[ext || ''] || 'application/octet-stream';
   }
   ```

3. **Configure Worker** (`wrangler.toml`):
   ```toml
   name = "ryla-r2-cdn-proxy"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"
   
   [[r2_buckets]]
   binding = "R2_BUCKET"
   bucket_name = "ryla-images"
   ```

4. **Deploy Worker**
   ```bash
   wrangler deploy
   ```

5. **Add Custom Domain**
   - Go to: Workers → `ryla-r2-cdn-proxy` → Settings → Triggers
   - Add Custom Domain: `cdn.ryla.ai`
   - Update DNS: Point `cdn.ryla.ai` to Cloudflare

---

## Testing

### 1. Test Upload

```bash
# Via API
curl -X POST https://end.ryla.ai/api/images/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"
```

### 2. Test Presigned URL

```bash
# Get presigned URL from API
curl https://end.ryla.ai/api/images/[image-id]/url \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test CDN Delivery

```bash
# Check CDN headers
curl -I https://cdn.ryla.ai/images/user-123/image.jpg

# Should see:
# Cache-Control: public, max-age=31536000
# CF-Cache-Status: HIT (after first request)
```

### 4. Test Video Playback

```bash
# Upload test video
# Verify playback in browser
# Check CDN caching
```

---

## Environment Variables Reference

### API App (Production)

| Variable | Value | Example |
|----------|-------|---------|
| `AWS_S3_ENDPOINT` | R2 endpoint | `https://abc123.r2.cloudflarestorage.com` |
| `AWS_S3_ACCESS_KEY` | R2 Access Key ID | `abc123def456...` |
| `AWS_S3_SECRET_KEY` | R2 Secret Access Key | `xyz789...` |
| `AWS_S3_BUCKET_NAME` | Bucket name | `ryla-images` |
| `AWS_S3_REGION` | Region | `auto` |
| `AWS_S3_FORCE_PATH_STYLE` | Path style | `false` |
| `AWS_S3_URL_TTL` | Presigned URL TTL | `3600` (1 hour) |

### Local Development

Keep using MinIO (docker-compose):

```bash
AWS_S3_ENDPOINT=http://localhost:9000
AWS_S3_ACCESS_KEY=ryla_minio
AWS_S3_SECRET_KEY=ryla_minio_secret
AWS_S3_BUCKET_NAME=ryla-images
AWS_S3_REGION=us-east-1
AWS_S3_FORCE_PATH_STYLE=true
```

---

## Cost Monitoring

### Cloudflare Dashboard

1. Go to: **R2** → **ryla-images** → **Metrics**
2. Monitor:
   - Storage used (GB)
   - Requests (GET, PUT, DELETE)
   - Bandwidth (ingress/egress)

### Expected Costs (MVP)

**Storage + Egress Only:**
| Usage | Storage | Egress | Total |
|-------|---------|--------|-------|
| 10GB, 100GB egress | $0.15 | $0 | **$0.15/month** |
| 100GB, 1TB egress | $1.50 | $0 | **$1.50/month** |
| 1TB, 10TB egress | $15 | $0 | **$15/month** |

**With Image Optimization (500K requests/month):**
| Service | Storage | Egress | Image Opt | Total |
|---------|---------|--------|-----------|-------|
| **R2 (no opt)** | $1.50 | $0 | $0 | **$1.50/month** |
| **R2 + Images** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **R2 + Worker** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **Bunny CDN** | $1.00 | $0 | $9.50 | **$10.50/month** |

**Compare to AWS S3:**
- 100GB, 1TB egress: **$92.30/month** (vs $1.50)
- Savings: **$90.80/month** (98% cost reduction)

---

## Troubleshooting

### Issue: "Access Denied" when uploading

**Solution:**
- Verify API tokens have correct permissions
- Check bucket name matches exactly
- Ensure endpoint URL includes account ID

### Issue: Presigned URLs not working

**Solution:**
- Verify `AWS_S3_FORCE_PATH_STYLE=false` (R2 uses subdomain style)
- Check URL TTL is set correctly
- Ensure bucket is accessible

### Issue: CDN not caching

**Solution:**
- Check Worker returns correct `Cache-Control` headers
- Verify custom domain is configured
- Check Cloudflare cache status: `CF-Cache-Status` header

### Issue: Slow uploads

**Solution:**
- Check region selection (choose closest to Fly.io region)
- Verify network connectivity
- Consider using multipart upload for large files (>100MB)

---

## Migration Checklist

### From MinIO (Local → Production)

- [ ] Create Cloudflare account
- [ ] Create R2 bucket
- [ ] Generate API tokens
- [ ] Set Fly.io secrets
- [ ] Test upload via API
- [ ] Test presigned URL generation
- [ ] Test video upload/playback
- [ ] Verify CDN caching
- [ ] Monitor costs for 1 week

### From AWS S3 (if migrating)

- [ ] Export existing files to R2
- [ ] Update environment variables
- [ ] Test all image/video URLs
- [ ] Monitor for 24-48 hours
- [ ] Update database if needed
- [ ] Decommission old S3 bucket

---

## Best Practices

1. **Use Presigned URLs**
   - Never expose R2 credentials to frontend
   - Generate presigned URLs server-side
   - Set appropriate TTL (1 hour default)

2. **Organize Files**
   - Use folder structure: `users/{userId}/characters/{characterId}/...`
   - Include timestamps in filenames
   - Use UUIDs for uniqueness

3. **Image Optimization Options**

   **Option A: Manual Optimization (Current Approach - Recommended)**
   - Use existing Python scripts (`scripts/utils/compress-slider-images.py`)
   - Optimize images before upload
   - Cost: $0 (preprocessing)
   - Best for: Static assets, predictable sizes
   - Example: Compress to WebP, resize to max 800px width

   **Option B: Cloudflare Images Service**
   - Cost: $5/month base + $1 per 100K images stored + $1 per 100K transformations
   - Features: Automatic WebP/AVIF conversion, resizing, quality adjustment
   - Best for: Moderate usage, integrated solution
   - Setup: Enable Cloudflare Images in dashboard

   **Option C: Custom Worker for On-Demand Optimization**
   - Cost: $5/month base + $0.30 per 1M requests + $0.02 per 1M CPU-ms
   - Features: Full control over optimization logic
   - Best for: High-volume, custom requirements
   - Setup: Create Worker with image processing library (e.g., `@cloudflare/workers-image`)

   **Alternative: Bunny CDN Built-in Optimization**
   - Cost: $9.50/month (unlimited transformations)
   - Features: URL-based transformations (`?width=800&format=webp`)
   - Best for: Simple setup, staying under 1TB egress
   - Note: Only available if using Bunny CDN for storage

   **Recommendation for RYLA:**
   - Start with Option A (manual optimization) - lowest cost, already implemented
   - Consider Option C (Worker) if on-demand optimization needed at scale
   - Bunny's built-in optimization is competitive if using Bunny CDN

4. **Optimize Before Upload** (if using manual optimization)
   - Compress images (WebP format)
   - Optimize videos (appropriate bitrate)
   - Use appropriate resolutions

4. **Monitor Usage**
   - Set up Cloudflare alerts
   - Track storage growth
   - Monitor request patterns

5. **CDN Caching**
   - Set long cache TTL for static content (1 year)
   - Use versioned URLs for cache busting
   - Monitor cache hit ratio

---

## MCP Setup

For automated setup using Cloudflare MCP tools, see:
- [Cloudflare MCP Usage Guide](./CLOUDFLARE-MCP-USAGE.md)
- [R2 Setup via MCP](./CLOUDFLARE-R2-SETUP.md)

**Quick MCP Commands:**
- Create bucket: "Create an R2 bucket named ryla-images in Europe (Warsaw)"
- List buckets: "List all R2 buckets in my Cloudflare account"
- Configure bucket: "Configure ryla-images bucket settings"

## Related Documentation

- [ADR-005: Cloudflare R2 Storage Decision](../decisions/ADR-005-cloudflare-r2-storage.md)
- [Storage Cost Comparison](./STORAGE-COST-COMPARISON.md) - Detailed Bunny vs Cloudflare R2 cost analysis
- [Cloudflare MCP Usage Guide](./CLOUDFLARE-MCP-USAGE.md)
- [R2 Setup via MCP](./CLOUDFLARE-R2-SETUP.md)
- [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md)
- [External Dependencies](../specs/general/EXTERNAL-DEPENDENCIES.md)
- [Image Storage Service](../../apps/api/src/modules/image/services/image-storage.service.ts)
- [AWS S3 Service](../../apps/api/src/modules/aws-s3/services/aws-s3.service.ts)

---

## Support

- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **S3-Compatible API**: https://developers.cloudflare.com/r2/api/s3/
- **Cloudflare Community**: https://community.cloudflare.com/
