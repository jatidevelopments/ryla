# Deployment Verification Checklist

**Initiative**: [IN-023: Fly.io Deployment Infrastructure & Infisical Integration](../../initiatives/IN-023-fly-io-deployment-infrastructure.md)  
**Epic**: [EP-060: Fly.io Deployment Infrastructure & Infisical Integration](../../requirements/epics/ops/EP-060-fly-io-deployment-infrastructure.md)  
**Last Updated**: 2025-01-21

---

## Pre-Deployment Verification

### Infisical Configuration

- [ ] Infisical CLI installed and logged in
- [ ] Machine identity created for GitHub Actions
- [ ] Machine identity token added to GitHub Secrets (`INFISICAL_TOKEN`)
- [ ] All required secrets exist in Infisical prod environment
  - [ ] Landing app secrets
  - [ ] Funnel app secrets
  - [ ] Web app secrets
  - [ ] API app secrets
  - [ ] Admin app secrets
  - [ ] Shared secrets

**Verification Command:**
```bash
./scripts/verify-infisical-secrets.sh
```

### Fly.io Configuration

- [ ] Fly.io CLI installed and authenticated
- [ ] Fly.io API token added to GitHub Secrets (`FLY_API_TOKEN`)
- [ ] All Fly.io apps created:
  - [ ] `ryla-landing-prod`
  - [ ] `ryla-funnel-prod`
  - [ ] `ryla-web-prod`
  - [ ] `ryla-api-prod`
  - [ ] `ryla-admin-prod`

**Verification Command:**
```bash
flyctl apps list
```

### Domain Configuration

- [ ] All domains configured in DNS:
  - [ ] `www.ryla.ai` → Landing
  - [ ] `ryla.ai` → Landing
  - [ ] `goviral.ryla.ai` → Funnel
  - [ ] `app.ryla.ai` → Web
  - [ ] `end.ryla.ai` → API
  - [ ] `admin.ryla.ai` → Admin

**Verification Command:**
```bash
# Check DNS resolution
dig www.ryla.ai
dig goviral.ryla.ai
dig app.ryla.ai
dig end.ryla.ai
dig admin.ryla.ai
```

---

## Deployment Verification

### Landing App

- [ ] App deployed to Fly.io
- [ ] Health check passing: `curl https://www.ryla.ai/api/health`
- [ ] Domain accessible: `curl https://www.ryla.ai`
- [ ] Infisical secrets loading correctly
- [ ] No errors in logs: `flyctl logs --app ryla-landing-prod`

### Funnel App

- [ ] App deployed to Fly.io
- [ ] Health check passing: `curl https://goviral.ryla.ai/api/health`
- [ ] Domain accessible: `curl https://goviral.ryla.ai`
- [ ] Infisical secrets loading correctly
- [ ] Payment flow working (test transaction)
- [ ] No errors in logs: `flyctl logs --app ryla-funnel-prod`

### Web App

- [ ] App deployed to Fly.io
- [ ] Health check passing: `curl https://app.ryla.ai/api/health`
- [ ] Domain accessible: `curl https://app.ryla.ai`
- [ ] Infisical secrets loading correctly
- [ ] Authentication working
- [ ] No errors in logs: `flyctl logs --app ryla-web-prod`

### API App

- [ ] App deployed to Fly.io
- [ ] Health check passing: `curl https://end.ryla.ai/health`
- [ ] Domain accessible: `curl https://end.ryla.ai/health`
- [ ] Infisical secrets loading correctly
- [ ] Database connection working
- [ ] No errors in logs: `flyctl logs --app ryla-api-prod`

### Admin App

- [ ] Secrets added to Infisical: `./scripts/setup-admin-secrets.sh`
- [ ] App created in Fly.io: `flyctl apps create ryla-admin-prod`
- [ ] Domain configured: `flyctl domains add admin.ryla.ai --app ryla-admin-prod`
- [ ] App deployed to Fly.io
- [ ] Health check passing: `curl https://admin.ryla.ai/api/health`
- [ ] Domain accessible: `curl https://admin.ryla.ai`
- [ ] Infisical secrets loading correctly
- [ ] Authentication working
- [ ] No errors in logs: `flyctl logs --app ryla-admin-prod`

---

## Post-Deployment Verification

### Health Checks

- [ ] All health endpoints responding:
  ```bash
  curl https://www.ryla.ai/api/health
  curl https://goviral.ryla.ai/api/health
  curl https://app.ryla.ai/api/health
  curl https://end.ryla.ai/health
  curl https://admin.ryla.ai/api/health
  ```

### Infisical Integration

- [ ] All apps using Infisical prod envs
- [ ] No hardcoded secrets in code
- [ ] Build args sourced from Infisical
- [ ] Runtime secrets synced from Infisical
- [ ] Machine identity working correctly

**Verification:**
- Check deployment logs for Infisical export messages
- Verify secrets are not in code: `grep -r "password.*=" apps/`
- Test deployment with Infisical secrets

### Monitoring

- [ ] Fly.io metrics accessible
- [ ] Health checks configured in fly.toml
- [ ] Alerts configured (if using external monitoring)
- [ ] Uptime tracking enabled

### Documentation

- [ ] Deployment guides complete
- [ ] Runbooks created
- [ ] Troubleshooting procedures documented
- [ ] Team trained on deployment process

---

## Automated Verification Script

```bash
#!/bin/bash
# Quick verification script

echo "Verifying all deployments..."

APPS=(
  "landing:www.ryla.ai:/api/health"
  "funnel:goviral.ryla.ai:/api/health"
  "web:app.ryla.ai:/api/health"
  "api:end.ryla.ai:/health"
  "admin:admin.ryla.ai:/api/health"
)

for app_info in "${APPS[@]}"; do
  IFS=':' read -r app_name domain health_path <<< "$app_info"
  url="https://${domain}${health_path}"
  
  echo -n "Checking $app_name ($domain)... "
  if curl -sf "$url" > /dev/null; then
    echo "✅ OK"
  else
    echo "❌ FAILED"
  fi
done
```

---

## Success Criteria

**All deployments verified when:**
- ✅ All 5 apps deployed and accessible
- ✅ All health checks passing
- ✅ All domains resolving correctly
- ✅ Infisical integration working
- ✅ No errors in logs
- ✅ Monitoring configured
- ✅ Documentation complete

---

## Troubleshooting

### Health Check Fails

1. Check app status: `flyctl status --app ryla-{app}-prod`
2. View logs: `flyctl logs --app ryla-{app}-prod`
3. SSH into machine: `flyctl ssh console --app ryla-{app}-prod`
4. Verify route exists and is accessible

### Domain Not Resolving

1. Check DNS records: `dig {domain}`
2. Verify Fly.io domain: `flyctl domains list --app ryla-{app}-prod`
3. Wait for DNS propagation (up to 48 hours)
4. Check SSL certificate: `flyctl certs list --app ryla-{app}-prod`

### Secrets Not Loading

1. Verify secrets exist: `infisical secrets --path=/apps/{app} --env=prod`
2. Check machine identity: `infisical machine-identity list`
3. Verify GitHub Secrets: Check `INFISICAL_TOKEN` exists
4. Check deployment logs for Infisical errors

---

**Last Updated**: 2025-01-21
