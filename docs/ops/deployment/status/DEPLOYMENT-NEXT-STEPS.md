# Deployment Next Steps Checklist

**Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../initiatives/IN-023-fly-io-deployment-infrastructure.md)  
**Epic**: [EP-060: Fly.io Deployment Infrastructure & Infisical Integration](../../requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md)  
**Status**: Phase 2 Complete → Phase 3 In Progress  
**Last Updated**: 2025-01-21

---

## Overview

This checklist covers the remaining steps to complete the deployment infrastructure initiative. All configuration files are created and ready. The remaining work involves:

1. Adding secrets to Infisical
2. Deploying the admin app
3. Verifying Infisical integration
4. Testing deployments

---

## Phase 3: Infisical Integration Verification

### Step 1: Add Admin Secrets to Infisical

**Required Secrets for Admin App:**

```bash
# Base Configuration
infisical secrets set NEXT_PUBLIC_SITE_URL=https://admin.ryla.ai --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai --path=/apps/admin --env=prod

# PostHog Analytics
infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key> --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/apps/admin --env=prod

# Supabase (if not already in /shared)
infisical secrets set NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url> --path=/apps/admin --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key> --path=/apps/admin --env=prod

# Server-side secrets (if any)
# Add any other non-NEXT_PUBLIC_* secrets your admin app needs
```

**Verification:**
```bash
# List all admin secrets
infisical secrets --path=/apps/admin --env=prod

# Verify specific secrets exist
infisical secrets get NEXT_PUBLIC_SITE_URL --path=/apps/admin --env=prod
infisical secrets get NEXT_PUBLIC_API_URL --path=/apps/admin --env=prod
```

### Step 2: Verify All Apps Have Required Secrets

**Check each app's secrets:**

```bash
# Landing
infisical secrets --path=/apps/landing --env=prod

# Funnel
infisical secrets --path=/apps/funnel --env=prod

# Web
infisical secrets --path=/apps/web --env=prod

# API
infisical secrets --path=/apps/api --env=prod

# Admin
infisical secrets --path=/apps/admin --env=prod

# Shared
infisical secrets --path=/shared --env=prod
```

**Compare against:** `config/infisical-secrets-template.md`

### Step 3: Verify Machine Identity Configuration

**Check machine identity exists:**
```bash
# List machine identities
infisical machine-identity list

# Verify token (if exists)
infisical machine-identity get-token --name="github-actions-fly-prod"
```

**If machine identity doesn't exist, create it:**
```bash
# Create machine identity for GitHub Actions
infisical machine-identity create \
  --name="github-actions-fly-prod" \
  --scope="/apps/*,/shared" \
  --env=prod

# Get token
TOKEN=$(infisical machine-identity get-token --name="github-actions-fly-prod")
echo "Add this token to GitHub Secrets as INFISICAL_TOKEN: $TOKEN"
```

**Add to GitHub Secrets:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add/update `INFISICAL_TOKEN` with the machine identity token

---

## Phase 4: Admin App Deployment

### Step 1: Create Fly.io App

```bash
# Create the Fly.io app
flyctl apps create ryla-admin-prod --org personal

# Or if using a different org
flyctl apps create ryla-admin-prod --org your-org-name
```

### Step 2: Configure Domain

```bash
# Add domain to Fly.io app
flyctl domains add admin.ryla.ai --app ryla-admin-prod

# This will provide DNS records to add to your domain registrar
# Example output:
# Add the following DNS records:
#   Type: A
#   Name: admin.ryla.ai
#   Value: <ip-address>
```

**Add DNS records to your domain registrar:**
- Follow the instructions from Fly.io
- Wait for DNS propagation (can take up to 48 hours, usually < 1 hour)

### Step 3: Test Deployment Locally (Optional)

```bash
# Build Docker image locally to test
docker build \
  -f apps/admin/Dockerfile \
  --build-arg NEXT_PUBLIC_SITE_URL=https://admin.ryla.ai \
  --build-arg NEXT_PUBLIC_API_URL=https://end.ryla.ai \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY=<your-key> \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=<your-url> \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key> \
  -t ryla-admin:test .

# Run container
docker run -p 3000:3000 ryla-admin:test

# Test health endpoint
curl http://localhost:3000/api/health
```

### Step 4: Deploy to Fly.io

**Option A: Manual Deployment (First Time)**

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

**Option B: Automated Deployment (After Setup)**

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

**Expected Health Check Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-21T...",
  "service": "admin"
}
```

---

## Phase 5: Verification & Testing

### Step 1: Verify All Apps Are Deployed

```bash
# List all Fly.io apps
flyctl apps list

# Expected apps:
# - ryla-landing-prod
# - ryla-funnel-prod
# - ryla-web-prod
# - ryla-api-prod
# - ryla-admin-prod (new)
```

### Step 2: Test Health Checks

```bash
# Landing
curl https://www.ryla.ai/api/health

# Funnel
curl https://goviral.ryla.ai/api/health

# Web
curl https://app.ryla.ai/api/health

# API
curl https://end.ryla.ai/health

