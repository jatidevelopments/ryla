# Cursor MCP Configuration

## Setup

1. Copy the example file to create your local config:

   ```bash
   cp .cursor/mcp.json.example .cursor/mcp.json
   ```

2. Set the required environment variables:

   - `RYLA_DEV_TOKEN` - JWT token for RYLA API (see Test User below)
   - `GITHUB_TOKEN` - GitHub personal access token
   - `SLACK_BOT_TOKEN` - Slack bot token
   - `SLACK_TEAM_ID` - Slack team ID
   - `POSTHOG_AUTH_HEADER` - PostHog authentication header
   - `RUNPOD_API_KEY` - RunPod API key
   - `SNYK_API_KEY` - Snyk API token for security scanning
   - `SNYK_ORG_ID` - (Optional) Snyk organization ID
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API token (for observability and bindings servers)
   - `PLAYWRIGHT_BASE_URL` - (Optional) Base URL for Playwright tests

3. Update the filesystem paths in `mcp.json` to match your local workspace paths.

4. Restart Cursor for changes to take effect.

## MCP Servers

- **ryla-api** - RYLA backend API (auth, characters, generation, debugging)
- **github** - GitHub integration (issues, PRs, repos)
- **slack** - Slack integration
- **filesystem** - File system access to workspace directories
- **playwright** - Browser automation and testing
- **posthog** - PostHog analytics integration
- **runpod** - RunPod GPU infrastructure
- **package-docs** - Package documentation lookup
- **snyk** - Snyk security vulnerability scanning
- **cloudflare-observability** - Cloudflare Workers observability and debugging
- **cloudflare-bindings** - Cloudflare Workers bindings management
- **cloudflare-docs** - Cloudflare documentation reference
- **cloudflare-browser** - Browser rendering and web scraping
- **cloudflare-builds** - Workers builds management and insights
- **cloudflare-radar** - Internet traffic insights and trends
- **cloudflare-container** - Sandbox development environments
- **cloudflare-logpush** - Logpush job health summaries
- **cloudflare-ai-gateway** - AI Gateway logs and details
- **cloudflare-autorag** - AutoRAG document management
- **cloudflare-auditlogs** - Audit log queries and reports
- **cloudflare-dns-analytics** - DNS performance optimization
- **cloudflare-dex** - Digital Experience Monitoring insights
- **cloudflare-casb** - Cloudflare One CASB security checks
- **cloudflare-graphql** - Analytics data via GraphQL API

## RYLA API Test User

A test user is available for MCP testing:

| Field | Value |
|-------|-------|
| Email | `mcptest99@ryla.dev` |
| Password | `TestPass123!` |
| User ID | `e57e0a15-cb59-4343-9c40-e31f3331086d` |
| Public Name | `mcptester99` |

### Get Token for MCP

```bash
# Via curl
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "mcptest99@ryla.dev", "password": "TestPass123!"}' \
  | jq -r '.tokens.accessToken'

# Then set in mcp.json or environment
export RYLA_DEV_TOKEN="<token>"
```

See `.cursor/rules/test-fixtures.mdc` for full test fixture documentation.

## Security

- `.cursor/mcp.json` is in `.gitignore` and should never be committed
- `.cursor/mcp.json.example` is tracked and serves as a template
- All sensitive tokens should use environment variables
