# Next Steps for Workflow Agent Deployment

**Status**: ✅ Modal tokens stored in Infisical  
**Next**: Deploy to Fly.io

---

## ✅ Completed

- [x] Modal tokens generated
- [x] Modal tokens stored in Infisical (`/shared`)
- [x] Dependencies installed
- [x] Configuration updated (Slack/OpenAI optional for now)

---

## 🚀 Ready to Deploy

### Option 1: Quick Deploy (Direct Secrets)

Since Modal tokens are already in Infisical, you can deploy directly:

```bash
# From repository root
cd /Users/admin/Documents/Projects/RYLA

# 1. Create Fly.io app
flyctl apps create ryla-workflow-agent

# 2. Export secrets and set in Fly.io
export MODAL_TOKEN_ID=$(infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev --format=json | jq -r '.secretValue')
export MODAL_TOKEN_ID_SECRET=$(infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev --format=json | jq -r '.secretValue')

flyctl secrets set MODAL_TOKEN_ID="$MODAL_TOKEN_ID"
flyctl secrets set MODAL_TOKEN_ID_SECRET="$MODAL_TOKEN_ID_SECRET"

# 3. Deploy
flyctl deploy -c apps/workflow-agent/fly.toml
```

### Option 2: Test Locally First (Recommended)

Test the agent locally before deploying:

```bash
cd /Users/admin/Documents/Projects/RYLA/apps/workflow-agent

# Export secrets
infisical export --path=/apps/workflow-agent --path=/shared --env=dev > .env

# Run locally
npm run dev
```

In another terminal:
```bash
# Test health check
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T...",
  "uptime": 0.123,
  "version": "0.1.0"
}
```

---

## 📋 After Deployment

### 1. Verify Deployment

```bash
# Check status
flyctl status -a ryla-workflow-agent

# View logs
flyctl logs -a ryla-workflow-agent

# Test health check
curl https://ryla-workflow-agent.fly.dev/health
```

### 2. Add Slack & OpenAI Credentials (When Ready)

```bash
# Store in Infisical
infisical secrets set SLACK_BOT_TOKEN=xoxb-xxx --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=xxx --path=/apps/workflow-agent --env=dev
infisical secrets set OPENAI_API_KEY=sk-xxx --path=/apps/workflow-agent --env=dev

# Update Fly.io secrets
flyctl secrets set SLACK_BOT_TOKEN=xxx -a ryla-workflow-agent
flyctl secrets set SLACK_SIGNING_SECRET=xxx -a ryla-workflow-agent
flyctl secrets set OPENAI_API_KEY=xxx -a ryla-workflow-agent

# Restart app
flyctl apps restart ryla-workflow-agent
```

### 3. Configure Slack Webhook

1. Go to https://api.slack.com/apps
2. Select your app
3. Go to "Event Subscriptions"
4. Enable events
5. Add Request URL: `https://ryla-workflow-agent.fly.dev/slack/webhook`
6. Subscribe to events:
   - `message.channels`
   - `file_shared`

---

## 🧪 Testing Workflow Deployment

Once deployed and Slack is configured:

1. **Upload workflow.json to Slack channel**
2. **Agent will**:
   - Acknowledge receipt
   - Analyze workflow
   - Generate Modal code
   - Deploy to Modal.com
   - Test endpoint
   - Send notification with endpoint URL

---

## 📊 Current Status

**EP-061 Progress**:
- ✅ App structure: Complete
- ✅ Modal tokens: Stored in Infisical
- ✅ Configuration: Ready
- ⏳ Local test: Ready to run
- ⏳ Fly.io deployment: Ready to deploy
- ⏳ Slack integration: Pending credentials
- ⏳ OpenAI integration: Pending credentials

---

## 🐛 Troubleshooting

### Modal CLI not working
```bash
# SSH into Fly.io container
flyctl ssh console -a ryla-workflow-agent

# Test Modal CLI
modal --version
modal app list
```

### Health check failing
```bash
# Check logs
flyctl logs -a ryla-workflow-agent

# Check if app is running
flyctl status -a ryla-workflow-agent
```

### Secrets not loading
```bash
# Verify secrets in Fly.io
flyctl secrets list -a ryla-workflow-agent

# Verify secrets in Infisical
infisical secrets --path=/shared --env=dev
```

---

**Ready to deploy!** 🚀
