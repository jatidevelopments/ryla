# Infisical Environments Strategy

## How Infisical Environments Work

### Environment Structure

Infisical has **separate environments** that are completely isolated:

```
RYLA Project (Infisical)
│
├── 📁 dev (Development)
│   ├── /mcp
│   ├── /apps/api
│   ├── /apps/web
│   ├── /shared
│   └── /test
│
├── 📁 staging (Staging/Pre-production)
│   ├── /mcp
│   ├── /apps/api
│   ├── /apps/web
│   ├── /shared
│   └── /test
│
└── 📁 prod (Production)
    ├── /mcp
    ├── /apps/api
    ├── /apps/web
    ├── /shared
    └── /test
```

**Key Points:**
- Each environment has its **own set of secrets**
- Same folder structure in each environment
- Secrets can have **different values** per environment
- Access is controlled per environment

### Example: Same Secret, Different Values

```bash
# Development
infisical secrets set DATABASE_URL=postgres://localhost:5432/ryla_dev --path=/apps/api --env=dev

# Staging
infisical secrets set DATABASE_URL=postgres://staging-db:5432/ryla_staging --path=/apps/api --env=staging

# Production
infisical secrets set DATABASE_URL=postgres://prod-db:5432/ryla_prod --path=/apps/api --env=prod
```

---

## Mapping GitHub Actions to Infisical Environments

### Current Setup

**GitHub Actions Environments:**
- `production` - Protected environment (requires approval)
- `staging` - (if exists, for staging deployments)

**Infisical Environments:**
- `dev` - Local development
- `staging` - Staging deployments
- `prod` - Production deployments

### Strategy: Environment Mapping

```yaml
# GitHub Actions environment → Infisical environment
production → prod
staging → staging
(no env) → dev (for local development)
```

---

## Implementation Patterns

### Pattern 1: Environment Variable in Workflow (Recommended)

**Use GitHub Actions `environment` to determine Infisical env:**

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'production' }}
    steps:
      - name: Determine Infisical Environment
        id: env
        run: |
          # Map GitHub environment to Infisical environment
          if [ "${{ github.event.inputs.environment }}" == "staging" ]; then
            echo "infisical_env=staging" >> $GITHUB_OUTPUT
          else
            echo "infisical_env=prod" >> $GITHUB_OUTPUT
          fi
      
      - name: Install Infisical CLI
        run: |
          curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
          sudo apt-get install infisical
      
      - name: Export Secrets from Infisical
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
        run: |
          # Use the determined environment
          export $(infisical export \
            --path=/apps/web \
            --path=/shared \
            --env=${{ steps.env.outputs.infisical_env }} \
            --format=dotenv | xargs)
          
          # Use in deployment
          flyctl deploy \
            --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL"
```

### Pattern 2: Direct Mapping (Simpler)

**Map GitHub `environment` directly to Infisical:**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # or staging
    steps:
      - name: Export Secrets
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
        run: |
          # Map: production → prod, staging → staging
          INFISICAL_ENV=${{ github.environment == 'production' && 'prod' || github.environment }}
          
          export $(infisical export \
            --path=/apps/web \
            --env=$INFISICAL_ENV \
            --format=dotenv | xargs)
```

### Pattern 3: Branch-Based (Current Approach)

**Use branch to determine environment:**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Determine Environment
        id: env
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "infisical_env=prod" >> $GITHUB_OUTPUT
            echo "fly_app_suffix=prod" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "infisical_env=staging" >> $GITHUB_OUTPUT
            echo "fly_app_suffix=staging" >> $GITHUB_OUTPUT
          else
            echo "infisical_env=dev" >> $GITHUB_OUTPUT
            echo "fly_app_suffix=dev" >> $GITHUB_OUTPUT
          fi
      
      - name: Export Secrets
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
        run: |
          export $(infisical export \
            --path=/apps/web \
            --env=${{ steps.env.outputs.infisical_env }} \
            --format=dotenv | xargs)
```

---

## Recommended Strategy for RYLA

### Environment Mapping

| GitHub Context | Infisical Env | Fly.io App | Use Case |
|----------------|---------------|------------|----------|
| `main` branch | `prod` | `ryla-*-prod` | Production |
| `staging` branch | `staging` | `ryla-*-staging` | Staging |
| Local dev | `dev` | N/A | Local development |
| PR workflows | `dev` or `staging` | N/A | CI/CD testing |

### Implementation

**1. Create Environment Helper Function:**

```yaml
# .github/workflows/deploy-auto.yml
jobs:
  deploy:
    steps:
      - name: Determine Infisical Environment
        id: env
        run: |
          # Default to prod for main branch
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "infisical_env=prod" >> $GITHUB_OUTPUT
            echo "fly_suffix=prod" >> $GITHUB_OUTPUT
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "infisical_env=staging" >> $GITHUB_OUTPUT
            echo "fly_suffix=staging" >> $GITHUB_OUTPUT
          else
            echo "infisical_env=dev" >> $GITHUB_OUTPUT
            echo "fly_suffix=dev" >> $GITHUB_OUTPUT
          fi
```

**2. Use in All Secret Exports:**

```yaml
- name: Export Secrets from Infisical
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    export $(infisical export \
      --path=/apps/web \
      --path=/shared \
      --env=${{ steps.env.outputs.infisical_env }} \
      --format=dotenv | xargs)
```

**3. Use in Deployments:**

```yaml
- name: Deploy to Fly.io
  run: |
    flyctl deploy \
      --app ryla-web-${{ steps.env.outputs.fly_suffix }} \
      --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL"
```

---

## Machine Identity Setup

### Create Separate Machine Identities Per Environment

**For Production:**
```bash
infisical machine-identity create \
  --name="github-actions-prod" \
  --scope="/apps/*,/shared" \
  --env=prod
