# [EPIC] EP-061: Moltbot Agent Setup & Fly.io Deployment

**Status**: Proposed  
**Phase**: P1  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28

> **Initiative**: [IN-031: Agentic ComfyUI Workflow Deployment System](../../../initiatives/IN-031-agentic-workflow-deployment.md)

---

## Overview

Set up Moltbot agent infrastructure on Fly.io to enable autonomous ComfyUI workflow deployment. This epic establishes the foundation: deploying Moltbot agent, configuring it with GPT-4o, setting up credentials, and ensuring it can run continuously.

---

## P1: Requirements

### Problem Statement

We need an autonomous AI agent to deploy ComfyUI workflows, but we don't have the infrastructure to run it. The agent needs:
- A persistent environment to run 24/7
- Access to Modal.com credentials
- Access to repository for knowledge base
- Slack integration for communication
- Cost-effective deployment that matches existing RYLA infrastructure

**Who has this problem**: Infrastructure team needs a deployable agent system

**Why it matters**: Without this foundation, we can't build the autonomous workflow deployment system

### MVP Objective

**Deploy Moltbot agent to Fly.io with all necessary credentials and configuration:**

- Moltbot agent running on Fly.io
- GPT-4o model configured
- Modal.com credentials configured (via Infisical)
- Slack bot token configured (via Infisical)
- Repository access configured (SSH key via Infisical)
- Agent can start and stay running
- Health checks configured
- Basic logging and monitoring

**Measurable**: 
- Agent deployed and running on Fly.io
- Agent can access Modal.com (verified via test command)
- Agent can access repository (verified via test command)
- Agent responds to Slack messages (verified via test)
- Uptime > 99% (Fly.io health checks)

### Non-Goals

- Workflow deployment logic (separate epic)
- Slack workflow upload (separate epic)
- Error handling (separate epic)
- Cost tracking (separate epic)

### Business Metric

**Target**: E-CAC (Infrastructure Cost Optimization), Foundation for C-Core Value (Faster Workflow Deployment)

---

## P2: Scoping

### Feature List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Moltbot Installation | Install and configure Moltbot in Docker container | P0 |
| F2 | Fly.io App Setup | Create Fly.io app with fly.toml and Dockerfile | P0 |
| F3 | GPT-4o Configuration | Configure Moltbot to use GPT-4o model | P0 |
| F4 | Infisical Integration | Set up Infisical secrets for Modal, Slack, Git | P0 |
| F5 | Repository Access | Configure Git SSH key for repository access | P0 |
| F6 | Health Checks | Configure Fly.io health checks | P1 |
| F7 | Logging & Monitoring | Set up basic logging and monitoring | P1 |
| F8 | Local Testing | Test agent locally before Fly.io deployment | P0 |

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| ST-001 | Install Moltbot Locally | Moltbot installed locally, can run commands, GPT-4o configured |
| ST-002 | Create Dockerfile | Dockerfile created with Moltbot, Node.js, Python, Git, Modal CLI |
| ST-003 | Create Fly.io App | Fly.io app created, fly.toml configured, app accessible |
| ST-004 | Configure Infisical Secrets | All secrets (Modal, Slack, Git) stored in Infisical, accessible to agent |
| ST-005 | Deploy to Fly.io | Agent deployed to Fly.io, running continuously, health checks passing |
| ST-006 | Verify Modal Access | Agent can execute Modal CLI commands (test: `modal app list`) |
| ST-007 | Verify Repository Access | Agent can access repository (test: `git clone` or `git pull`) |
| ST-008 | Verify Slack Integration | Agent can send/receive Slack messages (test: send test message) |

### Technical Approach

**Architecture**:
```
Fly.io App (ryla-workflow-agent)
├── Docker Container
│   ├── Moltbot (Node.js)
│   ├── Python 3.10+ (Modal CLI)
│   ├── Git (repository access)
│   └── Credentials (from Infisical)
└── Health Checks
```

**Secrets Management** (via Infisical):
- `/mcp` - MCP server secrets (if needed)
- `/apps/workflow-agent` - Agent-specific secrets
- `/shared` - Shared secrets (Modal, Slack)

**Required Secrets**:
- `MODAL_TOKEN_ID` - Modal.com authentication
- `MODAL_TOKEN_ID_SECRET` - Modal.com authentication
- `SLACK_BOT_TOKEN` - Slack bot token
- `SLACK_SIGNING_SECRET` - Slack webhook verification
- `OPENAI_API_KEY` - GPT-4o API key
- `GIT_SSH_KEY` - SSH key for repository access (optional for Phase 1)

