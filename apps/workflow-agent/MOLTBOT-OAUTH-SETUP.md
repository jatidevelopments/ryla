# Moltbot OAuth Setup for OpenAI (ChatGPT Subscription)

**Quick guide for setting up OAuth authentication with your ChatGPT subscription.**

---

## ✅ Why OAuth?

- **Uses your ChatGPT subscription** - No API key needed
- **No usage-based billing** - Uses subscription limits
- **Simpler setup** - Just log in once
- **Automatic token refresh** - Tokens managed automatically

---

## 🚀 Setup Steps

### Step 1: Run OAuth Login

**On the gateway host** (where Moltbot runs - in our case, the Fly.io container):

```bash
# Option A: Direct OAuth login
clawdbot models auth login --provider openai-codex

# Option B: Use onboarding wizard
clawdbot onboard --auth-choice openai-codex
```

### Step 2: Complete OAuth Flow

**What happens:**

1. **Browser opens** to `https://auth.openai.com/oauth/authorize`
2. **Log in** with your ChatGPT account
3. **Grant permission** to Moltbot
4. **Callback** - Tokens are automatically stored
5. **Done!** - Ready to use

**If running headless/remote:**

- The OAuth flow will provide a URL to paste
- Copy the redirect URL/code from the browser
- Paste it into the terminal when prompted

### Step 3: Verify Setup

```bash
# Check authentication status
clawdbot models status

# Should show:
# ✅ openai-codex: authenticated
#    Profile: openai-codex:default
#    Expires: [future date]
```

---

## 🔧 Configuration

### Model Reference

When using OAuth (Codex), use the `openai-codex/` provider prefix:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "openai-codex/gpt-4o"
        // or "openai-codex/gpt-5.2"
      }
    }
  }
}
```

**Important:** Use `openai-codex/` (not `openai/`) when using OAuth.

### Token Storage

Tokens are stored in:
```
~/.clawdbot/agents/<agentId>/agent/auth-profiles.json
```

**In Fly.io container:**
- Tokens are stored in the container's filesystem
- Persist across restarts (if using volumes)
- Or re-authenticate after container recreation

---

## 🔄 Token Refresh

**Automatic refresh:**
- Tokens refresh automatically when expired
- No manual intervention needed
- Refresh happens under file lock (safe for concurrent access)

**Manual refresh:**
```bash
# Check token status
clawdbot models status

# If expired, re-run OAuth
clawdbot models auth login --provider openai-codex
```

---

## 🐛 Troubleshooting

### "No credentials found"

**Solution:**
```bash
# Re-run OAuth login
clawdbot models auth login --provider openai-codex
```

### "Token expired"

**Solution:**
```bash
# Check status
clawdbot models status

# Re-authenticate if needed
clawdbot models auth login --provider openai-codex
```

### OAuth callback not working (headless/remote)

**Solution:**
1. OAuth flow will provide a URL to paste
2. Open the URL in a browser (on your local machine)
3. Complete the login
4. Copy the redirect URL/code
5. Paste it into the terminal

### Wrong provider prefix

**Error:** Using `openai/gpt-4o` instead of `openai-codex/gpt-4o`

**Solution:** Use `openai-codex/` prefix when using OAuth:
```json
{
  "model": {
    "primary": "openai-codex/gpt-4o"  // ✅ Correct
    // "openai/gpt-4o"  // ❌ Wrong (this is for API keys)
  }
}
```

---

## 📋 Quick Reference

```bash
# OAuth login
clawdbot models auth login --provider openai-codex

# Check status
clawdbot models status

# Verify in config
clawdbot models list

# Re-authenticate if needed
clawdbot models auth login --provider openai-codex
```

---

## 🔗 Related Documentation

- [Moltbot OAuth Concepts](https://docs.clawd.bot/concepts/oauth)
- [Moltbot OpenAI Provider](https://docs.clawd.bot/providers/openai)
- [Moltbot Gateway Authentication](https://docs.clawd.bot/gateway/authentication)

---

**Note:** OAuth tokens are stored locally in the agent's workspace. For Fly.io deployments, ensure tokens persist across container restarts (use volumes or re-authenticate after deployment).
