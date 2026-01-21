# Admin App Deployment Setup Guide

**Created**: 2025-01-21  
**Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../initiatives/IN-023-fly-io-deployment-infrastructure.md)  
**Epic**: [EP-060: Fly.io Deployment Infrastructure & Infisical Integration](../../requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md)

> **⚠️ IMPORTANT**: All deployments MUST run via GitHub Actions workflows. Manual CLI deployments are forbidden. See [Deployment Workflow Policy](./DEPLOYMENT-WORKFLOW-POLICY.md) for details.

---

## Overview

This guide covers the deployment setup for the Admin Dashboard app to Fly.io with Infisical production environment integration.

**Deployment Method**: GitHub Actions workflows (automated via main workflow or manual via standalone workflow)

---

## Files Created

### 1. `apps/admin/fly.toml`

Fly.io configuration for the admin app:
- App name: `ryla-admin-prod`
- Region: `fra` (Frankfurt)
- Port: `3000`
- Health check: `/api/health`
- Memory: `1gb`
- CPU: `shared`, 1 core

### 2. `apps/admin/Dockerfile`

Production Dockerfile following Next.js standalone pattern:
- Multi-stage build (deps → builder → runner)
- Build args for `NEXT_PUBLIC_*` variables
- Standalone output structure
- Non-root user (nextjs)

### 3. `apps/admin/app/api/health/route.ts`

Health check endpoint for Fly.io:
- Returns `200 OK` with status information
- Used by Fly.io health checks

### 4. `.github/workflows/deploy-auto.yml` (Main Workflow)

**Primary deployment method** - Auto Deploy (Nx Affected) workflow:
- Automatically detects admin app changes
- Deploys only when admin app is affected
- Triggers on push to main/staging
- Supports manual dispatch
- Includes admin in Nx affected detection

### 5. `.github/workflows/deploy-admin.yml` (Standalone Workflow)

**Emergency/Manual deployments only**:
- Manual dispatch only (no automatic triggers)
- For standalone admin deployments
- Use main workflow for regular deployments
- Environment detection (dev/staging/prod)
- Infisical integration
- Build args from Infisical
- Runtime secrets sync

---

## Deployment Steps

### Step 1: Add Secrets to Infisical

Add all required secrets to Infisical prod environment:

```bash
# Base configuration
infisical secrets set NEXT_PUBLIC_SITE_URL=https://admin.ryla.ai --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai --path=/apps/admin --env=prod

# PostHog Analytics
infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_xxx --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/apps/admin --env=prod

# Supabase
infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... --path=/apps/admin --env=prod

# Shared secrets (if not already set)
infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... --path=/shared --env=prod
```

### Step 2: Create Fly.io App

```bash
# Create the Fly.io app
flyctl apps create ryla-admin-prod --org personal

# Or if using a different org
flyctl apps create ryla-admin-prod --org your-org-name
```

### Step 3: Configure Domain

```bash
# Add domain to Fly.io app
flyctl domains add admin.ryla.ai --app ryla-admin-prod

# This will provide DNS records to add to your domain registrar
```

### Step 4: Deploy

**Option A: Manual Deployment (Testing)**

```bash
# Export build args from Infisical
infisical export --path=/apps/admin --path=/shared --env=prod --format=dotenv > /tmp/admin-build.env
source /tmp/admin-build.env

# Deploy to Fly.io
flyctl deploy \
  --config apps/admin/fly.toml \
  --dockerfile apps/admin/Dockerfile \
  --app ryla-admin-prod \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST="$NEXT_PUBLIC_POSTHOG_HOST" \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY="$NEXT_PUBLIC_POSTHOG_KEY" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Option B: Automated Deployment (Production)**

The GitHub Actions workflow (`.github/workflows/deploy-admin.yml`) will automatically deploy when:
- Changes are pushed to `main` or `staging` branches affecting `apps/admin/**`
- Workflow is manually triggered

### Step 5: Verify Deployment

```bash
# Check app status
flyctl status --app ryla-admin-prod

# Check health endpoint
curl https://admin.ryla.ai/api/health

# View logs
flyctl logs --app ryla-admin-prod

# SSH into machine (for debugging)
flyctl ssh console --app ryla-admin-prod
```

---

## Environment Variables

### Build-Time Variables (NEXT_PUBLIC_*)

These are required at build time and must be passed as `--build-arg`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Runtime Secrets

All non-`NEXT_PUBLIC_*` secrets are synced to Fly.io as runtime secrets:
- Database credentials
- API keys
- JWT secrets
- Other server-side secrets

---

## Infisical Integration

### Build Args Export

The deployment workflow exports build args from Infisical:

```yaml
infisical export \
  --path=/apps/admin \
  --path=/shared \
  --env=prod \
  --format=dotenv
```

### Runtime Secrets Sync

Runtime secrets are synced to Fly.io:

```yaml
infisical export \
  --path=/apps/admin \
  --path=/shared \
  --env=prod \
  --format=dotenv | while IFS='=' read -r key value; do
    if [[ ! "$key" =~ ^NEXT_PUBLIC_ ]]; then
      flyctl secrets set "$key=$value" --app ryla-admin-prod
    fi
  done
```

---

## Health Checks

The admin app has a health check endpoint at `/api/health`:

```typescript
// apps/admin/app/api/health/route.ts
GET /api/health
Response: { status: 'ok', timestamp: '...', service: 'admin' }
```

This is configured in `fly.toml`:

```toml
[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/api/health"
```

---

## Troubleshooting

### Build Fails

**Issue**: Docker build fails  
**Solution**: 
- Check build args are exported correctly
- Verify Infisical secrets exist
- Check Dockerfile paths match actual build output

### Deployment Fails

**Issue**: Fly.io deployment fails  
**Solution**:
- Check Fly.io app exists: `flyctl apps list`
- Verify Fly API token: `flyctl auth whoami`
- Check logs: `flyctl logs --app ryla-admin-prod`

### Health Check Fails

**Issue**: Health check returns 404 or 500  
**Solution**:
- Verify health endpoint exists: `curl https://admin.ryla.ai/api/health`
- Check app logs: `flyctl logs --app ryla-admin-prod`
- Verify route is accessible

### Secrets Not Loading

**Issue**: App can't access secrets  
**Solution**:
- Verify secrets synced: `flyctl secrets list --app ryla-admin-prod`
- Check Infisical token has access
- Verify secrets are in correct path (`/apps/admin`, `/shared`)

---

## Related Documentation

- **Deployment Audit**: `docs/ops/DEPLOYMENT-AUDIT-2025-01-21.md`
- **Initiative**: `docs/initiatives/IN-023-fly-io-deployment-infrastructure.md`
- **Epic**: `docs/requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md`
- **Infisical Setup**: `docs/technical/guides/INFISICAL-SETUP.md`
- **Domain Registry**: `docs/ops/DOMAIN-REGISTRY.md`

---

**Last Updated**: 2025-01-21
