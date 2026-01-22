# Infisical Migration Status

## ✅ Completed

### 1. Workflow Updates

- [x] **Environment Detection**: Added `detect-environment` job that maps:
  - `main` branch → `prod` environment
  - `staging` branch → `staging` environment
  - Other branches → `dev` environment

- [x] **Build Args from Infisical**: All `NEXT_PUBLIC_*` build args now exported from Infisical:
  - Web app: `/apps/web` path
  - Funnel app: `/apps/funnel` path
  - Landing app: `/apps/landing` path
  - Shared: `/shared` path (PostHog, Supabase)

- [x] **Environment-Aware Secrets**: All Infisical exports use detected environment
- [x] **Fly.io App Names**: Use environment suffix (`ryla-web-prod`, `ryla-web-staging`, etc.)
- [x] **Automated Commit SOP**: Updated to get `CURSOR_API_KEY` from Infisical

### 2. Documentation

- [x] Migration Guide: `docs/ops/INFISICAL-MIGRATION-GUIDE.md`
- [x] Quick Reference: `docs/ops/INFISICAL-WORKFLOW-QUICK-REF.md`
- [x] Setup Checklist: `docs/ops/INFISICAL-SETUP-CHECKLIST.md`
- [x] Migration Script: `scripts/ops/migrate-build-args-to-infisical.sh`

### 3. Files Updated

- `.github/workflows/deploy-auto.yml` - Environment detection + Infisical build args
- `.github/workflows/automated-commit-sop.yml` - Cursor API key from Infisical

## ⏳ Next Steps (Action Required)

### Step 1: Add Secrets to Infisical

Run the migration script:

```bash
# Production (main branch)
./scripts/ops/migrate-build-args-to-infisical.sh prod

# Staging (if you have a staging branch)
./scripts/ops/migrate-build-args-to-infisical.sh staging

# Development (for local testing)
./scripts/ops/migrate-build-args-to-infisical.sh dev
```

**Or manually add secrets** (see `docs/ops/INFISICAL-SETUP-CHECKLIST.md`)

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

1. Make a test commit to `main` branch
2. Watch GitHub Actions workflow
3. Verify:
   - Environment detection works (`infisical_env=prod`)
   - Build args exported successfully
   - Deployment succeeds

### Step 4: Remove from GitHub Secrets

After successful verification:

1. Go to: https://github.com/jatidevelopments/ryla/settings/secrets/actions
2. Delete these secrets (now in Infisical):
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

3. **Keep in GitHub:**
   - `INFISICAL_TOKEN` (required)
   - `FLY_API_TOKEN` (can move later)

## 📋 Secret Mapping

### Web App (`/apps/web`)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`

### Shared (`/shared`)
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Funnel App (`/apps/funnel`)
- `NEXT_PUBLIC_CDN_URL`
- `NEXT_PUBLIC_DEBUG_CDN`
- `NEXT_PUBLIC_SITE_URL_FUNNEL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT`

### Landing App (`/apps/landing`)
- `NEXT_PUBLIC_SITE_URL_LANDING`
- `NEXT_PUBLIC_CDN_URL` (can share with funnel)
- `NEXT_PUBLIC_DEBUG_CDN` (can share with funnel)

## 🔍 How It Works Now

### Before (GitHub Secrets)
```yaml
--build-arg NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}"
```

### After (Infisical)
```yaml
- name: Export Build Args from Infisical
  id: build-args
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    infisical export --path=/apps/web --env=${{ steps.env.outputs.infisical_env }} --format=dotenv > /tmp/build-args.env
    source /tmp/build-args.env
    echo "api_url=$NEXT_PUBLIC_API_URL" >> $GITHUB_OUTPUT

- name: Deploy
  run: |
    flyctl deploy --build-arg NEXT_PUBLIC_API_URL="${{ steps.build-args.outputs.api_url }}"
```

## 📚 Documentation

- **Migration Guide**: `docs/ops/INFISICAL-MIGRATION-GUIDE.md` - Full migration instructions
- **Quick Reference**: `docs/ops/INFISICAL-WORKFLOW-QUICK-REF.md` - Quick commands and troubleshooting
- **Setup Checklist**: `docs/ops/INFISICAL-SETUP-CHECKLIST.md` - Step-by-step checklist
- **Infisical Setup**: `docs/technical/INFISICAL-SETUP.md` - General Infisical setup
- **GitHub Integration**: `docs/technical/INFISICAL-GITHUB-INTEGRATION.md` - How Infisical works with GitHub

## 🚨 Important Notes

1. **Environment Detection**: Automatically detects environment from branch name
2. **Single Source of Truth**: Infisical is now the single source of truth for all build args
3. **Backward Compatible**: GitHub Secrets still work (but will be removed after migration)
4. **Testing**: Test thoroughly before removing GitHub Secrets

## ✅ Success Criteria

Migration is complete when:

- [ ] All `NEXT_PUBLIC_*` secrets in Infisical (all environments)
- [ ] Workflow tested and successful
- [ ] Deployment works with Infisical secrets
- [ ] Secrets removed from GitHub
- [ ] Documentation updated
