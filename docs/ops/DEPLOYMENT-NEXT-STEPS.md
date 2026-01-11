# Deployment Next Steps - Action Items

## ✅ Completed

1. ✅ Created API Dockerfile and fly.toml
2. ✅ Created comprehensive deployment documentation
3. ✅ Updated GitHub Actions workflows to include API
4. ✅ Created health endpoints for all apps
5. ✅ Added health check configurations to fly.toml files
6. ✅ Created setup and verification scripts

## 🚀 Ready to Execute

### Step 1: Run Verification Script

Verify everything is ready:

```bash
./scripts/setup/verify-deployment-readiness.sh
```

**Expected**: All checks should pass ✅

---

### Step 2: Set Up Fly.io Services

#### Option A: Use Setup Script (Recommended)

```bash
./scripts/setup/flyio-setup.sh
```

This interactive script will:
- Create PostgreSQL databases (production and/or staging)
- Create Redis instances (production and/or staging)
- Create all Fly.io apps
- Attach services to API apps

#### Option B: Manual Setup

Follow the commands in `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md` section "Fly.io Managed Services Setup"

---

### Step 3: Configure Domains

```bash
# Production domains
flyctl domains add www.ryla.ai --app ryla-landing
flyctl domains add ryla.ai --app ryla-landing
flyctl domains add goviral.ryla.ai --app funnel-v3-adult
flyctl domains add app.ryla.ai --app ryla-web
flyctl domains add end.ryla.ai --app ryla-api
```

**Note**: You need DNS access to configure these domains. If you don't have DNS access yet, you can skip this step and use the default `.fly.dev` domains initially.

---

### Step 4: Set Environment Variables

#### Generate Required Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32  # For JWT_ACCESS_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 32  # For JWT_ACTION_FORGOT_PASSWORD_SECRET
openssl rand -hex 32     # For CRON_SECRET
```

#### Set API Secrets

```bash
flyctl secrets set \
  JWT_ACCESS_SECRET=<generated-secret> \
  JWT_REFRESH_SECRET=<generated-secret> \
  JWT_ACTION_FORGOT_PASSWORD_SECRET=<generated-secret> \
  AWS_S3_ACCESS_KEY=<your-s3-key> \
  AWS_S3_SECRET_KEY=<your-s3-secret> \
  AWS_S3_BUCKET_NAME=ryla-images \
  BREVO_API_KEY=<your-brevo-key> \
  RUNPOD_API_KEY=<your-runpod-key> \
  OPENROUTER_API_KEY=<your-openrouter-key> \
  CRON_SECRET=<generated-secret> \
  SWAGGER_PASSWORD=<secure-password> \
  --app ryla-api
```

**Note**: `DATABASE_URL` and `REDIS_URL` are set automatically when you attach managed services.

#### Set Web App Secrets

```bash
flyctl secrets set \
  NEXT_PUBLIC_API_URL=https://end.ryla.ai \
  NEXT_PUBLIC_SITE_URL=https://app.ryla.ai \
  NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url> \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key> \
  NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key> \
  JWT_ACCESS_SECRET=<same-as-api> \
  POSTGRES_HOST=<from-database-url> \
  POSTGRES_PORT=5432 \
  POSTGRES_USER=<from-database-url> \
  POSTGRES_PASSWORD=<from-database-url> \
  POSTGRES_DB=ryla \
  --app ryla-web
```

#### Set Landing App Secrets

```bash
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app ryla-landing
```

#### Set Funnel App Secrets

```bash
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai \
  NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ \
  NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com \
  NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key> \
  NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url> \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key> \
  --app funnel-v3-adult
```

**See `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md` for complete environment variable lists.**

---

### Step 5: Deploy Applications

#### Manual Deployment (First Time)

```bash
# Deploy API first (other apps depend on it)
flyctl deploy \
  --config apps/api/fly.toml \
  --dockerfile apps/api/Dockerfile \
  --app ryla-api

# Deploy Web
flyctl deploy \
  --config apps/web/fly.toml \
  --dockerfile apps/web/Dockerfile \
  --app ryla-web

# Deploy Landing
flyctl deploy \
  --config apps/landing/fly.toml \
  --dockerfile apps/landing/Dockerfile \
  --app ryla-landing

# Deploy Funnel
flyctl deploy \
  --config apps/funnel/fly.toml \
  --dockerfile apps/funnel/Dockerfile \
  --app funnel-v3-adult
```

#### Automated Deployment (After First Deploy)

- **Staging**: Auto-deploys on push to `main` branch
- **Production**: Manual via GitHub Actions `workflow_dispatch` or release tag

---

### Step 6: Run Database Migrations

After API is deployed, run migrations:

```bash
# Option 1: Via proxy
flyctl proxy 5432 -a ryla-db-prod

# In another terminal, run migrations
DATABASE_URL="postgresql://..." pnpm db:migrate

# Option 2: SSH into API app
flyctl ssh console -a ryla-api
# Then run migrations if script exists
```

---

### Step 7: Verify Deployment

#### Health Checks

```bash
# API
curl https://end.ryla.ai/health
curl https://end.ryla.ai/database-check

# Web
curl https://app.ryla.ai/api/health

# Landing
curl https://www.ryla.ai/api/health

# Funnel
curl https://goviral.ryla.ai/api/health
```

#### Check Status

```bash
flyctl status --app ryla-api
flyctl status --app ryla-web
flyctl status --app ryla-landing
flyctl status --app funnel-v3-adult
```

#### View Logs

```bash
flyctl logs --app ryla-api --follow
```

---

## 📋 Checklist

- [ ] Run verification script: `./scripts/setup/verify-deployment-readiness.sh`
- [ ] Set up Fly.io services (PostgreSQL, Redis)
- [ ] Create Fly.io apps (or use setup script)
- [ ] Configure domains (if DNS access available)
- [ ] Set environment variables for all apps
- [ ] Deploy API application
- [ ] Deploy Web application
- [ ] Deploy Landing application
- [ ] Deploy Funnel application
- [ ] Run database migrations
- [ ] Verify health checks
- [ ] Test critical user flows

---

## 🔗 Documentation References

- **Complete Guide**: `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`
- **Quick Start**: `docs/ops/DEPLOYMENT-QUICK-START.md`
- **Setup Checklist**: `docs/ops/CD-SETUP-CHECKLIST.md`
- **CD Strategy**: `docs/ops/FLY-IO-CD-STRATEGY.md`

---

## ⚠️ Important Notes

1. **Database & Redis**: These are managed services that cost money. Start with free/small plans for MVP.

2. **Environment Variables**: Never commit secrets. Always use `flyctl secrets set`.

3. **First Deployment**: Deploy API first, then other apps that depend on it.

4. **Migrations**: Run migrations after first API deployment, before testing.

5. **Health Checks**: All apps now have health endpoints at `/api/health` (Next.js) or `/health` (API).

6. **Costs**: Estimated ~$40-60/mo for MVP. Monitor via Fly.io dashboard.

---

## 🆘 Troubleshooting

If something goes wrong:

1. Check logs: `flyctl logs --app <app-name>`
2. Verify secrets: `flyctl secrets list --app <app-name>`
3. Check status: `flyctl status --app <app-name>`
4. See troubleshooting section in `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`

