# Fly.io Continuous Deployment Strategy

## Overview

This document outlines the CD (Continuous Deployment) strategy for RYLA applications on Fly.io.

**Goal**: Automated, reliable deployments with zero-downtime and auto-rollback.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Feature    │  │    Main      │  │   Release    │      │
│  │   Branch     │  │   Branch    │  │    Tag       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Actions                              │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │  Deploy        │  │  Deploy         │                   │
│  │  Staging       │  │  Production     │                   │
│  │  (auto)        │  │  (manual/tag)   │                   │
│  └────────┬───────┘  └────────┬───────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Fly.io                                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing  │  │  Funnel  │  │   Web    │  │   API    │     │
│  │ (staging)│  │ (staging)│  │ (staging)│  │ (staging)│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing  │  │  Funnel  │  │   Web    │  │   API    │     │
│  │  (prod)  │  │  (prod)  │  │  (prod)  │  │  (prod)  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Environments

### Staging

- **Trigger**: Auto on push to `main` branch
- **Apps**: All 4 apps (landing, funnel, web, api)
- **Domain**: `*.staging.fly.dev` (Fly.io default)
- **Purpose**: Pre-production validation
- **Rollback**: Auto on health check failure

### Production

- **Trigger**: Manual via `workflow_dispatch` or release tag
- **Apps**: All 4 apps
- **Domains**: `ryla.ai`, `goviral.ryla.ai`, `app.ryla.ai`, `end.ryla.ai`
- **Purpose**: Live user-facing environment
- **Rollback**: Manual or auto on health check failure

---

## GitHub Actions Workflows

### 1. Deploy Staging (Auto)

**File**: `.github/workflows/deploy-staging.yml`

**Trigger**: Push to `main` branch

**Steps**:
1. Checkout code
2. Setup Node.js & pnpm
3. Install dependencies
4. Build all apps (Nx affected)
5. Deploy to Fly.io (matrix strategy)
6. Health check
7. Notify Slack

**Matrix Strategy**:
```yaml
strategy:
  matrix:
    app: [landing, funnel, web, api]
```

### 2. Deploy Production (Manual/Tag)

**File**: `.github/workflows/deploy-production.yml`

**Trigger**: 
- `workflow_dispatch` (manual)
- Release tag (e.g., `v1.0.0`)

**Steps**:
1. Checkout code
2. Setup Node.js & pnpm
3. Install dependencies
4. Build all apps
5. Deploy to Fly.io (matrix strategy)
6. Health check
7. Notify Slack (success/failure)
8. Audit log

---

## Deployment Process

### Pre-Deployment

1. **Code Review** - PR merged to `main`
2. **Tests Pass** - CI pipeline successful
3. **Build** - All apps build successfully
4. **Secrets Check** - Required secrets present

### Deployment Steps

1. **Build Docker Image**
   ```bash
   docker build -f apps/$APP/Dockerfile -t $IMAGE_TAG .
   ```

2. **Deploy to Fly.io**
   ```bash
   flyctl deploy --config apps/$APP/fly.toml --dockerfile apps/$APP/Dockerfile
   ```

3. **Health Check**
   ```bash
   flyctl status --app $APP_NAME
   curl https://$APP_NAME.fly.dev/health
   ```

4. **Verify**
   - Check Fly.io dashboard
   - Verify domain resolution
   - Test critical endpoints

### Post-Deployment

1. **Health Check** - Verify app is healthy
2. **Smoke Tests** - Test critical user flows
3. **Monitor** - Watch for errors in first 5 minutes
4. **Notify** - Slack notification with status

---

## Rollback Strategy

### Automatic Rollback

Fly.io automatically rolls back if:
- Health check fails after deployment
- App crashes on startup
- Build fails

### Manual Rollback

```bash
# List releases
flyctl releases --app $APP_NAME

# Rollback to previous release
flyctl releases rollback --app $APP_NAME
```

### Emergency Rollback

1. Identify last known good release
2. Run rollback command
3. Verify app is working
4. Investigate issue
5. Fix and redeploy

---

## Health Checks

### Health Check Endpoints

Each app must implement a health check endpoint:

**Landing/Web/Funnel** (Next.js):
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: Date.now() });
}
```

**API** (NestJS):
```typescript
// health.controller.ts
@Get('health')
health() {
  return { status: 'ok', timestamp: Date.now() };
}
```

### Fly.io Health Check Config

```toml
[http_service]
  internal_port = 3000
  force_https = true
  
  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"
```

---

## Secrets Management

### Fly.io Secrets

Set secrets per app:
```bash
flyctl secrets set \
  NEXT_PUBLIC_SUPABASE_URL=$VALUE \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=$VALUE \
  --app $APP_NAME
