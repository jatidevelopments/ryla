# Cloudflare Pages Setup Guide

Complete guide for setting up Cloudflare Pages projects for RYLA frontend apps.

## Overview

RYLA uses Cloudflare Pages for hosting frontend applications:
- **Landing**: `www.ryla.ai` / `ryla.ai`
- **Funnel**: `goviral.ryla.ai`
- **Web**: `app.ryla.ai`

## Prerequisites

1. Cloudflare account
2. GitHub repository: `jatidevelopments/ryla`
3. Cloudflare API token with Pages:Edit permission
4. Domain DNS access (for custom domains)

## Setup Methods

### Method 1: Cloudflare Dashboard (Recommended for First Setup)

1. **Go to Cloudflare Dashboard**
   - Navigate to: Workers & Pages → Create → Pages project

2. **Connect to GitHub**
   - Authorize Cloudflare to access GitHub
   - Select repository: `jatidevelopments/ryla`

3. **Configure Project**
   - Project name: `ryla-landing` (or `ryla-funnel`, `ryla-web`)
   - Production branch: `main`
   - Framework preset: `Next.js`

4. **Build Settings**
   - Build command: `pnpm install && pnpm nx build landing --configuration=production`
   - Output directory: `dist/apps/landing/.next`
   - Root directory: `/` (monorepo root)
   - Node version: `20`

5. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - See [Environment Variables](#environment-variables) section

6. **Custom Domain**
   - Go to: Custom domains → Add domain
   - Add: `www.ryla.ai` and `ryla.ai` (for landing)
   - Cloudflare will auto-provision SSL

### Method 2: Wrangler CLI

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Create Pages project
wrangler pages project create ryla-landing

# Deploy
wrangler pages deploy dist/apps/landing/.next --project-name=ryla-landing
```

### Method 3: GitHub Integration (Automatic)

1. **Connect Repository**
   - Cloudflare Dashboard → Workers & Pages → Create → Pages project
   - Connect GitHub account
   - Select `jatidevelopments/ryla`

2. **Auto-Deployments**
   - Production: Deploys on push to `main`
   - Preview: Creates preview for every PR

## Project Configurations

### Landing Page (`ryla-landing`)

**Build Settings:**
```yaml
Build command: pnpm install && pnpm nx build landing --configuration=production
Output directory: dist/apps/landing/.next
Root directory: /
Node version: 20
Framework preset: Next.js
```

**Environment Variables:**
```bash
NEXT_PUBLIC_SITE_URL=https://www.ryla.ai
NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai  # Or R2 public URL
NEXT_PUBLIC_DEBUG_CDN=false
```

**Custom Domains:**
- `www.ryla.ai`
- `ryla.ai` (redirects to www)

### Funnel (`ryla-funnel`)

**Build Settings:**
```yaml
Build command: pnpm install && pnpm nx build funnel --configuration=production
Output directory: dist/apps/funnel/.next
Root directory: /
Node version: 20
Framework preset: Next.js
```

**Environment Variables:**
```bash
NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai
NEXT_PUBLIC_DEBUG_CDN=false
NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai
NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/
```

**Custom Domain:**
- `goviral.ryla.ai`

### Web App (`ryla-web`)

**Build Settings:**
```yaml
Build command: pnpm install && pnpm nx build web --configuration=production
Output directory: dist/apps/web/.next
Root directory: /
Node version: 20
Framework preset: Next.js
```

**Environment Variables:**
```bash
NEXT_PUBLIC_SITE_URL=https://app.ryla.ai
NEXT_PUBLIC_API_URL=https://end.ryla.ai
NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
```

**Custom Domain:**
- `app.ryla.ai`

## Environment Variables

### Required for All Apps

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production site URL | `https://app.ryla.ai` |
| `NEXT_PUBLIC_CDN_URL` | CDN URL for assets | `https://cdn.ryla.ai` |

### App-Specific Variables

See project configurations above for app-specific variables.

### Setting Variables

**Via Dashboard:**
1. Go to: Workers & Pages → `ryla-<app>` → Settings → Environment variables
2. Add variables for Production, Preview, and Branch previews

**Via Wrangler CLI:**
```bash
wrangler pages secret put NEXT_PUBLIC_SITE_URL --project-name=ryla-landing
```

## Custom Domains

### Adding Custom Domain

1. **In Cloudflare Dashboard:**
   - Go to: Workers & Pages → `ryla-<app>` → Custom domains
   - Click "Set up a custom domain"
   - Enter domain (e.g., `www.ryla.ai`)
   - Cloudflare will auto-provision SSL

2. **DNS Configuration:**
   - If domain is on Cloudflare: Automatic
   - If domain is elsewhere: Add CNAME record
     - Name: `www` (or subdomain)
     - Value: `ryla-landing.pages.dev` (or project URL)

### Domain Verification

```bash
# Check DNS
dig www.ryla.ai

# Should return CNAME to Cloudflare Pages
# Verify SSL
curl -I https://www.ryla.ai
```

## Build Configuration

### Monorepo Considerations

Since RYLA uses an Nx monorepo, build settings must account for:
- Root directory: `/` (monorepo root)
- Build command: Must run from root
- Output directory: `dist/apps/<app>/.next`

### Build Command Breakdown

```bash
# Install dependencies (from root)
pnpm install

# Build specific app (Nx handles dependencies)
pnpm nx build <app> --configuration=production

# Output goes to: dist/apps/<app>/.next
```

### Build Optimization

- Enable build caching in Cloudflare Pages
- Use `pnpm` for faster installs
- Nx affected detection (if configured)

## Deployment

### Automatic Deployments

- **Production**: Deploys on push to `main` branch
- **Preview**: Creates preview for every PR
- **Branch previews**: Optional, for feature branches

### Manual Deployment

```bash
# Build locally
pnpm nx build landing --configuration=production

# Deploy via Wrangler
wrangler pages deploy dist/apps/landing/.next --project-name=ryla-landing
```

### Deployment Status

Check deployment status:
- Cloudflare Dashboard → Workers & Pages → `ryla-<app>` → Deployments
- GitHub Actions (if configured)

## Preview Deployments

### Automatic PR Previews

Every PR automatically gets a preview URL:
- Format: `https://<branch>-ryla-<app>.pages.dev`
- Accessible to anyone with the link
- Automatically deleted when PR is closed

### Accessing Previews

1. **In GitHub:**
   - PR will show preview URL in comments (if bot configured)
   - Or check Cloudflare Dashboard

2. **In Cloudflare Dashboard:**
   - Workers & Pages → `ryla-<app>` → Deployments
   - Find preview deployment for branch

## Monitoring & Analytics

### Build Logs

- View in Cloudflare Dashboard
- Real-time build output
- Error messages and warnings

### Performance

- Cloudflare Analytics (built-in)
- Core Web Vitals tracking
- Real User Monitoring (RUM)

### Alerts

Set up alerts for:
- Build failures
- Deployment errors
- High error rates

## Troubleshooting

### Build Failures

**Common Issues:**
1. **Missing dependencies**: Ensure `pnpm install` runs
2. **Wrong output directory**: Check `dist/apps/<app>/.next`
3. **Node version**: Ensure Node 20 is selected
4. **Monorepo path**: Ensure root directory is `/`

**Debug:**
```bash
# Test build locally
pnpm install
pnpm nx build landing --configuration=production
ls -la dist/apps/landing/.next
```

### Deployment Issues

**Common Issues:**
1. **Environment variables**: Check all required vars are set
2. **Custom domain**: Verify DNS configuration
3. **SSL certificate**: Wait for auto-provision (can take minutes)

### Performance Issues

- Check Cloudflare Analytics
- Review Core Web Vitals
- Optimize images and assets
- Enable caching headers

## Cost

### Cloudflare Pages Pricing

- **Free tier**: Unlimited requests, 500 builds/month
- **Pro tier**: $20/month (if needed for more builds)
- **Bandwidth**: Included (unlimited)

### Typical Usage

- **Builds**: ~50-100/month (well within free tier)
- **Requests**: Unlimited on free tier
- **Bandwidth**: Unlimited on free tier
- **Total**: $0/month (free tier sufficient)

## Migration from Fly.io

See [Cloudflare vs Fly.io Comparison](./CLOUDFLARE-VS-FLY-COMPARISON.md) for migration strategy.

## Related Documentation

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Storage Setup Guide](./STORAGE-SETUP.md)
- [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md)
