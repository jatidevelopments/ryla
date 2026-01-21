# Deployment Workflow Policy

**Policy**: All deployments MUST run via GitHub Actions workflows. Manual deployments via CLI are not allowed in production.

---

## ✅ Approved Deployment Methods

### 1. Automated Deployments (Preferred)

**Workflow**: `.github/workflows/deploy-auto.yml`  
**Name**: "Auto Deploy (Nx Affected)"

**How it works:**
- Automatically detects which apps changed using Nx affected
- Deploys only affected apps
- Triggers on push to `main` or `staging` branches
- Supports manual dispatch with environment selection

**Apps included:**
- ✅ Web (`apps/web`)
- ✅ API (`apps/api`)
- ✅ Funnel (`apps/funnel`)
- ✅ Landing (`apps/landing`)
- ✅ Admin (`apps/admin`)

**Usage:**
```bash
# Automatic: Push to main/staging
git push origin main

# Manual: GitHub Actions → "Auto Deploy (Nx Affected)" → Run workflow
```

### 2. Manual/Standalone Deployments (Emergency Only)

**Workflow**: `.github/workflows/deploy-admin.yml`  
**Name**: "Deploy Admin App (Manual/Standalone)"

**When to use:**
- Emergency deployments
- Testing deployment process
- Standalone admin deployments without affecting other apps

**Usage:**
```bash
# GitHub Actions → "Deploy Admin App (Manual/Standalone)" → Run workflow
```

---

## ❌ Forbidden Deployment Methods

### Manual CLI Deployments

**DO NOT:**
```bash
# ❌ FORBIDDEN: Manual deployment via CLI
flyctl deploy --config apps/admin/fly.toml --app ryla-admin-prod
```

**Why:**
- No audit trail
- No consistency checks
- No automated secret management
- No health checks
- No notifications
- Risk of configuration drift

---

## 🔄 Deployment Flow

```
┌─────────────────┐
│  Code Change    │
│  (Push to main) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Actions │
│  Auto Deploy    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nx Affected    │
│  Detection      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy Affected│
│  Apps Only      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Health Checks  │
│  & Notifications│
└─────────────────┘
```

---

## 📋 Deployment Checklist

### Before Deployment

- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Secrets updated in Infisical (if needed)
- [ ] Environment variables documented

### During Deployment

- [ ] GitHub Actions workflow triggered
- [ ] Build succeeds
- [ ] Secrets synced from Infisical
- [ ] Deployment completes

### After Deployment

- [ ] Health check passes
- [ ] App accessible
- [ ] Functionality verified
- [ ] Monitoring shows healthy status

---

## 🚨 Emergency Deployments

If you need to deploy urgently:

1. **Use GitHub Actions workflow** (still required)
   - Go to Actions → Select workflow → Run workflow
   - Choose environment (production/staging)
   - Monitor deployment

2. **Do NOT use CLI directly**
   - Even in emergencies, use workflows
   - Ensures consistency and audit trail

---

## 📊 Workflow Comparison

| Feature | Auto Deploy | Manual/Standalone |
|---------|------------|-------------------|
| Automatic trigger | ✅ Yes | ❌ No |
| Nx affected detection | ✅ Yes | ❌ No |
| Multi-app support | ✅ Yes | ❌ No (admin only) |
| Manual dispatch | ✅ Yes | ✅ Yes |
| Secret management | ✅ Automated | ✅ Automated |
| Health checks | ✅ Yes | ✅ Yes |
| Notifications | ✅ Yes | ✅ Yes |
| Audit trail | ✅ Yes | ✅ Yes |

---

## 🔧 Configuration

### Required GitHub Secrets

- `INFISICAL_TOKEN` - For accessing Infisical secrets
- `FLY_API_TOKEN` - For Fly.io deployments
- `SLACK_WEBHOOK_DEPLOYS` - For deployment notifications (optional)

### Environment Mapping

| GitHub Environment | Infisical Environment | Fly.io Suffix |
|-------------------|----------------------|---------------|
| `production` | `prod` | `prod` |
| `staging` | `staging` | `staging` |
| `development` | `dev` | `dev` |

---

## 📚 Related Documentation

- [Deployment Action Plan](./DEPLOYMENT-ACTION-PLAN.md)
- [Admin Deployment Setup](./ADMIN-APP-DEPLOYMENT-SETUP.md)
- [Deployment Verification](./DEPLOYMENT-VERIFICATION-CHECKLIST.md)

---

**Last Updated**: 2025-01-21
