# [EPIC] EP-060: Fly.io Deployment Infrastructure & Infisical Integration

**Status**: Ready for Execution  
**Phase**: P3  
**Created**: 2025-01-21  
**Last Updated**: 2025-01-21

> **Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../../initiatives/IN-023-fly-io-deployment-infrastructure.md)

**Note**: EP-050 is already used for admin authentication. Using EP-060 for this ops epic.

**Progress**: Phase 1 (Audit) complete, Phase 2 (Admin Deployment Config) complete

---

## Overview

Ensure all RYLA applications are properly deployed to Fly.io with Infisical production environment integration, automated deployments, and comprehensive monitoring.

---

## P1: Requirements

### Problem Statement

Deployment infrastructure is incomplete and inconsistent:
- Admin app has no Fly.io deployment configuration
- Infisical integration not verified for all apps in production
- Deployment automation may not be using Infisical prod envs consistently
- Missing health checks and monitoring for some apps
- No standardized deployment process across all apps

### MVP Objective

**Complete deployment infrastructure for all apps:**
- All 5 apps (landing, funnel, admin, web, api) deployed to Fly.io
- All apps use Infisical prod envs for secrets
- Automated deployments via CI/CD
- Health checks and monitoring configured
- Comprehensive documentation

**Measurable**: 
- 5/5 apps deployed and working
- 100% apps using Infisical prod envs
- >95% deployment success rate
- >99.9% uptime

### Non-Goals

- Multi-region deployments (single region for MVP)
- Blue-green deployments (standard Fly.io deployments)
- Custom monitoring solutions (use Fly.io built-in monitoring)
- Database migrations (handled separately)

### Business Metric

**Target**: E-CAC (Infrastructure Cost Optimization), C-Core Value (Reliability), B-Retention (Uptime)

---

## P2: Scoping

### Feature List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Admin App Deployment | Create fly.toml and Dockerfile for admin app | P0 |
| F2 | Infisical Prod Integration | Ensure all apps use Infisical prod envs | P0 |
| F3 | Machine Identity Setup | Configure machine identities for Fly.io | P0 |
| F4 | Automated Deployments | Update CI/CD workflows for automated deployments | P0 |
| F5 | Health Checks | Configure health checks for all apps | P1 |
| F6 | Monitoring Setup | Set up monitoring and alerting | P1 |
| F7 | Documentation | Complete deployment documentation | P1 |

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| ST-XXX | Admin App Deployment | Admin app deployed to Fly.io, accessible, health checks working |
| ST-XXX | Infisical Integration | All apps use Infisical prod envs, no hardcoded secrets |
| ST-XXX | Automated Deployments | Deployments triggered automatically on merge to main |
| ST-XXX | Health Checks | All apps have health check endpoints configured |
| ST-XXX | Monitoring | Monitoring dashboards show app status |

### Acceptance Criteria

1. **AC-1: All Apps Deployed**
   - Landing app deployed and accessible
   - Funnel app deployed and accessible
   - Admin app deployed and accessible
   - Web app deployed and accessible
   - API app deployed and accessible

2. **AC-2: Infisical Integration**
   - All apps use Infisical prod envs for runtime secrets
   - All apps use Infisical prod envs for build-time variables
   - No hardcoded secrets in code or config files
   - Machine identities configured for automated deployments

3. **AC-3: Automated Deployments**
   - GitHub Actions workflows trigger deployments
   - Build args sourced from Infisical
   - Environment detection (dev/staging/prod) working
   - Deployment logs accessible

4. **AC-4: Health Checks**
   - All apps have health check endpoints
   - Health checks configured in fly.toml
   - Health checks passing in production

5. **AC-5: Monitoring**
   - Monitoring dashboards configured
   - Alerting configured for critical issues
   - Uptime tracking enabled

6. **AC-6: Documentation**
   - Deployment guide created
   - Runbooks created
   - Troubleshooting procedures documented

---

## P3: Architecture

