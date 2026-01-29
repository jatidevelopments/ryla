# Quick Start Guide

**Status**: ✅ Modal tokens configured, ready to deploy!

---

## 🚀 Deploy to Fly.io (5 minutes)

### Step 1: Create Fly.io App

```bash
cd /Users/admin/Documents/Projects/RYLA
flyctl apps create ryla-workflow-agent
```

### Step 2: Set Modal Secrets

```bash
# Get secrets from Infisical and set in Fly.io
MODAL_TOKEN_ID=$(infisical secrets get MODAL_TOKEN_ID --path=/shared --env=dev --format=json | jq -r '.secretValue')
MODAL_TOKEN_ID_SECRET=$(infisical secrets get MODAL_TOKEN_ID_SECRET --path=/shared --env=dev --format=json | jq -r '.secretValue')

flyctl secrets set MODAL_TOKEN_ID="$MODAL_TOKEN_ID" -a ryla-workflow-agent
flyctl secrets set MODAL_TOKEN_ID_SECRET="$MODAL_TOKEN_ID_SECRET" -a ryla-workflow-agent
```

### Step 3: Deploy

```bash
# Deploy from repository root
flyctl deploy -c apps/workflow-agent/fly.toml -a ryla-workflow-agent
```

### Step 4: Verify

```bash
# Check status
flyctl status -a ryla-workflow-agent

# View logs
flyctl logs -a ryla-workflow-agent

# Test health check
curl https://ryla-workflow-agent.fly.dev/health
```

---

## ✅ Expected Result

Health check should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T...",
  "uptime": 123.456,
  "version": "0.1.0"
}
```

---

## 📝 Next: Add Slack & OpenAI

When you have the credentials:

```bash
# Store in Infisical
infisical secrets set SLACK_BOT_TOKEN=xxx --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=xxx --path=/apps/workflow-agent --env=dev
infisical secrets set OPENAI_API_KEY=xxx --path=/apps/workflow-agent --env=dev

# Set in Fly.io
flyctl secrets set SLACK_BOT_TOKEN=xxx -a ryla-workflow-agent
flyctl secrets set SLACK_SIGNING_SECRET=xxx -a ryla-workflow-agent
flyctl secrets set OPENAI_API_KEY=xxx -a ryla-workflow-agent

# Restart
flyctl apps restart ryla-workflow-agent
```

---

**Ready to deploy!** 🎉
