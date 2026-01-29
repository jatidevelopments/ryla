# How to Get Credentials

Quick guide to get all required credentials for the workflow agent.

---

## 🔑 Slack Credentials

### Where to Get Them

**URL**: https://api.slack.com/apps

### Step-by-Step

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Click **"Create New App"** → **"From scratch"**
   - Name: `RYLA Workflow Agent`
   - Select your workspace
   - Click **"Create App"**

2. **Get Bot Token** (`SLACK_BOT_TOKEN`):
   - Go to **"OAuth & Permissions"** (left sidebar)
   - Scroll to **"Bot Token Scopes"**, add:
     - `chat:write`
     - `files:read`
     - `channels:history`
     - `channels:read`
   - Click **"Install to Workspace"** → **"Allow"**
   - Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)
   - This is your `SLACK_BOT_TOKEN`

3. **Get Signing Secret** (`SLACK_SIGNING_SECRET`):
   - Go to **"Basic Information"** (left sidebar)
   - Scroll to **"App Credentials"**
   - Find **"Signing Secret"**
   - Click **"Show"** and copy it
   - This is your `SLACK_SIGNING_SECRET`

### Store Them

```bash
# In Infisical
infisical secrets set SLACK_BOT_TOKEN=xoxb-your-token --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=your-secret --path=/apps/workflow-agent --env=dev

# In Fly.io
flyctl secrets set SLACK_BOT_TOKEN=xoxb-your-token -a ryla-workflow-agent
flyctl secrets set SLACK_SIGNING_SECRET=your-secret -a ryla-workflow-agent
```

**See**: [SLACK-SETUP.md](./SLACK-SETUP.md) for detailed instructions

---

## 🤖 OpenAI API Key

### Where to Get It

**URL**: https://platform.openai.com/api-keys

### Step-by-Step

1. **Go to OpenAI Platform**:
   - Visit: https://platform.openai.com/api-keys
   - Sign in (or create account)

2. **Create API Key**:
   - Click **"Create new secret key"**
   - Name: `RYLA Workflow Agent`
   - Click **"Create secret key"**
   - **⚠️ Copy immediately** - you won't see it again!
   - Key starts with `sk-`

3. **Set Usage Limits** (Recommended):
   - Go to: https://platform.openai.com/account/limits
   - Set hard limit: $20/month

### Store It

```bash
# In Infisical
infisical secrets set OPENAI_API_KEY=sk-your-key --path=/apps/workflow-agent --env=dev

# In Fly.io
flyctl secrets set OPENAI_API_KEY=sk-your-key -a ryla-workflow-agent
```

**See**: [MOLTBOT-OPENAI-SETUP.md](./MOLTBOT-OPENAI-SETUP.md) for details

---

## 📝 About "OAuth with ChatGPT"

**You asked about OAuth with ChatGPT for Clawdbot.**

**Answer**: Moltbot/Clawdbot **does NOT use OAuth**. It uses **direct API key authentication**:

- ✅ **What you need**: OpenAI API key (from https://platform.openai.com/api-keys)
- ✅ **How it works**: You provide the API key, Moltbot uses it to call OpenAI
- ❌ **Not needed**: OAuth flow, login process, or ChatGPT account linking

**This is simpler** - just get an API key and provide it. No OAuth setup required!

---

## ✅ Quick Checklist

- [ ] Create Slack app at https://api.slack.com/apps
- [ ] Get `SLACK_BOT_TOKEN` (from OAuth & Permissions)
- [ ] Get `SLACK_SIGNING_SECRET` (from Basic Information)
- [ ] Get `OPENAI_API_KEY` from https://platform.openai.com/api-keys
- [ ] Store all in Infisical
- [ ] Set all in Fly.io
- [ ] Restart app: `flyctl apps restart ryla-workflow-agent`

---

## 🚀 After Getting Credentials

```bash
# 1. Store in Infisical
infisical secrets set SLACK_BOT_TOKEN=xoxb-xxx --path=/apps/workflow-agent --env=dev
infisical secrets set SLACK_SIGNING_SECRET=xxx --path=/apps/workflow-agent --env=dev
infisical secrets set OPENAI_API_KEY=sk-xxx --path=/apps/workflow-agent --env=dev

# 2. Set in Fly.io
flyctl secrets set SLACK_BOT_TOKEN=xoxb-xxx -a ryla-workflow-agent
flyctl secrets set SLACK_SIGNING_SECRET=xxx -a ryla-workflow-agent
flyctl secrets set OPENAI_API_KEY=sk-xxx -a ryla-workflow-agent

# 3. Restart app
flyctl apps restart ryla-workflow-agent

# 4. Verify
flyctl logs -a ryla-workflow-agent | grep -i "slack\|openai"
```

---

**That's it!** No OAuth needed - just API keys. 🎉
