# Infisical Setup Checklist

## Pre-Migration Checklist

Before migrating secrets from GitHub to Infisical, ensure:

- [ ] Infisical CLI installed (`infisical --version`)
- [ ] Logged in to Infisical (`infisical login`)
- [ ] Project initialized (`cat .infisical.json` should exist)
- [ ] Machine identity created for GitHub Actions (if needed)
- [ ] `INFISICAL_TOKEN` added to GitHub Secrets

## Migration Steps

### Step 1: Add Build Args to Infisical

Run the migration script for each environment:

```bash
# Production (main branch)
./scripts/ops/migrate-build-args-to-infisical.sh prod

# Staging (staging branch)
./scripts/ops/migrate-build-args-to-infisical.sh staging

# Development (other branches)
./scripts/ops/migrate-build-args-to-infisical.sh dev
```

**Or manually add secrets:**

```bash
# Web App (Production)
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/web --env=prod
infisical secrets set NEXT_PUBLIC_SITE_URL=https://app.ryla.ai --path=/apps/web --env=prod

# Shared (Production)
infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_xxx --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx --path=/shared --env=prod

# Funnel App (Production)
infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_SITE_URL_FUNNEL=https://goviral.ryla.ai --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai --path=/apps/funnel --env=prod
infisical secrets set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ --path=/apps/funnel --env=prod

# Landing App (Production)
infisical secrets set NEXT_PUBLIC_SITE_URL_LANDING=https://www.ryla.ai --path=/apps/landing --env=prod
infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/landing --env=prod
infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/landing --env=prod
```

### Step 2: Verify Secrets

```bash
# Check web app secrets
infisical secrets --path=/apps/web --env=prod | grep NEXT_PUBLIC

# Check shared secrets
infisical secrets --path=/shared --env=prod | grep NEXT_PUBLIC

# Check funnel secrets
infisical secrets --path=/apps/funnel --env=prod | grep NEXT_PUBLIC

# Check landing secrets
infisical secrets --path=/apps/landing --env=prod | grep NEXT_PUBLIC
```

### Step 3: Test Workflow

1. **Make a test commit:**
   ```bash
   git checkout -b test/infisical-migration
   # Make a small change (e.g., update README)
   git commit -m "test: verify Infisical build args"
   git push origin test/infisical-migration
   ```

2. **Create a PR to main** (or push directly to main if you have permissions)

3. **Watch GitHub Actions:**
   - Check "Detect Environment" step → Should show `infisical_env=prod`
   - Check "Export Build Args from Infisical" step → Should export all `NEXT_PUBLIC_*` variables
   - Check deployment → Should succeed with Infisical secrets

4. **Verify deployment:**
   - Check Fly.io app status
   - Verify app is running
   - Check build logs for correct build args

### Step 4: Remove from GitHub Secrets (After Verification)

Once workflows are working with Infisical:

1. Go to: https://github.com/jatidevelopments/ryla/settings/secrets/actions

2. Delete these secrets (they're now in Infisical):
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

3. **Keep these in GitHub:**
   - `INFISICAL_TOKEN` (required to access Infisical)
   - `FLY_API_TOKEN` (can optionally move to Infisical later)

### Step 5: Update Documentation

- [ ] Update `docs/ops/GITHUB-SECRETS-TO-SET.md` - Mark build args as migrated
- [ ] Update `docs/ops/CI-CD-SETUP.md` - Reflect Infisical usage
- [ ] Update any other docs referencing GitHub secrets

## Verification Checklist

After migration:

- [ ] All `NEXT_PUBLIC_*` secrets in Infisical (prod)
- [ ] All `NEXT_PUBLIC_*` secrets in Infisical (staging, if used)
- [ ] All `NEXT_PUBLIC_*` secrets in Infisical (dev)
- [ ] Workflow tested with Infisical secrets
- [ ] Deployment successful
- [ ] Secrets removed from GitHub (after verification)
- [ ] Documentation updated

## Troubleshooting

### Secret Not Found

```bash
# Check if secret exists
infisical secrets get NEXT_PUBLIC_API_URL --path=/apps/web --env=prod

# If not found, add it
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/web --env=prod
```

### Wrong Environment

Check workflow logs for "Determine Environment" step:
- Main branch → `prod`
- Staging branch → `staging`
- Other branches → `dev`

### Build Args Empty

Check "Export Build Args from Infisical" step:
- Should show "✅ Build args exported"
- Should list all exported variables
- Verify variables exist in Infisical

## Quick Commands

```bash
# Add all secrets (production)
./scripts/ops/migrate-build-args-to-infisical.sh prod

# Verify secrets
infisical secrets --path=/apps/web --env=prod | grep NEXT_PUBLIC

# Export for testing
infisical export --path=/apps/web --path=/shared --env=prod > .env.test

# Check specific secret
infisical secrets get NEXT_PUBLIC_API_URL --path=/apps/web --env=prod
```

## Related Documentation

- [Migration Guide](./INFISICAL-MIGRATION-GUIDE.md)
- [Quick Reference](./INFISICAL-WORKFLOW-QUICK-REF.md)
- [Infisical Setup](../technical/guides/INFISICAL-SETUP.md)
- [Infisical + GitHub Integration](../technical/guides/INFISICAL-GITHUB-INTEGRATION.md)
