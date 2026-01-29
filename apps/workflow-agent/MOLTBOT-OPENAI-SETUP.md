# Moltbot/Clawdbot OpenAI Setup Guide

Guide for configuring Moltbot (Clawdbot) with OpenAI. **Two options available:**

1. **OAuth with ChatGPT Subscription** (Recommended) - Uses your existing ChatGPT subscription
2. **API Key** - Direct API access with usage-based billing

---

## ✅ Option 1: OAuth with ChatGPT Subscription (Recommended)

**Best for:** Using your existing ChatGPT subscription without API key management.

Moltbot supports **OAuth authentication** with OpenAI using your ChatGPT account. This lets you use your subscription instead of creating API keys.

### How It Works

- Uses your **ChatGPT subscription** (no API key needed)
- OAuth login flow via `https://auth.openai.com/oauth/authorize`
- Tokens stored in `~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`
- Automatic token refresh
- No usage-based billing (uses subscription limits)

### Setup Steps

**On the gateway host** (where Moltbot runs):

```bash
# Run OAuth login
clawdbot models auth login --provider openai-codex

# Or use the wizard
clawdbot onboard --auth-choice openai-codex
```

**What happens:**
1. Opens browser to `https://auth.openai.com/oauth/authorize`
2. You log in with your ChatGPT account
3. Grants permission to Moltbot
4. Tokens are stored automatically
5. Ready to use!

**Verify:**
```bash
clawdbot models status
```

**Model reference:**
- Use `openai-codex/gpt-4o` or `openai-codex/gpt-5.2` in config
- Provider prefix: `openai-codex/` (not `openai/`)

---

## Option 2: API Key (Alternative)

**Best for:** Direct API access and usage-based billing.

If you prefer API key authentication:

---

### Step 1: Get OpenAI API Key

1. **Go to OpenAI Platform**:
   - Visit: https://platform.openai.com/api-keys
   - Sign in or create account

2. **Create API Key**:
   - Click **"Create new secret key"**
   - Give it a name: `RYLA Workflow Agent`
   - Click **"Create secret key"**
   - **IMPORTANT**: Copy the key immediately (you won't see it again!)
   - It starts with `sk-`

3. **Set Usage Limits** (Recommended):
   - Go to: https://platform.openai.com/account/limits
   - Set hard limit: $20/month (or your preferred limit)
   - This prevents runaway costs

---

### Step 2: Store OpenAI API Key

### In Infisical:

```bash
# Store OpenAI API key
infisical secrets set OPENAI_API_KEY=sk-your-key-here --path=/apps/workflow-agent --env=dev

# Also for production
infisical secrets set OPENAI_API_KEY=sk-your-key-here --path=/apps/workflow-agent --env=prod
```

### In Fly.io:

```bash
# Set secret in Fly.io
flyctl secrets set OPENAI_API_KEY=sk-your-key-here -a ryla-workflow-agent

# Restart app
flyctl apps restart ryla-workflow-agent
```

---

### Step 3: Configure Moltbot (When Integrated)

Once Moltbot is properly integrated, it will:

1. **Read OpenAI API key** from environment variable `OPENAI_API_KEY`
2. **Use GPT-4o model** (configured in code)
3. **Make API calls** to OpenAI for workflow deployment tasks

**Current Status**: Moltbot integration is a placeholder. The agent currently uses the OpenAI API key for:
- Workflow analysis
- Code generation
- Error handling
- Future Moltbot integration

---

## Model Configuration

**Recommended**: GPT-4o

- **Model**: `gpt-4o`
- **Cost**: ~$2-3/month (100 workflows)
- **Quality**: Excellent for coding tasks
- **Context**: 128K tokens

**Alternative**: GPT-5.2 (if available)
- **Model**: `gpt-5.2`
- **Cost**: ~$2-3.50/month
- **Quality**: Best for coding tasks

---

## Cost Management

### Set Usage Limits

1. **OpenAI Dashboard**:
   - Go to: https://platform.openai.com/account/limits
   - Set **Hard limit**: $20/month
   - Set **Soft limit**: $15/month (warning)

2. **Monitor Usage**:
   - Check: https://platform.openai.com/usage
   - Track API calls and costs

### Estimated Costs

| Usage | GPT-4o Cost | GPT-5.2 Cost |
|-------|------------|--------------|
| 10 workflows/month | ~$0.20-0.30 | ~$0.20-0.35 |
| 100 workflows/month | ~$2.00-3.00 | ~$2.00-3.50 |
| 1000 workflows/month | ~$20-30 | ~$20-35 |

---

## Testing

After setting up:

1. **Verify key is set**:
   ```bash
   # Check in Infisical
   infisical secrets get OPENAI_API_KEY --path=/apps/workflow-agent --env=dev
   
   # Check in Fly.io
   flyctl secrets list -a ryla-workflow-agent | grep OPENAI
   ```

2. **Test API key** (optional):
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer sk-your-key-here"
   ```

3. **Check agent logs**:
   ```bash
   flyctl logs -a ryla-workflow-agent | grep -i openai
   ```

---

## Security Best Practices

1. **Never commit API keys**:
   - ✅ Use Infisical for storage
   - ✅ Use Fly.io secrets for deployment
   - ❌ Never commit to git

2. **Rotate keys regularly**:
   - Rotate every 90 days
   - Revoke old keys after rotation

3. **Use least privilege**:
   - Create keys with minimal permissions
   - Set usage limits

4. **Monitor usage**:
   - Check OpenAI dashboard regularly
   - Set up alerts for unusual activity

---

## Troubleshooting

### API key not working
- Verify key starts with `sk-`
- Check key hasn't expired
- Verify key has sufficient credits
- Check usage limits haven't been exceeded

### High costs
- Check usage in OpenAI dashboard
- Review API calls in logs
- Adjust usage limits
- Consider switching to GPT-4o Mini if costs are too high

### Moltbot not using OpenAI
- Verify `OPENAI_API_KEY` environment variable is set
- Check Moltbot configuration
- Review agent logs for errors

---

## References

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [OpenAI Usage Limits](https://platform.openai.com/account/limits)
- [OpenAI Pricing](https://openai.com/api/pricing)
- [Moltbot OpenAI Provider](https://docs.clawd.bot/providers/openai)

---

## Quick Setup Commands

```bash
# 1. Get OpenAI API key from https://platform.openai.com/api-keys

# 2. Store in Infisical
infisical secrets set OPENAI_API_KEY=sk-xxx --path=/apps/workflow-agent --env=dev

# 3. Set in Fly.io
flyctl secrets set OPENAI_API_KEY=sk-xxx -a ryla-workflow-agent

# 4. Restart app
flyctl apps restart ryla-workflow-agent

# 5. Verify
flyctl logs -a ryla-workflow-agent | grep -i "OpenAI\|GPT"
```

---

---

## 🎯 Which Option Should I Use?

**Use OAuth (Option 1) if:**
- ✅ You have a ChatGPT subscription
- ✅ You want to use subscription limits (not pay per API call)
- ✅ You prefer not managing API keys
- ✅ You want simpler setup

**Use API Key (Option 2) if:**
- ✅ You don't have a ChatGPT subscription
- ✅ You want usage-based billing
- ✅ You need direct API access
- ✅ You want to set specific usage limits

---

## 📚 References

- [Moltbot OAuth Documentation](https://docs.clawd.bot/concepts/oauth)
- [Moltbot OpenAI Provider](https://docs.clawd.bot/providers/openai)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [OpenAI Usage Limits](https://platform.openai.com/account/limits)
