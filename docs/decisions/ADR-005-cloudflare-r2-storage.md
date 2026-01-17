# ADR-005: Cloudflare R2 + CDN for User-Generated Content Storage

**Status**: Accepted
**Date**: 2025-01-11
**Deciders**: Tech Team
**Related**: ADR-001 (Database Architecture), ADR-004 (Fly.io Deployment)

---

## Context

RYLA MVP requires object storage for:
- **AI-generated images**: Base images, character sheets, profile pictures, gallery images (11-13 images per character creation)
- **User-generated videos**: 10-30s HD/4K videos (20-150MB per video)
- **User uploads**: Base images, reference photos
- **Bug report screenshots**: Debug/error reporting

**Key Requirements:**
- S3-compatible API (existing code uses AWS SDK)
- High egress traffic expected (videos viewed multiple times, gallery browsing, sharing)
- Global CDN for fast delivery
- Cost-effective at scale
- Presigned URLs for secure access
- Support for both images and videos

**Current State:**
- Local development: MinIO via docker-compose
- Code: Already S3-compatible (AWS SDK with endpoint configuration)
- Static assets: Bunny CDN (`https://rylaai.b-cdn.net`) for public folder
- Production: Not yet configured

**The Question:** What storage solution should RYLA use for production user-generated content (images and videos)?

---

## Decision

**Use Cloudflare R2 + Cloudflare CDN** for user-generated content storage.

**Architecture:**
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **CDN**: Cloudflare CDN (via Workers proxy or public bucket)
- **Static Assets**: Keep Bunny CDN (or migrate to Cloudflare later)
- **Code**: No changes needed (already S3-compatible)

**Configuration:**
```bash
AWS_S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
AWS_S3_ACCESS_KEY=your_r2_access_key
AWS_S3_SECRET_KEY=your_r2_secret_key
AWS_S3_BUCKET_NAME=ryla-images
AWS_S3_REGION=auto
AWS_S3_FORCE_PATH_STYLE=false  # R2 uses subdomain style
```

---

## Consequences

### Positive

- **Zero egress fees** - Critical for video-heavy apps (videos are 20-150MB each, viewed multiple times)
- **Global CDN included** - 300+ edge locations for fast delivery worldwide
- **S3-compatible** - No code changes needed, works with existing AWS SDK
- **Cost-effective at scale** - $1.50/month for 100GB storage + unlimited egress vs $92-362 for AWS S3
- **Video-optimized** - Excellent for high-bandwidth content delivery
- **Simple pricing** - No complex egress calculations
- **Enterprise-grade** - Cloudflare's global infrastructure
- **Future-proof** - Scales to petabytes without egress cost concerns

### Negative

- **Slightly higher storage cost** - $0.015/GB vs $0.01/GB (Bunny) or $0.023/GB (AWS S3)
- **Requires Cloudflare account** - Additional service to manage
- **CDN setup** - Need Worker or public bucket configuration (simple but extra step)
- **Newer service** - R2 is newer than S3 (launched 2022), but stable and production-ready

### Risks

| Risk | Mitigation |
|------|------------|
| Learning curve for Cloudflare | Excellent documentation, S3-compatible API means minimal learning |
| Vendor lock-in | S3-compatible means easy migration if needed |
| Worker setup complexity | Can use public bucket initially, add Worker later for advanced features |
| Service reliability | Cloudflare is enterprise-grade, 99.99% uptime SLA |

---

## Alternatives Considered

### Option A: AWS S3 + CloudFront

**Approach**: Use AWS S3 for storage with CloudFront CDN.

**Pros:**
- Industry standard, battle-tested
- Extensive documentation and community
- Mature ecosystem
- Excellent reliability

**Cons:**
- **Expensive egress** - $0.09/GB (can cost $90-360/month for 1-4TB egress)
- **Complex pricing** - Multiple cost components (storage, requests, egress, CDN)
- **Higher total cost** - $92-362/month vs $1.50/month for R2 at scale

**Why not:** Egress costs are prohibitive for video-heavy apps. At 4TB egress/month, AWS costs $362 vs R2's $1.50. The savings are too significant to ignore.

### Option B: Bunny CDN Storage

**Approach**: Use Bunny CDN Storage (all-in-one storage + CDN).

