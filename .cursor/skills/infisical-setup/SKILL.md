---
name: infisical-setup
description: Configures Infisical secrets management for applications and services. Use when setting up secrets, configuring Infisical for new apps, creating machine identities, or when the user mentions Infisical or secrets management.
---

# Infisical Setup

Configures Infisical secrets management for applications and services following RYLA patterns.

## Quick Start

When setting up Infisical:

1. **Login** - `infisical login`
2. **Create Folders** - Set up folder structure
3. **Add Secrets** - Set secrets for each environment
4. **Export for Deployment** - Export secrets for CI/CD
5. **Configure Machine Identity** - For automated systems

## Secrets Structure

```
RYLA Project
├── /mcp # MCP server secrets
├── /apps/api # Backend API secrets
├── /apps/web # Web app secrets
├── /apps/funnel # Funnel app secrets
├── /apps/landing # Landing page secrets
├── /shared # Shared across all apps
├── /logins # SaaS tool login credentials
└── /test # Test fixtures and credentials
```

## Folder Assignments

| Application    | Paths                      | Command                                             |
| -------------- | -------------------------- | --------------------------------------------------- |
| `apps/api`     | `/apps/api`, `/shared`     | `infisical run --path=/apps/api --path=/shared`     |
| `apps/web`     | `/apps/web`, `/shared`     | `infisical run --path=/apps/web --path=/shared`     |
| `apps/funnel`  | `/apps/funnel`, `/shared`  | `infisical run --path=/apps/funnel --path=/shared`  |
| `apps/landing` | `/apps/landing`, `/shared` | `infisical run --path=/apps/landing --path=/shared` |
| `apps/mcp`     | `/mcp`                     | `infisical run --path=/mcp`                         |

## ⚠️ CRITICAL: Multiple --path Flag Behavior

**When using multiple `--path` flags, Infisical CLI only uses the LAST path, not all paths combined.**

```bash
# ❌ WRONG: Only /shared secrets are loaded (second path wins)
infisical run --path=/apps/web --path=/shared --env=dev -- npm start
# Result: Secrets from /apps/web are IGNORED

# ❌ WRONG: Only /apps/web secrets are loaded
infisical run --path=/shared --path=/apps/web --env=dev -- npm start
# Result: Secrets from /shared are IGNORED
```

**Solution: Put shared secrets in `/shared` path**

Since commands like `dev:web` use `--path=/apps/web --path=/shared`, any secret needed by web MUST be in `/shared` (the last path).

**Secrets that MUST be in `/shared`:**

- `JWT_ACCESS_SECRET` - Used by web, api, and other apps for token verification
- `JWT_REFRESH_SECRET` - Used for refresh token verification
- Any secret needed by multiple apps

**When adding new secrets:**

1. If the secret is app-specific AND not needed elsewhere → put in `/apps/{app-name}`
2. If the secret is needed by multiple apps OR used with multi-path commands → put in `/shared`

**Debugging missing secrets:**

```bash
# Check what secrets are actually exported with multiple paths
infisical export --path=/apps/web --path=/shared --env=dev

# If a secret is missing, check which path it's in
infisical secrets --path=/apps/web --env=dev | grep SECRET_NAME
infisical secrets --path=/shared --env=dev | grep SECRET_NAME

# Move secret to /shared if needed
infisical secrets set SECRET_NAME='value' --path=/shared --env=dev

# Verify it works
infisical run --path=/apps/web --path=/shared --env=dev -- sh -c 'echo $SECRET_NAME'
```

## Common Commands

### View Secrets

```bash
# List secrets in a folder
infisical secrets --path=/apps/api --env=dev

# Get specific secret value
infisical secrets get DATABASE_URL --path=/apps/api --env=dev
```

### Set Secrets

```bash
# Set single secret
infisical secrets set DATABASE_URL=postgres://... --path=/apps/api --env=dev

# Set multiple secrets
infisical secrets set \
  DATABASE_URL=postgres://... \
  REDIS_URL=redis://... \
  --path=/apps/api --env=dev

# Import from .env file
infisical secrets set --path=/apps/api --env=dev < apps/api/.env
```

### Export Secrets

```bash
# Export to .env format
infisical export --path=/apps/api --path=/shared --env=dev > apps/api/.env

# Export as JSON
infisical export --format=json --path=/apps/api --env=dev
```

### Run with Secrets

```bash
# Inject and run command
infisical run --path=/apps/api --path=/shared --env=dev -- npm start

# Multiple paths
infisical run --path=/apps/web --path=/shared --env=dev -- pnpm nx serve web
```

## Adding New Secrets

### Step 1: Determine Path

- App-specific → `/apps/{app-name}`
- Shared across apps → `/shared`
- MCP-only → `/mcp`
- SaaS logins → `/logins`
- Test fixtures → `/test`

### Step 2: Add to All Environments

```bash
# Development
infisical secrets set NEW_SECRET=dev_value --path=/apps/api --env=dev

# Staging
infisical secrets set NEW_SECRET=staging_value --path=/apps/api --env=staging

# Production
infisical secrets set NEW_SECRET=prod_value --path=/apps/api --env=prod
```

### Step 3: Update Documentation

