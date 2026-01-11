# Fly.io Deployment Guide - Complete Setup

## Overview

This guide covers the complete deployment setup for all RYLA applications and services on Fly.io, including managed services (Redis, PostgreSQL) and all required environment variables.

**Status**: 🟢 Ready for Deployment  
**Last Updated**: 2025-01-XX

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Fly.io Managed Services Setup](#flyio-managed-services-setup)
3. [Application Deployment](#application-deployment)
4. [Environment Variables](#environment-variables)
5. [Service Dependencies](#service-dependencies)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Fly.io Account & CLI

```bash
# Install Fly.io CLI
brew install flyctl

# Login to Fly.io
flyctl auth login

# Verify installation
flyctl version
```

### 2. GitHub Secrets

Required secrets in GitHub repository settings:

- `FLY_API_TOKEN` - Get with: `flyctl auth token`
- `SLACK_WEBHOOK_DEPLOYS` - Deployment notifications (optional)
- `SLACK_WEBHOOK_ALERTS` - Failure alerts (optional)
- `SLACK_WEBHOOK_AUDIT` - Audit log (optional)

---

## Fly.io Managed Services Setup

### PostgreSQL Database

RYLA uses Fly.io's managed PostgreSQL for production.

#### Create PostgreSQL Database

```bash
# Production database
flyctl postgres create --name ryla-db-prod --region fra --vm-size shared-cpu-1x --volume-size 10

# Staging database (optional, smaller)
flyctl postgres create --name ryla-db-staging --region fra --vm-size shared-cpu-1x --volume-size 5
```

#### Attach Database to Apps

```bash
# Attach to API production
flyctl postgres attach ryla-db-prod --app ryla-api

# Attach to API staging
flyctl postgres attach ryla-db-staging --app ryla-api-staging
```

**Note**: Attaching automatically sets `DATABASE_URL` secret. You can also manually set connection variables (see [Environment Variables](#environment-variables)).

#### Get Connection String

```bash
# View connection details
flyctl postgres connect -a ryla-db-prod

# Or get connection string
flyctl postgres connect -a ryla-db-prod --command "echo \$DATABASE_URL"
```

#### Run Migrations

After attaching database, run migrations:

```bash
# Connect to database
flyctl postgres connect -a ryla-db-prod

# Or use flyctl proxy
flyctl proxy 5432 -a ryla-db-prod

# Then run migrations locally pointing to proxy
DATABASE_URL="postgresql://..." pnpm db:migrate
```

**Alternative**: Run migrations from API app using a one-off command:

```bash
# SSH into API app
flyctl ssh console -a ryla-api

# Run migrations (if migration script exists)
pnpm db:migrate
```

### Redis

RYLA uses Fly.io's managed Redis (Upstash Redis) for caching and job queues.

#### Create Redis Instance

```bash
# Production Redis
flyctl redis create --name ryla-redis-prod --region fra --plan free

# Staging Redis (optional)
flyctl redis create --name ryla-redis-staging --region fra --plan free
```

**Note**: Free plan is suitable for MVP. Upgrade to paid plans for production scale.

#### Attach Redis to Apps

```bash
# Attach to API production
flyctl redis attach ryla-redis-prod --app ryla-api

# Attach to API staging
flyctl redis attach ryla-redis-staging --app ryla-api-staging
```

**Note**: Attaching automatically sets `REDIS_URL` secret. You can also manually set connection variables.

#### Get Connection Details

```bash
# View Redis info
flyctl redis status ryla-redis-prod

# Get connection string
flyctl redis connect ryla-redis-prod
```

---

## Application Deployment

### 1. Create Fly.io Apps

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

### 2. Configure Domains

```bash
# Production domains
flyctl domains add www.ryla.ai --app ryla-landing
flyctl domains add ryla.ai --app ryla-landing
flyctl domains add goviral.ryla.ai --app funnel-v3-adult
flyctl domains add app.ryla.ai --app ryla-web
flyctl domains add end.ryla.ai --app ryla-api
```

### 3. Set Environment Variables

See [Environment Variables](#environment-variables) section for complete list.

### 4. Deploy Applications

#### Manual Deployment

```bash
# Deploy API
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

#### Automated Deployment (GitHub Actions)

Deployments are automated via GitHub Actions:

- **Staging**: Auto-deploys on push to `main` branch
- **Production**: Manual via `workflow_dispatch` or release tag

See `.github/workflows/deploy-staging.yml` and `.github/workflows/deploy-production.yml`.

---

## Environment Variables

### API App (`ryla-api`)

#### Required Secrets

```bash
# Application
APP_PORT=3001
APP_HOST=0.0.0.0
APP_ENVIRONMENT=production

# PostgreSQL (from managed database attachment)
POSTGRES_HOST=<from DATABASE_URL>
POSTGRES_PORT=5432
POSTGRES_USER=<from DATABASE_URL>
POSTGRES_PASSWORD=<from DATABASE_URL>
POSTGRES_DB=<from DATABASE_URL>
POSTGRES_ENVIRONMENT=production
# OR use DATABASE_URL directly (set automatically when attaching)

# Redis (from managed Redis attachment)
REDIS_HOST=<from REDIS_URL>
REDIS_PORT=6379
REDIS_PASSWORD=<from REDIS_URL>
REDIS_ENVIRONMENT=production
# OR use REDIS_URL directly (set automatically when attaching)

# JWT Authentication
JWT_ACCESS_SECRET=<generate with: openssl rand -base64 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -base64 32>
JWT_ACCESS_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=86400
JWT_ACTION_FORGOT_PASSWORD_SECRET=<generate with: openssl rand -base64 32>
JWT_ACTION_FORGOT_PASSWORD_EXPIRES_IN=3600

# S3 Storage (AWS S3 or compatible)
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY=<your-s3-access-key>
AWS_S3_SECRET_KEY=<your-s3-secret-key>
AWS_S3_BUCKET_NAME=ryla-images
AWS_S3_URL_TTL=3600
AWS_S3_ENDPOINT=<optional-for-s3-compatible>
AWS_S3_FORCE_PATH_STYLE=false

# Brevo (Email Service)
BREVO_API_KEY=<your-brevo-api-key>
BREVO_API_URL=https://api.brevo.com/v3

# RunPod (AI Image Generation)
RUNPOD_API_KEY=<your-runpod-api-key>
RUNPOD_ENDPOINT_FLUX_DEV=jpcxjab2zpro19
RUNPOD_ENDPOINT_Z_IMAGE_TURBO=xqs8k7yhabwh0k

# OpenRouter (LLM Prompt Enhancement)
OPENROUTER_API_KEY=<your-openrouter-api-key>
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini

# Direct LLM APIs (Fallback)
GEMINI_API_KEY=<optional>
OPENAI_API_KEY=<optional>

# Cron Jobs
CRON_SECRET=<generate with: openssl rand -hex 32>

# Swagger Documentation
SWAGGER_PASSWORD=<secure-password>
```

#### Set Secrets

```bash
# Set all secrets at once
flyctl secrets set \
  APP_PORT=3001 \
  APP_HOST=0.0.0.0 \
  APP_ENVIRONMENT=production \
  JWT_ACCESS_SECRET=<value> \
  JWT_REFRESH_SECRET=<value> \
  AWS_S3_ACCESS_KEY=<value> \
  AWS_S3_SECRET_KEY=<value> \
  BREVO_API_KEY=<value> \
  RUNPOD_API_KEY=<value> \
  OPENROUTER_API_KEY=<value> \
  CRON_SECRET=<value> \
  SWAGGER_PASSWORD=<value> \
  --app ryla-api
```

**Note**: `DATABASE_URL` and `REDIS_URL` are set automatically when attaching managed services.

### Web App (`ryla-web`)

#### Required Secrets

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://end.ryla.ai

# Site URL
NEXT_PUBLIC_SITE_URL=https://app.ryla.ai

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Finby Payment Gateway
FINBY_API_KEY=<your-finby-api-key>
FINBY_MERCHANT_ID=<your-finby-merchant-id>
FINBY_WEBHOOK_SECRET=<your-finby-webhook-secret>
FINBY_PROJECT_ID=<your-finby-project-id>
FINBY_SECRET_KEY=<your-finby-secret-key>
FINBY_TEST_MODE=false

# JWT (for tRPC server-side)
JWT_ACCESS_SECRET=<must-match-api-jwt-access-secret>

# PostgreSQL (for tRPC server-side queries)
POSTGRES_HOST=<same-as-api>
POSTGRES_PORT=5432
POSTGRES_USER=<same-as-api>
POSTGRES_PASSWORD=<same-as-api>
POSTGRES_DB=ryla
POSTGRES_ENVIRONMENT=production
```

#### Set Secrets

```bash
flyctl secrets set \
  NEXT_PUBLIC_API_URL=https://end.ryla.ai \
  NEXT_PUBLIC_SITE_URL=https://app.ryla.ai \
  NEXT_PUBLIC_SUPABASE_URL=<value> \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<value> \
  NEXT_PUBLIC_POSTHOG_KEY=<value> \
  FINBY_API_KEY=<value> \
  FINBY_MERCHANT_ID=<value> \
  FINBY_WEBHOOK_SECRET=<value> \
  JWT_ACCESS_SECRET=<value> \
  POSTGRES_HOST=<value> \
  POSTGRES_PORT=5432 \
  POSTGRES_USER=<value> \
  POSTGRES_PASSWORD=<value> \
  POSTGRES_DB=ryla \
  POSTGRES_ENVIRONMENT=production \
  --app ryla-web
```

### Landing App (`ryla-landing`)

#### Required Secrets

```bash
NEXT_PUBLIC_SITE_URL=https://www.ryla.ai
NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
```

#### Set Secrets

```bash
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app ryla-landing
```

### Funnel App (`funnel-v3-adult`)

#### Required Secrets

```bash
NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai
NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

#### Set Secrets

```bash
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai \
  NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ \
  NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com \
  NEXT_PUBLIC_POSTHOG_KEY=<value> \
  NEXT_PUBLIC_SUPABASE_URL=<value> \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<value> \
  --app funnel-v3-adult
```

---

## Service Dependencies

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Fly.io Platform                        │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Landing  │  │  Funnel  │  │   Web    │  │   API    │ │
│  │          │  │          │  │           │  │           │ │
│  └──────────┘  └──────────┘  └─────┬─────┘  └─────┬─────┘ │
│                                    │              │       │
│                                    │              │       │
│                          ┌─────────▼──────┐  ┌────▼─────┐ │
│                          │  PostgreSQL    │  │  Redis   │ │
│                          │  (Managed)     │  │ (Managed)│ │
│                          └────────────────┘  └──────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │                  │
                    │  - Supabase      │
                    │  - RunPod        │
                    │  - AWS S3        │
                    │  - Brevo         │
                    │  - Finby         │
                    │  - OpenRouter    │
                    └──────────────────┘
```

### Service Connections

1. **Web App** → **API App**: `NEXT_PUBLIC_API_URL=https://end.ryla.ai`
2. **Funnel App** → **API App**: `NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai`
3. **API App** → **PostgreSQL**: Managed database (auto-attached)
4. **API App** → **Redis**: Managed Redis (auto-attached)
5. **All Apps** → **External Services**: See environment variables

---

## Verification & Testing

### 1. Health Checks

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

### 2. Database Connection

```bash
# Check API database connection
flyctl ssh console -a ryla-api
# Then: curl http://localhost:3001/database-check
```

### 3. Redis Connection

```bash
# Check API Redis connection
flyctl ssh console -a ryla-api
# Then: curl http://localhost:3001/health (includes Redis check)
```

### 4. Service Status

```bash
# Check all app statuses
flyctl status --app ryla-api
flyctl status --app ryla-web
flyctl status --app ryla-landing
flyctl status --app funnel-v3-adult

# Check database status
flyctl postgres status ryla-db-prod

# Check Redis status
flyctl redis status ryla-redis-prod
```

### 5. View Logs

```bash
# API logs
flyctl logs --app ryla-api

# Web logs
flyctl logs --app ryla-web

# Follow logs in real-time
flyctl logs --app ryla-api --follow
```

---

## Troubleshooting

### Database Connection Issues

1. **Verify database is attached**:
   ```bash
   flyctl postgres list
   flyctl postgres status ryla-db-prod
   ```

2. **Check connection string**:
   ```bash
   flyctl secrets list --app ryla-api | grep DATABASE
   ```

3. **Test connection**:
   ```bash
   flyctl postgres connect -a ryla-db-prod
   ```

### Redis Connection Issues

1. **Verify Redis is attached**:
   ```bash
   flyctl redis list
   flyctl redis status ryla-redis-prod
   ```

2. **Check connection string**:
   ```bash
   flyctl secrets list --app ryla-api | grep REDIS
   ```

3. **Test connection**:
   ```bash
   flyctl redis connect ryla-redis-prod
   ```

### App Deployment Fails

1. **Check build logs**:
   ```bash
   flyctl logs --app ryla-api
   ```

2. **Verify Dockerfile builds locally**:
   ```bash
   docker build -f apps/api/Dockerfile -t ryla-api-test .
   ```

3. **Check secrets**:
   ```bash
   flyctl secrets list --app ryla-api
   ```

4. **Verify health endpoint**:
   ```bash
   curl https://end.ryla.ai/health
   ```

### Health Check Fails

1. **Check app logs**:
   ```bash
   flyctl logs --app ryla-api
   ```

2. **SSH into app**:
   ```bash
   flyctl ssh console -a ryla-api
   curl http://localhost:3001/health
   ```

3. **Verify health endpoint exists**:
   - API: `/health` endpoint in `HealthController`
   - Web/Landing/Funnel: `/api/health` route

### Missing Environment Variables

1. **List all secrets**:
   ```bash
   flyctl secrets list --app ryla-api
   ```

2. **Set missing secrets**:
   ```bash
   flyctl secrets set KEY=value --app ryla-api
   ```

3. **Restart app**:
   ```bash
   flyctl apps restart ryla-api
   ```

---

## Cost Optimization

### Database

- **Staging**: Use smaller volume (5GB) or shared instance
- **Production**: Start with 10GB, scale up as needed
- **Auto-stop**: Not available for managed databases (always running)

### Redis

- **MVP**: Use free plan (Upstash Redis free tier)
- **Production**: Upgrade to paid plan when needed

### Apps

- **Landing**: Auto-stop enabled (min_machines_running = 0)
- **Web**: Auto-stop enabled (min_machines_running = 0)
- **Funnel**: Always-on (min_machines_running = 1)
- **API**: Always-on (min_machines_running = 1)

### Estimated Monthly Costs (MVP)

- Landing: ~$5/mo (auto-stop)
- Funnel: ~$10-15/mo (always-on)
- Web: ~$10-15/mo (auto-stop)
- API: ~$10-15/mo (always-on)
- PostgreSQL: ~$5-10/mo (managed, 10GB)
- Redis: $0/mo (free tier)
- **Total: ~$40-60/mo**

---

## Next Steps

1. ✅ Set up managed PostgreSQL database
2. ✅ Set up managed Redis
3. ✅ Configure all environment variables
4. ✅ Deploy all applications
5. ✅ Run database migrations
6. ✅ Verify health checks
7. ✅ Test critical user flows
8. ✅ Set up monitoring and alerts

---

## References

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io PostgreSQL](https://fly.io/docs/postgres/)
- [Fly.io Redis](https://fly.io/docs/redis/)
- [CD Setup Checklist](./CD-SETUP-CHECKLIST.md)
- [Fly.io CD Strategy](./FLY-IO-CD-STRATEGY.md)
- [ADR-004: Fly.io Deployment Platform](../decisions/ADR-004-fly-io-deployment-platform.md)