**Pros:**
- **Lower storage cost** - $0.01/GB vs $0.015/GB
- **Simple setup** - S3-compatible, all-in-one service
- **1TB free egress** - Good for MVP/early stage
- **Built-in CDN** - No additional setup needed

**Cons:**
- **Egress costs after 1TB** - $0.01/GB (can cost $10-30/month for 2-4TB)
- **Smaller edge network** - 100+ locations vs 300+ for Cloudflare
- **Less known** - Smaller ecosystem than Cloudflare

**Why not:** While cheaper for storage and good for MVP, egress costs add up quickly with videos. Cloudflare R2's zero egress fees make it better long-term. However, Bunny is a solid alternative if staying under 1TB egress.

**Image Optimization Consideration:**
- **Bunny**: Built-in image optimization at $9.50/month (unlimited transformations)
  - Features: Resizing, format conversion (WebP/AVIF), quality adjustment
  - URL-based: `?width=800&format=webp`
- **Cloudflare R2**: Requires additional service for optimization
  - Option 1: Cloudflare Images ($5/month base + usage)
  - Option 2: Custom Worker ($5/month base + CPU costs)
  - Option 3: Manual optimization before upload ($0, but requires preprocessing)

### Option C: MinIO on Fly.io

**Approach**: Self-host MinIO on Fly.io (same as local dev).

**Pros:**
- **Full control** - Complete ownership of infrastructure
- **No vendor lock-in** - Open source, can migrate anywhere
- **Consistent with dev** - Same setup as local development
- **No egress fees** - Direct access from Fly.io network

**Cons:**
- **Operational overhead** - Need to manage backups, scaling, monitoring
- **Higher cost** - $5-10/month for VM + storage volumes
- **No built-in CDN** - Would need separate CDN setup
- **More complex** - Requires infrastructure management

**Why not:** Too much operational overhead for MVP. Managed services (R2 or Bunny) are better for speed and reliability. Can revisit if we need full control later.

### Option D: Backblaze B2

**Approach**: Use Backblaze B2 with CDN.

**Pros:**
- **Cheapest storage** - $0.005/GB
- **S3-compatible** - Works with existing code
- **Good egress pricing** - $0.01/GB

**Cons:**
- **Slower performance** - Not as fast as Cloudflare/Bunny
- **Limited CDN options** - Need separate CDN (Cloudflare, Bunny, etc.)
- **Less features** - Fewer advanced features than R2

**Why not:** While cheapest, the performance and feature set don't match Cloudflare R2. The zero egress fees of R2 outweigh the storage cost difference.

---

## Egress Traffic Analysis

### Content Types & Sizes

| Content Type | Size Range | Frequency |
|--------------|------------|-----------|
| **Images** | 0.5-2MB each | 11-13 per character creation |
| **Videos (HD)** | 20-50MB each | 1+ per character |
| **Videos (4K)** | 50-150MB each | Optional, premium feature |

### Traffic Estimate (1,000 active users/month)

| Activity | Per User | Total | Monthly Egress |
|----------|----------|-------|---------------|
| Initial upload | 40-185MB | 40-185GB | One-time |
| View own content | 10x views | 400GB-1.8TB | **Major** |
| Gallery browsing | 50 images | 250GB-875GB | **Major** |
| Video playback | 5x per video | 100GB-750GB | **HUGE** |
| Sharing/embedding | 2x per item | 80GB-370GB | **Major** |
| **Total Monthly Egress** | | | **~1-4TB** |

### Cost Comparison (1-4TB egress/month, 100GB storage)

| Service | Storage | Egress | **Total** |
|---------|---------|--------|-----------|
| **Cloudflare R2** | $1.50 | **$0** | **$1.50** |
| **Bunny CDN** | $1.00 | $0-30 | **$1-31** |
| **AWS S3 + CloudFront** | $2.30 | $90-360 | **$92-362** |

**Savings with R2:**
- vs AWS: **$90-360/month** saved
- vs Bunny (at 4TB): **$29.50/month** saved

### Cost Comparison with Image Optimization

**Scenario: 100GB storage, 1TB egress, 500K image requests/month**

| Service | Storage | Egress | Image Opt | **Total** |
|---------|---------|--------|-----------|-----------|
| **Bunny CDN** | $1.00 | $0 (free tier) | $9.50 | **$10.50/month** |
| **Cloudflare R2 + Images** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **Cloudflare R2 + Worker** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **Cloudflare R2 (no opt)** | $1.50 | $0 | $0 | **$1.50/month** |