### Deployment Architecture

```
┌─────────────────┐
│  GitHub Actions │  ← CI/CD Pipeline
│  (CI/CD)        │
└────────┬────────┘
         │
         │ 1. Export secrets from Infisical
         │ 2. Build with build args
         │ 3. Deploy to Fly.io
         ▼
┌─────────────────┐
│  Infisical      │  ← Secrets Source
│  (Prod Env)     │
└────────┬────────┘
         │
         │ Machine Identity Token
         │
         ▼
┌─────────────────┐
│  Fly.io         │  ← Deployment Target
│  (Production)   │
│                 │
│  - Landing      │
│  - Funnel       │
│  - Admin        │
│  - Web          │
│  - API          │
└─────────────────┘
```

### App Deployment Status

| App | fly.toml | Dockerfile | Domain | Status |
|-----|----------|------------|--------|--------|
| Landing | ✅ | ✅ | www.ryla.ai | ✅ Deployed |
| Funnel | ✅ | ✅ | goviral.ryla.ai | ✅ Deployed |
| Admin | ❌ | ❌ | TBD | ❌ Not Deployed |
| Web | ✅ | ✅ | app.ryla.ai | ✅ Deployed |
| API | ✅ | ✅ | end.ryla.ai | ✅ Deployed |

### Infisical Integration Pattern

**For Each App:**

1. **Build-Time Variables (NEXT_PUBLIC_*):**
   ```yaml
   - name: Export Build Args from Infisical
     env:
       INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
     run: |
       export $(infisical export \
         --path=/apps/{app-name} \
         --env=prod \
         --format=dotenv | xargs)
   
   - name: Deploy
     run: |
       flyctl deploy \
         --app ryla-{app-name}-prod \
         --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
         ...
   ```

2. **Runtime Secrets:**
   ```yaml
   - name: Sync Runtime Secrets to Fly.io
     env:
       INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
     run: |
       infisical export \
         --path=/apps/{app-name} \
         --path=/shared \
         --env=prod \
         --format=dotenv | while IFS='=' read -r key value; do
         flyctl secrets set "$key=$value" --app ryla-{app-name}-prod
       done
   ```

### Machine Identity Setup

**For Fly.io Deployments:**
```bash
# Create machine identity for GitHub Actions
infisical machine-identity create \
  --name="github-actions-fly-prod" \
  --scope="/apps/*,/shared" \
  --env=prod

# Get token and add to GitHub Secrets
infisical machine-identity get-token --name="github-actions-fly-prod"
```

---

## P4: UI Skeleton

N/A - Infrastructure epic, no UI components

---

## P5: Technical Spec

### File Plan

**Admin App Deployment:**
- `apps/admin/fly.toml` - Fly.io configuration
- `apps/admin/Dockerfile` - Docker build configuration
- `apps/admin/docs/FLY_IO_SETUP.md` - Deployment documentation

**Infisical Integration:**
- `.github/workflows/deploy-*.yml` - Update deployment workflows
- `docs/ops/DEPLOYMENT-GUIDE.md` - Comprehensive deployment guide
- `docs/ops/INFISICAL-FLY-INTEGRATION.md` - Infisical + Fly.io guide

**Monitoring:**
- `docs/ops/MONITORING-GUIDE.md` - Monitoring setup guide
- `docs/ops/RUNBOOKS.md` - Operational runbooks

### Technical Implementation

**1. Admin App Deployment:**
- Create `fly.toml` following landing/funnel pattern
- Create `Dockerfile` following Next.js standalone pattern
- Configure health check endpoint
- Set up domain (if needed)

**2. Infisical Integration:**
- Verify all apps have secrets in Infisical prod
- Create machine identities
- Update GitHub Actions workflows
- Test deployment process

**3. Automation:**
- Update CI/CD workflows
- Add environment detection
- Configure automated deployments
- Set up deployment notifications

### Environment Variables

