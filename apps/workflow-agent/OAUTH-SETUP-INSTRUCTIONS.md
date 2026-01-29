# OAuth Setup Instructions for Workflow Agent

**Quick guide for setting up OAuth authentication with ChatGPT subscription on Fly.io.**

---

## ✅ Why OAuth?

- **Uses your ChatGPT subscription** - No API key needed
- **No usage-based billing** - Uses subscription limits
- **Simpler setup** - Just log in once
- **Automatic token refresh** - Tokens managed automatically

---

## 🚀 Setup Steps

### Step 1: Access Fly.io Container

```bash
# SSH into the running container
flyctl ssh console -a ryla-workflow-agent

# Or if you need to run commands directly
flyctl ssh console -a ryla-workflow-agent -C "clawdbot models auth login --provider openai-codex"
```

### Step 2: Run OAuth Login

**Inside the container:**

```bash
# Run OAuth login
clawdbot models auth login --provider openai-codex
```

**What happens:**
1. OAuth flow starts
2. If headless, you'll get a URL to paste
3. Open the URL in your browser (on your local machine)
4. Log in with your ChatGPT account
5. Grant permission
6. Copy the redirect URL/code
7. Paste it back into the terminal

### Step 3: Verify Setup

```bash
# Check authentication status
clawdbot models status

# Should show:
# ✅ openai-codex: authenticated
```

---

## 🔧 Configuration

### Update Agent Config

After OAuth is set up, ensure your agent uses the OAuth provider:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai-codex/gpt-4o"
      }
    }
  }
}
```

**Important:** Use `openai-codex/` prefix (not `openai/`) when using OAuth.

---

## 💾 Persisting Tokens

**Challenge:** Fly.io containers are ephemeral - tokens may be lost on restart.

**Solutions:**

### Option 1: Use Fly.io Volumes (Recommended)

```bash
# Create a volume for Moltbot state
flyctl volumes create clawdbot_state --size 1 --region iad -a ryla-workflow-agent

# Mount it in fly.toml
# [mounts]
#   source = "clawdbot_state"
#   destination = "/root/.clawdbot"
```

### Option 2: Re-authenticate After Deployment

If tokens are lost, re-run OAuth login after each deployment:

```bash
flyctl ssh console -a ryla-workflow-agent -C "clawdbot models auth login --provider openai-codex"
```

### Option 3: Store Tokens in Secrets (Advanced)

Extract tokens from `auth-profiles.json` and store in Fly.io secrets (not recommended for security).

---

## 🔄 Token Refresh

**Automatic:**
- Tokens refresh automatically when expired
- No manual intervention needed

**Manual refresh:**
```bash
# Check status
flyctl ssh console -a ryla-workflow-agent -C "clawdbot models status"

# Re-authenticate if expired
flyctl ssh console -a ryla-workflow-agent -C "clawdbot models auth login --provider openai-codex"
```

---

## 🐛 Troubleshooting

### "No credentials found"

**Solution:**
```bash
# Re-run OAuth login
flyctl ssh console -a ryla-workflow-agent -C "clawdbot models auth login --provider openai-codex"
```

### OAuth callback not working (headless)

**Solution:**
1. OAuth flow will provide a URL to paste
2. Open the URL in a browser (on your local machine)
3. Complete the login
4. Copy the redirect URL/code
5. Paste it into the terminal

### Tokens lost after restart

**Solution:**
- Use Fly.io volumes to persist tokens (see above)
- Or re-authenticate after each deployment

---

## 📋 Quick Reference

```bash
# SSH into container
flyctl ssh console -a ryla-workflow-agent

# OAuth login
clawdbot models auth login --provider openai-codex

# Check status
clawdbot models status

# Verify in config
clawdbot models list
```

---

## 🔗 Related Documentation

- [MOLTBOT-OAUTH-SETUP.md](./MOLTBOT-OAUTH-SETUP.md) - General OAuth guide
- [MOLTBOT-OPENAI-SETUP.md](./MOLTBOT-OPENAI-SETUP.md) - Complete OpenAI setup guide
- [Moltbot OAuth Docs](https://docs.clawd.bot/concepts/oauth)
- [Moltbot OpenAI Provider](https://docs.clawd.bot/providers/openai)

---

**Note:** OAuth tokens are stored in the container's filesystem. Use Fly.io volumes to persist them across restarts, or re-authenticate after deployments.