**Scenario: 1TB storage, 2TB egress, 5M image requests/month**

| Service | Storage | Egress | Image Opt | Worker Compute | **Total** |
|---------|---------|--------|-----------|---------------|-----------|
| **Bunny CDN** | $10.00 | $10.00 | $9.50 | - | **$29.50/month** |
| **Cloudflare R2 + Images** | $15.00 | $0 | $5.00 + $9.00 | - | **$29.00/month** |
| **Cloudflare R2 + Worker** | $15.00 | $0 | $5.00 | ~$4.40 | **$24.40/month** |
| **Cloudflare R2 (no opt)** | $15.00 | $0 | $0 | - | **$15.00/month** |

**Key Insights:**
- **Bunny's $9.50/month optimization** is competitive for low-medium usage
- **Cloudflare R2's zero egress** becomes more valuable at scale (>1TB egress)
- **Custom Worker** is cost-effective for high-volume optimization
- **Manual optimization** (before upload) is cheapest if preprocessing is acceptable

---

## Implementation Plan

### Phase 1: R2 Setup (1-2 hours)

1. **Create Cloudflare Account**
   - Sign up at https://dash.cloudflare.com
   - Enable R2 (may require payment method)

2. **Create R2 Bucket**
   ```bash
   # Via Cloudflare Dashboard or wrangler CLI
   wrangler r2 bucket create ryla-images
   ```

3. **Generate API Tokens**
   - Go to: Cloudflare Dashboard → R2 → Manage R2 API Tokens
   - Create token with read/write permissions
   - Save: Access Key ID and Secret Access Key

4. **Configure Environment Variables**
   ```bash
   # For API app (Fly.io secrets)
   flyctl secrets set --app ryla-api-prod \
     AWS_S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com \
     AWS_S3_ACCESS_KEY=your_access_key \
     AWS_S3_SECRET_KEY=your_secret_key \
     AWS_S3_BUCKET_NAME=ryla-images \
     AWS_S3_REGION=auto \
     AWS_S3_FORCE_PATH_STYLE=false
   ```

### Phase 2: CDN Setup (2-3 hours)

**Option A: Public Bucket (Simple)**
- Make R2 bucket public
- Use R2 public URL directly
- Cloudflare CDN automatically caches

**Option B: Cloudflare Worker (Recommended)**
- Create Worker to proxy R2 → CDN
- Enables: caching, compression, analytics, custom domains
- See implementation guide below

### Phase 3: Testing (1 hour)

1. Test image upload via API
2. Test presigned URL generation
3. Test video upload and playback
4. Verify CDN caching headers
5. Test from multiple regions

### Phase 4: Migration (if needed)

If migrating from existing storage:
1. Export existing files
2. Upload to R2 bucket
3. Update database references
4. Verify all URLs work
5. Monitor for issues

---

## Cloudflare Worker Setup (CDN Proxy)

### Worker Code

**File**: `workers/r2-cdn-proxy.ts` (or create via Cloudflare Dashboard)

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const objectKey = url.pathname.slice(1); // Remove leading /
    
    if (!objectKey) {
      return new Response('Not found', { status: 404 });
    }
    
    try {
      // Get object from R2
      const object = await env.R2_BUCKET.get(objectKey);
      
      if (!object) {
        return new Response('Not found', { status: 404 });
      }
      
      // Determine content type
      const contentType = object.httpMetadata?.contentType || 
        getContentTypeFromKey(objectKey) || 
        'application/octet-stream';
      
      // Return with CDN caching headers
      return new Response(object.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      return new Response('Internal error', { status: 500 });
    }
  },
};

