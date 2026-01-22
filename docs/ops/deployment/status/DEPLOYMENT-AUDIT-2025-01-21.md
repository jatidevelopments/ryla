# Deployment Infrastructure Audit - 2025-01-21

**Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../initiatives/IN-023-fly-io-deployment-infrastructure.md)  
**Epic**: [EP-060: Fly.io Deployment Infrastructure & Infisical Integration](../requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md)  
**Phase**: P1 - Requirements & Audit  
**Status**: In Progress

---

## Executive Summary

This audit assesses the current deployment infrastructure status for all RYLA applications and identifies gaps that need to be addressed to ensure all apps are properly deployed with Infisical production environment integration.

---

## Deployment Status by App

### ✅ Landing App (`apps/landing`)

**Status**: Deployed  
**Fly.io App**: `ryla-landing-prod`  
**Domain**: `www.ryla.ai` / `ryla.ai`  
**Region**: `fra` (Frankfurt)

**Configuration:**
- ✅ `fly.toml` exists
- ✅ `Dockerfile` exists
- ✅ Health check endpoint: `/api/health`
- ✅ Deployment workflow: `deploy-auto.yml` → `deploy-landing` job

**Infisical Integration:**
- ✅ Build args exported from Infisical (`/apps/landing`, `/shared`)
- ✅ Runtime secrets synced from Infisical
- ✅ Environment detection (dev/staging/prod)
- ⚠️ **Verification Needed**: Confirm prod envs are actually in Infisical

