# [EPIC] EP-077: Web App Cloudflare Pages Migration

**Status**: On Hold  
**Phase**: P3 (Architecture)  
**Initiative**: IN-001 (Cloudflare Infrastructure Migration)  
**Created**: 2026-02-01  
**Last Updated**: 2026-02-01

> **Note (2026-02-01)**: Migration blocked due to Cloudflare Pages Edge runtime limitations.
> The tRPC layer uses Drizzle ORM with `pg` (node-postgres) which requires Node.js TCP sockets
> that don't work on Cloudflare Workers even with `nodejs_compat` flag. Options:
>
> 1. Migrate database driver to edge-compatible (Neon serverless, PlanetScale)
> 2. Move tRPC to backend API and make web app static
> 3. Keep web app on Fly.io (current decision)
>
> Web app remains on Fly.io for now. Re-evaluate when edge-compatible database driver is available.

---

## Overview

Migrate the Web app (`app.ryla.ai`) from Fly.io to Cloudflare Pages with Edge SSR support using `@cloudflare/next-on-pages`.

### Business Value

- **Cost Reduction**: Eliminate Fly.io hosting costs for Web app (~$12/mo savings)
- **Performance**: Global CDN with 300+ edge locations, faster page loads
- **UX Improvement**: Lower latency for global users, better Core Web Vitals
- **Simplified Deployment**: GitHub Actions → Cloudflare Pages (free preview deployments)

### Scope

**In Scope:**

- Web app migration to Cloudflare Pages
- Edge SSR configuration with `@cloudflare/next-on-pages`
- Custom domain setup (`app.ryla.ai`)
- GitHub Actions deployment workflow
- Performance verification
- Rollback plan

**Out of Scope:**

- API migration (stays on Fly.io)
- Admin app (separate epic EP-078)
- Database changes
- Storage changes (R2 already configured)

---

## Technical Approach

### Architecture

```
User Request
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│           Cloudflare Pages (app.ryla.ai)                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Next.js App with @cloudflare/next-on-pages         │ │
│  │                                                    │ │
│  │ • Static assets: Cached at 300+ edge locations    │ │
│  │ • SSR: Runs on Cloudflare Workers (edge)          │ │
│  │ • Client-side data: Fetched via tRPC to API       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         │ API calls (HTTPS)
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Fly.io API (end.ryla.ai)                    │
│              Frankfurt (fra) region                      │
└─────────────────────────────────────────────────────────┘
```

### Key Technologies

- **@cloudflare/next-on-pages**: Next.js adapter for Cloudflare Pages
- **Wrangler**: Cloudflare CLI for deployment
- **Edge Runtime**: Cloudflare Workers for SSR

### CPU Time Considerations

Current Web app uses client-side rendering with `"use client"` for most pages:

- SSR only renders the shell (estimated <10ms CPU)
- Data fetching happens client-side via tRPC
- Risk of exceeding 50ms CPU limit: **LOW**

**Pages with potential concerns:**
| Route | Pattern | Risk | Mitigation |
|-------|---------|------|------------|
| `/dashboard` | Client-side | Low | None needed |
| `/studio` | Client-side | Low | None needed |
| `/wizard/*` | Client-side | Low | None needed |
| `/influencer/[id]` | Client-side | Low | None needed |

### Fallback Strategy

If any page exceeds CPU limit:

```typescript
// Option 1: Force static generation
export const dynamic = 'force-static';

// Option 2: ISR (regenerate hourly)
export const revalidate = 3600;

// Option 3: Client-side only
export const dynamic = 'force-dynamic';
```

---

## Acceptance Criteria

### AC-1: Infrastructure Setup

- [ ] `@cloudflare/next-on-pages` installed and configured
- [ ] `wrangler.toml` created for Web app
- [ ] Build succeeds with Cloudflare Pages adapter

### AC-2: Preview Deployment

- [ ] Web app deployed to Cloudflare Pages preview URL
- [ ] All routes accessible and functional
- [ ] No 523 errors (CPU limit exceeded)
- [ ] tRPC API calls work correctly

### AC-3: Performance Verification

- [ ] Page load time < 2s (p95) globally
- [ ] Time to First Byte (TTFB) < 500ms
- [ ] Core Web Vitals pass (LCP, FID, CLS)
- [ ] No performance regression vs Fly.io

### AC-4: Production Deployment

- [ ] Custom domain `app.ryla.ai` configured
- [ ] DNS updated to point to Cloudflare Pages
- [ ] SSL certificate active
- [ ] Old Fly.io deployment stopped (after 24h validation)

### AC-5: CI/CD Integration

- [ ] GitHub Actions workflow updated for Cloudflare Pages
- [ ] Automatic deployment on push to main
- [ ] Preview deployments for PRs

