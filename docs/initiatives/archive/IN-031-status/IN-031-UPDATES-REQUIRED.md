# IN-031 Updates Required: Moltbot Selection

**Date**: 2026-01-28  
**Status**: Ready to apply

---

## Summary of Changes

Based on user feedback, we're selecting **Moltbot** as the solution for IN-031. This document outlines all required updates to the main initiative document.

---

## 1. Update Implementation Options (Section 1.1)

**Current**: Option B is "OpenCode-Style Standalone Agent"

**Update to**:

```markdown
**Option B: Moltbot (SELECTED)**
- Open-source personal AI assistant (formerly Clawdbot)
- Built-in Slack/Telegram/WhatsApp integration
- Full terminal access and command execution
- Persistent memory system
- Skills/plugins system for extending functionality
- Self-hostable (Docker, Fly.io, VM, etc.)
- Can write/fix code (Ralph pattern built-in)
- Proven by thousands of users

**Recommendation**: **Option B (Moltbot)** - Simplest solution, built-in everything we need, fastest to implement (8 weeks vs. 11 weeks).
```

---

## 2. Update Architecture Diagram

**Current**: Generic "Agent Orchestrator"

**Update to**:

```markdown
**Architecture**:
```
Slack Channel
    ↓ (User uploads workflow.json)
[Moltbot - Single Agent]
    ├─→ Receives message (built-in Slack integration)
    ├─→ Extracts workflow JSON
    ├─→ Runs: `pnpm workflow-deploy analyze ...` (terminal access)
    ├─→ Runs: `pnpm workflow-deploy generate ...` (terminal access)
    ├─→ Runs: `modal deploy ...` (terminal access)
    ├─→ Tests endpoint (terminal access)
    ├─→ Fixes errors (can write/fix code)
    ├─→ Tracks costs (memory system)
    ├─→ Updates knowledge base (file system access)
    └─→ Sends updates (built-in Slack integration)
    ↓
Deployed & Tested Endpoint + Slack Notification
```
```

---

## 3. Update Virtual Environment Section

**Replace Section 2** with:

```markdown
#### 2. Moltbot Setup & Deployment

**Purpose**: Deploy Moltbot with all necessary tools and credentials

**Deployment Platform**: **Fly.io (Recommended)**
- Consistent with existing RYLA infrastructure
- Persistent deployment (always available)
- Cost: ~$10-15/mo
- Easy deployment: `flyctl deploy`

**Alternative Options**:
- **Docker Container**: For local/VM deployment
- **Railway/Render**: Serverless-like platforms
- **GCP Compute Engine**: Enterprise VPS

**Requirements**:
- Node.js 20+ (Moltbot requirement)
- Python 3.10+ (for Modal CLI)
- Git (for repository access)
- pnpm (for workflow-deployer)
- Modal CLI (for deployments)

**Credentials** (via Infisical):
- `MODAL_TOKEN_ID` / `MODAL_TOKEN_ID_SECRET`
- `SLACK_BOT_TOKEN` / `SLACK_SIGNING_SECRET`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `GIT_SSH_KEY` (optional, for knowledge base)

**See**: [Moltbot Deployment Guide](./IN-031-moltbot-deployment-guide.md) for detailed setup instructions.
```

---

## 4. Add Model Recommendations Section

**Add after Section 2**:

```markdown
#### 2.5. Model Configuration

**Recommended: GPT-4o Mini** (Start cheap, upgrade if needed)

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

**Upgrade Path**:
1. **Start**: GPT-4o Mini (cheapest, good quality)
2. **If >10% failures**: Upgrade to Claude Haiku 4.5 ($0.20-0.30/mo)
3. **If still issues**: Upgrade to Claude Sonnet 4.5 ($0.50-1.00/mo)

**Configuration**:
```bash
clawdbot config set model openai
clawdbot config set model.name gpt-4o-mini
clawdbot config set openai.api_key $OPENAI_API_KEY
```

**See**: [Moltbot Deployment Guide](./IN-031-moltbot-deployment-guide.md) for model comparison and configuration.
```

---

## 5. Update Phases (Shorter Timeline)

**Current**: 11 weeks (8 phases)

**Update to**:

```markdown
### Phases

1. **Phase 1: Moltbot Setup** - Install Moltbot, configure Slack, set up Fly.io deployment - 1 week
2. **Phase 2: Workflow Skill** - Create workflow-deployment skill, integrate with existing tools - 2 weeks
3. **Phase 3: Error Handling** - Add Ralph pattern for automatic error fixing - 2 weeks
4. **Phase 4: Testing & Quality Evaluation** - Build automatic endpoint testing and quality evaluation - 2 weeks
5. **Phase 5: Cost Tracking** - Implement cost limits ($20) and tracking - 1 week
6. **Phase 6: Knowledge Base** - Use Moltbot memory for learnings, repository connection - 1 week
7. **Phase 7: Integration & Testing** - End-to-end testing, polish, deployment - 1 week

**Total Timeline**: 8 weeks (reduced from 11 weeks due to Moltbot's built-in features)
```

---

## 6. Update Timeline

**Current**: 11 weeks, completion 2026-05-02

**Update to**:

