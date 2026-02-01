# [EPIC] EP-078: Admin App Cloudflare Pages Migration

**Status**: Proposed  
**Phase**: P3 (Architecture)  
**Initiative**: IN-001 (Cloudflare Infrastructure Migration)  
**Created**: 2026-02-01  
**Last Updated**: 2026-02-01

---

## Overview

Migrate the Admin app (`admin.ryla.ai`) from Fly.io to Cloudflare Pages with Edge SSR support using `@cloudflare/next-on-pages`.

### Business Value

- **Cost Reduction**: Eliminate Fly.io hosting costs for Admin app (~$12/mo savings)
- **Performance**: Global CDN with 300+ edge locations
- **Consistency**: Same deployment platform as Web app
- **Simplified Operations**: Single deployment workflow for all frontend apps

### Scope

**In Scope:**
- Admin app migration to Cloudflare Pages
- Edge SSR configuration with `@cloudflare/next-on-pages`
- Custom domain setup (`admin.ryla.ai`)
- GitHub Actions deployment workflow
- Authentication flow verification

**Out of Scope:**
- API migration (stays on Fly.io)
- Web app (separate epic EP-077)
- Database changes

### Dependencies

- **EP-077**: Web App migration should be completed first (validates approach)
- **IN-001**: Cloudflare Infrastructure Initiative

---

## Technical Approach

### Architecture

```
Admin User Request
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│         Cloudflare Pages (admin.ryla.ai)                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Next.js Admin App with @cloudflare/next-on-pages  │ │
│  │                                                    │ │
│  │ • Static assets: Cached at edge                   │ │
│  │ • SSR: Runs on Cloudflare Workers                 │ │
│  │ • Admin API calls: Fetched via tRPC              │ │
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

### Key Considerations

- Admin app has fewer routes than Web app
- Primarily used by internal team (EU-based)
- Authentication required for all routes
- Lower traffic volume

---

## Acceptance Criteria

### AC-1: Infrastructure Setup
- [ ] `@cloudflare/next-on-pages` installed and configured
- [ ] `wrangler.toml` created for Admin app
- [ ] Build succeeds with Cloudflare Pages adapter

### AC-2: Preview Deployment
- [ ] Admin app deployed to Cloudflare Pages preview URL
- [ ] All routes accessible and functional
- [ ] Authentication flow works correctly
- [ ] Admin API calls work correctly

### AC-3: Production Deployment
- [ ] Custom domain `admin.ryla.ai` configured
- [ ] DNS updated to point to Cloudflare Pages
- [ ] SSL certificate active
- [ ] Old Fly.io deployment stopped

### AC-4: CI/CD Integration
- [ ] GitHub Actions workflow updated
- [ ] Automatic deployment on push to main
- [ ] Deploy only when admin app changes (Nx affected)

---

## Implementation Plan

### Phase 1: Setup (Day 1)
1. Install `@cloudflare/next-on-pages` in admin app
2. Create `wrangler.toml` configuration
3. Update `next.config.js` for Cloudflare Pages
4. Test local build

### Phase 2: Preview Deployment (Day 1)
1. Create Cloudflare Pages project
2. Deploy to preview URL
3. Test all admin routes
4. Verify authentication

### Phase 3: Production Cutover (Day 2)
1. Configure custom domain
2. Update DNS
3. Monitor for 24 hours
4. Stop Fly.io deployment

---

## Stories

| Story ID | Description | Points |
|----------|-------------|--------|
| ST-078-01 | Install and configure @cloudflare/next-on-pages for admin | 2 |
| ST-078-02 | Create wrangler.toml and update next.config.js | 1 |
| ST-078-03 | Deploy to Cloudflare Pages preview | 2 |
| ST-078-04 | Verify all admin routes and auth | 2 |
| ST-078-05 | Configure custom domain and DNS | 1 |
| ST-078-06 | Update GitHub Actions workflow | 1 |
| ST-078-07 | Cleanup Fly.io resources | 1 |

**Total**: 10 points

---

## Technical Specifications

### wrangler.toml

```toml
name = "ryla-admin"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npx @cloudflare/next-on-pages"

[[routes]]
pattern = "admin.ryla.ai/*"
zone_name = "ryla.ai"
```

### Environment Variables

Required in Cloudflare Pages settings:
- `NEXT_PUBLIC_API_URL` = `https://end.ryla.ai`
- `NEXT_PUBLIC_SITE_URL` = `https://admin.ryla.ai`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Auth issues | Low | High | Test thoroughly in preview |
| Admin-specific API issues | Low | Medium | Verify all admin endpoints |
| Service Worker conflicts | Low | Low | Admin doesn't use PWA features |

---

## Success Metrics

| Metric | Current (Fly.io) | Target (Cloudflare) |
|--------|-----------------|---------------------|
| Hosting cost | ~$12/mo | $0/mo |
| Page load (avg) | ~1.5s | <1s |
| Deployment time | ~5min | ~2min |

---

## Related Documentation

- [EP-077: Web App Migration](./EP-077-web-cloudflare-pages-migration.md)
- [IN-001: Cloudflare Infrastructure Migration](../../../initiatives/IN-001-cloudflare-infrastructure.md)
- [Cloudflare Pages Setup](../../../ops/CLOUDFLARE-PAGES-SETUP.md)
