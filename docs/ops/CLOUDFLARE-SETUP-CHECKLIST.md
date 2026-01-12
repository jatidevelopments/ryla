# Cloudflare Setup Checklist

Complete checklist for setting up Cloudflare infrastructure for RYLA.

## Prerequisites

- [ ] Cloudflare account created (https://dash.cloudflare.com)
- [ ] Payment method added (required for R2)
- [ ] GitHub repository access (`jatidevelopments/ryla`)
- [ ] Domain DNS access (`ryla.ai`)

## Step 1: API Token Setup

- [ ] Go to: https://dash.cloudflare.com/profile/api-tokens
- [ ] Click "Create Token"
- [ ] Use "Edit Cloudflare Workers" template OR create custom token
- [ ] Verify permissions:
  - [ ] Account: Read
  - [ ] Zone: Read
  - [ ] Workers: Edit
  - [ ] R2: Edit
  - [ ] Pages: Edit
- [ ] Copy token (cannot be retrieved later)
- [ ] Set environment variable:
  ```bash
  export CLOUDFLARE_API_TOKEN=your_token_here
  ```
- [ ] Verify token:
  ```bash
  bash scripts/setup/verify-cloudflare-mcp.sh
  ```

## Step 2: R2 Bucket Setup

### Create Bucket

**Option A: Via MCP (in Cursor)**
- [ ] Open Cursor
- [ ] Use MCP tool: "Create an R2 bucket named ryla-images in Europe (Warsaw) location"

**Option B: Via Setup Script**
- [ ] Run: `bash scripts/setup/setup-cloudflare-infrastructure.sh`

**Option C: Via Dashboard**
- [ ] Go to: R2 → Create bucket
- [ ] Name: `ryla-images`
- [ ] Location: `Europe (Warsaw)` or closest to users
- [ ] Click "Create bucket"

### Generate R2 API Tokens

- [ ] Go to: R2 → Manage R2 API Tokens
- [ ] Click "Create API Token"
- [ ] Name: `ryla-api-token`
- [ ] Permissions: **Object Read & Write**
- [ ] TTL: No expiration (or set as needed)
- [ ] **Save credentials securely:**
  - [ ] Access Key ID: `_________________`
  - [ ] Secret Access Key: `_________________`

### Get Account ID

- [ ] Go to: Cloudflare Dashboard
- [ ] Right sidebar → Account ID
- [ ] Copy Account ID: `_________________`

### Configure Bucket

- [ ] Choose access method:
  - [ ] Option A: Public bucket (simple, recommended for MVP)
    - [ ] Go to: R2 → `ryla-images` → Settings
    - [ ] Enable "Public Access"
    - [ ] Note public URL: `https://pub-<hash>.r2.dev`
  - [ ] Option B: Private bucket + Worker (advanced, recommended for production)
    - [ ] Keep bucket private
    - [ ] Deploy CDN Worker (see Step 3)

## Step 3: CDN Worker Setup

### Deploy Worker

- [ ] Install wrangler (if not installed):
  ```bash
  npm install -g wrangler
  ```
- [ ] Deploy worker:
  ```bash
  bash scripts/setup/deploy-cdn-worker.sh
  ```
- [ ] Or manually:
  ```bash
  cd workers/ryla-r2-cdn-proxy
  wrangler login
  wrangler deploy
  ```
- [ ] Note Worker URL: `https://ryla-r2-cdn-proxy.<account>.workers.dev`

### Configure Custom Domain (Optional)

- [ ] Go to: Workers & Pages → `ryla-r2-cdn-proxy` → Settings → Triggers
- [ ] Add Custom Domain: `cdn.ryla.ai`
- [ ] Update DNS (if domain not on Cloudflare):
  - [ ] Add CNAME: `cdn` → `ryla-r2-cdn-proxy.<account>.workers.dev`
- [ ] Verify SSL certificate auto-provisioned

### Test Worker

- [ ] Test Worker endpoint:
  ```bash
  curl -I https://ryla-r2-cdn-proxy.<account>.workers.dev/test
  ```
- [ ] Verify headers include:
  - [ ] `Cache-Control: public, max-age=31536000, immutable`
  - [ ] `Content-Type` (correct for file type)
  - [ ] `Access-Control-Allow-Origin: *`

## Step 4: Cloudflare Pages Setup

### Landing Page (`ryla-landing`)

- [ ] Go to: Workers & Pages → Create → Pages project
- [ ] Connect GitHub repository: `jatidevelopments/ryla`
- [ ] Project name: `ryla-landing`
- [ ] Production branch: `main`
- [ ] Framework preset: `Next.js`
- [ ] Build settings:
  - [ ] Build command: `pnpm install && pnpm nx build landing --configuration=production`
  - [ ] Output directory: `dist/apps/landing/.next`
  - [ ] Root directory: `/`
  - [ ] Node version: `20`
- [ ] Environment variables:
  - [ ] `NEXT_PUBLIC_SITE_URL=https://www.ryla.ai`
  - [ ] `NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai` (or R2 public URL)
  - [ ] `NEXT_PUBLIC_DEBUG_CDN=false`
- [ ] Custom domains:
  - [ ] Add: `www.ryla.ai`
  - [ ] Add: `ryla.ai` (redirects to www)
- [ ] Test deployment:
  - [ ] Push to `main` branch
  - [ ] Verify build succeeds
  - [ ] Test domains: `https://www.ryla.ai` and `https://ryla.ai`

### Funnel (`ryla-funnel`)

- [ ] Go to: Workers & Pages → Create → Pages project
- [ ] Connect GitHub repository: `jatidevelopments/ryla`
- [ ] Project name: `ryla-funnel`
- [ ] Production branch: `main`
- [ ] Framework preset: `Next.js`
- [ ] Build settings:
  - [ ] Build command: `pnpm install && pnpm nx build funnel --configuration=production`
  - [ ] Output directory: `dist/apps/funnel/.next`
  - [ ] Root directory: `/`
  - [ ] Node version: `20`
- [ ] Environment variables:
  - [ ] `NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai`
  - [ ] `NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai`
  - [ ] `NEXT_PUBLIC_DEBUG_CDN=false`
  - [ ] `NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai`
  - [ ] `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/`
- [ ] Custom domain:
  - [ ] Add: `goviral.ryla.ai`
- [ ] Test deployment:
  - [ ] Push to `main` branch
  - [ ] Verify build succeeds
  - [ ] Test domain: `https://goviral.ryla.ai`

### Web App (`ryla-web`)

- [ ] Go to: Workers & Pages → Create → Pages project
- [ ] Connect GitHub repository: `jatidevelopments/ryla`
- [ ] Project name: `ryla-web`
- [ ] Production branch: `main`
- [ ] Framework preset: `Next.js`
- [ ] Build settings:
  - [ ] Build command: `pnpm install && pnpm nx build web --configuration=production`
  - [ ] Output directory: `dist/apps/web/.next`
  - [ ] Root directory: `/`
  - [ ] Node version: `20`
- [ ] Environment variables:
  - [ ] `NEXT_PUBLIC_SITE_URL=https://app.ryla.ai`
  - [ ] `NEXT_PUBLIC_API_URL=https://end.ryla.ai`
  - [ ] `NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai`
  - [ ] `NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>`
  - [ ] `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>`
- [ ] Custom domain:
  - [ ] Add: `app.ryla.ai`
- [ ] Test deployment:
  - [ ] Push to `main` branch
  - [ ] Verify build succeeds
  - [ ] Test domain: `https://app.ryla.ai`

## Step 5: Update Fly.io API Secrets

- [ ] Get Cloudflare Account ID (from Step 2)
- [ ] Get R2 Access Key ID (from Step 2)
- [ ] Get R2 Secret Access Key (from Step 2)
- [ ] Update Fly.io secrets:
  ```bash
  flyctl secrets set --app ryla-api-prod \
    AWS_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
    AWS_S3_ACCESS_KEY=<r2_access_key_id> \
    AWS_S3_SECRET_KEY=<r2_secret_access_key> \
    AWS_S3_BUCKET_NAME=ryla-images \
    AWS_S3_REGION=auto \
    AWS_S3_FORCE_PATH_STYLE=false
  ```
- [ ] Verify secrets:
  ```bash
  flyctl secrets list --app ryla-api-prod
  ```

## Step 6: Testing & Verification

### R2 Bucket

- [ ] Upload test file to R2 bucket
- [ ] Verify file accessible:
  - [ ] Via public URL (if public bucket)
  - [ ] Via Worker (if using Worker)
- [ ] Test CDN caching:
  ```bash
  curl -I https://cdn.ryla.ai/test-image.jpg
  # Should show: CF-Cache-Status: HIT
  ```

### CDN Worker

- [ ] Test Worker endpoint:
  ```bash
  curl -I https://ryla-r2-cdn-proxy.<account>.workers.dev/test-image.jpg
  ```
- [ ] Verify headers:
  - [ ] `Cache-Control: public, max-age=31536000, immutable`
  - [ ] `Content-Type: image/jpeg` (or correct type)
  - [ ] `Access-Control-Allow-Origin: *`
- [ ] Test custom domain (if configured):
  ```bash
  curl -I https://cdn.ryla.ai/test-image.jpg
  ```

### Cloudflare Pages

- [ ] Test landing page:
  - [ ] `https://www.ryla.ai` loads correctly
  - [ ] `https://ryla.ai` redirects to www
  - [ ] SSL certificate valid
- [ ] Test funnel:
  - [ ] `https://goviral.ryla.ai` loads correctly
  - [ ] SSL certificate valid
- [ ] Test web app:
  - [ ] `https://app.ryla.ai` loads correctly
  - [ ] SSL certificate valid
  - [ ] API calls work (to `end.ryla.ai`)

### Integration Testing

- [ ] Test image upload (via API):
  ```bash
  curl -X POST https://end.ryla.ai/api/images/upload \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "file=@test-image.jpg"
  ```
- [ ] Verify image accessible via CDN:
  ```bash
  curl -I https://cdn.ryla.ai/<image-path>
  ```
- [ ] Test frontend image loading:
  - [ ] Images load in web app
  - [ ] Images load in funnel
  - [ ] Images load in landing

## Step 7: CI/CD Configuration

### GitHub Secrets

- [ ] Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets
- [ ] Add `CLOUDFLARE_ACCOUNT_ID` to GitHub Secrets
- [ ] Verify secrets:
  ```bash
  gh secret list --repo jatidevelopments/ryla
  ```

### GitHub Actions

- [ ] Verify workflow exists: `.github/workflows/deploy-cloudflare-pages.yml`
- [ ] Test workflow (optional):
  - [ ] Push to `main` branch
  - [ ] Verify Pages deployment triggered
  - [ ] Check deployment status in Cloudflare Dashboard

## Step 8: Documentation

- [ ] Review setup documentation:
  - [ ] [Setup Index](./CLOUDFLARE-SETUP-INDEX.md)
  - [ ] [MCP Usage](./CLOUDFLARE-MCP-USAGE.md)
  - [ ] [Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
  - [ ] [R2 Setup](./CLOUDFLARE-R2-SETUP.md)
  - [ ] [CDN Worker](./CLOUDFLARE-CDN-WORKER.md)
- [ ] Update team documentation if needed
- [ ] Document any custom configurations

## Step 9: Monitoring Setup

- [ ] Set up Cloudflare Analytics alerts
- [ ] Monitor R2 usage:
  - [ ] Storage: R2 → `ryla-images` → Metrics
  - [ ] Requests: Monitor operation counts
- [ ] Monitor Worker performance:
  - [ ] Workers & Pages → `ryla-r2-cdn-proxy` → Analytics
  - [ ] Check error rates
  - [ ] Monitor response times
- [ ] Monitor Pages deployments:
  - [ ] Workers & Pages → `ryla-<app>` → Deployments
  - [ ] Set up build failure alerts

## Step 10: Cost Monitoring

- [ ] Review Cloudflare billing:
  - [ ] R2 storage costs
  - [ ] Worker request costs
  - [ ] Pages costs (should be $0 on free tier)
- [ ] Set up billing alerts if needed
- [ ] Compare to previous Fly.io costs

## Troubleshooting

### Common Issues

**Token Not Working:**
- [ ] Verify token is set: `echo $CLOUDFLARE_API_TOKEN`
- [ ] Check token permissions in Dashboard
- [ ] Regenerate token if needed

**MCP Not Connecting:**
- [ ] Check `.cursor/mcp.json` exists
- [ ] Verify Cloudflare servers configured
- [ ] Restart Cursor
- [ ] Check MCP logs

**Build Failures:**
- [ ] Check build logs in Cloudflare Dashboard
- [ ] Verify build command is correct
- [ ] Check output directory exists
- [ ] Verify environment variables are set

**Domain Not Resolving:**
- [ ] Check DNS records
- [ ] Verify domain in Cloudflare Dashboard
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Check SSL certificate status

## Success Criteria

- [ ] R2 bucket `ryla-images` created and accessible
- [ ] R2 API tokens generated and working
- [ ] CDN Worker deployed and responding
- [ ] Cloudflare Pages projects created for all 3 apps
- [ ] Custom domains configured and verified
- [ ] SSL certificates active
- [ ] Environment variables set correctly
- [ ] Test deployments successful
- [ ] Integration tested (frontend → API → R2)
- [ ] Documentation updated

## Next Steps After Setup

1. **Migrate Frontend Apps**
   - Move landing, funnel, web from Fly.io to Cloudflare Pages
   - Update CI/CD workflows
   - Monitor performance

2. **Optimize**
   - Tune CDN caching rules
   - Optimize images (WebP/AVIF)
   - Monitor costs and performance

3. **Scale**
   - Monitor usage patterns
   - Adjust resources as needed
   - Set up alerts

## Support

- **Documentation**: See `docs/ops/CLOUDFLARE-*.md` files
- **MCP Usage**: `docs/ops/CLOUDFLARE-MCP-USAGE.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Setup Scripts**: `scripts/setup/`