# Admin
curl https://admin.ryla.ai/api/health
```

### Step 3: Verify Infisical Integration

**Test deployment with Infisical secrets:**

1. Make a small change to any app
2. Push to `main` branch
3. Verify GitHub Actions workflow:
   - Exports secrets from Infisical
   - Uses correct environment (prod)
   - Deploys successfully
   - Health checks pass

**Check deployment logs:**
```bash
# View recent deployments
flyctl releases --app ryla-admin-prod

# View deployment logs
flyctl logs --app ryla-admin-prod
```

### Step 4: Verify No Hardcoded Secrets

**Search codebase for hardcoded secrets:**
```bash
# Search for common secret patterns
grep -r "password.*=" apps/ --exclude-dir=node_modules
grep -r "api.*key.*=" apps/ --exclude-dir=node_modules
grep -r "secret.*=" apps/ --exclude-dir=node_modules

# Should only find examples, not actual secrets
```

---

## Phase 6: Documentation & Monitoring

### Step 1: Complete Documentation

- [x] Deployment audit document
- [x] Admin app deployment guide
- [ ] Update main deployment guide (if exists)
- [ ] Create troubleshooting runbook
- [ ] Document rollback procedures

### Step 2: Set Up Monitoring

**Fly.io Built-in Monitoring:**
```bash
# View metrics
flyctl metrics --app ryla-admin-prod

# Set up alerts (via Fly.io dashboard)
# - CPU usage > 80%
# - Memory usage > 90%
# - Health check failures
```

**External Monitoring (Optional):**
- Set up UptimeRobot or similar
- Monitor all app health endpoints
- Set up alerts for downtime

### Step 3: Create Runbooks

Create operational runbooks for:
- Deployment procedures
- Rollback procedures
- Troubleshooting common issues
- Emergency procedures

---

## Quick Reference Commands

### Infisical

```bash
# List secrets
infisical secrets --path=/apps/admin --env=prod

# Set secret
infisical secrets set KEY=value --path=/apps/admin --env=prod

# Export secrets
infisical export --path=/apps/admin --env=prod --format=dotenv

# Machine identity
infisical machine-identity list
infisical machine-identity get-token --name="github-actions-fly-prod"
```

### Fly.io

```bash
# App management
flyctl apps list
flyctl apps create ryla-admin-prod
flyctl status --app ryla-admin-prod

# Deployment
flyctl deploy --config apps/admin/fly.toml --dockerfile apps/admin/Dockerfile --app ryla-admin-prod

# Secrets
flyctl secrets list --app ryla-admin-prod
flyctl secrets set KEY=value --app ryla-admin-prod

# Logs & Debugging
flyctl logs --app ryla-admin-prod
flyctl ssh console --app ryla-admin-prod
flyctl releases --app ryla-admin-prod
```

---

## Success Criteria

**Phase 3 Complete When:**
- [x] All apps have secrets in Infisical prod
- [ ] Machine identity configured
- [ ] GitHub Secrets updated
- [ ] Infisical integration verified

**Phase 4 Complete When:**
- [ ] Admin app deployed to Fly.io
- [ ] Domain configured (`admin.ryla.ai`)
- [ ] Health checks passing
- [ ] App accessible

**Phase 5 Complete When:**
- [ ] All 5 apps deployed and accessible
- [ ] All health checks passing
- [ ] Infisical integration verified
- [ ] No hardcoded secrets found

**Phase 6 Complete When:**
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Runbooks created
- [ ] Team trained

---

## Troubleshooting

### Secrets Not Loading

**Issue**: App can't access secrets from Infisical  
**Solution**:
1. Verify secrets exist: `infisical secrets --path=/apps/admin --env=prod`
2. Check machine identity has access
3. Verify GitHub Secrets has `INFISICAL_TOKEN`
4. Check deployment logs for errors

### Deployment Fails

**Issue**: Fly.io deployment fails  
**Solution**:
1. Check Fly.io app exists: `flyctl apps list`
2. Verify Fly API token: `flyctl auth whoami`
3. Check build logs: `flyctl logs --app ryla-admin-prod`
4. Verify Dockerfile paths are correct

### Health Check Fails

**Issue**: Health check returns 404 or 500  
**Solution**:
1. Verify route exists: `curl https://admin.ryla.ai/api/health`
2. Check app logs: `flyctl logs --app ryla-admin-prod`
3. Verify route is accessible (not behind auth)
4. Check Next.js routing configuration

---

## Related Documentation

- **Deployment Audit**: `docs/ops/DEPLOYMENT-AUDIT-2025-01-21.md`
- **Admin Deployment Guide**: `docs/ops/ADMIN-APP-DEPLOYMENT-SETUP.md`
- **Initiative**: `docs/initiatives/IN-023-fly-io-deployment-infrastructure.md`
- **Epic**: `docs/requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md`
- **Infisical Setup**: `docs/technical/guides/INFISICAL-SETUP.md`
- **Domain Registry**: `docs/ops/DOMAIN-REGISTRY.md`

---

**Last Updated**: 2025-01-21  
**Next Review**: After admin app deployment