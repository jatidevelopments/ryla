# Moltbot Deployment & Configuration Guide for IN-031

**Date**: 2026-01-28  
**Purpose**: Deployment options, model recommendations, and considerations for Moltbot-based workflow deployment agent

---

## Deployment Options

### Option 1: Fly.io (Recommended for RYLA)

**Why Fly.io**:
- ✅ **Already using Fly.io** - Consistent with existing RYLA infrastructure
- ✅ **Persistent deployment** - Agent runs 24/7, always available
- ✅ **Docker-based** - Easy to containerize Moltbot
- ✅ **Cost-effective** - ~$10-15/mo for always-on instance
- ✅ **Auto-scaling** - Can scale if needed
- ✅ **Simple deployment** - `flyctl deploy` like other apps

**Setup**:
```bash
# 1. Create Fly.io app
flyctl apps create ryla-workflow-agent

# 2. Create fly.toml
cat > fly.toml <<EOF
app = "ryla-workflow-agent"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"
EOF

# 3. Deploy
flyctl deploy
```

**Cost**: ~$10-15/mo (256MB RAM, always-on)

**Pros**:
- Consistent with existing infrastructure
- Persistent (always available)
- Easy deployment
- Can use existing Fly.io secrets

**Cons**:
- Costs money even when idle
- Need to manage instance

---

### Option 2: Docker Container (Local/VM)

**Why Docker**:
- ✅ **Full control** - Run on your own infrastructure
- ✅ **No ongoing costs** - If you have existing server
- ✅ **Easy to test** - Run locally first
- ✅ **Portable** - Can move to any host

**Setup**:
```bash
# 1. Build Docker image
docker build -t ryla-workflow-agent .

# 2. Run container
docker run -d \
  --name workflow-agent \
  -e MODAL_TOKEN_ID=$MODAL_TOKEN_ID \
  -e MODAL_TOKEN_ID_SECRET=$MODAL_TOKEN_ID_SECRET \
  -e SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -v /path/to/workflow-deployer:/app/workflow-deployer \
  ryla-workflow-agent
```

**Cost**: $0 (if you have existing server) or $5-20/mo (VPS)

**Pros**:
- Full control
- No vendor lock-in
- Can run on any infrastructure

**Cons**:
- Need to manage server
- Need to handle updates
- Need to ensure uptime

---

### Option 3: Railway/Render/Northflank (Serverless-like)

**Why Serverless Platforms**:
- ✅ **Easy deployment** - Git push to deploy
- ✅ **Auto-scaling** - Scales based on usage
- ✅ **Managed** - No server management
- ✅ **Free tier available** - Good for testing

**Setup** (Railway example):
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up
```

**Cost**: 
- Railway: $5-20/mo (usage-based)
- Render: $7-25/mo (always-on)
- Northflank: $10-30/mo

**Pros**:
- Easy deployment
- Auto-scaling
- Managed infrastructure

**Cons**:
- Can be more expensive
- Less control
- Cold starts possible

---

### Option 4: GCP Compute Engine (VPS)

**Why GCP**:
- ✅ **Enterprise-grade** - Reliable, scalable
- ✅ **Full control** - Custom VM configuration
- ✅ **Persistent** - Always-on instance
- ✅ **Cost-effective at scale** - Can be cheaper for heavy usage

**Setup**:
```bash
# 1. Create VM instance
gcloud compute instances create workflow-agent \
  --machine-type=e2-small \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# 2. SSH and install Moltbot
ssh workflow-agent
curl -fsSL https://molt.bot/install.sh | bash

