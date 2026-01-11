# Fly.io Setup - Final Status ✅

## ✅ Completed

### Apps Created (6 total - 4 production + 2 old)

**Production Apps (with `-prod` suffix):**
- ✅ `ryla-landing-prod` - Landing page
- ✅ `ryla-funnel-prod` - Payment funnel
- ✅ `ryla-web-prod` - Main web app
- ✅ `ryla-api-prod` - Backend API

**Old Apps (can be deleted if not needed):**
- `ryla-api` (without -prod)
- `ryla-web` (without -prod)

**Organization**: `my-dream-companion`

### Domains Configured ✅

All domains from `docs/ops/DOMAIN-REGISTRY.md` are configured:

- ✅ `www.ryla.ai` → `ryla-landing-prod` (Awaiting DNS configuration)
- ✅ `ryla.ai` → `ryla-landing-prod` (Awaiting DNS configuration)
- ✅ `goviral.ryla.ai` → `ryla-funnel-prod` (Awaiting DNS configuration)
- ✅ `app.ryla.ai` → `ryla-web-prod` (Awaiting DNS configuration)
- ✅ `end.ryla.ai` → `ryla-api-prod` (Awaiting DNS configuration)

**Status**: All certificates are in "Awaiting configuration" state - DNS records need to be added at your domain registrar.

### Configuration Files Updated ✅

- ✅ `apps/landing/fly.toml` → `app = "ryla-landing-prod"`
- ✅ `apps/funnel/fly.toml` → `app = "ryla-funnel-prod"`
- ✅ `apps/web/fly.toml` → `app = "ryla-web-prod"`
- ✅ `apps/api/fly.toml` → `app = "ryla-api-prod"`
- ✅ `.github/workflows/deploy-production.yml` → Updated to use `-prod` app names

## ⏳ Next Steps

### 1. Configure DNS Records (REQUIRED)

For each domain, add DNS records at your domain registrar. Get instructions:

```bash
# Get DNS instructions for each app
flyctl certs list --app ryla-landing-prod
flyctl certs list --app ryla-funnel-prod
flyctl certs list --app ryla-web-prod
flyctl certs list --app ryla-api-prod
```

**Example DNS record format:**
```
CNAME _acme-challenge.www.ryla.ai => www.ryla.ai.xxxxx.flydns.net
CNAME _acme-challenge.ryla.ai => ryla.ai.xxxxx.flydns.net
```

After adding DNS records, Fly.io will automatically validate and issue SSL certificates.

### 2. Create Managed Services

```bash
# PostgreSQL (Managed Postgres - recommended)
flyctl mpg create ryla-db-prod --region fra --org my-dream-companion

# Redis
flyctl redis create --name ryla-redis-prod --region fra --plan free --org my-dream-companion

# Attach to API
flyctl postgres attach ryla-db-prod --app ryla-api-prod
flyctl redis attach ryla-redis-prod --app ryla-api-prod
```

### 3. Set Environment Variables

See `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md` for complete lists.

**Quick start:**
```bash
# API
flyctl secrets set JWT_ACCESS_SECRET=<generate> --app ryla-api-prod

# Web
flyctl secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --app ryla-web-prod

# Landing
flyctl secrets set NEXT_PUBLIC_SITE_URL=https://www.ryla.ai --app ryla-landing-prod

# Funnel
flyctl secrets set NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai --app ryla-funnel-prod
```

### 4. Deploy Applications

```bash
# Deploy API first
flyctl deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile --app ryla-api-prod

# Deploy others
flyctl deploy --config apps/web/fly.toml --dockerfile apps/web/Dockerfile --app ryla-web-prod
flyctl deploy --config apps/landing/fly.toml --dockerfile apps/landing/Dockerfile --app ryla-landing-prod
flyctl deploy --config apps/funnel/fly.toml --dockerfile apps/funnel/Dockerfile --app ryla-funnel-prod
```

### 5. Clean Up Old Apps (Optional)

If the old apps (`ryla-api`, `ryla-web`) are not needed:

```bash
flyctl apps destroy ryla-api
flyctl apps destroy ryla-web
```

## View Your Setup

```bash
# List all apps
flyctl apps list --org my-dream-companion

# View certificates
flyctl certs list --app ryla-landing-prod

# Check certificate status
flyctl certs check www.ryla.ai --app ryla-landing-prod

# Check app status
flyctl status --app ryla-api-prod
```

## Dashboard

Access your Fly.io dashboard:
https://fly.io/dashboard/my-dream-companion

## Summary

✅ **Apps**: 4 production apps created with `-prod` suffix  
✅ **Domains**: All 5 domains configured (awaiting DNS)  
✅ **Config**: All fly.toml and GitHub Actions updated  
⏳ **DNS**: Need to configure DNS records at registrar  
⏳ **Services**: PostgreSQL and Redis need to be created  
⏳ **Secrets**: Environment variables need to be set  
⏳ **Deploy**: Applications need to be deployed  

**You're ready to configure DNS and deploy!** 🚀

