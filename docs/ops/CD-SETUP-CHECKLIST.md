# CD Setup Checklist

## Overview

This checklist covers the setup required to enable Continuous Deployment (CD) for RYLA applications on Fly.io.

**Status**: 🟡 In Progress  
**Target Completion**: Week 1

---

## Prerequisites

- [x] Fly.io account created
- [x] Fly.io CLI installed (`flyctl`)
- [x] All apps have Dockerfiles
- [x] Fly.io configs (`fly.toml`) for landing, funnel, web, api
- [x] API Dockerfile and fly.toml created
- [ ] GitHub repository access
- [ ] Slack workspace configured

---

## Phase 1: Fly.io Setup

### 1.1 Create Fly.io Apps

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

- [ ] Landing staging app created
- [ ] Landing production app created
- [ ] Funnel staging app created
- [ ] Funnel production app created
- [ ] Web staging app created
- [ ] Web production app created
- [ ] API staging app created
- [ ] API production app created

### 1.2 Configure Domains

```bash
# Production domains
flyctl domains add www.ryla.ai --app ryla-landing
flyctl domains add ryla.ai --app ryla-landing
flyctl domains add goviral.ryla.ai --app funnel-v3-adult
flyctl domains add app.ryla.ai --app ryla-web
flyctl domains add end.ryla.ai --app ryla-api
```

- [ ] www.ryla.ai configured
- [ ] ryla.ai configured
- [ ] goviral.ryla.ai configured
- [ ] app.ryla.ai configured
- [ ] end.ryla.ai configured

### 1.3 Set Secrets

**Staging Secrets:**
```bash
# Landing staging
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://ryla-landing-staging.fly.dev \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app ryla-landing-staging

# Funnel staging
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://funnel-v3-adult-staging.fly.dev \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app funnel-v3-adult-staging

# Web staging
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://ryla-web-staging.fly.dev \
  NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY \
  --app ryla-web-staging
```

**Production Secrets:**
```bash
# Landing production
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app ryla-landing

# Funnel production
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai \
  NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --app funnel-v3-adult

# Web production
flyctl secrets set \
  NEXT_PUBLIC_SITE_URL=https://app.ryla.ai \
  NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY \
  --app ryla-web
```

- [ ] Landing staging secrets set
- [ ] Landing production secrets set
- [ ] Funnel staging secrets set
- [ ] Funnel production secrets set
- [ ] Web staging secrets set
- [ ] Web production secrets set
- [ ] API staging secrets set
- [ ] API production secrets set

---

## Phase 2: GitHub Setup

### 2.1 Create GitHub Secrets

Required secrets in GitHub repository settings:

- `FLY_API_TOKEN` - Fly.io API token
- `SLACK_WEBHOOK_DEPLOYS` - Deployment notifications
- `SLACK_WEBHOOK_ALERTS` - Failure alerts
- `SLACK_WEBHOOK_AUDIT` - Audit log

**Get Fly.io API Token:**
```bash
flyctl auth token
```

- [ ] FLY_API_TOKEN added to GitHub secrets
- [ ] SLACK_WEBHOOK_DEPLOYS added
- [ ] SLACK_WEBHOOK_ALERTS added
- [ ] SLACK_WEBHOOK_AUDIT added

### 2.2 Verify Workflows

- [ ] `.github/workflows/deploy-staging.yml` exists
- [ ] `.github/workflows/deploy-production.yml` exists
- [ ] Workflows use correct app names
- [ ] Matrix strategy configured correctly

---

## Phase 3: Health Checks

### 3.1 Add Health Check Endpoints

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

- [ ] Landing health endpoint added
- [ ] Funnel health endpoint added
- [ ] Web health endpoint added
- [ ] API health endpoint added

### 3.2 Configure Fly.io Health Checks

Update `fly.toml` files:
```toml
[http_service]
  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"
```

- [ ] Landing fly.toml updated
- [ ] Funnel fly.toml updated
- [ ] Web fly.toml updated
- [ ] API fly.toml updated

---

## Phase 4: Testing

### 4.1 Manual Deployment Test

```bash
# Test staging deployment
flyctl deploy \
  --config apps/landing/fly.toml \
  --dockerfile apps/landing/Dockerfile \
  --app ryla-landing-staging
```

- [ ] Landing staging manual deploy successful
- [ ] Funnel staging manual deploy successful
- [ ] Web staging manual deploy successful
- [ ] API staging manual deploy successful
- [ ] Health checks working

### 4.2 GitHub Actions Test

- [ ] Push to `main` triggers staging deploy
- [ ] Staging deploy completes successfully
- [ ] Slack notifications received
- [ ] Production deploy (manual) works
- [ ] Production deploy (release tag) works

---

## Phase 5: Monitoring

### 5.1 Setup Monitoring

- [ ] Fly.io dashboard access configured
- [ ] Slack notifications working
- [ ] GitHub Actions status badges added
- [ ] Deployment logs accessible

### 5.2 Documentation

- [ ] ADR-004 created and reviewed
- [ ] CD Strategy document created
- [ ] Rollback process documented
- [ ] Troubleshooting guide created

---

## Phase 6: API Setup ✅

API deployment setup completed:

- [x] Create `apps/api/Dockerfile`
- [x] Create `apps/api/fly.toml`
- [x] Add API to GitHub Actions workflows
- [ ] Configure API secrets
- [ ] Test API deployment
- [x] Update documentation

---

## Verification

### Quick Test

1. **Make a small change** to any app
2. **Push to `main`** branch
3. **Verify** staging deployment triggers
4. **Check** Slack for notification
5. **Verify** app is accessible
6. **Test** health endpoint

### Production Test

1. **Create release tag**: `git tag v1.0.0 && git push --tags`
2. **Verify** production deployment triggers
3. **Check** all apps deployed
4. **Verify** domains resolve correctly
5. **Test** critical user flows

---

## Troubleshooting

### Deployment Fails

1. Check Fly.io logs: `flyctl logs --app $APP_NAME`
2. Verify secrets: `flyctl secrets list --app $APP_NAME`
3. Check GitHub Actions logs
4. Verify Dockerfile builds locally

### Health Check Fails

1. Verify health endpoint exists: `curl https://$APP.fly.dev/health`
2. Check fly.toml health check config
3. Verify app starts correctly
4. Check app logs for errors

### Secrets Missing

1. List secrets: `flyctl secrets list --app $APP_NAME`
2. Set missing secrets: `flyctl secrets set KEY=value --app $APP_NAME`
3. Verify in GitHub Actions (if using build args)

---

## Next Steps

After completing this checklist:

1. ✅ Monitor first few deployments
2. ✅ Optimize deployment time
3. ✅ Add smoke tests
4. ✅ Document common issues
5. ✅ Set up cost monitoring

---

## References

- [ADR-004: Fly.io Deployment Platform](../decisions/ADR-004-fly-io-deployment-platform.md)
- [Fly.io CD Strategy](./FLY-IO-CD-STRATEGY.md)
- [AWS vs Fly.io Comparison](./AWS-VS-FLY-COMPARISON.md)
- [Fly.io Documentation](https://fly.io/docs/)

