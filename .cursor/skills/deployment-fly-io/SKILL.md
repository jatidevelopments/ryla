---
name: deployment-fly-io
description: Deploys applications to Fly.io following RYLA deployment patterns. Use when deploying apps, setting up Fly.io infrastructure, configuring deployment workflows, or when the user mentions Fly.io deployment.
---

# Fly.io Deployment

Deploys applications to Fly.io following RYLA deployment patterns and policies.

## Quick Start

When deploying to Fly.io:

1. **Use GitHub Actions** - Never deploy manually via CLI
2. **Check Secrets** - Ensure Infisical secrets are exported
3. **Run Workflow** - Use auto-deploy or manual workflow
4. **Verify Health** - Check health endpoints after deployment
5. **Monitor Logs** - Watch for errors

## Deployment Policy

### ✅ Approved Methods

**1. Automated Deployments (Preferred)**
- Workflow: `.github/workflows/deploy-auto.yml`
- Triggers: Push to `main` or `staging`
- Auto-detects affected apps using Nx

**2. Manual Workflows (Emergency Only)**
- Workflow: `.github/workflows/deploy-[app].yml`
- Manual dispatch only
- For standalone deployments

### ❌ Forbidden Methods

**Manual CLI Deployments**
```bash
# ❌ FORBIDDEN: Never deploy manually
flyctl deploy --config apps/admin/fly.toml
```

**Why:**
- No audit trail
- No consistency checks
- No automated secret management
- No health checks

## Deployment Workflow

### Auto Deploy (Nx Affected)

**Workflow**: `.github/workflows/deploy-auto.yml`

**How it works:**
1. Detects which apps changed using Nx affected
2. Deploys only affected apps
3. Exports Infisical secrets
4. Builds Docker images
5. Deploys to Fly.io
6. Runs health checks
7. Notifies Slack

**Usage:**
```bash
# Automatic: Push to main/staging
git push origin main

# Manual: GitHub Actions → "Auto Deploy (Nx Affected)" → Run workflow
```

### Manual Workflow

**When to use:**
- Emergency deployments
- Testing deployment process
- Standalone app deployments

**Usage:**
```bash
# GitHub Actions → "Deploy [App] (Manual)" → Run workflow
```

## Pre-Deployment Checklist

### 1. Code Review
- [ ] PR merged to `main`
- [ ] All tests passing
- [ ] No breaking changes

### 2. Secrets Configuration
- [ ] Infisical secrets configured
- [ ] Environment variables set
- [ ] Database connections verified

### 3. Build Verification
- [ ] Apps build successfully locally
- [ ] Docker images build correctly
- [ ] No TypeScript errors

### 4. Health Checks
- [ ] Health endpoints configured
- [ ] Health checks pass locally
- [ ] Database connections work

## Deployment Steps

### 1. Export Infisical Secrets

```yaml
- name: Export Infisical secrets
  run: |
    infisical export --path=/apps/${{ matrix.app }} --path=/shared --env=${{ env.ENVIRONMENT }} > .env
```

### 2. Build Docker Image

```yaml
- name: Build Docker image
  run: |
    docker build -f apps/${{ matrix.app }}/Dockerfile -t ${{ matrix.app }}:latest .
```

### 3. Deploy to Fly.io

```yaml
- name: Deploy to Fly.io
  run: |
    flyctl deploy \
      --config apps/${{ matrix.app }}/fly.toml \
      --app ${{ matrix.app }}-${{ env.ENVIRONMENT }} \
      --remote-only
```

### 4. Health Check

```yaml
- name: Health check
  run: |
    curl -f https://${{ matrix.app }}.${{ env.DOMAIN }}/api/health || exit 1
```

## Fly.io Configuration

### fly.toml Structure

```toml
# apps/web/fly.toml
app = "ryla-web-prod"
primary_region = "fra"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/api/health"
```

### Dockerfile Pattern

```dockerfile
# Multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm nx build web

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist/apps/web ./
EXPOSE 3000
CMD ["node", "server.js"]
```

## Environment Variables

### Setting Secrets

```bash
# Via Infisical (preferred)
infisical export --path=/apps/web --env=prod > .env
flyctl secrets import --app ryla-web-prod < .env

# Via Fly CLI (emergency only)
flyctl secrets set KEY=value --app ryla-web-prod
```

### Required Secrets

**All Apps:**
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT signing key

**Web App:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`

**API App:**
- `FINBY_API_KEY`
- `REPLICATE_API_TOKEN`
- `CLOUDFLARE_R2_*` - R2 storage credentials

## Health Checks

### Health Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database
  const dbHealthy = await checkDatabase();
  
  // Check Redis
  const redisHealthy = await checkRedis();
  
  if (!dbHealthy || !redisHealthy) {
    return Response.json(
      { status: 'unhealthy', checks: { db: dbHealthy, redis: redisHealthy } },
      { status: 503 }
    );
  }
  
  return Response.json({ status: 'healthy' });
}
```

### Health Check Configuration

```toml
[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/api/health"
```

## Rollback

### Automatic Rollback

Fly.io automatically rolls back if health checks fail after deployment.

### Manual Rollback

```bash
# List releases
flyctl releases --app ryla-web-prod

# Deploy specific release
flyctl releases deploy <release-id> --app ryla-web-prod
```

## Monitoring

### View Logs

```bash
# Real-time logs
flyctl logs --app ryla-web-prod

# Follow logs
flyctl logs --app ryla-web-prod -f
```

### Check Status

```bash
# App status
flyctl status --app ryla-web-prod

# Machine status
flyctl machines list --app ryla-web-prod
```

## Best Practices

### 1. Always Use GitHub Actions

```yaml
# ✅ Good: Automated deployment
- name: Deploy
  uses: ./.github/workflows/deploy-auto.yml

# ❌ Bad: Manual deployment
flyctl deploy --config apps/web/fly.toml
```

### 2. Export Secrets from Infisical

```bash
# ✅ Good: Use Infisical
infisical export --path=/apps/web --env=prod > .env

# ❌ Bad: Hardcode secrets
flyctl secrets set KEY=hardcoded-value
```

### 3. Health Checks Required

```toml
# ✅ Good: Health check configured
[[http_service.checks]]
  path = "/api/health"

# ❌ Bad: No health checks
```

### 4. Multi-Stage Docker Builds

```dockerfile
# ✅ Good: Multi-stage build
FROM node:20-alpine AS builder
# ... build steps
FROM node:20-alpine AS runner
# ... runtime

# ❌ Bad: Single stage
FROM node:20-alpine
# ... everything
```

### 5. Monitor After Deployment

```bash
# ✅ Good: Check logs after deploy
flyctl logs --app ryla-web-prod -f

# ❌ Bad: Deploy and forget
```

## Related Resources

- **Deployment Guide**: `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`
- **Deployment Policy**: `docs/ops/DEPLOYMENT-WORKFLOW-POLICY.md`
- **Auto Deploy Workflow**: `.github/workflows/deploy-auto.yml`
- **Infisical Setup**: See `infisical-setup` skill
