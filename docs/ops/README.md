# Operations Documentation

Operations, deployment, and infrastructure documentation for RYLA.

---

## 📚 Documentation Index

### Deployment Infrastructure

| Document | Purpose | Status |
|----------|---------|--------|
| [Deployment Action Plan](./DEPLOYMENT-ACTION-PLAN.md) | **START HERE** - Complete execution plan | ✅ Ready |
| [Quick Start Deployment](./QUICK-START-DEPLOYMENT.md) | Fastest way to deploy admin app | ✅ Ready |
| [Deployment Ready Status](./DEPLOYMENT-READY-STATUS.md) | Current status and what's ready | ✅ Complete |
| [Deployment Audit](./DEPLOYMENT-AUDIT-2025-01-21.md) | Complete deployment audit | ✅ Complete |
| [Admin Deployment Setup](./ADMIN-APP-DEPLOYMENT-SETUP.md) | Complete admin app deployment guide | ✅ Complete |
| [Deployment Next Steps](./DEPLOYMENT-NEXT-STEPS.md) | Detailed step-by-step guide | ✅ Complete |
| [Deployment Verification](./DEPLOYMENT-VERIFICATION-CHECKLIST.md) | Verification checklist | ✅ Complete |

### Infrastructure

| Document | Purpose |
|----------|---------|
| [Domain Registry](./DOMAIN-REGISTRY.md) | Production domain mapping |
| [Fly.io Deployment Guide](./FLY-IO-DEPLOYMENT-GUIDE.md) | Fly.io setup and configuration (if exists) |

### Related Documentation

- **Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../initiatives/IN-023-fly-io-deployment-infrastructure.md)
- **Epic**: [EP-060: Fly.io Deployment Infrastructure & Infisical Integration](../../requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md)
- **Infisical Setup**: [Infisical Setup Guide](../../technical/guides/INFISICAL-SETUP.md)
- **Secrets Template**: [Infisical Secrets Template](../../../config/infisical-secrets-template.md)

---

## 🚀 Quick Start

### Deploy Admin App (First Time)

```bash
# 1. Add secrets to Infisical
./scripts/setup-admin-secrets.sh

# 2. Deploy to Fly.io
./scripts/deploy-admin.sh prod

# 3. Verify deployment
./scripts/verify-all-deployments.sh
```

### Verify All Deployments

```bash
# Verify all apps are deployed and accessible
./scripts/verify-all-deployments.sh

# Verify all secrets exist
./scripts/verify-infisical-secrets.sh
```

---

## 📋 Deployment Status

### Apps

| App | fly.toml | Dockerfile | Deployed | Domain | Health Check |
|-----|----------|------------|----------|--------|--------------|
| Landing | ✅ | ✅ | ✅ | www.ryla.ai | `/api/health` |
| Funnel | ✅ | ✅ | ✅ | goviral.ryla.ai | `/api/health` |
| Web | ✅ | ✅ | ✅ | app.ryla.ai | `/api/health` |
| API | ✅ | ✅ | ✅ | end.ryla.ai | `/health` |
| Admin | ✅ | ✅ | ⏳ | admin.ryla.ai | `/api/health` |

### Infrastructure

| Component | Status |
|-----------|--------|
| Fly.io Apps | 4/5 deployed |
| Infisical Integration | Configured (needs verification) |
| Automated Deployments | ✅ Configured |
| Health Checks | 4/5 configured |
| Monitoring | ⏳ Pending |

---

## 🔧 Available Scripts

All scripts are in the `scripts/` directory:

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-admin-secrets.sh` | Add admin secrets to Infisical | `./scripts/setup-admin-secrets.sh` |
| `verify-infisical-secrets.sh` | Verify all apps have secrets | `./scripts/verify-infisical-secrets.sh` |
| `deploy-admin.sh` | Deploy admin app to Fly.io | `./scripts/deploy-admin.sh [env]` |
| `verify-all-deployments.sh` | Verify all app deployments | `./scripts/verify-all-deployments.sh` |

---

## 📖 Documentation Guide

### For First-Time Deployment

1. **Start Here**: [Deployment Action Plan](./DEPLOYMENT-ACTION-PLAN.md)
2. **Quick Deploy**: [Quick Start Deployment](./QUICK-START-DEPLOYMENT.md)
3. **Detailed Guide**: [Admin Deployment Setup](./ADMIN-APP-DEPLOYMENT-SETUP.md)

### For Verification

1. **Checklist**: [Deployment Verification](./DEPLOYMENT-VERIFICATION-CHECKLIST.md)
2. **Status**: [Deployment Ready Status](./DEPLOYMENT-READY-STATUS.md)
3. **Audit**: [Deployment Audit](./DEPLOYMENT-AUDIT-2025-01-21.md)

### For Troubleshooting

1. **Next Steps**: [Deployment Next Steps](./DEPLOYMENT-NEXT-STEPS.md) (has troubleshooting section)
2. **Admin Setup**: [Admin Deployment Setup](./ADMIN-APP-DEPLOYMENT-SETUP.md) (has troubleshooting section)

---

## 🎯 Current Initiative

**Active Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../initiatives/IN-023-fly-io-deployment-infrastructure.md)

**Status**: Ready for Execution (~85% complete)

**Next Actions**:
1. Add admin secrets to Infisical
2. Deploy admin app
3. Verify all deployments

---

## 📊 Deployment Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Apps Deployed | 5/5 | 4/5 | 🟡 80% |
| Deployment Configs | 5/5 | 5/5 | ✅ 100% |
| Infisical Integration | 5/5 | 5/5* | 🟡 *Needs verification |
| Health Checks | 5/5 | 5/5 | ✅ 100% |
| Documentation | Complete | Complete | ✅ 100% |

---

**Last Updated**: 2025-01-21