function getContentTypeFromKey(key: string): string {
  const ext = key.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
```

### Worker Configuration

**wrangler.toml**:
```toml
name = "ryla-r2-cdn-proxy"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "ryla-images"
```

### Custom Domain Setup

1. Add custom domain in Cloudflare Dashboard
2. Point DNS to Cloudflare
3. Worker automatically serves via CDN
4. Example: `https://cdn.ryla.ai/images/user-123/video.mp4`

---

## Code Changes Required

### None! ✅

The existing code already uses S3-compatible API:

```typescript
// apps/api/src/modules/aws-s3/services/aws-s3.service.ts
// Already supports custom endpoint:
const endpoint = process.env['AWS_S3_ENDPOINT'] || undefined;
const forcePathStyle = process.env['AWS_S3_FORCE_PATH_STYLE'] === 'true';

// Works with R2 out of the box!
```

**Only change needed:** Update environment variables.

---

## Cost Projections

### MVP Stage (100 users, 10GB storage, 100GB egress)

| Service | Cost |
|---------|------|
| Cloudflare R2 | $0.15 storage + $0 egress = **$0.15/month** |
| Bunny CDN | $0.10 storage + $0 egress = **$0.10/month** |
| AWS S3 | $0.23 storage + $9 egress = **$9.23/month** |

### Growth Stage (1,000 users, 100GB storage, 1TB egress)

| Service | Cost |
|---------|------|
| Cloudflare R2 | $1.50 storage + $0 egress = **$1.50/month** |
| Bunny CDN | $1.00 storage + $0 egress = **$1.00/month** |
| AWS S3 | $2.30 storage + $90 egress = **$92.30/month** |

### Scale Stage (10,000 users, 1TB storage, 10TB egress)

| Service | Cost |
|---------|------|
| Cloudflare R2 | $15 storage + $0 egress = **$15/month** |
| Bunny CDN | $10 storage + $90 egress = **$100/month** |
| AWS S3 | $23 storage + $900 egress = **$923/month** |

**Key Insight:** As egress grows (especially with videos), R2's zero egress fees provide massive savings.

---

## Migration Path

### From MinIO (Local Dev)

No migration needed - keep MinIO for local development. Production uses R2.

### From AWS S3 (if migrating)

1. **Export existing files**
   ```bash
   aws s3 sync s3://old-bucket/ s3://ryla-images/ \
     --endpoint-url https://[account-id].r2.cloudflarestorage.com
   ```

2. **Update database**
   - S3 keys remain the same
   - Only endpoint URL changes
   - No database migration needed

3. **Update environment variables**
   - Change `AWS_S3_ENDPOINT` to R2 endpoint
   - Update access keys

4. **Test and verify**
   - Verify all images/videos load
   - Check presigned URLs work
   - Monitor for 24-48 hours

---

## Monitoring & Observability

### Cloudflare R2 Metrics

- Storage usage (GB)
- Request count (GET, PUT, DELETE)
- Error rates
- Bandwidth (ingress/egress)

### CDN Metrics (via Worker)

- Cache hit ratio
- Response times
- Geographic distribution
- Popular content

### Alerts to Set Up

- Storage approaching limits
- High error rates
- Unusual traffic patterns
- Cost anomalies

---

## Future Considerations

### Phase 2 Enhancements

1. **Video Optimization**
   - Transcoding via Cloudflare Stream (if needed)
   - Adaptive bitrate streaming
   - Thumbnail generation

2. **Image Optimization**
   - **Option A**: Manual optimization before upload (current approach)
     - Use existing Python scripts (`scripts/utils/compress-slider-images.py`)
     - Cost: $0 (preprocessing)
     - Best for: Static assets, predictable sizes
   - **Option B**: Cloudflare Images service
     - Cost: $5/month base + $1 per 100K images stored + $1 per 100K transformations
     - Best for: Moderate usage, integrated solution
   - **Option C**: Custom Worker for on-demand optimization
     - Cost: $5/month base + $0.30 per 1M requests + $0.02 per 1M CPU-ms
     - Best for: High-volume, custom requirements
   - **Alternative**: Bunny CDN built-in optimization ($9.50/month unlimited)
     - Consider if staying under 1TB egress and need simple setup

3. **Analytics**
   - Content popularity tracking
   - Geographic usage patterns
   - Bandwidth optimization opportunities

4. **Security**
   - Signed URLs with expiration
   - Access control policies
   - DDoS protection (included with Cloudflare)

---

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [S3-Compatible API Guide](https://developers.cloudflare.com/r2/api/s3/)
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [External Dependencies](../specs/general/EXTERNAL-DEPENDENCIES.md)
- [Storage Setup Guide](../ops/STORAGE-SETUP.md)
- [Storage Cost Comparison](../ops/STORAGE-COST-COMPARISON.md) - Detailed cost analysis including image optimization

---

## Related Decisions

- **ADR-001**: Database Architecture (PostgreSQL)
- **ADR-004**: Fly.io Deployment Platform
- **Future ADR**: CDN Strategy for Static Assets (Bunny vs Cloudflare)
