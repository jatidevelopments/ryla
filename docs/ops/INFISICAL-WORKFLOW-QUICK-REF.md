# Infisical Workflow Quick Reference

## How It Works Now

### Environment Detection

**Automatic mapping:**
- `main` branch → `prod` environment
- `staging` branch → `staging` environment  
- Other branches → `dev` environment

**Workflow step:**
```yaml
- name: Determine Environment
  id: env
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      echo "infisical_env=prod" >> $GITHUB_OUTPUT
    elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
      echo "infisical_env=staging" >> $GITHUB_OUTPUT
    else
      echo "infisical_env=dev" >> $GITHUB_OUTPUT
    fi
```

### Build Args from Infisical

**Before (GitHub Secrets):**
```yaml
--build-arg NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}"
```

**After (Infisical):**
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

### Runtime Secrets Sync

**Before:**
```yaml
infisical export --path=/apps/api --env=prod --format=dotenv
```

**After (Environment-aware):**
```yaml
infisical export \
  --path=/apps/api \
  --env=${{ steps.env.outputs.infisical_env }} \
  --format=dotenv
```

## Required Setup

### 1. Infisical Machine Identity

```bash
# Create machine identity for GitHub Actions
infisical machine-identity create \
  --name="github-actions-prod" \
  --scope="/apps/*,/shared,/mcp" \
  --env=prod

# Get token
infisical machine-identity get-token --name="github-actions-prod"
```

### 2. GitHub Secret

Add to GitHub Secrets:
- `INFISICAL_TOKEN` = Machine identity token from step 1

### 3. Add Secrets to Infisical

```bash
# Example: Web app build args (production)
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/web --env=prod
infisical secrets set NEXT_PUBLIC_SITE_URL=https://app.ryla.ai --path=/apps/web --env=prod

# Shared secrets (used by multiple apps)
infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_xxx --path=/shared --env=prod
infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co --path=/shared --env=prod
```

## Workflow Structure

```
detect-environment (new)
  ↓
detect-changes
  ↓
deploy-web/api/funnel/landing
  ├── Export Build Args from Infisical
  ├── Sync Runtime Secrets to Fly.io
  └── Deploy with build args
```

## Common Commands

### Add Secret to Infisical

```bash
# Single secret
infisical secrets set KEY=value --path=/apps/web --env=prod

# Multiple environments
infisical secrets set KEY=prod_value --path=/apps/web --env=prod
infisical secrets set KEY=staging_value --path=/apps/web --env=staging
infisical secrets set KEY=dev_value --path=/apps/web --env=dev
```

### Check Secrets

```bash
# List all secrets in path
infisical secrets --path=/apps/web --env=prod

# Get specific secret
infisical secrets get NEXT_PUBLIC_API_URL --path=/apps/web --env=prod
```

### Export for Testing

```bash
# Export to .env file
infisical export --path=/apps/web --path=/shared --env=prod > .env

# Export and use in command
infisical export --path=/apps/web --env=prod --format=dotenv | xargs -0 -I {} sh -c 'export {} && echo $NEXT_PUBLIC_API_URL'
```

## Troubleshooting

### Workflow Fails: "Secret not found"

1. Check secret exists:
   ```bash
   infisical secrets get SECRET_NAME --path=/apps/web --env=prod
   ```

2. Check path is correct:
   - Web app → `/apps/web`
   - Shared → `/shared`
   - Funnel → `/apps/funnel`

3. Check environment:
   - Main branch → `prod`
   - Staging branch → `staging`

### Wrong Environment Used

Check workflow logs for "Determine Environment" step:
- Should show correct `infisical_env` output
- Verify branch mapping is correct

### Build Args Empty

Check "Export Build Args from Infisical" step:
- Should show "✅ Build args exported"
- Should list exported variables
- Check if variables exist in Infisical

## Next Steps

1. ✅ Workflows updated to use Infisical
2. ⏳ Add all `NEXT_PUBLIC_*` secrets to Infisical
3. ⏳ Test deployment
4. ⏳ Remove secrets from GitHub (after verification)