```

**For Staging:**
```bash
infisical machine-identity create \
  --name="github-actions-staging" \
  --scope="/apps/*,/shared" \
  --env=staging
```

**For Development:**
```bash
infisical machine-identity create \
  --name="github-actions-dev" \
  --scope="/apps/*,/shared,/mcp" \
  --env=dev
```

### GitHub Secrets Setup

**Option A: Single Token (Access to All Environments)**
- `INFISICAL_TOKEN` - Machine identity with access to staging + prod

**Option B: Separate Tokens (Recommended for Security)**
- `INFISICAL_TOKEN_PROD` - Production only
- `INFISICAL_TOKEN_STAGING` - Staging only
- Use conditional in workflow based on environment

---

## Workflow Examples

### Example 1: Environment-Aware Deployment

```yaml
name: Deploy (Environment-Aware)

on:
  push:
    branches: [main, staging]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment'
        required: true
        type: choice
        options: [staging, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || (github.ref == 'refs/heads/main' && 'production' || 'staging') }}
    steps:
      - name: Determine Infisical Environment
        id: env
        run: |
          GITHUB_ENV="${{ github.event.inputs.environment || (github.ref == 'refs/heads/main' && 'production' || 'staging') }}"
          
          if [ "$GITHUB_ENV" == "production" ]; then
            echo "infisical_env=prod" >> $GITHUB_OUTPUT
            echo "fly_suffix=prod" >> $GITHUB_OUTPUT
            echo "token_secret=INFISICAL_TOKEN_PROD" >> $GITHUB_OUTPUT
          else
            echo "infisical_env=staging" >> $GITHUB_OUTPUT
            echo "fly_suffix=staging" >> $GITHUB_OUTPUT
            echo "token_secret=INFISICAL_TOKEN_STAGING" >> $GITHUB_OUTPUT
          fi
      
      - name: Install Infisical CLI
        run: |
          curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
          sudo apt-get install infisical
      
      - name: Export Secrets from Infisical
        env:
          INFISICAL_TOKEN: ${{ secrets[steps.env.outputs.token_secret] }}
        run: |
          echo "📦 Exporting secrets from Infisical (${{ steps.env.outputs.infisical_env }})..."
          
          export $(infisical export \
            --path=/apps/web \
            --path=/shared \
            --env=${{ steps.env.outputs.infisical_env }} \
            --format=dotenv | xargs)
          
          echo "✅ Secrets exported"
          echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
      
      - name: Deploy to Fly.io
        run: |
          flyctl deploy \
            --app ryla-web-${{ steps.env.outputs.fly_suffix }} \
            --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
            --build-arg NEXT_PUBLIC_POSTHOG_KEY="$NEXT_PUBLIC_POSTHOG_KEY"
```

### Example 2: Simple Branch-Based (Current)

```yaml
jobs:
  deploy:
    steps:
      - name: Set Environment
        id: env
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "infisical_env=prod" >> $GITHUB_OUTPUT
          else
            echo "infisical_env=staging" >> $GITHUB_OUTPUT
          fi
      
      - name: Export Secrets
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
        run: |
          infisical export \
            --path=/apps/web \
            --env=${{ steps.env.outputs.infisical_env }} \
            --format=dotenv > .env.export
          
          export $(cat .env.export | xargs)
```

---

## Best Practices

### 1. Always Specify Environment Explicitly

```yaml
# ✅ Good
infisical export --path=/apps/web --env=prod

# ❌ Bad (defaults to dev, might be wrong)
infisical export --path=/apps/web
```

### 2. Use Environment Variables in Workflows

```yaml
# ✅ Good - Clear and explicit
env:
  INFISICAL_ENV: ${{ steps.env.outputs.infisical_env }}

# ❌ Bad - Hardcoded
infisical export --env=prod
```

### 3. Validate Environment Before Deployment

```yaml
- name: Validate Environment
  run: |
    if [ -z "${{ steps.env.outputs.infisical_env }}" ]; then
      echo "❌ Environment not determined"
      exit 1
    fi
    echo "✅ Deploying to: ${{ steps.env.outputs.infisical_env }}"
```

### 4. Separate Machine Identities Per Environment

- More secure
- Better audit trail
- Can revoke access per environment

### 5. Document Environment Mappings

Keep a clear mapping document:
- Which branch → which environment
- Which workflow → which environment
- Which machine identity → which environment

---

## Migration Checklist

When updating workflows to be environment-aware:

- [ ] Create environment determination step
- [ ] Update all `infisical export` commands to use environment variable
- [ ] Update Fly.io app names to use environment suffix
- [ ] Create machine identities for each environment
- [ ] Update GitHub secrets (if using separate tokens)
- [ ] Test staging deployment
- [ ] Test production deployment
- [ ] Document environment mappings

---

## Quick Reference

### Local Development
```bash
infisical run --path=/apps/api --env=dev -- pnpm nx serve api
```

### Staging Deployment
```bash
infisical export --path=/apps/web --env=staging --format=dotenv
```

### Production Deployment
```bash
infisical export --path=/apps/web --env=prod --format=dotenv
```

### Check Secrets in Environment
```bash
# List all secrets in staging
infisical secrets --path=/apps/web --env=staging

# Get specific secret in prod
infisical secrets get DATABASE_URL --path=/apps/api --env=prod
```

---

## Related Documentation

- [Infisical Setup](./INFISICAL-SETUP.md)
- [Infisical + GitHub Integration](./INFISICAL-GITHUB-INTEGRATION.md)
- [CI/CD Setup](../ops/CI-CD-SETUP.md)