**Build Args (from Infisical):**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CDN_URL`
- `NEXT_PUBLIC_DEBUG_CDN`

**Runtime Secrets:**
- All non-`NEXT_PUBLIC_*` secrets from `/apps/landing` and `/shared`

**Issues:**
- None identified

---

### ✅ Funnel App (`apps/funnel`)

**Status**: Deployed  
**Fly.io App**: `ryla-funnel-prod`  
**Domain**: `goviral.ryla.ai`  
**Region**: `fra` (Frankfurt)

**Configuration:**
- ✅ `fly.toml` exists
- ✅ `Dockerfile` exists
- ✅ Health check endpoint: `/api/health`
- ✅ Deployment workflow: `deploy-auto.yml` → `deploy-funnel` job
- ✅ Persistent volume: `funnel_db` (SQLite)

**Infisical Integration:**
- ✅ Build args exported from Infisical (`/apps/funnel`, `/shared`)
- ✅ Runtime secrets synced from Infisical
- ✅ Environment detection (dev/staging/prod)
- ⚠️ **Verification Needed**: Confirm prod envs are actually in Infisical

**Build Args (from Infisical):**
- `NEXT_PUBLIC_CDN_URL`
- `NEXT_PUBLIC_DEBUG_CDN`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Runtime Secrets:**
- All non-`NEXT_PUBLIC_*` secrets from `/apps/funnel` and `/shared`

**Issues:**
- None identified

---

### ✅ Web App (`apps/web`)

**Status**: Deployed  
**Fly.io App**: `ryla-web-prod`  
**Domain**: `app.ryla.ai`  
**Region**: `fra` (Frankfurt)

**Configuration:**
- ✅ `fly.toml` exists
- ✅ `Dockerfile` exists
- ✅ Health check endpoint: `/api/health`
- ✅ Deployment workflow: `deploy-auto.yml` → `deploy-web` job

**Infisical Integration:**
- ✅ Build args exported from Infisical (`/apps/web`, `/shared`)
- ✅ Runtime secrets synced from Infisical
- ✅ Environment detection (dev/staging/prod)
- ⚠️ **Verification Needed**: Confirm prod envs are actually in Infisical

**Build Args (from Infisical):**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Runtime Secrets:**
- All non-`NEXT_PUBLIC_*` secrets from `/apps/web` and `/shared`

**Issues:**
- None identified

---

### ✅ API App (`apps/api`)

**Status**: Deployed  
**Fly.io App**: `ryla-api-prod`  
**Domain**: `end.ryla.ai`  
**Region**: `fra` (Frankfurt)

**Configuration:**
- ✅ `fly.toml` exists
- ✅ `Dockerfile` exists
- ✅ Health check endpoint: `/health`
- ✅ Deployment workflow: `deploy-auto.yml` → `deploy-api` job

**Infisical Integration:**
- ✅ Runtime secrets synced from Infisical (`/apps/api`, `/shared`)
- ✅ Environment detection (dev/staging/prod)
- ⚠️ **Verification Needed**: Confirm prod envs are actually in Infisical

**Runtime Secrets:**
- All secrets from `/apps/api` and `/shared`

**Issues:**
- None identified

---

### ❌ Admin App (`apps/admin`)

**Status**: Not Deployed  
**Fly.io App**: `ryla-admin-prod` (to be created)  
**Domain**: `admin.ryla.ai` (to be configured)  
**Region**: `fra` (Frankfurt) (planned)

**Configuration:**
- ✅ `fly.toml` created (2025-01-21)
- ✅ `Dockerfile` created (2025-01-21)
- ✅ Health check endpoint: `/api/health` created (2025-01-21)
- ✅ Deployment workflow: `deploy-admin.yml` created (2025-01-21)
- ❌ Not yet deployed to Fly.io
- ❌ Domain not configured

**Infisical Integration:**
- ✅ Build args configured to export from Infisical (`/apps/admin`, `/shared`)
- ✅ Runtime secrets configured to sync from Infisical
- ✅ Environment detection configured
- ❌ **Action Required**: Add secrets to Infisical prod env

**Build Args (Required from Infisical):**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Runtime Secrets (Required from Infisical):**
- All non-`NEXT_PUBLIC_*` secrets from `/apps/admin` and `/shared`

**Issues:**
- ❌ Missing deployment configuration (now created)
- ❌ Not deployed to Fly.io
- ❌ Domain not configured
- ❌ Secrets not in Infisical prod env

---

## Infisical Integration Status

### Current State

**GitHub Actions Workflow:**
- ✅ Infisical CLI installed in workflows
- ✅ Environment detection (dev/staging/prod)
- ✅ Build args exported from Infisical
- ✅ Runtime secrets synced to Fly.io
- ✅ Machine identity token used (`INFISICAL_TOKEN` from GitHub Secrets)

**Apps Using Infisical:**
- ✅ Landing: Build args + runtime secrets
- ✅ Funnel: Build args + runtime secrets
- ✅ Web: Build args + runtime secrets
- ✅ API: Runtime secrets
- ✅ Admin: Configured (not yet deployed)

### Verification Needed

**Action Items:**
1. ⚠️ Verify all prod secrets exist in Infisical for each app
2. ⚠️ Verify machine identity has access to all required paths
3. ⚠️ Test deployment with Infisical prod envs
4. ⚠️ Verify no hardcoded secrets in code

**Commands to Verify:**
```bash
# Check secrets for each app
infisical secrets --path=/apps/landing --env=prod
infisical secrets --path=/apps/funnel --env=prod
infisical secrets --path=/apps/web --env=prod
infisical secrets --path=/apps/api --env=prod
infisical secrets --path=/apps/admin --env=prod
infisical secrets --path=/shared --env=prod
```

---

## Deployment Workflow Status

### Current Workflow: `deploy-auto.yml`

**Features:**
- ✅ Environment detection (dev/staging/prod)
- ✅ Change detection (Nx affected)
- ✅ Infisical integration
- ✅ Automated deployments
- ✅ Health checks
- ✅ Slack notifications

**Apps Covered:**
- ✅ Landing (`deploy-landing` job)
- ✅ Funnel (`deploy-funnel` job)
- ✅ Web (`deploy-web` job)
- ✅ API (`deploy-api` job)
- ❌ Admin (not in main workflow)

**Admin App:**
- ✅ Separate workflow created: `deploy-admin.yml`
- ⚠️ **Recommendation**: Consider integrating into main workflow or keep separate (admin may have different deployment cadence)

---

## Gaps and Action Items

### Critical (P0)

1. **Admin App Deployment**
   - ✅ Created `fly.toml`
   - ✅ Created `Dockerfile`
   - ✅ Created health check endpoint
   - ✅ Created deployment workflow
   - ❌ Deploy to Fly.io
   - ❌ Configure domain (`admin.ryla.ai`)
   - ❌ Add secrets to Infisical prod env

2. **Infisical Prod Env Verification**
   - ❌ Verify all apps have required secrets in Infisical prod
   - ❌ Test deployment with Infisical prod envs
   - ❌ Document any missing secrets

### High Priority (P1)

3. **Machine Identity Setup**
   - ⚠️ Verify machine identity has correct scope
   - ⚠️ Test machine identity token access
   - ⚠️ Document machine identity configuration

4. **Monitoring & Alerting**
   - ⚠️ Set up monitoring dashboards
   - ⚠️ Configure alerting for critical issues
   - ⚠️ Set up uptime tracking

### Medium Priority (P2)

5. **Documentation**
   - ⚠️ Complete deployment runbooks
   - ⚠️ Document troubleshooting procedures
   - ⚠️ Create deployment checklist

6. **Testing**
   - ⚠️ Test all deployments end-to-end
   - ⚠️ Verify health checks
   - ⚠️ Test rollback procedures

---

## Next Steps

### Immediate (This Week)

1. **Add Admin Secrets to Infisical**
   ```bash
   # Add required secrets to Infisical prod
   infisical secrets set NEXT_PUBLIC_SITE_URL=https://admin.ryla.ai --path=/apps/admin --env=prod
   infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/admin --env=prod
   # ... (add all required secrets)
   ```

2. **Deploy Admin App**
   ```bash
   # Test deployment locally first
   flyctl deploy --config apps/admin/fly.toml --dockerfile apps/admin/Dockerfile --app ryla-admin-prod
   ```

3. **Configure Domain**
   ```bash
   flyctl domains add admin.ryla.ai --app ryla-admin-prod
   ```

4. **Verify Infisical Integration**
   - Check all apps have required secrets
   - Test deployment with prod envs
   - Verify no hardcoded secrets

### Short Term (Next 2 Weeks)

5. **Set Up Monitoring**
   - Configure Fly.io monitoring
   - Set up alerting
   - Create dashboards

6. **Complete Documentation**
   - Deployment runbooks
   - Troubleshooting guides
   - Operational procedures

---

## Summary

**Overall Status**: 🟡 Partially Complete

**Completed:**
- ✅ 4/5 apps deployed (landing, funnel, web, api)
- ✅ Infisical integration configured for all apps
- ✅ Deployment workflows created
- ✅ Admin app deployment config created

**Remaining:**
- ❌ Admin app deployment
- ⚠️ Infisical prod env verification
- ⚠️ Monitoring setup
- ⚠️ Documentation completion

**Risk Level**: 🟢 Low
- Existing deployments are stable
- Admin app is internal tool (lower risk)
- Infisical integration is well-documented

---

**Last Updated**: 2025-01-21  
**Next Review**: After admin app deployment
