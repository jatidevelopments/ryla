# Infisical Secrets Management

## Overview

RYLA uses [Infisical](https://infisical.com) for centralized secrets management. Infisical provides:

- **Hierarchical organization** - Secrets organized by folder/path
- **Role-based access control (RBAC)** - Team members see only what they need
- **Environment separation** - dev, staging, production
- **Audit logging** - Track who accessed what
- **Machine identities** - Secure access for MCP servers and CI/CD

## Quick Start

### 1. Install the CLI

```bash
# macOS
brew install infisical/get-cli/infisical

# Linux
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get install infisical

# Windows (PowerShell)
scoop bucket add infisical https://github.com/Infisical/scoop-infisical.git
scoop install infisical
```

### 2. Login

```bash
infisical login
```

This opens a browser for authentication. After login, your credentials are cached locally.

### 3. Initialize Project (First Time Only)

```bash
cd /Users/admin/Documents/Projects/RYLA
infisical init
```

Select the RYLA project when prompted. This creates `.infisical.json` in the project root.

### 4. Pull Secrets

```bash
# Pull all secrets to .env file
infisical export --env=dev > .env

# Or run a command with secrets injected
infisical run --env=dev -- npm run dev
```

## Project Structure

Our secrets are organized hierarchically:

```
RYLA Project
├── 📁 /mcp                     # MCP Server Secrets
│   ├── RYLA_API_URL
│   ├── RYLA_DEV_TOKEN
│   ├── GITHUB_TOKEN
│   ├── SLACK_BOT_TOKEN
│   ├── SLACK_TEAM_ID
│   ├── RUNPOD_API_KEY
│   ├── CLOUDFLARE_API_TOKEN
│   ├── SNYK_API_KEY
│   ├── SNYK_ORG_ID
│   └── POSTHOG_AUTH_HEADER
│
├── 📁 /apps
│   ├── 📁 /api                 # Backend API (apps/api)
│   │   ├── APP_PORT
│   │   ├── POSTGRES_*
│   │   ├── REDIS_*
│   │   ├── JWT_*
│   │   ├── AWS_S3_*
│   │   ├── RUNPOD_*
│   │   ├── OPENROUTER_*
│   │   └── FINBY_*
│   │
│   ├── 📁 /web                 # Web App (apps/web)
│   │   ├── NEXT_PUBLIC_API_URL
│   │   ├── NEXT_PUBLIC_CDN_URL
│   │   └── NEXT_PUBLIC_SITE_URL
│   │
│   ├── 📁 /funnel              # Funnel App (apps/funnel)
│   │   ├── NEXT_PUBLIC_SITE_URL
│   │   └── FINBY_*
│   │
│   └── 📁 /landing             # Landing Page (apps/landing)
│       └── NEXT_PUBLIC_SITE_URL
│
├── 📁 /shared                  # Shared Across Apps
│   ├── NEXT_PUBLIC_SUPABASE_URL
│   ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
│   ├── SUPABASE_SERVICE_ROLE_KEY
│   ├── NEXT_PUBLIC_POSTHOG_KEY
│   ├── NEXT_PUBLIC_POSTHOG_HOST
│   ├── RESEND_API_KEY
│   └── EMAIL_FROM
│
└── 📁 /test                    # Test Fixtures
    ├── TEST_USER_EMAIL
    ├── TEST_USER_PASSWORD
    └── TEST_USER_ID
```

## Usage

### Running Applications

```bash
# Run API with secrets from /apps/api + /shared
infisical run --path=/apps/api --path=/shared --env=dev -- pnpm nx serve api

# Run Web with secrets from /apps/web + /shared
infisical run --path=/apps/web --path=/shared --env=dev -- pnpm nx serve web

# Run Funnel with secrets
infisical run --path=/apps/funnel --path=/shared --env=dev -- pnpm nx serve funnel
```

### Running MCP Servers

MCP servers use machine identities. See `.cursor/mcp.json` configuration.

```bash
# Manual test of MCP with secrets
infisical run --path=/mcp --env=dev -- npx tsx apps/mcp/src/main.ts
```

### Export to .env File

```bash
# Export API secrets for local development
infisical export --path=/apps/api --path=/shared --env=dev > apps/api/.env

# Export all secrets recursively
infisical export --recursive --env=dev > .env
```

### View Secrets (Read-Only)

```bash
# List secrets in a folder
infisical secrets --path=/mcp --env=dev

# Get a specific secret
infisical secrets get GITHUB_TOKEN --path=/mcp --env=dev
```

### Set Secrets

```bash
# Set a single secret
infisical secrets set GITHUB_TOKEN=ghp_xxx --path=/mcp --env=dev

# Set from a file
infisical secrets set --path=/apps/api --env=dev < apps/api/.env
```

## Environments

| Environment | Use Case | Access |
|-------------|----------|--------|
| `dev` | Local development | All developers |
| `staging` | Staging deployments | Developers, CI/CD |
| `prod` | Production | Admin, CI/CD only |

```bash
# Switch environments
infisical run --env=staging -- npm start
infisical run --env=prod -- npm start
```

## Team Access Control

### Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all paths and environments |
| **Developer** | Read/write to dev, read staging |
| **Frontend Dev** | Read `/apps/web`, `/apps/funnel`, `/shared` only |
| **Backend Dev** | Read `/apps/api`, `/shared` only |
| **Viewer** | Read-only access |

### Adding Team Members

```bash
# Invite via CLI (Admin only)
infisical members invite developer@team.com --role=developer

# Or use the Infisical dashboard: https://app.infisical.com
```

### Machine Identities

For MCP servers and CI/CD, use machine identities instead of personal tokens:

```bash
# Create machine identity
infisical machine-identity create \
  --name="mcp-server-local" \
  --scope="/mcp" \
  --env=dev

# Get the token
export INFISICAL_TOKEN=$(infisical machine-identity get-token --name="mcp-server-local")
```

## MCP Server Configuration

### Option 1: Using Infisical CLI Wrapper

```json
{
  "mcpServers": {
    "ryla-api": {
      "command": "infisical",
      "args": [
        "run",
        "--path=/mcp",
        "--env=dev",
        "--",
        "npx", "tsx", "/Users/admin/Documents/Projects/RYLA/apps/mcp/src/main.ts"
      ]
    }
  }
}
```

### Option 2: Using Machine Identity Token

```json
{
  "mcpServers": {
    "ryla-api": {
      "command": "npx",
      "args": ["tsx", "/Users/admin/Documents/Projects/RYLA/apps/mcp/src/main.ts"],
      "env": {
        "INFISICAL_TOKEN": "${INFISICAL_TOKEN}"
      }
    }
  }
}
```

## CI/CD Integration

### GitHub Actions Setup

The deployment workflow (`.github/workflows/deploy-auto.yml`) uses Infisical to sync secrets to Fly.io.

**Required GitHub Secret:**

You must set `INFISICAL_TOKEN` in GitHub Secrets:

1. Create a Machine Identity in Infisical Dashboard:
   - Go to https://app.infisical.com → RYLA MAIN → Settings → Machine Identities
   - Create a new identity with name "github-actions-prod"
   - Grant access to `/apps/*`, `/shared` with `prod` environment

2. Get the token:
   ```bash
   infisical machine-identity get-token --name="github-actions-prod"
   ```

3. Add to GitHub Secrets:
   - Go to GitHub → Repository → Settings → Secrets and variables → Actions
   - Add new secret: `INFISICAL_TOKEN` with the token value

### How It Works

```yaml
# In deploy-auto.yml
- name: Install Infisical CLI
  run: |
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get install infisical

- name: Sync Runtime Secrets to Fly.io (via Infisical)
  run: |
    # Export from Infisical and sync to Fly.io
    infisical export --path=/apps/api --path=/shared --env=prod --format=dotenv | while IFS='=' read -r key value; do
      flyctl secrets set "$key=$value" --app ryla-api-prod --stage
    done
    flyctl secrets deploy --app ryla-api-prod
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Fly.io Runtime

For runtime secret injection (if not using Fly secrets):

```bash
# Set machine identity token as Fly secret
fly secrets set INFISICAL_TOKEN=$(infisical machine-identity get-token --name="fly-prod")

# In Dockerfile or start script
infisical run --env=prod -- node dist/main.js
```

### Build Args (Still Required)

Build-time variables (NEXT_PUBLIC_*) are still passed as build args since they're baked into the Next.js bundle:

```yaml
flyctl deploy \
  --build-arg NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}" \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY="${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}"
