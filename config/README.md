# Configuration

Application configuration files, environment settings, and secrets management.

## Secrets Management

RYLA uses **Infisical** for centralized secrets management.

### Quick Start

```bash
# 1. Install Infisical CLI
brew install infisical/get-cli/infisical

# 2. Login
infisical login

# 3. Initialize project
cd /path/to/RYLA
infisical init

# 4. Run with secrets
infisical run --path=/apps/api --path=/shared --env=dev -- pnpm nx serve api
```

### Documentation

- **Setup Guide**: `docs/technical/INFISICAL-SETUP.md`
- **Secrets Template**: `config/infisical-secrets-template.md`
- **Cursor Rule**: `.cursor/rules/infisical.mdc`
- **MCP Config Example**: `.cursor/mcp.json.infisical.example`

### Folder Structure in Infisical

```
RYLA Project
├── /mcp              # MCP server secrets (Cursor IDE)
├── /apps/api         # Backend API secrets
├── /apps/web         # Web app secrets
├── /apps/funnel      # Funnel app secrets
├── /apps/landing     # Landing page secrets
├── /shared           # Shared across apps
└── /test             # Test fixtures/credentials
```

## Files

| File | Description | Committed |
|------|-------------|-----------|
| `infisical-secrets-template.md` | All secrets reference | ✅ Yes |

### For Local Development

```bash
# Export secrets to .env for IDE support
infisical export --path=/apps/api --path=/shared --env=dev > apps/api/.env
```

### For Applications

| Application | Infisical Paths | Command |
|-------------|-----------------|---------|
| `apps/api` | `/apps/api`, `/shared` | `infisical run --path=/apps/api --path=/shared --env=dev -- pnpm nx serve api` |
| `apps/web` | `/apps/web`, `/shared` | `infisical run --path=/apps/web --path=/shared --env=dev -- pnpm nx serve web` |
| `apps/funnel` | `/apps/funnel`, `/shared` | `infisical run --path=/apps/funnel --path=/shared --env=dev -- pnpm nx serve funnel` |
| `apps/landing` | `/apps/landing`, `/shared` | `infisical run --path=/apps/landing --path=/shared --env=dev -- pnpm nx serve landing` |
| `apps/mcp` | `/mcp` | `infisical run --path=/mcp --env=dev -- npx tsx apps/mcp/src/main.ts` |

## Legacy Files (Removed)

The following legacy files have been removed in favor of Infisical:

- ~~`credentials.csv`~~ - Use Infisical `/test` folder instead
- ~~`env.template`~~ - Use `infisical-secrets-template.md` instead
- ~~`mcp.config.json`~~ - Use `.cursor/mcp.json` instead
- `.env` files scattered in apps - Use `infisical run` instead

## Configuration Categories

- **Database settings** - PostgreSQL connection parameters
- **API settings** - Ports, hosts, CORS configuration
- **Authentication settings** - JWT secrets, OAuth credentials
- **Logging settings** - Log levels, output formats
- **Feature flags** - Enable/disable features per environment
- **External services** - API keys for third-party services

## Security Notes

1. **Never commit secrets** - All `.env` files are gitignored
2. **Use Infisical** - Centralized, encrypted, audited
3. **Scope access** - Use appropriate Infisical paths per app
4. **Rotate regularly** - Especially after team changes
5. **Environment separation** - dev/staging/prod are isolated

## Related Documentation

- [Infisical Setup](../docs/technical/INFISICAL-SETUP.md)
- [Environment Variables Rule](../.cursor/rules/environment-variables.mdc)
- [Security Best Practices](../.cursor/rules/security.mdc)