# 3. Configure and run
clawdbot onboard
```

**Cost**: ~$10-20/mo (e2-small instance)

**Pros**:
- Enterprise-grade reliability
- Full control
- Scalable

**Cons**:
- More complex setup
- Need to manage VM
- More expensive than Fly.io

---

## Recommended: Fly.io Deployment

**For RYLA, we recommend Fly.io** because:
1. **Consistency** - Already using Fly.io for all apps
2. **Infrastructure** - Team already familiar with Fly.io
3. **Cost** - Similar to other options, but integrated
4. **Deployment** - Same process as other apps
5. **Secrets** - Can use Fly.io secrets or Infisical

---

## Model Recommendations

### Option 1: GPT-4o Mini (Recommended for Cost)

**Why GPT-4o Mini**:
- ✅ **Cheapest option** - $0.15/$0.60 per million tokens
- ✅ **Good coding quality** - Handles TypeScript/CLI commands well
- ✅ **Fast** - Quick responses
- ✅ **128K context** - Large context window

**Cost Estimate** (per workflow deployment):
- Analysis: ~1K tokens = $0.00015
- Code generation: ~5K tokens = $0.00075
- Error fixing: ~3K tokens = $0.00045
- **Total per workflow**: ~$0.001-0.002

**Monthly cost** (100 workflows): ~$0.10-0.20

**Configuration**:
```bash
# In Moltbot config
clawdbot config set model openai
clawdbot config set model.name gpt-4o-mini
clawdbot config set openai.api_key $OPENAI_API_KEY
```

---

### Option 2: Claude Haiku 4.5 (Recommended for Quality)

**Why Claude Haiku 4.5**:
- ✅ **Best coding quality** - Excellent for TypeScript/CLI
- ✅ **Fast execution** - Fastest in tests
- ✅ **Zero tool-calling failures** - Very reliable
- ✅ **Good cost** - Slightly more expensive than GPT-4o Mini

**Cost Estimate** (per workflow deployment):
- Analysis: ~1K tokens = $0.00025
- Code generation: ~5K tokens = $0.00125
- Error fixing: ~3K tokens = $0.00075
- **Total per workflow**: ~$0.002-0.003

**Monthly cost** (100 workflows): ~$0.20-0.30

**Configuration**:
```bash
# In Moltbot config
clawdbot config set model anthropic
clawdbot config set model.name claude-3-5-haiku-20241022
clawdbot config set anthropic.api_key $ANTHROPIC_API_KEY
```

---

### Option 3: Claude Sonnet 4.5 (Best Quality, Higher Cost)

**Why Claude Sonnet**:
- ✅ **Best quality** - Highest coding quality
- ✅ **200K context** - Largest context window
- ✅ **Most reliable** - Best error handling
- ❌ **More expensive** - 2-3x cost of Haiku

**Cost Estimate** (per workflow deployment):
- **Total per workflow**: ~$0.005-0.010

**Monthly cost** (100 workflows): ~$0.50-1.00

**When to use**: If GPT-4o Mini or Haiku fail too often, upgrade to Sonnet.

---

### Recommendation: Start with GPT-4o Mini, Upgrade if Needed

**Strategy**:
1. **Start**: GPT-4o Mini (cheapest, good quality)
2. **Monitor**: Track success rate and error types
3. **Upgrade if needed**: 
   - If >10% failures → Upgrade to Claude Haiku 4.5
   - If still issues → Upgrade to Claude Sonnet 4.5

**Cost Comparison** (100 workflows/month):
- GPT-4o Mini: $0.10-0.20/mo
- Claude Haiku 4.5: $0.20-0.30/mo
- Claude Sonnet 4.5: $0.50-1.00/mo

---

## Deployment Requirements

### Infrastructure Requirements

**Minimum**:
- **CPU**: 1 vCPU
- **RAM**: 512MB (256MB minimum)
- **Storage**: 5GB (for workflow files, knowledge base)
- **Network**: Outbound internet access

**Recommended**:
- **CPU**: 2 vCPU
- **RAM**: 1GB
- **Storage**: 10GB
- **Network**: Outbound internet access

### Software Requirements

**Required**:
- Node.js 20+ (Moltbot requirement)
- Python 3.10+ (for Modal CLI)
- Git (for repository access)
- pnpm (for workflow-deployer)
- Modal CLI (for deployments)

**Optional**:
- Docker (if containerizing)
- jq (for JSON processing)

### Credentials & Secrets

**Required Secrets**:
- `MODAL_TOKEN_ID` - Modal.com authentication
- `MODAL_TOKEN_ID_SECRET` - Modal.com authentication
- `SLACK_BOT_TOKEN` - Slack bot token
- `SLACK_SIGNING_SECRET` - Slack webhook verification
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - LLM provider
- `GIT_SSH_KEY` - SSH key for repository access (optional, for knowledge base)

**Storage**:
- Use **Infisical** for secrets (consistent with RYLA approach)
- Or Fly.io secrets if deploying to Fly.io
- Never commit secrets to repository

---

## Deployment Considerations

### 1. Serverless vs. Persistent

**Serverless** (Railway, Render, Northflank):
- ✅ Scales to zero (cost-effective when idle)
- ✅ Auto-scaling
- ❌ Cold starts (first request slower)
- ❌ May timeout on long-running deployments
- ❌ Less control

**Persistent** (Fly.io, Docker, GCP):
- ✅ Always available (no cold starts)
- ✅ Can handle long-running tasks
- ✅ Full control
- ❌ Costs money even when idle
- ❌ Need to manage instance

**Recommendation**: **Persistent (Fly.io)** - Deployments can take 5-10 minutes, serverless timeouts are risky.

### 2. Cost Management

**Agent Costs**:
- LLM API calls: $0.10-1.00/mo (100 workflows)
- Infrastructure: $10-20/mo (Fly.io/Docker)
- **Total**: ~$10-21/mo

**Deployment Costs** (separate):
- Modal.com deployments: $20/workflow limit (enforced)
- These are separate from agent infrastructure costs

**Cost Tracking**:
- Track LLM API costs in Moltbot
- Track infrastructure costs in Fly.io dashboard
- Track deployment costs in Modal.com dashboard
- Set alerts at 80% of budget

### 3. Security Considerations

**Secrets Management**:
- ✅ Use Infisical for all secrets
- ✅ Never commit secrets to repository
- ✅ Rotate secrets regularly
- ✅ Use machine identities for automated systems

**Access Control**:
- ✅ Limit Git access (read-only for knowledge base)
- ✅ Limit Modal access (deploy only, no delete)
- ✅ Limit Slack access (specific channels only)
- ✅ Use SSH keys, not passwords

**Network Security**:
- ✅ Run in isolated Docker container
- ✅ Limit outbound network access
- ✅ Use VPN if needed for repository access
- ✅ Monitor for suspicious activity

### 4. Reliability & Uptime

**High Availability**:
- ✅ Deploy to Fly.io with health checks
- ✅ Set up monitoring/alerting
- ✅ Auto-restart on failure
- ✅ Backup knowledge base regularly

**Monitoring**:
- ✅ Track deployment success rate
- ✅ Monitor LLM API errors
- ✅ Monitor infrastructure health
- ✅ Alert on failures

**Backup**:
- ✅ Backup knowledge base (Git repository)
- ✅ Backup Moltbot configuration
- ✅ Backup skill code

### 5. Scalability

**Single Instance** (Recommended for MVP):
- Handles 1 workflow at a time
- Simple, cost-effective
- Good for < 50 workflows/day

**Multiple Instances** (Future):
- Can run multiple workflows in parallel
- More complex, higher cost
- Good for > 50 workflows/day

**Recommendation**: Start with single instance, scale if needed.

### 6. Model Selection Strategy

**Start Cheap, Upgrade if Needed**:
1. **Phase 1**: GPT-4o Mini (cheapest)
2. **Monitor**: Track success rate
3. **Phase 2**: If <90% success → Upgrade to Claude Haiku 4.5
4. **Phase 3**: If still issues → Upgrade to Claude Sonnet 4.5

**Cost vs. Quality Trade-off**:
- GPT-4o Mini: $0.10/mo, 85-90% success rate
- Claude Haiku: $0.30/mo, 90-95% success rate
- Claude Sonnet: $1.00/mo, 95-98% success rate

**Recommendation**: Start with GPT-4o Mini, upgrade based on actual performance.

---

## Deployment Checklist

### Pre-Deployment

- [ ] Choose deployment platform (Fly.io recommended)
- [ ] Set up Infisical secrets
- [ ] Choose LLM model (GPT-4o Mini recommended)
- [ ] Set up Slack bot
- [ ] Configure Git access (if using knowledge base)
- [ ] Test locally first

### Deployment

- [ ] Install Moltbot
- [ ] Configure Moltbot (model, Slack, etc.)
- [ ] Create workflow-deployment skill
- [ ] Test skill locally
- [ ] Deploy to Fly.io/Docker/etc.
- [ ] Configure health checks
- [ ] Set up monitoring

### Post-Deployment

- [ ] Test end-to-end workflow
- [ ] Verify Slack integration
- [ ] Verify Modal deployment
- [ ] Verify cost tracking
- [ ] Set up alerts
- [ ] Document deployment process

---

## Quick Start: Fly.io Deployment

```bash
# 1. Install Moltbot locally (for testing)
curl -fsSL https://molt.bot/install.sh | bash