```

These can be moved to Infisical too by exporting them before build:

```yaml
- name: Export build args from Infisical
  run: |
    export $(infisical export --path=/apps/web --env=prod --format=dotenv | xargs)
    flyctl deploy \
      --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
      --build-arg NEXT_PUBLIC_POSTHOG_KEY="$NEXT_PUBLIC_POSTHOG_KEY"
```

## Security Best Practices

1. **Never commit `.infisical.json` tokens** - It contains project reference, not secrets
2. **Use machine identities** for automated systems, not personal tokens
3. **Scope access narrowly** - Give minimum required access per role
4. **Rotate tokens regularly** - Especially after team member offboarding
5. **Use staging for testing** - Never test with production secrets
6. **Enable audit logging** - Review access patterns periodically

## Troubleshooting

### "Not logged in"

```bash
infisical login
```

### "Project not found"

```bash
infisical init  # Re-initialize project
```

### "Permission denied"

Contact an admin to grant access to the required path/environment.

### "Token expired"

```bash
# For personal access
infisical login

# For machine identity
infisical machine-identity rotate-token --name="mcp-server-local"
```

## Migration from .env Files

If you have existing `.env` files:

```bash
# Import existing secrets
infisical secrets set --path=/apps/api --env=dev < apps/api/.env

# Verify import
infisical secrets --path=/apps/api --env=dev
```

## Related Documentation

- [Infisical Official Docs](https://infisical.com/docs)
- [Infisical CLI Reference](https://infisical.com/docs/cli/commands)
- [Machine Identities](https://infisical.com/docs/documentation/platform/identity)
- Cursor Rule: `.cursor/rules/infisical.mdc`
