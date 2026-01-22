# Infisical + GitHub Actions Integration Guide

## How It Currently Works

### Current Architecture

```
┌─────────────────┐
│  Infisical      │  ← Single source of truth for secrets
│  (Cloud)        │
└────────┬────────┘
         │
         │ Machine Identity Token
         │ (INFISICAL_TOKEN)
         ▼
┌─────────────────┐
│  GitHub Secrets │  ← Only stores INFISICAL_TOKEN
│  (Minimal)      │
└────────┬────────┘
         │
         │ Used in GitHub Actions
         ▼
┌─────────────────┐
│  GitHub Actions │  ← Installs Infisical CLI
│  Workflow       │  ← Exports secrets from Infisical
└────────┬────────┘
         │
         │ Syncs to deployment target
         ▼
┌─────────────────┐
│  Fly.io / etc.  │  ← Runtime secrets injected
└─────────────────┘
```

### Current Setup

**1. Infisical Structure:**
```
RYLA Project (Infisical)
├── /mcp          # MCP/Cursor secrets
├── /apps/api     # API secrets
├── /apps/web     # Web app secrets
├── /shared       # Shared secrets
└── /test         # Test credentials
```

**2. GitHub Secrets (Minimal):**
- `INFISICAL_TOKEN` - Machine identity token to access Infisical
- `FLY_API_TOKEN` - Fly.io deployment token
- `NEXT_PUBLIC_*` - Build-time variables (still in GitHub for now)

**3. How Workflows Use It:**
```yaml
# Step 1: Install Infisical CLI
- name: Install Infisical CLI
  run: |
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get install infisical

# Step 2: Use INFISICAL_TOKEN from GitHub Secrets
- name: Sync Secrets to Fly.io
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}  # ← Only this in GitHub
  run: |
    # Export secrets from Infisical
    infisical export --path=/apps/api --path=/shared --env=prod --format=dotenv | \
      while IFS='=' read -r key value; do
        flyctl secrets set "$key=$value" --app ryla-api-prod
      done
```

---

## Option 1: Keep Current Setup (Recommended)

**Pros:**
- ✅ Single source of truth (Infisical)
- ✅ Minimal GitHub secrets (only INFISICAL_TOKEN)
- ✅ Easy to manage secrets in one place
- ✅ Works well with your current setup

**Cons:**
- ⚠️ Requires installing Infisical CLI in every workflow
- ⚠️ Build-time variables (NEXT_PUBLIC_*) still in GitHub

**Current Status:** ✅ This is what you're doing now

---

## Option 2: Completely Replace GitHub Secrets with Infisical

### Can You Do It?

**Yes!** You can eliminate ALL GitHub secrets except `INFISICAL_TOKEN`.

### How It Works

**1. For Runtime Secrets (Already Working):**
```yaml
# ✅ Already doing this - secrets synced from Infisical to Fly.io
- name: Sync Runtime Secrets
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    infisical export --path=/apps/api --env=prod | \
      while IFS='=' read -r key value; do
        flyctl secrets set "$key=$value" --app ryla-api-prod
      done
```

**2. For Build-Time Variables (Can Be Fixed):**
```yaml
# ❌ Current: Using GitHub secrets
flyctl deploy --build-arg NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}"

# ✅ Better: Export from Infisical first
- name: Export Build Args from Infisical
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    # Export to environment variables
    export $(infisical export --path=/apps/web --env=prod --format=dotenv | xargs)
    
    # Use in build
    flyctl deploy \
      --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
      --build-arg NEXT_PUBLIC_POSTHOG_KEY="$NEXT_PUBLIC_POSTHOG_KEY"
```

**3. For Workflow Secrets (Can Be Fixed):**
```yaml
# ❌ Current: Using GitHub secrets
env:
  CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}

# ✅ Better: Get from Infisical
- name: Get Cursor API Key
  id: cursor-key
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    echo "key=$(infisical secrets get CURSOR_API_KEY --path=/mcp --env=prod)" >> $GITHUB_OUTPUT

- name: Use Cursor API
  env:
    CURSOR_API_KEY: ${{ steps.cursor-key.outputs.key }}
  run: |
    # Use the key
```

### Complete Example Workflow

```yaml
name: Deploy with Infisical Only

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Infisical CLI
        run: |
          curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
          sudo apt-get install infisical
      
      - name: Export All Secrets from Infisical
        id: secrets
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}  # ← Only secret in GitHub
        run: |
          # Export to environment variables
          export $(infisical export --path=/apps/web --path=/shared --env=prod --format=dotenv | xargs)
          
          # Set as workflow outputs
          echo "api_url=$NEXT_PUBLIC_API_URL" >> $GITHUB_OUTPUT
          echo "posthog_key=$NEXT_PUBLIC_POSTHOG_KEY" >> $GITHUB_OUTPUT
      
      - name: Deploy
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
          FLY_API_TOKEN: $(infisical secrets get FLY_API_TOKEN --path=/shared --env=prod)
        run: |
          flyctl deploy \
            --build-arg NEXT_PUBLIC_API_URL="${{ steps.secrets.outputs.api_url }}" \
            --build-arg NEXT_PUBLIC_POSTHOG_KEY="${{ steps.secrets.outputs.posthog_key }}"
```

