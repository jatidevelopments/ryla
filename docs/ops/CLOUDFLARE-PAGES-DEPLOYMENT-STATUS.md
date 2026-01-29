# Cloudflare Pages Deployment Status

## Current Status

### ✅ Landing App - **WORKING**
- **Status**: Successfully deployed and working
- **URL**: https://ryla-landing.pages.dev
- **Method**: Static export (removed health API route for Cloudflare builds)
- **Deployment**: `bash scripts/setup/deploy-cloudflare-pages.sh landing`

### ⚠️ Funnel App - **LIMITED**
- **Status**: Can be deployed but API routes won't work
- **Issue**: Has Finby API routes (`/api/finby/*`) that require server-side execution
- **Current**: Deployed to Cloudflare Pages but API routes return 404
- **Recommendation**: Keep on Fly.io for full functionality

### ⚠️ Web App - **LIMITED**
- **Status**: Can be deployed but API routes won't work
- **Issue**: Has tRPC API routes (`/api/trpc/*`) that require server-side execution
- **Current**: Not yet deployed
- **Recommendation**: Keep on Fly.io for full functionality

## Cloudflare Pages Limitations

**Cloudflare Pages does NOT support:**
- API routes (Next.js `/api/*` routes)
- Server-side rendering (SSR)
- Server Actions
- Dynamic routes that require server execution

**Cloudflare Pages DOES support:**
- Static site generation (SSG)
- Client-side rendering
- Static file hosting

## Solutions for Apps with API Routes

### Option 1: Keep on Fly.io (Recommended)
- ✅ Full Next.js feature support
- ✅ API routes work perfectly
- ✅ Server-side rendering
- ✅ Already configured and working
- ⚠️ Regional hosting (not global edge)

### Option 2: Cloudflare Workers with OpenNext
- ✅ Global edge deployment
- ✅ Full Next.js feature support
- ✅ API routes work
- ⚠️ Requires migration from Pages to Workers
- ⚠️ Different deployment process
- ⚠️ More complex setup

### Option 3: Hybrid Approach
- ✅ Landing on Cloudflare Pages (static, global edge)
- ✅ Funnel & Web on Fly.io (full features)
- ✅ Best of both worlds
- ⚠️ Two platforms to manage

## Deployment Scripts

### Landing (Static Export)
```bash
bash scripts/setup/deploy-cloudflare-pages.sh landing
```

### Funnel/Web (Standalone - API routes won't work)
```bash
bash scripts/setup/deploy-cloudflare-pages.sh funnel
bash scripts/setup/deploy-cloudflare-pages.sh web
```

**Note**: Funnel and web deployments will succeed but API routes will return 404 errors.

## Recommendations

1. **Landing**: ✅ Keep on Cloudflare Pages (working perfectly)
2. **Funnel**: ⚠️ Keep on Fly.io (API routes are critical for payments)
3. **Web**: ⚠️ Keep on Fly.io (tRPC API routes are critical for app functionality)

## Future Migration Path

If you want to move funnel/web to Cloudflare:

1. **Use Cloudflare Workers** (not Pages)
2. **Use OpenNext adapter** (not deprecated @cloudflare/next-on-pages)
3. **Migrate API routes** to Cloudflare Workers Functions
4. **Update deployment process** to use Workers deployment

See: https://developers.cloudflare.com/pages/framework-guides/nextjs/

## Current Architecture

```
┌─────────────────────────────────────┐
│  Cloudflare Pages (Static)          │
│  ✅ Landing (ryla-landing)          │
│  ⚠️  Funnel (ryla-funnel) - no APIs │
│  ⚠️  Web (ryla-web) - no APIs       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Fly.io (Full-Stack)                 │
│  ✅ Landing (backup/health)          │
│  ✅ Funnel (full features)           │
│  ✅ Web (full features)              │
│  ✅ API (backend)                    │
└─────────────────────────────────────┘
```

## Next Steps

1. ✅ Landing is working on Cloudflare Pages
2. ⚠️ Decide on funnel/web: Keep on Fly.io or migrate to Cloudflare Workers
3. 📝 Document final architecture decision
4. 🔧 Update CI/CD if needed
