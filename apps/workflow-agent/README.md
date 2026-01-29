# RYLA Workflow Agent

Autonomous AI agent for ComfyUI workflow deployment to Modal.com.

## Overview

This agent automatically:
- Analyzes ComfyUI workflow JSON
- Generates deployment code
- Deploys to Modal.com
- Tests endpoints
- Handles errors iteratively
- Tracks costs and enforces limits
- Documents learnings

## Architecture

```
Fly.io App (ryla-workflow-agent)
├── Docker Container
│   ├── Moltbot (Node.js)
│   ├── Python 3.10+ (Modal CLI)
│   ├── Git (repository access)
│   └── Credentials (from Infisical)
└── Health Checks
```

## Setup

### Prerequisites

- Fly.io account and CLI
- Infisical account and CLI
- Modal.com account (with tokens) ✅ **Done**
- Slack workspace (for bot) - [Get credentials](./GET-CREDENTIALS.md#-slack-credentials)
- OpenAI API key (for GPT-4o) - [Get API key](./GET-CREDENTIALS.md#-openai-api-key)

### Modal Token Setup

If you don't have Modal tokens yet:

1. **Generate Modal tokens**:
   ```bash
   modal token new
   ```
   This outputs:
   - `MODAL_TOKEN_ID`
   - `MODAL_TOKEN_SECRET`

2. **Store in Infisical**:
   ```bash
   # Use the setup script
   ./scripts/setup-modal-token.sh
   
   # Or manually:
   infisical secrets set MODAL_TOKEN_ID=xxx --path=/shared --env=dev
   infisical secrets set MODAL_TOKEN_ID_SECRET=xxx --path=/shared --env=dev
   ```

3. **Verify tokens**:
   ```bash
   infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev
   infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev
   ```

### Local Development

1. **Install dependencies**:
   ```bash
   cd apps/workflow-agent
   npm install
   ```

2. **Set up environment variables** (via Infisical):
   ```bash
   # Export secrets from Infisical
   infisical export --path=/apps/workflow-agent --path=/shared --env=dev > .env
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

### Deployment to Fly.io

1. **Create Fly.io app**:
   ```bash
   flyctl apps create ryla-workflow-agent
   ```

2. **Set secrets** (via Infisical or Fly.io):
   ```bash
   # Option 1: Use Infisical machine identity in Fly.io (recommended)
   # This allows Fly.io to fetch secrets from Infisical at runtime
   # See: https://docs.infisical.com/integrations/platforms/fly-io
   
   # Option 2: Export from Infisical and set as Fly.io secrets
   export MODAL_TOKEN_ID=$(infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev)
   export MODAL_TOKEN_ID_SECRET=$(infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev)
   
   flyctl secrets set MODAL_TOKEN_ID="$MODAL_TOKEN_ID"
   flyctl secrets set MODAL_TOKEN_ID_SECRET="$MODAL_TOKEN_ID_SECRET"
   # SLACK_BOT_TOKEN and OPENAI_API_KEY will be set later
   ```

3. **Deploy**:
   ```bash
   flyctl deploy
   ```

4. **Check status**:
   ```bash
   flyctl status
   flyctl logs
   ```

## Configuration

### Required Secrets

**From Infisical** (`/shared` or `/apps/workflow-agent`):

- `MODAL_TOKEN_ID` - Modal.com authentication token ID
  - Generate with: `modal token new`
  - Store in: `/shared` (accessible to all apps)
- `MODAL_TOKEN_ID_SECRET` - Modal.com authentication token secret
  - Generate with: `modal token new`
  - Store in: `/shared` (accessible to all apps)
- `SLACK_BOT_TOKEN` - Slack bot token (you'll provide later)
- `SLACK_SIGNING_SECRET` - Slack webhook signing secret (you'll provide later)
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o (you'll provide later)

### Optional Secrets

- `GIT_SSH_KEY` - SSH key for repository access
- `GIT_REPO_URL` - Repository URL

## Health Checks

The agent exposes a health check endpoint at `/health`:

```bash
curl https://ryla-workflow-agent.fly.dev/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0"
}
```

## Development Status

**Current Phase**: EP-061 (Foundation Setup)

**Completed**:
- ✅ Basic app structure
- ✅ Dockerfile and fly.toml
- ✅ Health check endpoint
- ✅ Configuration loader

**In Progress**:
- 🔄 Moltbot integration
- 🔄 Slack integration
- 🔄 Workflow deployment orchestration

## Related Epics

- **EP-061**: Moltbot Agent Setup & Fly.io Deployment (Foundation)
- **EP-062**: Slack Integration & Workflow Upload
- **EP-063**: Workflow Deployment Orchestration
- **EP-064**: Error Handling & Iterative Fixes
- **EP-065**: Cost Tracking & Limits
- **EP-066**: Knowledge Base & Documentation

## References

- [IN-031: Agentic Workflow Deployment](../../../docs/initiatives/IN-031-agentic-workflow-deployment.md)
- [EP-061: Moltbot Agent Setup](../../../docs/requirements/epics/ops/EP-061-clawdbot-agent-fly-io-deployment.md)
- [Moltbot Documentation](https://docs.clawd.bot/)
- [Fly.io Documentation](https://fly.io/docs/)