```markdown
### Timeline

- **Start Date**: 2026-02-15 (after IN-028 Phase 6 completes)
- **Target Completion**: 2026-04-11 (8 weeks)
- **Key Milestones**:
  - **M1: Moltbot Setup**: 2026-02-22
  - **M2: Workflow Skill**: 2026-03-07
  - **M3: Error Handling**: 2026-03-21
  - **M4: Testing & Quality Evaluation**: 2026-04-04
  - **M5: Cost Tracking**: 2026-04-11
  - **M6: Knowledge Base**: 2026-04-18
  - **M7: Integration Complete**: 2026-04-25
```

---

## 7. Add Deployment Considerations Section

**Add before "Risks & Mitigation"**:

```markdown
## Deployment Considerations

### Platform Selection

**Recommended: Fly.io**
- ✅ Consistent with existing RYLA infrastructure
- ✅ Persistent deployment (no cold starts)
- ✅ Cost: ~$10-15/mo
- ✅ Easy deployment process
- ✅ Can use existing Fly.io secrets or Infisical

**Alternatives**:
- **Docker**: For local/VM deployment ($0-20/mo)
- **Railway/Render**: Serverless-like ($5-25/mo)
- **GCP Compute Engine**: Enterprise VPS ($10-20/mo)

### Model Selection

**Recommended: GPT-4o Mini**
- ✅ Cheapest: $0.10-0.20/mo (100 workflows)
- ✅ Good coding quality
- ✅ Fast responses
- ✅ 128K context window

**Upgrade Path**: If success rate <90%, upgrade to Claude Haiku 4.5 or Claude Sonnet 4.5

### Cost Management

**Infrastructure Costs**:
- Fly.io: $10-15/mo
- LLM API (GPT-4o Mini): $0.10-0.20/mo
- **Total**: ~$10-15/mo

**Deployment Costs** (separate):
- Modal.com: $20/workflow limit (enforced)
- These are separate from agent infrastructure

### Security Considerations

- ✅ Use Infisical for all secrets
- ✅ Limit Git access (read-only for knowledge base)
- ✅ Limit Modal access (deploy only, no delete)
- ✅ Limit Slack access (specific channels only)
- ✅ Run in isolated Docker container
- ✅ Monitor for suspicious activity

### Reliability & Uptime

- ✅ Deploy to Fly.io with health checks
- ✅ Set up monitoring/alerting
- ✅ Auto-restart on failure
- ✅ Backup knowledge base regularly (Git repository)

**See**: [Moltbot Deployment Guide](./IN-031-moltbot-deployment-guide.md) for detailed deployment options, model recommendations, and considerations.
```

---

## 8. Update References

**Add to References section**:

```markdown
## References

- [Moltbot Website](https://clawd.bot/) - **Selected Solution**: Open-source personal AI assistant
- [Moltbot GitHub](https://github.com/moltbot/moltbot) - Source code
- [Moltbot Documentation](https://docs.clawd.bot/) - Setup and configuration
- [Moltbot Deployment Guide](./IN-031-moltbot-deployment-guide.md) - **NEW**: Detailed deployment, model, and configuration guide
- [Moltbot Analysis](./IN-031-moltbot-analysis.md) - **NEW**: Detailed analysis of Moltbot for IN-031
- [VoltAgent + OpenCode Hybrid](./IN-031-agentic-workflow-deployment-hybrid-analysis.md) - **NEW**: Alternative approach analysis
- [OpenCode GitHub](https://github.com/anomalyco/opencode) - Inspiration for agentic approach
- [IN-028: Workflow-to-Serverless Deployment](./IN-028-workflow-to-serverless-deployment.md)
- [Ralph Pattern](../../.cursor/rules/ralph.mdc)
- [Modal Comprehensive Guide](../../research/infrastructure/MODAL-COMPREHENSIVE-GUIDE.md)
- [Modal Best Practices](../../.cursor/rules/mcp-modal.mdc)
- [Fly.io Deployment Infrastructure](./IN-023-fly-io-deployment-infrastructure.md)
```

---

## 9. Update Recent Updates

**Add to Progress Tracking section**:

```markdown
### Recent Updates

- **2026-01-28**: Initiative created based on user requirements and OpenCode inspiration
- **2026-01-28**: **Moltbot selected** as solution - Simplest approach with built-in Slack, terminal, memory, and skills
- **2026-01-28**: Deployment guide created - Fly.io recommended, GPT-4o Mini for model
```

---

## Files Created

1. ✅ `IN-031-moltbot-analysis.md` - Detailed Moltbot analysis
2. ✅ `IN-031-moltbot-deployment-guide.md` - Deployment, model, and configuration guide
3. ✅ `IN-031-agentic-workflow-deployment-hybrid-analysis.md` - VoltAgent + OpenCode analysis

---

## Next Steps

1. Apply these updates to `IN-031-agentic-workflow-deployment.md`
2. Review deployment guide with team
3. Set up Moltbot locally for testing
4. Create proof-of-concept workflow-deployment skill
5. Plan Fly.io deployment

---

**Status**: Ready to apply updates  
**Confidence**: High - Moltbot is the simplest and fastest solution
