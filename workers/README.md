# Cloudflare Workers

Cloudflare Workers for RYLA infrastructure.

## Workers

### ryla-r2-cdn-proxy

CDN proxy Worker for R2 bucket with custom domain support.

**Purpose:**
- Serve R2 objects via custom domain (`cdn.ryla.ai`)
- Add proper CDN caching headers
- Handle CORS for cross-origin requests

**Location:** `ryla-r2-cdn-proxy/`

**Documentation:** See [CDN Worker Setup](../../docs/ops/CLOUDFLARE-CDN-WORKER.md)

## Setup

### Prerequisites

1. Cloudflare account
2. Wrangler CLI: `npm install -g wrangler`
3. R2 bucket `ryla-images` created

### Deploy Worker

```bash
cd ryla-r2-cdn-proxy
wrangler login
wrangler deploy
```

Or use the setup script:
```bash
bash scripts/setup/deploy-cdn-worker.sh
```

## Development

### Local Development

```bash
cd ryla-r2-cdn-proxy
wrangler dev
```

### Testing

```bash
# Test locally
wrangler dev

# Test deployment
curl https://ryla-r2-cdn-proxy.<account>.workers.dev/test-image.jpg
```

## Related Documentation

- [CDN Worker Setup](../../docs/ops/CLOUDFLARE-CDN-WORKER.md)
- [R2 Setup Guide](../../docs/ops/CLOUDFLARE-R2-SETUP.md)
- [Cloudflare MCP Usage](../../docs/ops/CLOUDFLARE-MCP-USAGE.md)
