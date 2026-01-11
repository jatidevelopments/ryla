# Fly.io Setup Status

## Current Status

✅ **Logged in to Fly.io** - `janis@miracleai.de`  
⚠️ **Payment Required** - Need to add credit card to create apps

## Required Action

**Add Payment Information:**
1. Visit: https://fly.io/dashboard/janis-tirtey-218/billing
2. Add a credit card or buy credit
3. Then run the setup script again

## What Will Be Created

Once payment is added, the setup script will create:

### Apps (4)
- `ryla-landing` - Landing page
- `funnel-v3-adult` - Payment funnel
- `ryla-web` - Main web app
- `ryla-api` - Backend API

### Managed Services (2)
- `ryla-db-prod` - PostgreSQL database (10GB, shared-cpu-1x)
- `ryla-redis-prod` - Redis instance (free plan)

### Domains (5)
- `www.ryla.ai` → `ryla-landing`
- `ryla.ai` → `ryla-landing`
- `goviral.ryla.ai` → `funnel-v3-adult`
- `app.ryla.ai` → `ryla-web`
- `end.ryla.ai` → `ryla-api`

## Next Steps After Payment

1. **Run setup script:**
   ```bash
   ./scripts/setup/flyio-complete-setup.sh
   ```

2. **Or run manually:**
   ```bash
   # Create apps
   flyctl apps create ryla-landing --org personal
   flyctl apps create funnel-v3-adult --org personal
   flyctl apps create ryla-web --org personal
   flyctl apps create ryla-api --org personal
   
   # Create services
   flyctl postgres create --name ryla-db-prod --region fra --vm-size shared-cpu-1x --volume-size 10 --org personal
   flyctl redis create --name ryla-redis-prod --region fra --plan free --org personal
   
   # Attach services
   flyctl postgres attach ryla-db-prod --app ryla-api
   flyctl redis attach ryla-redis-prod --app ryla-api
   
   # Configure domains
   flyctl domains add www.ryla.ai --app ryla-landing
   flyctl domains add ryla.ai --app ryla-landing
   flyctl domains add goviral.ryla.ai --app funnel-v3-adult
   flyctl domains add app.ryla.ai --app ryla-web
   flyctl domains add end.ryla.ai --app ryla-api
   ```

3. **Set environment variables** (see `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`)

4. **Deploy applications**

## Estimated Costs (MVP)

- Apps: ~$35-50/mo (with auto-stop for landing/web)
- PostgreSQL: ~$5-10/mo (10GB, shared-cpu-1x)
- Redis: $0/mo (free tier)
- **Total: ~$40-60/mo**

## Notes

- All apps will be created in the `personal` organization
- Region: `fra` (Frankfurt)
- PostgreSQL uses managed service (not unmanaged)
- Redis uses Upstash Redis (free tier)

