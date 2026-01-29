# Workflow Agent Deployment Guide

Complete guide for deploying the RYLA Workflow Agent to Fly.io.

## Prerequisites

1. **Modal.com Account**
   - Generate tokens: `modal token new`
   - Store in Infisical: `./scripts/setup-modal-token.sh`

2. **Slack Workspace**
   - Create Slack app: https://api.slack.com/apps
   - Get bot token and signing secret
   - Store in Infisical (you'll provide later)

3. **OpenAI API Key**
   - Get API key: https://platform.openai.com/api-keys
   - Store in Infisical (you'll provide later)

4. **Fly.io Account**
   - Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
   - Login: `flyctl auth login`

## Step 1: Generate Modal Tokens

If you don't have Modal tokens yet:

```bash
cd apps/workflow-agent
./scripts/setup-modal-token.sh
```

Or manually:

```bash
# Generate tokens
modal token new

# Store in Infisical
infisical secrets set MODAL_TOKEN_ID=xxx --path=/shared --env=dev
infisical secrets set MODAL_TOKEN_ID_SECRET=xxx --path=/shared --env=dev
```

## Step 2: Store Secrets in Infisical

```bash
# Modal tokens (already done if you ran setup script)
infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev
infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev

# Slack credentials (you'll provide later)
infisical secrets set SLACK_BOT_TOKEN=xoxb-xxx --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=xxx --path=/apps/workflow-agent --env=dev

# OpenAI API key (you'll provide later)
infisical secrets set OPENAI_API_KEY=sk-xxx --path=/apps/workflow-agent --env=dev
```

## Step 3: Test Locally

```bash
cd apps/workflow-agent

# Export secrets for local testing
infisical export --path=/apps/workflow-agent --path=/shared --env=dev > .env

# Install dependencies
npm install

# Run locally
npm run dev
```

Verify:
- Health check: `curl http://localhost:3000/health`
- Should see: `{"status":"healthy",...}`

## Step 4: Deploy to Fly.io

**Important**: The Dockerfile must be built from the repository root, not from `apps/workflow-agent/`. Fly.io will handle this automatically when you deploy from the root directory.

### Option A: Using Infisical Machine Identity (Recommended)

1. **Create Infisical machine identity**:
   ```bash
   infisical machine-identity create \
     --name="fly-workflow-agent" \
     --path="/apps/workflow-agent" \
     --path="/shared" \
     --env="dev"
   ```

2. **Get machine identity token**:
   ```bash
   TOKEN=$(infisical machine-identity get-token --name="fly-workflow-agent")
   ```

3. **Create Fly.io app**:
   ```bash
   flyctl apps create ryla-workflow-agent
   ```

4. **Set Infisical token**:
   ```bash
   flyctl secrets set INFISICAL_TOKEN="$TOKEN"
   ```

5. **Update Dockerfile to use Infisical** (if needed):
   - Add Infisical CLI installation
   - Use `infisical run` in CMD

### Option B: Direct Secrets (Simpler for MVP)

1. **Create Fly.io app**:
   ```bash
   flyctl apps create ryla-workflow-agent
   ```

2. **Export secrets from Infisical**:
   ```bash
   MODAL_TOKEN_ID=$(infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev)
   MODAL_TOKEN_ID_SECRET=$(infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev)
   # SLACK_BOT_TOKEN and OPENAI_API_KEY will be set later
   ```

3. **Set secrets in Fly.io**:
   ```bash
   flyctl secrets set MODAL_TOKEN_ID="$MODAL_TOKEN_ID"
   flyctl secrets set MODAL_TOKEN_ID_SECRET="$MODAL_TOKEN_ID_SECRET"
   # Add Slack and OpenAI when you have them:
   # flyctl secrets set SLACK_BOT_TOKEN=xxx
   # flyctl secrets set SLACK_SIGNING_SECRET=xxx
   # flyctl secrets set OPENAI_API_KEY=xxx
   ```

4. **Deploy**:
   ```bash
   flyctl deploy
   ```

## Step 5: Verify Deployment

```bash
# Check status
flyctl status

# View logs
flyctl logs

# Test health check
curl https://ryla-workflow-agent.fly.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0"
}
```

## Step 6: Configure Slack Webhook

1. **Get webhook URL**:
   - Your Fly.io app URL: `https://ryla-workflow-agent.fly.dev`
   - Webhook endpoint: `https://ryla-workflow-agent.fly.dev/slack/webhook`

2. **Configure in Slack**:
   - Go to your Slack app settings
   - Add webhook URL to Event Subscriptions
   - Subscribe to: `message.channels`, `file_shared`

3. **Update secrets** (when you have Slack credentials):
   ```bash
   flyctl secrets set SLACK_BOT_TOKEN=xxx
   flyctl secrets set SLACK_SIGNING_SECRET=xxx
   ```

4. **Restart app**:
   ```bash
   flyctl apps restart ryla-workflow-agent
   ```

## Step 7: Test Workflow Deployment

1. **Upload workflow.json to Slack**:
   - Upload a ComfyUI workflow JSON file
   - Or paste JSON in a message

2. **Agent will**:
   - Acknowledge receipt
   - Analyze workflow
   - Generate deployment code
   - Deploy to Modal.com
   - Test endpoint
   - Send success/failure notification

## Troubleshooting

### Modal CLI not found
```bash
# Check if Modal is installed in container
flyctl ssh console -a ryla-workflow-agent
modal --version
```

### Workflow deployment fails
- Check logs: `flyctl logs`
- Verify Modal tokens: `flyctl secrets list`
- Test Modal CLI: `flyctl ssh console -a ryla-workflow-agent` then `modal app list`

### Slack webhook not receiving events
- Verify webhook URL is correct
- Check Slack app Event Subscriptions settings
- Verify signing secret matches

## Next Steps

Once deployed and working:
1. ✅ EP-061: Foundation complete
2. 🔄 EP-062: Slack integration (in progress)
3. 📝 EP-063: Workflow orchestration (ready to test)
4. 📝 EP-064: Error handling (next)
5. 📝 EP-065: Cost tracking (next)
6. 📝 EP-066: Knowledge base (next)

## References

- [EP-061: Moltbot Agent Setup](../../../docs/requirements/epics/ops/EP-061-clawdbot-agent-fly-io-deployment.md)
- [IN-031: Agentic Workflow Deployment](../../../docs/initiatives/IN-031-agentic-workflow-deployment.md)
- [Fly.io Documentation](https://fly.io/docs/)
- [Infisical Documentation](https://infisical.com/docs)
