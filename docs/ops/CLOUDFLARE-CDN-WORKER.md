# Cloudflare CDN Worker Setup

Guide for setting up CDN Worker to proxy R2 bucket with custom domain.

## Overview

The CDN Worker (`ryla-r2-cdn-proxy`) serves R2 objects via custom domain (`cdn.ryla.ai`) with proper caching headers.

**Worker Name**: `ryla-r2-cdn-proxy`  
**Custom Domain**: `cdn.ryla.ai` (optional)  
**R2 Bucket**: `ryla-images`

## Architecture

```
User Request
    ↓
cdn.ryla.ai (Custom Domain)
    ↓
Cloudflare CDN (Edge Cache)
    ↓
ryla-r2-cdn-proxy Worker
    ↓
R2 Bucket (ryla-images)
    ↓
Response with CDN Headers
```

## Prerequisites

1. R2 bucket `ryla-images` created
2. Cloudflare account with Workers enabled
3. Wrangler CLI installed
4. Domain `ryla.ai` on Cloudflare (for custom domain)

## Setup

### 1. Install Dependencies

```bash
cd workers/ryla-r2-cdn-proxy
npm install
```

### 2. Configure Worker

Edit `wrangler.toml`:
```toml
name = "ryla-r2-cdn-proxy"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "ryla-images"
```

### 3. Deploy Worker

```bash
# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

### 4. Test Worker

```bash
# Get Worker URL from deployment output
# Test with sample object
curl -I https://ryla-r2-cdn-proxy.<account>.workers.dev/test-image.jpg
```

## Custom Domain Setup

### Option 1: Cloudflare Dashboard

1. **Go to Worker Settings**
   - Workers & Pages → `ryla-r2-cdn-proxy` → Settings → Triggers

2. **Add Custom Domain**
   - Click "Add Custom Domain"
   - Enter: `cdn.ryla.ai`
   - Cloudflare will auto-provision SSL

3. **Verify DNS**
   - If domain is on Cloudflare: Automatic
   - If domain is elsewhere: Add CNAME
     - Name: `cdn`
     - Value: `ryla-r2-cdn-proxy.<account>.workers.dev`

### Option 2: Wrangler CLI

```bash
# Add custom domain
wrangler routes add cdn.ryla.ai/* --worker ryla-r2-cdn-proxy

# Or update wrangler.toml
[[routes]]
pattern = "cdn.ryla.ai/*"
zone_name = "ryla.ai"
```

## Configuration

### R2 Bucket Binding

The Worker automatically binds to R2 bucket via `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "ryla-images"
```

### Response Headers

The Worker adds these headers:
- `Cache-Control: public, max-age=31536000, immutable` (1 year)
- `Content-Type` (auto-detected from extension)
- `Access-Control-Allow-Origin: *` (CORS)
- `ETag` (if available)
- `Last-Modified` (if available)

### Caching Behavior

- **Edge Cache**: 1 year (immutable)
- **Conditional Requests**: Returns 304 if `If-None-Match` matches
- **Cache Invalidation**: Delete and re-upload object in R2

## Usage

### Access Objects

**Via Custom Domain:**
```
https://cdn.ryla.ai/path/to/image.jpg
```

**Via Worker URL:**
```
https://ryla-r2-cdn-proxy.<account>.workers.dev/path/to/image.jpg
```

### Example Requests

```bash
# Get image
curl https://cdn.ryla.ai/characters/123/image.jpg

# Check headers
curl -I https://cdn.ryla.ai/characters/123/image.jpg

# CORS preflight
curl -X OPTIONS \
     -H "Origin: https://app.ryla.ai" \
     https://cdn.ryla.ai/characters/123/image.jpg
```

## Monitoring

### View Logs

```bash
# Real-time logs
wrangler tail

# Filter by level
wrangler tail --format pretty
```

### Cloudflare Dashboard

- **Workers & Pages → `ryla-r2-cdn-proxy` → Logs**
  - Real-time request logs
  - Error tracking
  - Performance metrics

### Analytics

- **Workers & Pages → `ryla-r2-cdn-proxy` → Analytics**
  - Request count
  - Error rate
  - Response times
  - Cache hit rate

## Cost

### Workers Pricing

- **Free tier**: 100,000 requests/day
- **Pro tier**: $5/month for 10M requests
- **Additional**: $0.15 per 1M requests

### Typical Usage

- **Requests**: ~1M/day = 30M/month
- **Cost**: $5 (base) + $3 (20M additional) = $8/month
- **Savings**: Better than separate CDN service

## Troubleshooting

### Common Issues

1. **404 Not Found**
   - Verify object exists in R2 bucket
   - Check object key path
   - Verify R2 bucket binding

2. **CORS Errors**
   - Check `Access-Control-Allow-Origin` header
   - Verify origin in request
   - Test with `curl -H "Origin: ..."`

3. **Slow Response**
   - Check R2 bucket location
   - Verify Worker is deployed to edge
   - Check object size

4. **Cache Not Working**
   - Verify `Cache-Control` header
   - Check Cloudflare cache settings
   - Test with different objects

### Debug Mode

Enable debug logging in Worker:
```typescript
// Add to index.ts
console.log('Request:', request.url);
console.log('Object key:', objectKey);
console.log('Object found:', !!object);
```

## Optimization

### Performance Tips

1. **Enable HTTP/3**: Automatic with Cloudflare
2. **Use WebP/AVIF**: Optimize images before upload
3. **Set proper Content-Type**: Helps with caching
4. **Use ETags**: Conditional requests reduce bandwidth

### Caching Strategy

- **Static assets**: 1 year cache (immutable)
- **User uploads**: 1 year cache (immutable)
- **Dynamic content**: Shorter cache or no cache

## Security

### Access Control

- **Public access**: All objects accessible
- **Private access**: Use presigned URLs from API
- **CORS**: Configure allowed origins

### Best Practices

1. **Keep bucket private**: Use Worker for access
2. **Validate object keys**: Prevent path traversal
3. **Rate limiting**: Cloudflare automatic
4. **DDoS protection**: Cloudflare automatic

## Related Documentation

- [R2 Setup Guide](./CLOUDFLARE-R2-SETUP.md)
- [Storage Setup Guide](./STORAGE-SETUP.md)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