### AC-6: Monitoring & Rollback

- [ ] Cloudflare Analytics configured
- [ ] Error monitoring active
- [ ] Rollback plan documented and tested

---

## Implementation Plan

### Phase 1: Setup (Day 1)

1. Install `@cloudflare/next-on-pages` and `wrangler`
2. Create `wrangler.toml` configuration
3. Update `next.config.js` for Cloudflare Pages
4. Test local build with `npx @cloudflare/next-on-pages`

### Phase 2: Preview Deployment (Day 1-2)

1. Create Cloudflare Pages project via GitHub
2. Deploy to preview URL
3. Test all routes systematically
4. Fix any issues found

### Phase 3: Route Verification (Day 2)

1. Run route test script
2. Verify all critical paths:
   - `/login` → `/dashboard` → `/wizard` → `/studio`
   - `/influencer/[id]` pages
3. Check API connectivity
4. Verify authentication flow

### Phase 4: Production Cutover (Day 3)

1. Configure custom domain `app.ryla.ai`
2. Update DNS (Cloudflare manages)
3. Monitor for 24 hours
4. Stop Fly.io deployment

### Phase 5: Cleanup (Day 4)

1. Remove Fly.io Web app configuration
2. Update documentation
3. Update deploy-auto.yml workflow

---

## Stories

| Story ID  | Description                                     | Points |
| --------- | ----------------------------------------------- | ------ |
| ST-077-01 | Install and configure @cloudflare/next-on-pages | 2      |
| ST-077-02 | Create wrangler.toml and update next.config.js  | 2      |
| ST-077-03 | Deploy to Cloudflare Pages preview              | 3      |
| ST-077-04 | Verify all routes work correctly                | 3      |
| ST-077-05 | Configure custom domain and DNS                 | 2      |
| ST-077-06 | Update GitHub Actions workflow                  | 2      |
| ST-077-07 | Monitor and validate production                 | 2      |
| ST-077-08 | Cleanup Fly.io resources                        | 1      |

**Total**: 17 points

---

## Technical Specifications

### Dependencies to Add

```json
{
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.x",
    "wrangler": "^3.x"
  }
}
```

### wrangler.toml

```toml
name = "ryla-web"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npx @cloudflare/next-on-pages"

[[routes]]
pattern = "app.ryla.ai/*"
zone_name = "ryla.ai"
```

### next.config.js Changes

```javascript
// Add runtime edge configuration
const nextConfig = {
  // Remove standalone output for Cloudflare
  // output: 'standalone', // Remove this

  // Add edge runtime experimental features
  experimental: {
    runtime: 'edge',
  },
};
```

### Environment Variables

Required in Cloudflare Pages settings:

- `NEXT_PUBLIC_API_URL` = `https://end.ryla.ai`
- `NEXT_PUBLIC_SITE_URL` = `https://app.ryla.ai`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Risks & Mitigation

| Risk                       | Probability | Impact | Mitigation                                     |
| -------------------------- | ----------- | ------ | ---------------------------------------------- |
| SSR exceeds 50ms CPU limit | Low         | High   | Pre-test all routes, use static/ISR fallback   |
| API latency increase       | Low         | Medium | Most calls are client-side, minimal impact     |
| Authentication issues      | Low         | High   | Test auth flow in preview before cutover       |
| Service Worker conflicts   | Medium      | Low    | Test PWA functionality, update sw.js if needed |

---

## Success Metrics

| Metric            | Current (Fly.io) | Target (Cloudflare) |
| ----------------- | ---------------- | ------------------- |
| Hosting cost      | ~$12/mo          | $0/mo               |
| TTFB (global avg) | ~200ms           | <100ms              |
| Page load (p95)   | ~2.5s            | <2s                 |
| CDN hit rate      | N/A              | >90%                |
| Deployment time   | ~5min            | ~2min               |

---

## Rollback Plan

1. **If issues in preview**: Fix before going live
2. **If issues in production**:
   - Update DNS to point back to Fly.io (keep running for 24h)
   - Fly.io app still available at `ryla-web-prod.fly.dev`
   - Rollback time: ~5 minutes (DNS propagation)

---

## Related Documentation

- [IN-001: Cloudflare Infrastructure Migration](../../../initiatives/IN-001-cloudflare-infrastructure.md)
- [Cloudflare vs Fly.io Comparison](../../../ops/CLOUDFLARE-VS-FLY-COMPARISON.md)
- [Cloudflare Pages Setup](../../../ops/CLOUDFLARE-PAGES-SETUP.md)
- [@cloudflare/next-on-pages Docs](https://github.com/cloudflare/next-on-pages)
