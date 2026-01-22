# Migration Guide: Moving Secrets from GitHub to Infisical

## Overview

This guide helps you migrate all build-time secrets (`NEXT_PUBLIC_*`) from GitHub Secrets to Infisical, making Infisical the single source of truth.

## Current State

**GitHub Secrets (to be migrated):**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CDN_URL`
- `NEXT_PUBLIC_DEBUG_CDN`
- `NEXT_PUBLIC_SITE_URL_FUNNEL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT`
- `NEXT_PUBLIC_SITE_URL_LANDING`

**GitHub Secrets (keep):**
- `INFISICAL_TOKEN` - Required to access Infisical
- `FLY_API_TOKEN` - Can optionally move to Infisical later

## Migration Steps

### Step 1: Add Build Args to Infisical

Add all `NEXT_PUBLIC_*` variables to Infisical for each app and environment:

#### Web App (`/apps/web`)

```bash
# Production
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/web --env=prod
infisical secrets set NEXT_PUBLIC_SITE_URL=https://app.ryla.ai --path=/apps/web --env=prod
infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://wkmhcjjphidaaxsulhrw.supabase.co --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... --path=/shared --env=prod

# Staging (if different)
infisical secrets set NEXT_PUBLIC_API_URL=https://end-staging.ryla.ai --path=/apps/web --env=staging
infisical secrets set NEXT_PUBLIC_SITE_URL=https://app-staging.ryla.ai --path=/apps/web --env=staging
# ... etc

# Development
infisical secrets set NEXT_PUBLIC_API_URL=http://localhost:3001 --path=/apps/web --env=dev
infisical secrets set NEXT_PUBLIC_SITE_URL=http://localhost:3000 --path=/apps/web --env=dev
# ... etc
```

#### Funnel App (`/apps/funnel`)

```bash
# Production
infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_SITE_URL_FUNNEL=https://goviral.ryla.ai --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ --path=/apps/funnel --env=prod
# PostHog and Supabase are in /shared (already set above)
```

#### Landing App (`/apps/landing`)

```bash
# Production
infisical secrets set NEXT_PUBLIC_SITE_URL_LANDING=https://www.ryla.ai --path=/apps/landing --env=prod
# CDN_URL and DEBUG_CDN are in /shared or /apps/funnel (can reuse)
```

### Step 2: Verify Secrets in Infisical

```bash
# Check web app secrets
infisical secrets --path=/apps/web --env=prod | grep NEXT_PUBLIC

# Check shared secrets
infisical secrets --path=/shared --env=prod | grep NEXT_PUBLIC

# Check funnel secrets
infisical secrets --path=/apps/funnel --env=prod | grep NEXT_PUBLIC
```

### Step 3: Test Workflow

1. Push a test commit to `main` branch
2. Watch the workflow in GitHub Actions
3. Verify:
   - Environment is detected correctly
   - Build args are exported from Infisical
   - Deployment succeeds with Infisical secrets

### Step 4: Remove from GitHub Secrets (After Verification)

Once workflows are working with Infisical:

1. Go to GitHub → Settings → Secrets and variables → Actions
2. Delete the migrated secrets:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CDN_URL`
   - `NEXT_PUBLIC_DEBUG_CDN`
   - `NEXT_PUBLIC_SITE_URL_FUNNEL`
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT`
   - `NEXT_PUBLIC_SITE_URL_LANDING`

**Keep:**
- `INFISICAL_TOKEN`
- `FLY_API_TOKEN` (optional, can move later)

### Step 5: Update Documentation

Update any docs that reference GitHub secrets:
- `docs/ops/GITHUB-SECRETS-TO-SET.md` - Mark as migrated
- `docs/ops/CI-CD-SETUP.md` - Update to reflect Infisical usage

## Quick Migration Script

```bash
#!/bin/bash
# scripts/ops/migrate-secrets-to-infisical.sh
# Migrates secrets from GitHub to Infisical

set -e

ENV=${1:-prod}

echo "🔄 Migrating secrets to Infisical ($ENV environment)"
echo "=================================================="
echo ""

# Read secrets from GitHub (requires gh CLI)
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed"
  exit 1
fi

REPO="jatidevelopments/ryla"

