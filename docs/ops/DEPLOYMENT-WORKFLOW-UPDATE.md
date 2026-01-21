# Deployment Workflow Update - Admin App Integration

**Date**: 2025-01-21  
**Status**: ✅ Complete

---

## ✅ Changes Made

### 1. Added Admin to Main Auto-Deploy Workflow

**File**: `.github/workflows/deploy-auto.yml`

**Changes:**
- ✅ Added `deploy-admin` job to main workflow
- ✅ Updated `has-changes` check to include `admin`
- ✅ Admin now deploys automatically when affected by changes
- ✅ Follows same pattern as other apps (web, api, funnel, landing)

**Admin Deployment Job Includes:**
- Environment detection
- Infisical secret export
- Build args from Infisical
- Runtime secrets sync to Fly.io
- Automated deployment
- Health checks
- Slack notifications

### 2. Updated Standalone Admin Workflow

**File**: `.github/workflows/deploy-admin.yml`

**Changes:**
- ✅ Removed automatic push triggers
- ✅ Changed to manual dispatch only
- ✅ Added note that it's for emergency/standalone use
- ✅ Main workflow is preferred for regular deployments

### 3. Created Deployment Policy Document

**File**: `docs/ops/DEPLOYMENT-WORKFLOW-POLICY.md`

**Content:**
- ✅ Policy: All deployments via GitHub Actions
- ✅ Approved deployment methods
- ✅ Forbidden deployment methods
- ✅ Deployment flow diagram
- ✅ Emergency deployment procedures
- ✅ Workflow comparison table

### 4. Updated Documentation

**Files Updated:**
- ✅ `docs/ops/ADMIN-APP-DEPLOYMENT-SETUP.md` - Added policy notice
- ✅ `docs/ops/DEPLOYMENT-WORKFLOW-POLICY.md` - New policy document

---

## 🎯 Result

**All apps now deploy via GitHub Actions workflows:**

| App | Workflow | Auto-Trigger | Manual Dispatch |
|-----|----------|-------------|-----------------|
| Web | `deploy-auto.yml` | ✅ Yes | ✅ Yes |
| API | `deploy-auto.yml` | ✅ Yes | ✅ Yes |
| Funnel | `deploy-auto.yml` | ✅ Yes | ✅ Yes |
| Landing | `deploy-auto.yml` | ✅ Yes | ✅ Yes |
| Admin | `deploy-auto.yml` | ✅ Yes | ✅ Yes |
| Admin (standalone) | `deploy-admin.yml` | ❌ No | ✅ Yes (emergency) |

---

## 📋 How to Deploy Admin App

### Method 1: Automatic (Preferred)

**Trigger**: Push to `main` or `staging` branch

```bash
# Make changes to admin app
git add apps/admin/
git commit -m "feat(admin): update feature"
git push origin main

# GitHub Actions automatically:
# 1. Detects admin app changes
# 2. Deploys admin app
# 3. Runs health checks
# 4. Sends notifications
```

### Method 2: Manual Dispatch (Main Workflow)

1. Go to GitHub Actions
2. Select "Auto Deploy (Nx Affected)"
3. Click "Run workflow"
4. Select environment (production/staging)
5. Click "Run workflow"

### Method 3: Standalone Workflow (Emergency Only)

1. Go to GitHub Actions
2. Select "Deploy Admin App (Manual/Standalone)"
3. Click "Run workflow"
4. Select environment
5. Click "Run workflow"

---

## ✅ Benefits

1. **Consistency**: All apps use same deployment process
2. **Automation**: Automatic deployments on push
3. **Audit Trail**: All deployments tracked in GitHub Actions
4. **Safety**: No manual CLI deployments (reduces errors)
5. **Efficiency**: Only affected apps deploy (Nx affected)
6. **Reliability**: Automated health checks and notifications

---

## 🚫 What NOT to Do

**DO NOT:**
```bash
# ❌ FORBIDDEN: Manual CLI deployment
flyctl deploy --config apps/admin/fly.toml --app ryla-admin-prod
```

**DO:**
```bash
# ✅ CORRECT: Push to trigger workflow
git push origin main

# OR

# ✅ CORRECT: Manual dispatch via GitHub Actions
# (Go to Actions → Run workflow)
```

---

## 📚 Related Documentation

- [Deployment Workflow Policy](./DEPLOYMENT-WORKFLOW-POLICY.md)
- [Admin Deployment Setup](./ADMIN-APP-DEPLOYMENT-SETUP.md)
- [Deployment Action Plan](./DEPLOYMENT-ACTION-PLAN.md)

---

**Last Updated**: 2025-01-21
