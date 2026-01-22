# Fly.io Setup Complete ✅

## ✅ Completed Setup

### Apps Created (4) - All with `-prod` suffix

- ✅ `ryla-landing-prod` - Landing page app
- ✅ `ryla-funnel-prod` - Payment funnel app
- ✅ `ryla-web-prod` - Main web app
- ✅ `ryla-api-prod` - Backend API app

**Organization**: `my-dream-companion`

### Domains Configured

All domains from `docs/ops/DOMAIN-REGISTRY.md` have been added:

- ✅ `www.ryla.ai` → `ryla-landing-prod`
- ✅ `ryla.ai` → `ryla-landing-prod`
- ✅ `goviral.ryla.ai` → `ryla-funnel-prod`
- ✅ `app.ryla.ai` → `ryla-web-prod`
- ✅ `end.ryla.ai` → `ryla-api-prod`

**Note**: DNS records need to be configured at your domain registrar. Fly.io provides DNS instructions when you add each certificate. Check with:

```bash
flyctl certs list --app <app-name>
```

### Configuration Files Updated

- ✅ `apps/landing/fly.toml` → `app = "ryla-landing-prod"`
- ✅ `apps/funnel/fly.toml` → `app = "ryla-funnel-prod"`
- ✅ `apps/web/fly.toml` → `app = "ryla-web-prod"`
- ✅ `apps/api/fly.toml` → `app = "ryla-api-prod"`
- ✅ `.github/workflows/deploy-production.yml` → Updated app names

## ⏳ Next Steps

### 1. Configure DNS Records

For each domain, add the DNS records as instructed by Fly.io:

```bash
# Check DNS instructions for each app
flyctl certs list --app ryla-landing-prod
flyctl certs list --app ryla-funnel-prod
flyctl certs list --app ryla-web-prod
flyctl certs list --app ryla-api-prod
```

Typically, you'll need to add CNAME records like:

- `CNAME _acme-challenge.www.ryla.ai => www.ryla.ai.xxxxx.flydns.net`

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

See `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md` for complete environment variable lists.

**Quick reference:**

```bash
# API secrets
flyctl secrets set JWT_ACCESS_SECRET=... --app ryla-api-prod

# Web secrets
flyctl secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --app ryla-web-prod

# Landing secrets
flyctl secrets set NEXT_PUBLIC_SITE_URL=https://www.ryla.ai --app ryla-landing-prod

# Funnel secrets
flyctl secrets set NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai --app ryla-funnel-prod
```

### 4. Deploy Applications

```bash
# Deploy API first
flyctl deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile --app ryla-api-prod

# Deploy Web
flyctl deploy --config apps/web/fly.toml --dockerfile apps/web/Dockerfile --app ryla-web-prod

# Deploy Landing
flyctl deploy --config apps/landing/fly.toml --dockerfile apps/landing/Dockerfile --app ryla-landing-prod

# Deploy Funnel
flyctl deploy --config apps/funnel/fly.toml --dockerfile apps/funnel/Dockerfile --app ryla-funnel-prod
```

### 5. Run Database Migrations

After API is deployed:

```bash
flyctl proxy 5432 -a ryla-db-prod
# In another terminal:
DATABASE_URL="postgresql://..." pnpm db:migrate
```

## View Your Setup

```bash
# List all apps
flyctl apps list --org my-dream-companion

# View certificates
flyctl certs list --app ryla-landing-prod

# Check app status
flyctl status --app ryla-api-prod
```

## Dashboard

Access your Fly.io dashboard:
https://fly.io/dashboard/my-dream-companion

## Notes

- All apps use the `-prod` suffix to avoid naming conflicts
- Old apps (`ryla-api`, `ryla-web`) without `-prod` can be deleted if not needed
- Domains are configured but need DNS records at your registrar
- Services (PostgreSQL, Redis) still need to be created
