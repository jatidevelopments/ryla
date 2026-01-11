# Fly.io Setup Summary ✅

## ✅ Completed Setup

### Apps Created (4 production apps with `-prod` suffix)

- ✅ `ryla-landing-prod` - Landing page
- ✅ `ryla-funnel-prod` - Payment funnel  
- ✅ `ryla-web-prod` - Main web app
- ✅ `ryla-api-prod` - Backend API

**Organization**: `my-dream-companion`

### Domains Configured ✅

All 5 domains from `docs/ops/DOMAIN-REGISTRY.md` are configured:

- ✅ `www.ryla.ai` → `ryla-landing-prod`
- ✅ `ryla.ai` → `ryla-landing-prod`
- ✅ `goviral.ryla.ai` → `ryla-funnel-prod`
- ✅ `app.ryla.ai` → `ryla-web-prod`
- ✅ `end.ryla.ai` → `ryla-api-prod`

**Status**: Certificates are in "Awaiting configuration" - DNS records need to be added at your domain registrar.

### Configuration Updated ✅

- ✅ All `fly.toml` files updated with `-prod` app names
- ✅ GitHub Actions workflows updated for production deployments
- ✅ Setup scripts created and ready

## ⏳ Next Steps

### 1. Configure DNS Records

Get DNS instructions for each domain:

```bash
flyctl certs list --app ryla-landing-prod
flyctl certs list --app ryla-funnel-prod
flyctl certs list --app ryla-web-prod
flyctl certs list --app ryla-api-prod
```

Add the CNAME records shown to your domain registrar (Cloudflare in your case).

### 2. Create Managed Services

```bash
# PostgreSQL
flyctl mpg create ryla-db-prod --region fra --org my-dream-companion

# Redis
flyctl redis create --name ryla-redis-prod --region fra --plan free --org my-dream-companion

# Attach to API
flyctl postgres attach ryla-db-prod --app ryla-api-prod
flyctl redis attach ryla-redis-prod --app ryla-api-prod
```

### 3. Set Environment Variables & Deploy

See `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md` for complete instructions.

## View Status

```bash
# All apps
flyctl apps list --org my-dream-companion

# Certificates
flyctl certs list --app ryla-landing-prod
```

## Dashboard

https://fly.io/dashboard/my-dream-companion

