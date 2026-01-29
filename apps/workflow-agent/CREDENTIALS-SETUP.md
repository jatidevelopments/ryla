# Complete Credentials Setup Guide

Quick reference for setting up all required credentials for the workflow agent.

---

## 📋 Required Credentials

| Credential | Status | Where to Get | Storage Location |
|------------|--------|--------------|------------------|
| **Modal Token ID** | ✅ Done | `modal token new` | `/shared` in Infisical |
| **Modal Token Secret** | ✅ Done | `modal token new` | `/shared` in Infisical |
| **Slack Bot Token** | ⏳ Needed | [Slack App Setup](./SLACK-SETUP.md) | `/apps/workflow-agent` |
| **Slack Signing Secret** | ⏳ Needed | [Slack App Setup](./SLACK-SETUP.md) | `/apps/workflow-agent` |
| **OpenAI API Key** | ⏳ Needed | [OpenAI Setup](./MOLTBOT-OPENAI-SETUP.md) | `/apps/workflow-agent` |

---

## 🚀 Quick Setup

### 1. Slack Credentials

**Get them here**: https://api.slack.com/apps

**Steps**:
1. Create new app → "From scratch"
2. Go to "OAuth & Permissions" → Install to workspace → Copy `xoxb-...` token
3. Go to "Basic Information" → Copy "Signing Secret"
4. See [SLACK-SETUP.md](./SLACK-SETUP.md) for detailed steps

**Store**:
```bash
infisical secrets set SLACK_BOT_TOKEN=xoxb-xxx --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=xxx --path=/apps/workflow-agent --env=dev

flyctl secrets set SLACK_BOT_TOKEN=xoxb-xxx -a ryla-workflow-agent
flyctl secrets set SLACK_SIGNING_SECRET=xxx -a ryla-workflow-agent
```

### 2. OpenAI API Key

**Get it here**: https://platform.openai.com/api-keys

**Steps**:
1. Create new secret key
2. Copy key (starts with `sk-`)
3. Set usage limits ($20/month recommended)
4. See [MOLTBOT-OPENAI-SETUP.md](./MOLTBOT-OPENAI-SETUP.md) for details

**Store**:
```bash
infisical secrets set OPENAI_API_KEY=sk-xxx --path=/apps/workflow-agent --env=dev

flyctl secrets set OPENAI_API_KEY=sk-xxx -a ryla-workflow-agent
```

### 3. Restart App

After adding all credentials:

```bash
flyctl apps restart ryla-workflow-agent
```

---

## ✅ Verification

```bash
# Check all secrets in Fly.io
flyctl secrets list -a ryla-workflow-agent

# Check logs for initialization
flyctl logs -a ryla-workflow-agent | grep -i "slack\|openai\|modal"

# Test health
curl https://ryla-workflow-agent.fly.dev/health
```

---

## 📚 Detailed Guides

- **Slack Setup**: [SLACK-SETUP.md](./SLACK-SETUP.md)
- **OpenAI Setup**: [MOLTBOT-OPENAI-SETUP.md](./MOLTBOT-OPENAI-SETUP.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Note on "OAuth with ChatGPT"**: 

Moltbot/Clawdbot doesn't use OAuth authentication. It uses direct API key authentication with OpenAI. You provide the OpenAI API key, and Moltbot uses it to make API calls. This is simpler than OAuth and is the standard way to use OpenAI's API.

The setup is:
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Store it as `OPENAI_API_KEY`
3. Moltbot will use it automatically

No OAuth flow needed! 🎉
