# RYLA R2 CDN Proxy Worker

Cloudflare Worker that proxies requests to R2 bucket with proper CDN headers and caching.

## Purpose

- Serve R2 objects via custom domain (`cdn.ryla.ai`)
- Add proper cache headers for CDN optimization
- Handle CORS for cross-origin requests
- Provide better branding than default R2 public URLs

## Setup

### Prerequisites

1. Cloudflare account with Workers enabled
2. R2 bucket `ryla-images` created
3. Wrangler CLI installed: `npm install -g wrangler`

### Deployment

1. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

2. **Deploy Worker:**
   ```bash
   cd workers/ryla-r2-cdn-proxy
   wrangler deploy
   ```

3. **Verify Deployment:**
   ```bash
   wrangler tail
   ```

### Custom Domain Setup (Optional)

1. **Add Custom Domain in Cloudflare Dashboard:**
   - Go to: Workers & Pages → `ryla-r2-cdn-proxy` → Settings → Triggers
   - Add Custom Domain: `cdn.ryla.ai`

2. **Update DNS:**
   - Add CNAME record: `cdn.ryla.ai` → `ryla-r2-cdn-proxy.<account>.workers.dev`
   - Or use Cloudflare DNS (automatic)

3. **Update wrangler.toml:**
   - Uncomment routes section
   - Update zone_name if needed

## Usage

### Access Objects

**Via Worker URL:**
```
https://ryla-r2-cdn-proxy.<account>.workers.dev/path/to/image.jpg
```

**Via Custom Domain (if configured):**
```
https://cdn.ryla.ai/path/to/image.jpg
```

### Headers

The Worker automatically adds:
- `Cache-Control: public, max-age=31536000, immutable` (1 year cache)
- `Content-Type` (based on file extension)
- `Access-Control-Allow-Origin: *` (CORS)
- `ETag` (if available)
- `Last-Modified` (if available)

### Caching

- Objects are cached at Cloudflare edge for 1 year
- Conditional requests (If-None-Match) return 304 Not Modified
- Cache invalidation: Delete and re-upload object in R2

## Configuration

### Environment Variables

Set in `wrangler.toml` or via Cloudflare Dashboard:
- `R2_BUCKET` - Automatically bound from wrangler.toml

### R2 Bucket Binding

The Worker uses R2 bucket binding configured in `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "ryla-images"
```

## Testing

### Test Worker Locally

```bash
wrangler dev
```

### Test Deployment

```bash
# Test object access
curl -I https://ryla-r2-cdn-proxy.<account>.workers.dev/test-image.jpg

# Should return:
# HTTP/2 200
# Content-Type: image/jpeg
# Cache-Control: public, max-age=31536000, immutable
```

### Test CORS

```bash
curl -H "Origin: https://app.ryla.ai" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://ryla-r2-cdn-proxy.<account>.workers.dev/test-image.jpg
```

## Monitoring

- View logs: `wrangler tail`
- Monitor in Cloudflare Dashboard: Workers & Pages → `ryla-r2-cdn-proxy` → Logs
- Set up alerts for errors

## Cost

- **Workers**: $5/month for 10M requests (free tier: 100k requests/day)
- **R2 Storage**: $0.015/GB/month
- **R2 Egress**: $0 (zero egress fees)
- **Total**: ~$5-10/month for typical usage

## Related Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [Storage Setup Guide](../../docs/ops/STORAGE-SETUP.md)