```

### GitHub Secrets

Required for CD:
- `FLY_API_TOKEN` - Fly.io API token
- `SLACK_WEBHOOK_DEPLOYS` - Deployment notifications
- `SLACK_WEBHOOK_ALERTS` - Failure alerts
- `SLACK_WEBHOOK_AUDIT` - Audit log

### Environment-Specific Secrets

- **Staging**: Use `-a $APP_NAME-staging`
- **Production**: Use `-a $APP_NAME`

---

## Monitoring & Alerts

### Fly.io Metrics

- **CPU Usage** - Monitor via Fly.io dashboard
- **Memory Usage** - Watch for memory leaks
- **Request Rate** - Track traffic patterns
- **Error Rate** - Alert on spikes

### GitHub Actions Status

- **Deployment Status** - Success/failure in Actions tab
- **Deployment Time** - Track deployment duration
- **Build Time** - Monitor build performance

### Slack Notifications

**Deployment Success**:
```
DEPLOY: staging $SHA success
Apps: landing, funnel, web, api
Duration: 5m 23s
```

**Deployment Failure**:
```
ALERT: staging deploy failed - $SHA
App: landing
Error: Health check failed
```

**Audit Log**:
```
AUDIT: production deploy by @user
Status: success
Apps: landing, funnel, web, api
```

---

## Best Practices

### 1. Small, Frequent Deployments

- Deploy often (multiple times per day)
- Small changes reduce risk
- Faster feedback loop

### 2. Test Before Deploy

- Run tests in CI before deployment
- Smoke tests post-deployment
- Monitor for 5 minutes after deploy

### 3. Feature Flags

- Use feature flags for risky changes
- Gradual rollout
- Easy rollback via flag

### 4. Database Migrations

- Run migrations before app deployment
- Backward-compatible migrations
- Test migrations in staging first

### 5. Blue-Green Deployments

Fly.io handles this automatically:
- New version deploys alongside old
- Health checks verify new version
- Traffic switches to new version
- Old version stops if new is healthy

---

## Troubleshooting

### Deployment Fails

1. **Check Build Logs**
   ```bash
   flyctl logs --app $APP_NAME
   ```

2. **Check Health Checks**
   ```bash
   flyctl status --app $APP_NAME
   ```

3. **Verify Secrets**
   ```bash
   flyctl secrets list --app $APP_NAME
   ```

4. **Check Resources**
   ```bash
   flyctl status --app $APP_NAME
   ```

### App Crashes After Deploy

1. **Check Logs**
   ```bash
   flyctl logs --app $APP_NAME
   ```

2. **Rollback**
   ```bash
   flyctl releases rollback --app $APP_NAME
   ```

3. **Investigate**
   - Check recent code changes
   - Verify environment variables
   - Check dependencies

### Slow Deployments

1. **Optimize Dockerfile**
   - Multi-stage builds
   - Layer caching
   - Smaller base images

2. **Check Build Time**
   - Monitor CI build duration
   - Optimize Nx build
   - Cache dependencies

---

## Implementation Checklist

### Phase 1: Setup (Week 1)

- [ ] Create Fly.io API token
- [ ] Add GitHub secrets (FLY_API_TOKEN, Slack webhooks)
- [ ] Update `deploy-staging.yml` workflow
- [ ] Update `deploy-production.yml` workflow
- [ ] Add health check endpoints to all apps
- [ ] Configure Fly.io health checks in `fly.toml`
- [ ] Test staging deployment
- [ ] Test production deployment (manual)

### Phase 2: Monitoring (Week 2)

- [ ] Setup Slack notifications
- [ ] Configure Fly.io metrics dashboard
- [ ] Add deployment status badges
- [ ] Document rollback process
- [ ] Create runbook for common issues

### Phase 3: Optimization (Ongoing)

- [ ] Optimize Docker images
- [ ] Reduce deployment time
- [ ] Improve health checks
- [ ] Add smoke tests
- [ ] Monitor costs

---

## Cost Optimization

### Auto-Stop Machines

For low-traffic apps (landing):
```toml
[http_service]
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
```

### VM Sizing

Start small, scale up:
- Landing: `512mb` (auto-stop)
- Funnel: `shared-cpu-2x` (always-on)
- Web: `1gb` (auto-stop)
- API: `1gb` (always-on)

### Monitoring Costs

- Review Fly.io dashboard monthly
- Adjust VM sizes based on usage
- Optimize auto-stop settings

---

## References

- [ADR-004: Fly.io Deployment Platform](../decisions/ADR-004-fly-io-deployment-platform.md)
- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io GitHub Actions](https://github.com/superfly/flyctl-actions)
- [Fly.io Health Checks](https://fly.io/docs/reference/configuration/#http_servicechecks)

