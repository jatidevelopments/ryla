# Trigger Cloudflare Pages Build for CDN

**Issue**: Local builds don't have access to Cloudflare Pages environment variables. We need to trigger a build on Cloudflare Pages infrastructure.

---

## Why Local Builds Don't Work

When you run `wrangler pages deploy`, it:
1. Builds locally (using your local environment)
2. Uploads the built files to Cloudflare Pages

**Problem**: Local builds don't have access to Cloudflare Pages environment variables, so `NEXT_PUBLIC_CDN_URL` is not available during the build.

---

## Solution: Trigger Build on Cloudflare Pages

### Option 1: Retry Deployment in Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Navigate to: **Workers & Pages** → **ryla-funnel** → **Deployments**

2. **Retry Latest Deployment**
   - Find the latest deployment
   - Click **"Retry deployment"** or **"Redeploy"**
   - This will trigger a new build on Cloudflare Pages infrastructure with environment variables

3. **Wait for Build**
   - Build will run on Cloudflare Pages
   - Environment variables will be available during build
   - Deployment will complete automatically

### Option 2: Push Empty Commit

```bash
# Create empty commit to trigger automatic deployment
git commit --allow-empty -m "chore: trigger Cloudflare Pages build for CDN"
git push origin main
```

This will trigger automatic deployment via GitHub integration.

### Option 3: Manual Build via API (Advanced)

If you have Cloudflare API access, you can trigger a build via API, but the Dashboard method is simpler.

---

## Verify After Build

After the Cloudflare Pages build completes:

1. **Check HTML Source**:
   ```bash
   curl -s https://ryla-funnel.pages.dev | grep "sprite.webp"
   ```
   Should show: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp`

2. **Check Browser**:
   - Open: https://ryla-funnel.pages.dev
   - Open DevTools → Network tab
   - Images should load from CDN URL

---

## Important Notes

- **Local builds** (`wrangler pages deploy`) don't use Cloudflare Pages environment variables
- **Cloudflare Pages builds** (via Dashboard or GitHub) do use environment variables
- Environment variables must be set as **build-time variables** (not secrets) in Dashboard
- Secrets are runtime-only and won't work for `NEXT_PUBLIC_*` variables

---

## Current Status

- ✅ Environment variable set in Dashboard
- ⏳ Waiting for Cloudflare Pages build (not local build)
- ⏳ After build, images should load from CDN
