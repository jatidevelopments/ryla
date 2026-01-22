# Fly.io Setup - Current Status

## ✅ Completed

### Apps Created in `my-dream-companion` Organization

- ✅ `ryla-api` - Backend API app
- ✅ `ryla-web` - Main web app

### Apps Status

The apps `ryla-landing` and `funnel-v3-adult` **already exist globally** (app names are globally unique in Fly.io). They appear to be in a different organization. You have two options:

1. **Move/Transfer** the existing apps to `my-dream-companion` organization
2. **Use different names** (e.g., `ryla-landing-mdc`, `funnel-v3-adult-mdc`)

To check which organization they're in:
```bash
# Try to access them (will show error if not accessible)
flyctl apps show ryla-landing
flyctl apps show funnel-v3-adult
```

## 🌐 Domains

### Domains Added

- ✅ `app.ryla.ai` → `ryla-web` (pending DNS configuration)
- ✅ `end.ryla.ai` → `ryla-api` (pending DNS configuration)

### Domains Pending

These domains need to be added once the apps are accessible:

- ⏳ `www.ryla.ai` → `ryla-landing`
- ⏳ `ryla.ai` → `ryla-landing`
- ⏳ `goviral.ryla.ai` → `funnel-v3-adult`

**To add domains:**
```bash
flyctl certs add <domain> --app <app-name>
```

After adding, configure DNS records at your domain registrar as instructed by Fly.io.

## ⏳ Pending Setup

### Managed Services
- ⏳ PostgreSQL database (`ryla-db-prod`)
- ⏳ Redis instance (`ryla-redis-prod`)

**Create PostgreSQL:**
```bash
# Option 1: Managed Postgres (recommended)
flyctl mpg create ryla-db-prod --region fra --org my-dream-companion

# Option 2: Via dashboard
# Visit: https://fly.io/dashboard/my-dream-companion
```

**Create Redis:**
```bash
flyctl redis create --name ryla-redis-prod --region fra --plan free --org my-dream-companion
```

**Attach Services:**
```bash
flyctl postgres attach ryla-db-prod --app ryla-api
flyctl redis attach ryla-redis-prod --app ryla-api
```

### Environment Variables
- ⏳ Set secrets for all apps (see `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`)

### Deployment
- ⏳ Deploy all applications
- ⏳ Run database migrations

## Next Steps

1. **Resolve app access** - Move `ryla-landing` and `funnel-v3-adult` to `my-dream-companion` org, or create with different names
2. **Add remaining domains** - Once apps are accessible
3. **Create managed services** - PostgreSQL and Redis
4. **Set environment variables** - For all apps
5. **Deploy applications**

## View Your Setup

```bash
# List apps in my-dream-companion org
flyctl apps list --org my-dream-companion

# View certificates/domains
flyctl certs list --app ryla-web
flyctl certs list --app ryla-api

# Check app status
flyctl status --app ryla-api
flyctl status --app ryla-web
```

## Dashboard

Access your Fly.io dashboard:
https://fly.io/dashboard/my-dream-companion