**Pros:**
- ✅ Single source of truth (Infisical)
- ✅ No duplicate secrets
- ✅ Easy to rotate (change in one place)

**Cons:**
- ⚠️ Requires Infisical CLI in every workflow
- ⚠️ Slightly slower (API calls to Infisical)
- ⚠️ More complex workflow files

---

## Option 3: Sync Secrets Between GitHub and Infisical

### Does Infisical Have Native Sync?

**No**, Infisical doesn't have a built-in GitHub Actions integration that auto-syncs secrets.

### Can You Build It?

**Yes!** You can create a sync script.

### Option 3A: One-Way Sync (Infisical → GitHub)

**Use Case:** Keep Infisical as source of truth, sync to GitHub for faster workflows.

```bash
#!/bin/bash
# scripts/ops/sync-infisical-to-github.sh

# Export secrets from Infisical
infisical export --path=/apps/web --path=/shared --env=prod --format=dotenv > /tmp/secrets.env

# Use GitHub CLI to set secrets
while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  
  # Remove quotes
  value="${value%\"}"
  value="${value#\"}"
  
  # Set in GitHub
  gh secret set "$key" --body "$value"
done < /tmp/secrets.env

rm /tmp/secrets.env
```

**Usage:**
```bash
# Run manually when secrets change
./scripts/ops/sync-infisical-to-github.sh

# Or add to CI/CD
```

**Pros:**
- ✅ Infisical remains source of truth
- ✅ GitHub workflows run faster (no Infisical API calls)
- ✅ Automatic sync possible

**Cons:**
- ⚠️ Secrets exist in two places (sync risk)
- ⚠️ Need to remember to sync
- ⚠️ More complex setup

### Option 3B: Two-Way Sync (Bidirectional)

**Not Recommended** - Creates sync conflicts and complexity.

---

## Option 4: GitHub Actions with Infisical Action

### Use Infisical GitHub Action

Infisical provides an official GitHub Action:

```yaml
- name: Get secrets from Infisical
  uses: infisical/get-secrets@v1.1.0
  with:
    infisical-token: ${{ secrets.INFISICAL_TOKEN }}
    path: /apps/web,/shared
    environment: prod
    export-env: true  # Exports as environment variables

- name: Use secrets
  run: |
    echo "API URL: $NEXT_PUBLIC_API_URL"  # Available as env var
    flyctl deploy --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL"
```

**Pros:**
- ✅ Official Infisical action
- ✅ Cleaner workflow syntax
- ✅ No manual CLI installation

**Cons:**
- ⚠️ Still requires INFISICAL_TOKEN in GitHub
- ⚠️ Action might be slower than CLI

---

## Recommendation: Hybrid Approach

### Best Practice Setup

**1. Keep in GitHub Secrets:**
- `INFISICAL_TOKEN` - Required to access Infisical
- `FLY_API_TOKEN` - Deployment token (can move to Infisical too)

**2. Store in Infisical:**
- All application secrets
- All environment variables
- All API keys
- Build-time variables (NEXT_PUBLIC_*)

**3. Workflow Pattern:**
```yaml
- name: Export Secrets from Infisical
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    # Export to environment for this step
    export $(infisical export --path=/apps/web --path=/shared --env=prod --format=dotenv | xargs)
    
    # Use in build
    flyctl deploy \
      --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL"
```

**4. Optional: Sync Script for Convenience**
```bash
# When you add a secret to Infisical, optionally sync to GitHub
./scripts/ops/sync-infisical-to-github.sh
```

---

## Migration Plan

### Step 1: Move Build Args to Infisical

```bash
# Add build-time variables to Infisical
infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/web --env=prod
infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_xxx --path=/shared --env=prod
# ... etc
```

### Step 2: Update Workflows

```yaml
# Before
flyctl deploy --build-arg NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}"

# After
- name: Export Build Args
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    export $(infisical export --path=/apps/web --env=prod --format=dotenv | xargs)
    flyctl deploy --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL"
```

### Step 3: Remove from GitHub Secrets

Once workflows are updated, remove secrets from GitHub (except INFISICAL_TOKEN).

---

## Quick Reference

### Current Setup
- ✅ Infisical = Source of truth
- ✅ GitHub = Only INFISICAL_TOKEN
- ✅ Workflows export from Infisical

### Can You Eliminate GitHub Secrets?
- ✅ **Yes** - Except INFISICAL_TOKEN (required to access Infisical)

### Can You Sync?
- ✅ **Yes** - Build a sync script (one-way recommended)

### Should You?
- ✅ **Recommended:** Keep current setup (minimal GitHub secrets)
- ⚠️ **Optional:** Move build args to Infisical for consistency

---

## Related Documentation

- [Infisical Setup](./INFISICAL-SETUP.md)
- [CI/CD Setup](../ops/CI-CD-SETUP.md)
- [Infisical Rules](../../.cursor/rules/infisical.mdc)
