# Quick Start: Deploy Admin App

**For**: First-time admin app deployment  
**Time**: ~15 minutes  
**Prerequisites**: Infisical CLI, Fly.io CLI, secrets in Infisical

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Add Secrets (5 min)

```bash
./scripts/setup-admin-secrets.sh
```

Follow the prompts to add all required secrets.

### Step 2: Deploy (5 min)

```bash
./scripts/deploy-admin.sh prod
```

The script will:
- ✅ Check prerequisites
- ✅ Create Fly.io app (if needed)
- ✅ Export secrets from Infisical
- ✅ Deploy to Fly.io

### Step 3: Verify (2 min)

```bash
# Check health
curl https://admin.ryla.ai/api/health

# Or verify all deployments
./scripts/verify-all-deployments.sh
```

---

## 📋 Detailed Steps

### Prerequisites Check

```bash
# Check Infisical
infisical whoami

# Check Fly.io
flyctl auth whoami

# Verify secrets exist
./scripts/verify-infisical-secrets.sh
```

### Create Fly.io App (First Time Only)

```bash
flyctl apps create ryla-admin-prod --org your-org-name
```

### Configure Domain (First Time Only)

```bash
flyctl domains add admin.ryla.ai --app ryla-admin-prod
```

Add the DNS records provided by Fly.io to your domain registrar.

### Deploy

```bash
./scripts/deploy-admin.sh prod
```

---

## ✅ Verification

After deployment, verify:

1. **Health Check**
   ```bash
   curl https://admin.ryla.ai/api/health
   ```
   Expected: `{"status":"ok","timestamp":"...","service":"admin"}`

2. **App Status**
   ```bash
   flyctl status --app ryla-admin-prod
   ```

3. **Logs**
   ```bash
   flyctl logs --app ryla-admin-prod
   ```

---

## 🆘 Troubleshooting

### Script Fails: "Missing required build args"

**Solution**: Add missing secrets to Infisical
```bash
infisical secrets set NEXT_PUBLIC_XXX=value --path=/apps/admin --env=prod
```

### Script Fails: "App does not exist"

**Solution**: Create the app first
```bash
flyctl apps create ryla-admin-prod
```

### Health Check Returns 404

**Solution**: 
1. Check route exists: `apps/admin/app/api/health/route.ts`
2. Check logs: `flyctl logs --app ryla-admin-prod`
3. Verify deployment succeeded: `flyctl status --app ryla-admin-prod`

---

## 📚 More Information

- **Full Guide**: `docs/ops/ADMIN-APP-DEPLOYMENT-SETUP.md`
- **Next Steps**: `docs/ops/DEPLOYMENT-NEXT-STEPS.md`
- **Verification**: `docs/ops/DEPLOYMENT-VERIFICATION-CHECKLIST.md`

---

**Last Updated**: 2025-01-21