# 2. Configure Moltbot
clawdbot onboard
clawdbot config set model openai
clawdbot config set model.name gpt-4o-mini
clawdbot config set openai.api_key $OPENAI_API_KEY

# 3. Create workflow-deployment skill
clawdbot skill create workflow-deployment

# 4. Test locally
clawdbot skill test workflow-deployment

# 5. Create Fly.io app
flyctl apps create ryla-workflow-agent

# 6. Set secrets
flyctl secrets set MODAL_TOKEN_ID=$MODAL_TOKEN_ID
flyctl secrets set MODAL_TOKEN_ID_SECRET=$MODAL_TOKEN_ID_SECRET
flyctl secrets set SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN
flyctl secrets set SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET
flyctl secrets set OPENAI_API_KEY=$OPENAI_API_KEY

# 7. Deploy
flyctl deploy
```

---

## Cost Summary

**Monthly Costs** (estimated, 100 workflows/month):

| Item | Cost |
|------|------|
| **Infrastructure** (Fly.io) | $10-15/mo |
| **LLM API** (GPT-4o Mini) | $0.10-0.20/mo |
| **Deployment Costs** (Modal) | $0-20/workflow (limit enforced) |
| **Total Infrastructure** | **~$10-15/mo** |
| **Total per Workflow** | **~$0.10-0.20** (LLM) + Modal costs |

**Annual Cost**: ~$120-180/year (infrastructure only)

---

## References

- [Moltbot Documentation](https://docs.clawd.bot/)
- [Moltbot GitHub](https://github.com/moltbot/moltbot)
- [Fly.io Documentation](https://fly.io/docs/)
- [Model Comparison](https://docsbot.ai/models/compare/gpt-4o-mini/claude-4-sonnet)
- [IN-023: Fly.io Deployment Infrastructure](./IN-023-fly-io-deployment-infrastructure.md)
