# Cloudflare Pages Build Configuration

## Overview

RYLA Next.js apps are configured to support both **Fly.io** (standalone mode) and **Cloudflare Pages** (static export) deployments.

## Configuration

### Output Mode Selection

The output mode is controlled by the `CLOUDFLARE_PAGES` environment variable:

- **Fly.io** (default): `output: 'standalone'` - Full SSR, API routes, dynamic rendering
- **Cloudflare Pages**: `output: 'export'` - Static export, no API routes, all pages must be static

### Apps Status

| App | Static Export | Notes |
|-----|---------------|-------|
| **landing** | ✅ Supported | Mostly static, health API route skipped for Cloudflare |
| **funnel** | ⚠️ Limited | Has Finby API routes - needs Cloudflare adapter or Fly.io |
| **web** | ⚠️ Limited | Has tRPC API routes - needs Cloudflare adapter or Fly.io |

## Deployment

### Landing App (Static Export)

```bash
# Build and deploy to Cloudflare Pages
bash scripts/setup/deploy-pages-app.sh landing
```

The script automatically:
1. Sets `CLOUDFLARE_PAGES=true`
2. Builds with `output: 'export'`
3. Deploys the `out` directory to Cloudflare Pages

### Funnel & Web Apps

For apps with API routes, you have two options:

#### Option 1: Use Cloudflare Next.js Adapter (Recommended)

Install and configure `@cloudflare/next-on-pages`:

```bash
pnpm add -D @cloudflare/next-on-pages
```

Update `next.config.js` to use the adapter when building for Cloudflare.

#### Option 2: Keep on Fly.io

Deploy funnel and web apps to Fly.io only, which supports full Next.js features.

## Build Commands

### For Cloudflare Pages

```bash
export CLOUDFLARE_PAGES=true
pnpm nx build landing --configuration=production
# Output: apps/landing/out
```

### For Fly.io

```bash
# Default (no CLOUDFLARE_PAGES set)
pnpm nx build landing --configuration=production
# Output: apps/landing/.next/standalone
```

## Configuration Files

All Next.js configs (`apps/*/next.config.js`) conditionally set:

```javascript
output: process.env.CLOUDFLARE_PAGES === 'true' ? 'export' : 'standalone',
```

This ensures:
- ✅ Fly.io deployments use `standalone` (default)
- ✅ Cloudflare Pages deployments use `export` (when `CLOUDFLARE_PAGES=true`)

## Limitations

### Static Export Limitations

When using `output: 'export'`:
- ❌ No API routes (`/api/*`)
- ❌ No server-side rendering (SSR)
- ❌ No dynamic routes with `force-dynamic`
- ✅ All pages must be statically generated

### Apps with API Routes

**Funnel** has Finby payment API routes:
- `/api/finby/notification`
- `/api/finby/payment-status/[reference]`
- `/api/finby/refund`

**Web** has tRPC API routes:
- `/api/trpc/[trpc]`

These apps need either:
1. Cloudflare Next.js adapter (`@cloudflare/next-on-pages`)
2. Or deploy to Fly.io only

## Next Steps

1. ✅ Landing app: Ready for Cloudflare Pages (static export)
2. ⚠️ Funnel app: Consider Cloudflare adapter or keep on Fly.io
3. ⚠️ Web app: Consider Cloudflare adapter or keep on Fly.io

## References

- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Cloudflare Next.js Adapter](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