- Add to `.env.example` files
- Update `docs/technical/INFISICAL-SETUP.md` if needed

## Machine Identities

### Creating Machine Identity

```bash
# Create machine identity for CI/CD
infisical machine-identity create \
  --name="github-actions" \
  --project-id=<project-id> \
  --environment=prod

# Get token
infisical machine-identity get-token --name="github-actions"
```

### Using in CI/CD

```yaml
# GitHub Actions
- name: Export secrets
  env:
    INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
  run: |
    infisical export --path=/apps/api --env=prod > .env
```

### Using in MCP

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
        "npx",
        "tsx",
        "apps/mcp/src/main.ts"
      ]
    }
  }
}
```

## SaaS Tool Logins (`/logins`)

### Naming Convention

- `{SERVICE}_EMAIL` - Email/username
- `{SERVICE}_PASSWORD` - Password (if applicable)
- `{SERVICE}_AUTH_METHOD` - Authentication method
- `{SERVICE}_API_KEY` - API key/token
- `{SERVICE}_URL` - Service URL (optional)

### Examples

```bash
# OAuth-based services
infisical secrets set RUNPOD_EMAIL=user@example.com --path=/logins --env=dev
infisical secrets set RUNPOD_AUTH_METHOD=oauth_google --path=/logins --env=dev
infisical secrets set RUNPOD_API_KEY=xxx --path=/logins --env=dev

# Password-based services
infisical secrets set HIGGSFIELD_EMAIL=user@example.com --path=/logins --env=dev
infisical secrets set HIGGSFIELD_PASSWORD=xxx --path=/logins --env=dev
```

## Best Practices

### 1. Put Shared Secrets in `/shared`

**Any secret used by multiple apps or in multi-path commands MUST be in `/shared`.**

```bash
# ✅ Good: JWT secrets in /shared (available to all apps)
infisical secrets set JWT_ACCESS_SECRET='value' --path=/shared --env=dev

# ❌ Bad: JWT secret only in /apps/web (won't load with multi-path command)
infisical secrets set JWT_ACCESS_SECRET='value' --path=/apps/web --env=dev
```

### 2. Use Narrowest Scope

```bash
# ✅ Good: Only request paths you need
infisical run --path=/apps/api --path=/shared --env=dev

# ❌ Bad: Request all paths
infisical run --path=/ --env=dev
```

### 2. Never Hardcode Secrets

```typescript
// ❌ Bad: Hardcoded secret
const apiKey = 'sk-1234567890';

// ✅ Good: Environment variable
const apiKey = process.env.API_KEY;
```

### 3. Use Machine Identities for Automation

```bash
# ✅ Good: Machine identity for CI/CD
infisical machine-identity create --name="github-actions"

# ❌ Bad: Personal token in CI/CD
INFISICAL_TOKEN=${{ secrets.INFISICAL_PERSONAL_TOKEN }}
```

### 4. Export for IDE Support

```bash
# ✅ Good: Export to gitignored .env for IDE autocomplete
infisical export --path=/apps/api --env=dev > apps/api/.env
# Add .env to .gitignore

# ❌ Bad: Commit .env files
git add apps/api/.env
```

### 5. Rotate Regularly

```bash
# Rotate machine identity token
infisical machine-identity rotate-token --name="github-actions"
```

### 6. Test Secret Injection

Always verify secrets load correctly after changes:

```bash
# Test that secrets are injected
infisical run --path=/apps/web --path=/shared --env=dev -- sh -c 'echo $JWT_ACCESS_SECRET'

# If empty, the secret is not in the correct path (see Critical section above)
```

## Troubleshooting

### Not Logged In

```bash
infisical login
```

### Permission Denied

Contact admin to grant access to required path/environment.

### Token Expired

```bash
# Personal token
infisical login

# Machine identity
infisical machine-identity rotate-token --name="mcp-server"
```

### Secrets Not Loading

1. Check path: `infisical secrets --path=/your/path --env=dev`
2. Verify login: `infisical whoami`
3. Check project: `cat .infisical.json`

### Secret Missing with Multiple --path Flags

**Symptom:** App logs show "JWT_ACCESS_SECRET not set" or similar, falling back to default values.

**Cause:** Multiple `--path` flags only use the LAST path. Secrets from earlier paths are ignored.

**Solution:**

```bash
# 1. Check which path the secret is in
infisical secrets --path=/apps/web --env=dev | grep JWT_ACCESS_SECRET
infisical secrets --path=/shared --env=dev | grep JWT_ACCESS_SECRET

# 2. If secret is only in /apps/web but command uses --path=/apps/web --path=/shared,
#    the secret won't be loaded. Move it to /shared:
infisical secrets set JWT_ACCESS_SECRET='your-value' --path=/shared --env=dev

# 3. Verify it works
infisical run --path=/apps/web --path=/shared --env=dev -- sh -c 'echo $JWT_ACCESS_SECRET'

# 4. Restart your dev server
```

See the "CRITICAL: Multiple --path Flag Behavior" section above for full details.

## Related Resources

- **Infisical Rule**: `.cursor/rules/infisical.mdc`
- **Setup Guide**: `docs/technical/INFISICAL-SETUP.md`
- **Environment Variables**: `.cursor/rules/environment-variables.mdc`