**Required for Each App:**
- See `config/infisical-secrets-template.md` for full list
- All secrets must be in Infisical prod env
- Build-time variables (NEXT_PUBLIC_*) exported before build
- Runtime secrets synced to Fly.io

---

## P6: Implementation

### Phase 1: Audit & Assessment - ✅ Complete

**Completed:**
- ✅ Audited all 5 apps deployment status
- ✅ Created comprehensive audit document: `docs/ops/DEPLOYMENT-AUDIT-2025-01-21.md`
- ✅ Identified gaps and action items
- ✅ Documented Infisical integration status

**Findings:**
- 4/5 apps deployed (landing, funnel, web, api)
- Admin app missing deployment config (now created)
- Infisical integration configured for all apps
- Need to verify prod secrets exist in Infisical

### Phase 2: Admin App Deployment - ✅ Complete

**Completed:**
- ✅ Created `apps/admin/fly.toml`
- ✅ Created `apps/admin/Dockerfile`
- ✅ Created health check endpoint (`apps/admin/app/api/health/route.ts`)
- ✅ Created deployment workflow (`.github/workflows/deploy-admin.yml`)
- ✅ Added admin to change detection in main workflow
- ✅ Updated Infisical secrets template
- ✅ Updated domain registry
- ✅ Created deployment setup guide: `docs/ops/ADMIN-APP-DEPLOYMENT-SETUP.md`

**Remaining:**
- ❌ Deploy to Fly.io (requires secrets in Infisical first)
- ❌ Configure domain (`admin.ryla.ai`)
- ❌ Add secrets to Infisical prod env

### Phase 3: Infisical Integration - ✅ Ready

**Completed:**
- ✅ Created deployment scripts (`scripts/setup-admin-secrets.sh`, `scripts/verify-infisical-secrets.sh`)
- ✅ Created automated deployment script (`scripts/deploy-admin.sh`)
- ✅ Created verification script (`scripts/verify-all-deployments.sh`)
- ✅ Created deployment verification checklist
- ✅ Created next steps guide
- ✅ Created quick start guide
- ✅ Created action plan
- ✅ Created ready status document

**Ready for Execution:**
- ⏳ Add admin secrets to Infisical prod env (run `./scripts/setup-admin-secrets.sh`)
- ⏳ Verify all apps have required secrets (run `./scripts/verify-infisical-secrets.sh`)
- ⏳ Verify machine identity configuration
- ⏳ Test Infisical integration

### Phase 4: Automation - ✅ Complete

**Completed:**
- ✅ Updated GitHub Actions workflows
- ✅ Created automated deployment script
- ✅ Created verification scripts
- ✅ Environment detection configured
- ✅ Infisical integration in workflows

### Phase 5: Testing - ⏳ Ready

**Ready:**
- ✅ Verification scripts created
- ✅ Health check endpoints configured
- ✅ Deployment scripts ready

**Remaining:**
- ❌ Execute deployment verification
- ❌ Test all deployments
- ❌ Verify health checks
- ❌ Test rollback procedures

### Phase 6: Documentation - ✅ Complete

**Completed:**
- ✅ Deployment audit document
- ✅ Admin deployment guide
- ✅ Next steps guide
- ✅ Verification checklist
- ✅ Quick start guide
- ✅ Action plan
- ✅ Ready status document
- ✅ Execution summary
- ✅ Status dashboard
- ✅ Documentation index (README.md)
- ✅ START HERE guide

---

## P7: Testing

[To be completed in Phase 7]

---

## P8: Integration

[To be completed in Phase 8]

---

## P9: Deployment

[To be completed in Phase 9]

---

## P10: Validation

[To be completed in Phase 10]

---

## Related Work

- **Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../../initiatives/IN-023-fly-io-deployment-infrastructure.md)
- **Domain Registry**: `docs/ops/DOMAIN-REGISTRY.md`
- **Infisical Setup**: `docs/technical/INFISICAL-SETUP.md`

---

**Last Updated**: 2025-01-21
