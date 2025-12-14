# Cursor MCP Configuration

## Setup

1. Copy the example file to create your local config:
   ```bash
   cp .cursor/mcp.json.example .cursor/mcp.json
   ```

2. Set the required environment variables:
   - `GITHUB_TOKEN` - GitHub personal access token
   - `SLACK_BOT_TOKEN` - Slack bot token
   - `SLACK_TEAM_ID` - Slack team ID
   - `POSTHOG_AUTH_HEADER` - PostHog authentication header
   - `RUNPOD_API_KEY` - RunPod API key
   - `PLAYWRIGHT_BASE_URL` - (Optional) Base URL for Playwright tests

3. Update the filesystem paths in `mcp.json` to match your local workspace paths.

4. Restart Cursor for changes to take effect.

## MCP Servers

- **github** - GitHub integration (issues, PRs, repos)
- **slack** - Slack integration
- **filesystem** - File system access to workspace directories
- **playwright** - Browser automation and testing
- **posthog** - PostHog analytics integration
- **runpod** - RunPod GPU infrastructure
- **package-docs** - Package documentation lookup

## Security

- `.cursor/mcp.json` is in `.gitignore` and should never be committed
- `.cursor/mcp.json.example` is tracked and serves as a template
- All sensitive tokens should use environment variables