**Model Configuration**:
- Model: `gpt-4o` (OpenAI)
- Context: 128K tokens
- Cost: ~$2-3/mo (100 workflows)

---

## P3: Architecture

### File Structure

```
apps/workflow-agent/
├── Dockerfile
├── fly.toml
├── package.json
├── .dockerignore
├── src/
│   ├── index.ts          # Moltbot entry point
│   ├── config.ts         # Configuration loader
│   └── health.ts          # Health check endpoint
└── README.md
```

### Dockerfile

```dockerfile
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip \
    git curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Modal CLI
RUN pip3 install modal

# Install Moltbot
RUN npm install -g @moltbot/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY src/ ./src/

# Expose health check port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run agent
CMD ["node", "src/index.js"]
```

### fly.toml

```toml
app = "ryla-workflow-agent"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"
  
  [services.concurrency]
    type = "requests"
    hard_limit = 25
    soft_limit = 20

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.http_checks]]
    interval = "10s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/health"
    protocol = "http"
    tls_skip_verify = false
```

### Configuration Loading

```typescript
// src/config.ts
import { config } from 'dotenv';

export interface AgentConfig {
  modal: {
    tokenId: string;
    tokenSecret: string;
  };
  slack: {
    botToken: string;
    signingSecret: string;
  };
  openai: {
    apiKey: string;
  };
  git?: {
    sshKey?: string;
    repoUrl?: string;
  };
}

export function loadConfig(): AgentConfig {
  // Load from Infisical (via environment variables injected by Infisical)
  return {
    modal: {
      tokenId: process.env.MODAL_TOKEN_ID!,
      tokenSecret: process.env.MODAL_TOKEN_ID_SECRET!,
    },
    slack: {
      botToken: process.env.SLACK_BOT_TOKEN!,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
    git: {
      sshKey: process.env.GIT_SSH_KEY,
      repoUrl: process.env.GIT_REPO_URL,
    },
  };
}
```

### Health Check

```typescript
// src/health.ts
import express from 'express';

export function createHealthCheck() {
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
  
  return app;
}
```

---

## Dependencies

- **IN-023**: Fly.io Deployment Infrastructure (provides Fly.io setup patterns)
- **Infisical**: Secrets management (existing)
- **Modal.com**: Serverless platform (existing)
- **Slack**: Communication platform (existing)

---

## Acceptance Criteria

### Phase 1: Local Setup
- [ ] Moltbot installed locally
- [ ] GPT-4o configured and working
- [ ] Can run basic Moltbot commands
- [ ] Dockerfile created and tested locally

### Phase 2: Fly.io Setup
- [ ] Fly.io app created (`ryla-workflow-agent`)
- [ ] fly.toml configured
- [ ] Secrets stored in Infisical
- [ ] Agent deployed to Fly.io
- [ ] Health checks passing

### Phase 3: Verification
- [ ] Agent running continuously (uptime > 99%)
- [ ] Modal CLI access verified (`modal app list` works)
- [ ] Repository access verified (if configured)
- [ ] Slack integration verified (can send/receive messages)
- [ ] Logs accessible via Fly.io dashboard

---

## Timeline

- **Start Date**: 2026-02-15 (after IN-028 Phase 6)
- **Target Completion**: 2026-02-28 (2 weeks)
- **Key Milestones**:
  - **M1: Local Setup**: 2026-02-18 (3 days)
  - **M2: Fly.io Deployment**: 2026-02-22 (4 days)
  - **M3: Verification**: 2026-02-28 (6 days)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Deployment Success** | 100% | Agent deployed and running |
| **Uptime** | >99% | Fly.io health checks |
| **Modal Access** | 100% | Can execute Modal commands |
| **Slack Integration** | 100% | Can send/receive messages |
| **Cost** | <$15/mo | Fly.io infrastructure costs |

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Moltbot not compatible with Fly.io** | Low | High | Test locally first, use Docker |
| **Secrets not accessible** | Medium | High | Use Infisical CLI in Docker, test locally |
| **Health checks failing** | Low | Medium | Start with simple health check, iterate |
| **Cost higher than expected** | Low | Low | Monitor costs, use smallest Fly.io instance |

---

## References

- [IN-031: Agentic Workflow Deployment](../../../initiatives/IN-031-agentic-workflow-deployment.md)
- [IN-031: Moltbot Deployment Guide](../../../initiatives/IN-031-moltbot-deployment-guide.md)
- [EP-060: Fly.io Deployment Infrastructure](./EP-060-fly-io-deployment-infrastructure.md)
- [Moltbot Documentation](https://docs.clawd.bot/)
- [Fly.io Documentation](https://fly.io/docs/)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-28