# List of secrets to migrate
SECRETS=(
  "NEXT_PUBLIC_API_URL"
  "NEXT_PUBLIC_SITE_URL"
  "NEXT_PUBLIC_POSTHOG_KEY"
  "NEXT_PUBLIC_POSTHOG_HOST"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "NEXT_PUBLIC_CDN_URL"
  "NEXT_PUBLIC_DEBUG_CDN"
  "NEXT_PUBLIC_SITE_URL_FUNNEL"
  "NEXT_PUBLIC_API_BASE_URL"
  "NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT"
  "NEXT_PUBLIC_SITE_URL_LANDING"
)

for secret in "${SECRETS[@]}"; do
  echo -n "Migrating $secret... "
  
  # Get value from GitHub (this requires gh CLI and proper permissions)
  VALUE=$(gh secret get "$secret" --repo "$REPO" 2>/dev/null || echo "")
  
  if [ -z "$VALUE" ]; then
    echo "⚠️  Not found in GitHub (skipping)"
    continue
  fi
  
  # Determine path based on secret name
  if [[ "$secret" == *"FUNNEL"* ]]; then
    PATH="/apps/funnel"
  elif [[ "$secret" == *"LANDING"* ]]; then
    PATH="/apps/landing"
  elif [[ "$secret" == *"POSTHOG"* ]] || [[ "$secret" == *"SUPABASE"* ]]; then
    PATH="/shared"
  else
    PATH="/apps/web"
  fi
  
  # Set in Infisical
  if infisical secrets set "$secret=$VALUE" --path="$PATH" --env="$ENV" 2>/dev/null; then
    echo "✅"
  else
    echo "❌"
  fi
done

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify secrets in Infisical"
echo "2. Test workflow deployment"
echo "3. Remove secrets from GitHub (after verification)"
```

## Environment-Specific Values

### Production Values

```bash
# Web App
NEXT_PUBLIC_API_URL=https://end.ryla.ai
NEXT_PUBLIC_SITE_URL=https://app.ryla.ai

# Funnel App
NEXT_PUBLIC_SITE_URL_FUNNEL=https://goviral.ryla.ai
NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net

# Landing App
NEXT_PUBLIC_SITE_URL_LANDING=https://www.ryla.ai
```

### Staging Values (if different)

```bash
# Web App
NEXT_PUBLIC_API_URL=https://end-staging.ryla.ai
NEXT_PUBLIC_SITE_URL=https://app-staging.ryla.ai

# Funnel App
NEXT_PUBLIC_SITE_URL_FUNNEL=https://goviral-staging.ryla.ai
```

### Development Values

```bash
# Web App
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Funnel App
NEXT_PUBLIC_SITE_URL_FUNNEL=http://localhost:3002
```

## Verification Checklist

- [ ] All `NEXT_PUBLIC_*` secrets added to Infisical (prod)
- [ ] All `NEXT_PUBLIC_*` secrets added to Infisical (staging, if used)
- [ ] All `NEXT_PUBLIC_*` secrets added to Infisical (dev)
- [ ] Workflow tested with Infisical secrets
- [ ] Deployment successful
- [ ] Secrets removed from GitHub (after verification)
- [ ] Documentation updated

## Troubleshooting

### Secret Not Found in Infisical

```bash
# Check if secret exists
infisical secrets get SECRET_NAME --path=/apps/web --env=prod

# If not found, add it
infisical secrets set SECRET_NAME=value --path=/apps/web --env=prod
```

### Wrong Environment Used

Check the environment detection step in workflow logs:
- Should show: `Environment: prod` (for main branch)
- Should show: `Environment: staging` (for staging branch)

### Build Args Missing

Check the "Export Build Args from Infisical" step:
- Should export all `NEXT_PUBLIC_*` variables
- Should set them as workflow outputs
- Should use them in `flyctl deploy --build-arg`

## Related Documentation

- [Infisical Setup](../technical/guides/INFISICAL-SETUP.md)
- [Infisical Environments Strategy](../technical/guides/INFISICAL-ENVIRONMENTS-STRATEGY.md)
- [Infisical + GitHub Integration](../technical/guides/INFISICAL-GITHUB-INTEGRATION.md)
