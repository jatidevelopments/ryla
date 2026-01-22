# Deployment Quick Start

## 🚀 Quick Reference

This is a quick reference guide for deploying RYLA applications to Fly.io. For detailed instructions, see [FLY-IO-DEPLOYMENT-GUIDE.md](./FLY-IO-DEPLOYMENT-GUIDE.md).

---

## Prerequisites Checklist

- [ ] Fly.io CLI installed: `brew install flyctl`
- [ ] Fly.io account: `flyctl auth login`
- [ ] GitHub secrets configured: `FLY_API_TOKEN`
- [ ] All environment variables documented (see deployment guide)

---

## Step 1: Set Up Managed Services

### PostgreSQL

```bash
# Create production database
flyctl postgres create --name ryla-db-prod --region fra --vm-size shared-cpu-1x --volume-size 10

# Attach to API
flyctl postgres attach ryla-db-prod --app ryla-api
```

### Redis

```bash
# Create production Redis
flyctl redis create --name ryla-redis-prod --region fra --plan free

# Attach to API
flyctl redis attach ryla-redis-prod --app ryla-api
```

---

## Step 2: Create Fly.io Apps

```bash
# Landing
flyctl apps create ryla-landing-staging
flyctl apps create ryla-landing

# Funnel
flyctl apps create funnel-v3-adult-staging
flyctl apps create funnel-v3-adult

# Web
flyctl apps create ryla-web-staging
flyctl apps create ryla-web

# API
flyctl apps create ryla-api-staging
flyctl apps create ryla-api
```

---

## Step 3: Configure Domains

```bash
flyctl domains add www.ryla.ai --app ryla-landing
flyctl domains add ryla.ai --app ryla-landing
flyctl domains add goviral.ryla.ai --app funnel-v3-adult
flyctl domains add app.ryla.ai --app ryla-web
flyctl domains add end.ryla.ai --app ryla-api
```

---

## Step 4: Set Environment Variables

### API App

```bash
flyctl secrets set \
  JWT_ACCESS_SECRET=<generate> \
  JWT_REFRESH_SECRET=<generate> \
  AWS_S3_ACCESS_KEY=<value> \
  AWS_S3_SECRET_KEY=<value> \
  BREVO_API_KEY=<value> \
  RUNPOD_API_KEY=<value> \
  OPENROUTER_API_KEY=<value> \
  CRON_SECRET=<generate> \
  SWAGGER_PASSWORD=<value> \
  --app ryla-api
```

**Note**: `DATABASE_URL` and `REDIS_URL` are set automatically when attaching managed services.

### Web App

```bash
flyctl secrets set \
  NEXT_PUBLIC_API_URL=https://end.ryla.ai \
  NEXT_PUBLIC_SITE_URL=https://app.ryla.ai \
  NEXT_PUBLIC_SUPABASE_URL=<value> \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<value> \
  JWT_ACCESS_SECRET=<same-as-api> \
  --app ryla-web
```

### Landing App

```bash
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app ryla-landing
```

### Funnel App

```bash
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai \
  --app funnel-v3-adult
```

**See [FLY-IO-DEPLOYMENT-GUIDE.md](./FLY-IO-DEPLOYMENT-GUIDE.md) for complete environment variable lists.**

---

## Step 5: Deploy Applications

### Manual Deployment

```bash
# Deploy API
flyctl deploy --config apps/api/fly.toml --dockerfile apps/api/Dockerfile --app ryla-api

# Deploy Web
flyctl deploy --config apps/web/fly.toml --dockerfile apps/web/Dockerfile --app ryla-web

# Deploy Landing
flyctl deploy --config apps/landing/fly.toml --dockerfile apps/landing/Dockerfile --app ryla-landing

# Deploy Funnel
flyctl deploy --config apps/funnel/fly.toml --dockerfile apps/funnel/Dockerfile --app funnel-v3-adult
```

### Automated Deployment

- **Staging**: Auto-deploys on push to `main` branch
- **Production**: Manual via GitHub Actions `workflow_dispatch` or release tag

---

## Step 6: Run Database Migrations

```bash
# Option 1: Via proxy
flyctl proxy 5432 -a ryla-db-prod
# Then in another terminal:
DATABASE_URL="postgresql://..." pnpm db:migrate

# Option 2: SSH into API app
flyctl ssh console -a ryla-api
# Then run migrations if script exists
```

---

## Step 7: Verify Deployment

### Health Checks

```bash
# API
curl https://end.ryla.ai/health

# Web
curl https://app.ryla.ai/api/health

# Landing
curl https://www.ryla.ai/api/health

# Funnel
curl https://goviral.ryla.ai/api/health
```

### Check Status

```bash
flyctl status --app ryla-api
flyctl status --app ryla-web
flyctl status --app ryla-landing
flyctl status --app funnel-v3-adult
```

### View Logs

```bash
flyctl logs --app ryla-api --follow
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check database status
flyctl postgres status ryla-db-prod

# Verify connection string
flyctl secrets list --app ryla-api | grep DATABASE

# Test connection
flyctl postgres connect -a ryla-db-prod
```

### Redis Connection Issues

```bash
# Check Redis status
flyctl redis status ryla-redis-prod

# Verify connection string
flyctl secrets list --app ryla-api | grep REDIS

# Test connection
flyctl redis connect ryla-redis-prod
```

### App Deployment Fails

```bash
# Check logs
flyctl logs --app ryla-api

# Verify secrets
flyctl secrets list --app ryla-api

# Restart app
flyctl apps restart ryla-api
```

---

## Cost Estimate (MVP)

- Landing: ~$5/mo (auto-stop)
- Funnel: ~$10-15/mo (always-on)
- Web: ~$10-15/mo (auto-stop)
- API: ~$10-15/mo (always-on)
- PostgreSQL: ~$5-10/mo (managed, 10GB)
- Redis: $0/mo (free tier)
- **Total: ~$40-60/mo**

---

## Next Steps

1. ✅ Set up managed services (PostgreSQL, Redis)
2. ✅ Create Fly.io apps
3. ✅ Configure domains
4. ✅ Set environment variables
5. ✅ Deploy applications
6. ✅ Run database migrations
7. ✅ Verify health checks
8. ✅ Test critical user flows

---

## Documentation

- **Complete Guide**: [FLY-IO-DEPLOYMENT-GUIDE.md](./FLY-IO-DEPLOYMENT-GUIDE.md)
- **Setup Checklist**: [CD-SETUP-CHECKLIST.md](./CD-SETUP-CHECKLIST.md)
- **CD Strategy**: [FLY-IO-CD-STRATEGY.md](./FLY-IO-CD-STRATEGY.md)
- **ADR**: [ADR-004: Fly.io Deployment Platform](../decisions/ADR-004-fly-io-deployment-platform.md)

