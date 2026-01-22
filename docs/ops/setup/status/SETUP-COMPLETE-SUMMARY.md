# Fly.io Setup Complete Summary

## ✅ Completed

### Apps Created (4)
- ✅ `ryla-landing` - Landing page app
- ✅ `funnel-v3-adult` - Payment funnel app  
- ✅ `ryla-web` - Main web app
- ✅ `ryla-api` - Backend API app

**Organization**: `my-dream-companion`

### Domains to Configure

Add domains using `flyctl certs add`:

```bash
# Landing page domains
flyctl certs add www.ryla.ai --app ryla-landing
flyctl certs add ryla.ai --app ryla-landing

# Funnel domain
flyctl certs add goviral.ryla.ai --app funnel-v3-adult

# Web app domain
flyctl certs add app.ryla.ai --app ryla-web

# API domain
flyctl certs add end.ryla.ai --app ryla-api
```

**Note**: After adding certificates, you'll need to configure DNS records at your domain registrar. Fly.io will provide the DNS instructions when you add each certificate.

## ⏳ Pending

### Managed Services
- ⏳ PostgreSQL database (`ryla-db-prod`) - Needs to be created
- ⏳ Redis instance (`ryla-redis-prod`) - Needs to be created

**Note**: PostgreSQL creation requires interactive input. You can:
1. Create manually via Fly.io dashboard: https://fly.io/dashboard/my-dream-companion
2. Or use managed postgres: `flyctl mpg create ryla-db-prod --region fra --org my-dream-companion`

### Environment Variables
- ⏳ Set secrets for all apps (see `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`)

### Deployment
- ⏳ Deploy all applications
- ⏳ Run database migrations

## Next Steps

1. **Add Domains** (run the commands above)
2. **Create PostgreSQL**: Use Fly.io dashboard or `flyctl mpg create`
3. **Create Redis**: `flyctl redis create --name ryla-redis-prod --region fra --plan free --org my-dream-companion`
4. **Attach Services**: 
   ```bash
   flyctl postgres attach ryla-db-prod --app ryla-api
   flyctl redis attach ryla-redis-prod --app ryla-api
   ```
5. **Set Environment Variables** (see deployment guide)
6. **Deploy Applications**

## View Your Setup

```bash
# List all apps
flyctl apps list --org my-dream-companion

# View certificates/domains
flyctl certs list --app ryla-landing

# Check app status
flyctl status --app ryla-api
```

## Dashboard

Access your Fly.io dashboard:
https://fly.io/dashboard/my-dream-companion

