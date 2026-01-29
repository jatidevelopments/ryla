# [INITIATIVE] IN-031: Agentic ComfyUI Workflow Deployment System

**Status**: Proposed  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, DevOps Team, Product Team

---

## Executive Summary

**One-sentence description**: Build an autonomous AI agent system that automatically analyzes ComfyUI workflow JSON, generates deployment code, deploys to Modal.com, tests the endpoint, and notifies when ready - enabling "found a workflow online → deployed and tested in minutes" with zero manual intervention.

**Business Impact**: E-CAC (90% reduction in deployment time), C-Core Value (faster feature deployment), A-Activation (rapid workflow testing), B-Retention (workflow isolation prevents breaking changes)

---

## Why (Business Rationale)

### Problem Statement

**Current Pain Points**:
- **Manual Deployment Process**: Finding a new ComfyUI workflow → manually analyze dependencies → manually write deployment code → manually deploy → manually test takes hours
- **Rapid Workflow Evolution**: New models, custom workflows, and custom nodes appear weekly - too fast to manually deploy each one
- **Testing Bottleneck**: Even with automated code generation (IN-028), manual testing and verification is required
- **No Autonomous Iteration**: When deployment fails, requires human intervention to debug and fix
- **Knowledge Loss**: Each deployment is a one-off - no shared knowledge base for future deployments
- **Cost Uncertainty**: No way to test workflows with cost limits before committing to full deployment

**Key Pain Points**:
- Found a cool workflow on ComfyUI community → Can't test it quickly
- Workflow deployment fails → Need to manually debug and retry
- Want to test multiple workflow variations → Too time-consuming
- No way to document what worked/didn't work for future reference

### Current State

**Existing Infrastructure** (from IN-028):
- ✅ Workflow JSON analyzer (`scripts/workflow-deployer/`)
- ✅ Automatic dependency detection
- ✅ Modal Python code generation
- ✅ RunPod Dockerfile generation
- ✅ CLI tool for deployment (`pnpm workflow-deploy`)

**What's Missing**:
- ❌ No autonomous agent to orchestrate the full process
- ❌ No automatic testing and verification
- ❌ No iterative debugging when deployment fails
- ❌ No cost limit enforcement
- ❌ No shared knowledge base for deployment learnings
- ❌ No parameter variation testing
- ❌ No result quality evaluation

### Desired State

**Vision**: An autonomous AI agent that:

1. **Takes Workflow JSON** → Analyzes dependencies → Generates deployment code
2. **Deploys to Modal** → Monitors deployment → Handles errors automatically
3. **Tests Endpoint** → Verifies health → Tests with sample requests
4. **Iterates on Failures** → Uses Ralph pattern to fix issues → Retries until success
5. **Enforces Cost Limits** → Tracks costs → Stops if limit exceeded
6. **Documents Learnings** → Saves successful patterns → Shares knowledge for future deployments
7. **Notifies When Ready** → Sends notification → Provides endpoint URL and test results

**Success Criteria**:
- Workflow JSON → Deployed and tested endpoint in < 10 minutes (autonomous)
- 90%+ success rate on first deployment attempt
- Automatic recovery from common deployment failures
- Cost limits enforced (no runaway costs)
- Knowledge base grows with each deployment

### Business Drivers

- **Revenue Impact**: Faster workflow deployment = faster feature delivery = more revenue opportunities
- **Cost Impact**: 90% reduction in deployment time = lower operational costs
- **Risk Mitigation**: Automated testing prevents broken deployments in production
- **Competitive Advantage**: Can test new workflows in minutes vs. competitors' hours/days
- **User Experience**: Faster iteration on new workflows = better product features
- **Developer Experience**: Eliminates tedious manual deployment and testing work

---

## How (Approach & Strategy)

### Strategy

**Inspired by OpenCode and Ralph Pattern**:
- **Autonomous Agent**: AI agent with full access to deployment tools and environment
- **Iterative Development**: Uses Ralph pattern to iterate until success criteria met
- **Virtual Environment**: Agent runs in isolated environment with all necessary credentials
- **Cost-Aware**: Tracks costs and enforces limits
- **Knowledge Sharing**: Documents learnings for future deployments

**Architecture**:
```
Slack Channel
    ↓ (User uploads workflow.json)
[Slack Webhook Receiver]
    ↓
[Agent Orchestrator] (Standalone, Docker/VM)
    ├─→ Analyze Workflow (existing tool)
    ├─→ Generate Code (existing tool)
    ├─→ Deploy to Modal (existing tool)
    ├─→ Test Endpoint (new)
    ├─→ Quality Evaluation (new - Phase 5)
    ├─→ Handle Errors (new - Ralph pattern)
    ├─→ Enforce Cost Limits ($20, new)
    └─→ Document Learnings (new - includes repo connection)
    ↓
[Slack Notification] ← Endpoint URL, Status, Cost, Errors
[Repository] ← Knowledge base updates
```

### Key Components

#### 1. Agent Orchestrator

**Purpose**: Coordinates the entire deployment process

**Capabilities**:
- Accepts workflow JSON input
- Orchestrates analysis → generation → deployment → testing
- Handles errors and retries
- Enforces cost limits
- Documents learnings

**Implementation Options**:

**Option A: Cursor Agent**
- Use Cursor's agent capabilities
- Access to existing tools via MCP
- Can run in virtual environment
- Can access repository and documentation

**Option B: OpenCode-Style Standalone Agent (SELECTED)**
- Standalone agent similar to OpenCode
- Full terminal access
- Can run in Docker container or VM
- Deployable independently (Fly.io, Modal, etc.)
- Communicates via Slack webhooks
- More isolated but fully autonomous

**Option C: Hybrid Approach**
- Cursor agent for orchestration
- Standalone script for heavy lifting
- Best of both worlds

**Recommendation**: **Option B (Standalone Agent)** - fully autonomous, deployable anywhere, communicates via Slack for easy integration.

#### 2. Virtual Environment

**Purpose**: Provide isolated environment with all necessary credentials and tools

**Requirements**:
- Modal CLI access (credentials)
- Git access (for repository)
- Python/Node.js for running tools
- Access to workflow-deployer scripts
- Cost tracking capabilities
- Slack webhook integration

**Implementation**:
```bash
# Docker container (preferred) or VM if more resources needed:
- Modal CLI installed and authenticated
- Git configured with repository access
- Node.js + pnpm
- Python 3.10+
- All workflow-deployer tools
- Cost tracking service
- Slack webhook client
```

**Deployment Options**:
- **Docker Container**: Default choice, lightweight, easy to deploy
- **VM**: If more resources needed (GPU access, larger storage, etc.)
- **Fly.io**: For persistent deployment
- **Modal.com**: For serverless deployment (ironic but possible)

#### 3. Iterative Error Handling (Ralph Pattern)

**Purpose**: Automatically fix common deployment failures

**Process**:
1. Deploy workflow
2. If deployment fails → Analyze error
3. Apply fix (e.g., missing dependency, code generation issue)
4. Retry deployment
5. Repeat until success or max iterations

**Common Fixes**:
- Missing custom node → Add to deployment code
- Missing model → Document requirement
- Code generation error → Fix template
- Modal deployment error → Retry with backoff
- Endpoint test failure → Check logs, fix issue

**Max Iterations**: 10 (configurable)

#### 4. Cost Limit Enforcement

**Purpose**: Prevent runaway costs during testing

**Implementation**:
- Track costs per deployment attempt
- Set cost limit: **$20 per workflow** (default, configurable)
- Stop if limit exceeded
- Report costs in notification

**Cost Tracking**:
- Modal deployment costs (image build)
- Endpoint test costs (execution)
- Total cost per workflow
- Real-time cost updates sent to Slack

#### 5. Endpoint Testing & Verification

**Purpose**: Automatically verify deployed endpoint works

**Tests**:
1. **Health Check**: `GET /health` → Should return 200 OK
2. **Root Endpoint**: `GET /` → Should return app info
3. **Generate Test**: `POST /generate` with minimal workflow → Should return image
4. **Cost Headers**: Verify cost tracking headers present
5. **Response Time**: Should complete within timeout
6. **Quality Evaluation**: (Phase 5) Evaluate generated output quality

**Success Criteria**:
- All tests pass
- Endpoint responds within timeout
- Generated output is valid
- Quality metrics meet thresholds (if enabled)

#### 7. Slack Integration

**Purpose**: Easy communication and workflow submission

**Features**:
- **Workflow Upload**: Upload workflow.json file via Slack (file upload or paste JSON)
- **Status Updates**: Real-time progress updates
- **Notifications**: Success/failure notifications
- **Cost Alerts**: Cost limit warnings (at 80% and 100%)
- **Error Reports**: Detailed error information with fix suggestions
- **Interactive**: Reply to messages for follow-up actions

**Workflow Upload Methods**:
1. **File Upload**: User uploads `workflow.json` file to Slack channel
2. **JSON Paste**: User pastes workflow JSON in message (agent detects JSON)
3. **Slash Command**: `/deploy-workflow [workflow-url]` (future enhancement)

**Agent Processing Flow**:
1. Agent receives workflow (file or JSON)
2. Agent sends acknowledgment: "📥 Received workflow, starting analysis..."
3. Agent sends status updates:
   - "📊 Analyzing workflow..."
   - "🔧 Generating deployment code..."
   - "🚀 Deploying to Modal..."
   - "🧪 Testing endpoint..."
   - "🎨 Evaluating quality..." (Phase 5)
   - "✅ Deployment complete! Endpoint: [url]"
4. On failure: Detailed error report with fix suggestions
5. On cost limit: Alert at 80% and stop at 100%

**Slack Message Format**:
```json
{
  "text": "Workflow Deployment Status",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Workflow:* workflow-name\n*Status:* 🚀 Deploying...\n*Cost:* $2.50 / $20.00\n*Iteration:* 1/10"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "⏱️ Started: 2:30 PM | ⏳ ETA: 2:35 PM"
        }
      ]
    }
  ]
}
```

**Error Notification Format**:
```json
{
  "text": "❌ Deployment Failed",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Error:* Missing custom node `ComfyUI_CustomNode`\n*Fix Applied:* Added node to deployment code\n*Retrying...*"
      }
    }
  ]
}
```

**Success Notification Format**:
```json
{
  "text": "✅ Deployment Complete",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Endpoint:* https://ryla--workflow-name-fastapi-app.modal.run\n*Cost:* $3.25 / $20.00\n*Quality Score:* 8.5/10\n*Status:* ✅ All tests passed"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Test Endpoint"
          },
          "url": "https://ryla--workflow-name-fastapi-app.modal.run/health"
        }
      ]
    }
  ]
}
```

#### 6. Knowledge Base & Documentation

**Purpose**: Share learnings across deployments

**Storage**:
- **Repository**: Commit successful deployment patterns
- **Documentation**: Markdown files with learnings
- **Database**: (Future) Structured knowledge base

**Content**:
- Successful deployment patterns
- Common errors and fixes
- Workflow-specific notes
- Cost estimates
- Performance metrics
- **Repository Connection**: How to connect to repository (credentials, setup, access patterns)

**Format**:
```markdown
# Workflow: [name]

## Deployment Date
2026-01-28

## Dependencies
- Custom Nodes: [list]
- Models: [list]

## Deployment Pattern
[Code pattern that worked]

## Common Issues
- Issue 1: [description] → Fix: [solution]

## Cost
- Deployment: $X.XX
- Test Execution: $X.XX
- Total: $X.XX

## Performance
- Cold Start: X seconds
- Generation Time: X seconds

## Repository Connection
- **Method**: [Git SSH, HTTPS, etc.]
- **Credentials**: [How credentials are stored/accessed]
- **Access Pattern**: [How agent connects to repo]
- **Documentation Location**: [Where docs are stored in repo]
```

### Key Principles

- **Autonomous**: Agent should work without human intervention
- **Iterative**: Use Ralph pattern to fix issues automatically
- **Cost-Aware**: Enforce cost limits, track spending
- **Knowledge Sharing**: Document learnings for future use
- **Fail Fast**: Detect issues early, stop if unfixable
- **Transparent**: Clear logging and notifications

### Phases

1. **Phase 1: Agent Orchestrator** - Build standalone agent that orchestrates existing tools - 2 weeks
2. **Phase 2: Virtual Environment** - Set up Docker container/VM with credentials - 1 week
3. **Phase 3: Slack Integration** - Build Slack webhook integration for workflow upload and notifications - 1 week
4. **Phase 4: Error Handling** - Implement Ralph pattern for automatic fixes - 2 weeks
5. **Phase 5: Testing & Quality Evaluation** - Build automatic endpoint testing and quality evaluation - 2 weeks
6. **Phase 6: Cost Tracking** - Implement cost limits ($20) and tracking - 1 week
7. **Phase 7: Knowledge Base** - Build documentation system with repository connection docs - 1 week
8. **Phase 8: Integration & Testing** - End-to-end testing, polish, deployment - 1 week

**Total Timeline**: 11 weeks

### Dependencies

- **IN-028**: Workflow-to-Serverless Deployment (provides foundation tools)
- **Modal.com**: Serverless platform (existing)
- **Cursor/MCP**: Agent infrastructure (existing)
- **Ralph Pattern**: Iterative development pattern (existing)

### Constraints

- Must work with existing Modal infrastructure
- Must respect cost limits (no runaway spending)
- Must maintain backward compatibility with existing tools
- Must work in isolated environment (security)

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-02-15 (after IN-028 Phase 6 completes)
- **Target Completion**: 2026-05-02
- **Key Milestones**:
  - **M1: Agent Orchestrator**: 2026-02-28
  - **M2: Virtual Environment**: 2026-03-07
  - **M3: Slack Integration**: 2026-03-14
  - **M4: Error Handling**: 2026-03-28
  - **M5: Testing & Quality Evaluation**: 2026-04-11
  - **M6: Cost Tracking**: 2026-04-18
  - **M7: Knowledge Base**: 2026-04-25
  - **M8: Integration Complete**: 2026-05-02

### Priority

**Priority Level**: P1

**Rationale**: 
- Addresses critical pain point: "found workflow online → can't test it quickly"
- Enables rapid iteration on new workflows
- Reduces deployment time by 90%
- Competitive advantage: test workflows in minutes vs. hours

### Resource Requirements

- **Team**: Infrastructure Team (1 engineer), Backend Team (0.5 engineer for integration)
- **Budget**: No additional budget required (uses existing infrastructure, cost limits enforced)
- **External Dependencies**: 
  - Modal.com (existing)
  - Cursor/MCP (existing)
  - Docker/VM for virtual environment

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team Lead  
**Role**: Infrastructure Team  
**Responsibilities**: 
- Design and implement agentic deployment system
- Build agent orchestrator and virtual environment
- Ensure integration with existing tools
- Maintain cost limits and security

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend | High | Integration with existing services, API compatibility |
| DevOps Team | DevOps | Medium | Virtual environment setup, security |
| Product Team | Product | Low | Workflow requirements, testing |

### Teams Involved

- **Infrastructure Team**: Primary implementation
- **Backend Team**: Integration and API compatibility
- **DevOps Team**: Virtual environment and security

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Slack status update in #mvp-ryla-dev
- **Audience**: Infrastructure Team, Backend Team, DevOps Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| **Deployment Time** | < 10 minutes (autonomous) | Time from workflow JSON to tested endpoint | End of Phase 7 |
| **Success Rate** | 90%+ first attempt | % of workflows that deploy successfully on first try | End of Phase 7 |
| **Error Recovery** | 80%+ auto-fixed | % of deployment errors automatically fixed | End of Phase 3 |
| **Cost Compliance** | 100% | % of deployments that respect cost limits | End of Phase 5 |
| **Knowledge Base Growth** | 10+ patterns | Number of documented deployment patterns | End of Phase 6 |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [x] B-Retention [x] C-Core Value [x] E-CAC

**Expected Impact**:
- **A-Activation**: Faster workflow deployment = faster feature delivery
- **B-Retention**: Workflow isolation prevents breaking changes
- **C-Core Value**: More workflows available = better product
- **E-CAC**: 90% reduction in deployment time = lower operational costs

### Leading Indicators

- Agent orchestrator successfully coordinates deployment
- Virtual environment provides necessary access
- Error handling fixes common issues automatically
- Endpoint testing verifies deployments work

### Lagging Indicators

- New workflows deploy in < 10 minutes (autonomous)
- 90%+ success rate on first deployment attempt
- Cost limits enforced (no runaway spending)
- Knowledge base contains 10+ deployment patterns

---

## Definition of Done

### Initiative Complete When:

- [ ] Agent orchestrator coordinates full deployment process
- [ ] Virtual environment provides isolated access with credentials
- [ ] Error handling automatically fixes 80%+ of common issues
- [ ] Endpoint testing verifies deployments work automatically
- [ ] Cost limits enforced and tracked
- [ ] Knowledge base documents successful patterns
- [ ] End-to-end testing: 10+ workflows deployed successfully
- [ ] Documentation complete (usage guide, examples)
- [ ] Integration with existing infrastructure verified

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Manual intervention still required for deployment
- [ ] Error handling doesn't fix common issues
- [ ] Endpoint testing doesn't verify deployments
- [ ] Cost limits not enforced
- [ ] Knowledge base not documenting learnings
- [ ] Documentation missing or incomplete

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-005 | Content Studio | Active | [Link](../requirements/epics/mvp/EP-005-content-studio.md) |
| EP-044 | Serverless Endpoint Testing | In Progress | [Link](../requirements/epics/mvp/EP-044-serverless-endpoint-testing.md) |

### Dependencies

- **Blocks**: Faster workflow deployment (enables rapid feature development)
- **Blocked By**: IN-028 Phase 6 (needs workflow deployment tools complete)
- **Related Initiatives**: 
  - IN-028: Workflow-to-Serverless Deployment (provides foundation)
  - IN-008: ComfyUI Dependency Management (provides dependency tools)
  - IN-019: Automated Workflow Analyzer (provides analysis tools)

### Documentation

- [IN-028: Workflow-to-Serverless Deployment](./IN-028-workflow-to-serverless-deployment.md)
- [Modal Comprehensive Guide](../../research/infrastructure/MODAL-COMPREHENSIVE-GUIDE.md)
- [Ralph Pattern](../../.cursor/rules/ralph.mdc)
- [Modal Best Practices](../../.cursor/rules/mcp-modal.mdc)

---

## Technical Details

### Agent Orchestrator Architecture

```typescript
// scripts/agentic-deployer/orchestrator.ts
import { IncomingWebhook } from '@slack/webhook';

interface DeploymentRequest {
  workflowJson: string | object;
  workflowName?: string;
  costLimit?: number; // USD (default: $20)
  maxIterations?: number;
  successCriteria?: SuccessCriteria;
  slackChannel?: string; // Slack channel for notifications
}

class AgentOrchestrator {
  private slackWebhook: IncomingWebhook;
  
  constructor(slackWebhookUrl: string) {
    this.slackWebhook = new IncomingWebhook(slackWebhookUrl);
  }
  
  async notifySlack(message: string, blocks?: any[]) {
    await this.slackWebhook.send({
      text: message,
      blocks: blocks
    });
  }
  
  async deploy(request: DeploymentRequest): Promise<DeploymentResult> {
    // Notify start
    await this.notifySlack(`🚀 Starting deployment: ${request.workflowName || 'workflow'}`);
    
    // 1. Analyze workflow
    await this.notifySlack('📊 Analyzing workflow...');
    const analysis = await this.analyzeWorkflow(request.workflowJson);
    
    // 2. Generate deployment code
    await this.notifySlack('🔧 Generating deployment code...');
    const code = await this.generateCode(analysis);
    
    // 3. Deploy with retry logic (Ralph pattern)
    await this.notifySlack('🚀 Deploying to Modal...');
    let result = await this.deployWithRetry(code, request);
    
    // 4. Test endpoint
    if (result.success) {
      await this.notifySlack('🧪 Testing endpoint...');
      result = await this.testEndpoint(result.endpointUrl, request);
    }
    
    // 5. Document learnings
    await this.documentLearnings(result, analysis);
    
    // Final notification
    if (result.success) {
      await this.notifySlack(
        `✅ Deployment complete!\n` +
        `Endpoint: ${result.endpointUrl}\n` +
        `Cost: $${result.cost.toFixed(2)} / $${request.costLimit || 20}`
      );
    } else {
      await this.notifySlack(
        `❌ Deployment failed after ${result.iterations} iterations\n` +
        `Errors: ${result.errors?.join(', ')}\n` +
        `Cost: $${result.cost.toFixed(2)}`
      );
    }
    
    return result;
  }

interface DeploymentResult {
  success: boolean;
  endpointUrl?: string;
  cost: number;
  iterations: number;
  learnings: string[];
  errors?: string[];
}

class AgentOrchestrator {
  async deploy(request: DeploymentRequest): Promise<DeploymentResult> {
    // 1. Analyze workflow
    const analysis = await this.analyzeWorkflow(request.workflowJson);
    
    // 2. Generate deployment code
    const code = await this.generateCode(analysis);
    
    // 3. Deploy with retry logic (Ralph pattern)
    let result = await this.deployWithRetry(code, request);
    
    // 4. Test endpoint
    if (result.success) {
      result = await this.testEndpoint(result.endpointUrl, request);
    }
    
    // 5. Document learnings
    await this.documentLearnings(result, analysis);
    
    return result;
  }
  
  private async deployWithRetry(
    code: string,
    request: DeploymentRequest
  ): Promise<DeploymentResult> {
    let iteration = 0;
    let lastError: Error | null = null;
    
    while (iteration < (request.maxIterations || 10)) {
      iteration++;
      
      try {
        // Deploy
        const endpoint = await this.deployToModal(code);
        
        // Check cost
        const cost = await this.getDeploymentCost();
        const limit = request.costLimit || 20;
        if (cost > limit) {
          await this.notifySlack(
            `⚠️ Cost limit exceeded: $${cost.toFixed(2)} / $${limit}\n` +
            `Stopping deployment to prevent runaway costs.`
          );
          throw new Error(`Cost limit exceeded: $${cost}`);
        }
        
        // Warn if approaching limit
        if (cost > limit * 0.8) {
          await this.notifySlack(
            `⚠️ Approaching cost limit: $${cost.toFixed(2)} / $${limit}`
          );
        }
        
        return {
          success: true,
          endpointUrl: endpoint,
          cost,
          iterations: iteration,
          learnings: []
        };
      } catch (error) {
        lastError = error;
        
        // Try to fix error
        const fix = await this.analyzeAndFix(error, code);
        if (fix) {
          code = fix.updatedCode;
          continue; // Retry with fixed code
        } else {
          // Can't fix automatically
          break;
        }
      }
    }
    
    return {
      success: false,
      cost: await this.getDeploymentCost(),
      iterations: iteration,
      errors: [lastError?.message || 'Unknown error'],
      learnings: []
    };
  }
}
```

### Virtual Environment Setup

```dockerfile
# Dockerfile for agent environment
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip \
    nodejs npm \
    git curl \
    jq

# Install Modal CLI
RUN pip3 install modal

# Install workflow-deployer
COPY scripts/workflow-deployer /app/workflow-deployer
WORKDIR /app/workflow-deployer
RUN npm install

# Install Slack SDK
RUN npm install @slack/webhook

# Configure credentials (from secrets/environment)
ENV MODAL_TOKEN_ID=${MODAL_TOKEN_ID}
ENV MODAL_TOKEN_ID_SECRET=${MODAL_TOKEN_ID_SECRET}
ENV SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
ENV GIT_SSH_KEY=${GIT_SSH_KEY}
ENV GIT_REPO_URL=${GIT_REPO_URL}

# Run agent
CMD ["node", "orchestrator.js"]
```

**Alternative: VM Setup** (if more resources needed):
- Same dependencies as Docker
- More storage for large workflows
- GPU access if needed for quality evaluation
- Persistent storage for knowledge base

### Error Handling Patterns

```typescript
// Common error fixes
const errorFixes = {
  'Missing custom node': async (error, code) => {
    // Extract missing node from error
    const nodeName = extractNodeName(error);
    // Add to deployment code
    return updateCodeWithNode(code, nodeName);
  },
  
  'Modal deployment failed': async (error, code) => {
    // Check if it's a transient error
    if (isTransientError(error)) {
      // Retry with backoff
      await sleep(5000);
      return { updatedCode: code, retry: true };
    }
    // Otherwise, analyze and fix
    return analyzeModalError(error, code);
  },
  
  'Endpoint test failed': async (error, endpointUrl) => {
    // Check logs
    const logs = await getModalLogs(endpointUrl);
    // Analyze issue
    const issue = analyzeLogs(logs);
    // Fix if possible
    return fixEndpointIssue(issue, endpointUrl);
  }
};
```

### Cost Tracking

```typescript
class CostTracker {
  private costs: Map<string, number> = new Map();
  
  async trackDeployment(appName: string): Promise<number> {
    // Get Modal costs for deployment
    const cost = await this.getModalCosts(appName);
    this.costs.set(appName, cost);
    return cost;
  }
  
  async checkLimit(appName: string, limit: number): Promise<boolean> {
    const cost = this.costs.get(appName) || 0;
    return cost < limit;
  }
  
  getTotalCost(): number {
    return Array.from(this.costs.values()).reduce((a, b) => a + b, 0);
  }
}
```

### Knowledge Base Structure

```
docs/knowledge-base/workflows/
├── README.md
├── repository-connection.md  # How to connect to repository
├── patterns/
│   ├── flux-workflow-pattern.md
│   ├── instantid-pattern.md
│   └── ...
└── learnings/
    ├── common-errors.md
    ├── cost-estimates.md
    ├── performance-metrics.md
    └── repository-setup.md  # Repository access patterns
```

### Repository Connection Documentation

**Purpose**: Document how agent connects to repository for knowledge base updates

**Content**:
- Git credentials setup (SSH keys, tokens)
- Repository URL and access patterns
- Branch strategy for knowledge base commits
- Commit message format
- Documentation location in repository
- How to update knowledge base from agent

**Example**:
```markdown
# Repository Connection Guide

## Setup
1. Generate SSH key for agent: `ssh-keygen -t ed25519 -C "agent@ryla"`
2. Add public key to GitHub/GitLab
3. Configure git: `git config user.name "RYLA Agent"`

## Access Pattern
- Repository: `git@github.com:ryla/ryla.git`
- Branch: `main` (or `knowledge-base` for knowledge updates)
- Documentation Path: `docs/knowledge-base/workflows/`

## Commit Pattern
- Format: `docs(workflow): add deployment pattern for [workflow-name]`
- Include: deployment code, dependencies, cost, performance metrics
```

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Agent Fails to Fix Errors** | Medium | High | Start with common fixes, expand based on learnings |
| **Cost Limits Too Restrictive** | Low | Medium | Make limits configurable, start conservative |
| **Virtual Environment Security** | Medium | High | Use isolated Docker container, limit credentials |
| **Knowledge Base Becomes Unwieldy** | Medium | Low | Structure from start, regular cleanup |
| **Modal API Changes** | Low | Medium | Version pinning, abstraction layer |

---

## Future Enhancements

### Phase 2: Parameter Variation Testing

**Goal**: Test workflows with different parameters automatically

**Features**:
- Generate multiple parameter variations
- Test each variation
- Compare results
- Recommend best parameters

**Note**: Quality evaluation moved to Phase 5 (earlier in timeline)

### Phase 3: Result Quality Evaluation (Moved to Phase 5)

**Goal**: Automatically evaluate generated output quality

**Features**:
- Image quality metrics
- Consistency checks
- Comparison with reference
- Quality scoring
- Quality thresholds for success criteria

**Note**: Now part of Phase 5 (Testing & Quality Evaluation)

### Phase 4: Shared Knowledge Base (Advanced)

**Goal**: Structured knowledge base for deployment patterns

**Features**:
- Database for patterns
- Search and retrieval
- Pattern matching
- Automatic pattern application
- Repository connection documentation

### Phase 5: Multi-Agent Collaboration

**Goal**: Multiple agents working on different workflows

**Features**:
- Parallel deployment
- Resource sharing
- Load balancing
- Coordination

---

## Progress Tracking

### Current Phase

**Phase**: Proposed  
**Status**: Not Started

### Recent Updates

- **2026-01-28**: Initiative created based on user requirements and OpenCode inspiration
- **2026-01-28**: **DECISION: Split Modal endpoints into separate apps** - Started migration to enable agent isolation and parallel deployment

### App Splitting Decision (2026-01-28)

**Decision**: Split single Modal app (`ryla-comfyui`) into multiple isolated apps, one per workflow/model.

**Rationale**:
1. **Agent Isolation**: Enables IN-027 multi-agent orchestration - agents can work in parallel without file conflicts
2. **Faster Deployment**: Deploy individual apps independently, test in parallel
3. **Clear Boundaries**: Each workflow has isolated files for agent assignment
4. **Git Worktrees**: Each app can be in separate worktree for true isolation
5. **Faster Iteration**: Fix/deploy one endpoint without affecting others

**Structure**:
```
apps/modal/
├── shared/              # Shared code (read-only for agents)
│   ├── config.py
│   ├── image_base.py
│   └── utils/
└── apps/                # Individual apps (agent-isolated)
    ├── flux/           # Flux Schnell & Flux Dev
    ├── instantid/       # InstantID face consistency
    ├── wan2/           # Wan2.1 text-to-video
    ├── seedvr2/        # SeedVR2 upscaling
    └── z-image/        # Z-Image-Turbo workflows
```

**Status**: Phase 1 in progress - Shared code extracted, Flux app created as template

**Migration Plan**: See `apps/modal/docs/MULTI-AGENT-MIGRATION-PLAN.md`

**Benefits**:
- ✅ Agents can work in parallel (no file conflicts)
- ✅ Deploy apps independently (faster iteration)
- ✅ Test endpoints in parallel (faster validation)
- ✅ Clear file boundaries for agent assignment
- ✅ Aligns with IN-027 multi-agent system

**Trade-offs**:
- ⚠️ Each app has its own ComfyUI instance (more memory, but enables isolation)
- ⚠️ More deployment commands (automated via `deploy.sh`)

### Next Steps

1. ✅ **Complete app splitting** - Create all individual apps (in progress)
2. ⏳ Test each app independently
3. ⏳ Update client script for new endpoints
4. ⏳ Review and approve initiative
5. ⏳ Assign Infrastructure Team engineer
6. ⏳ Start Phase 1: Build agent orchestrator
7. ⏳ Set up virtual environment
8. ⏳ Implement error handling

---

## Lessons Learned

[To be filled during/after initiative completion]

---

## References

- [OpenCode GitHub](https://github.com/anomalyco/opencode) - Inspiration for agentic approach
- [IN-028: Workflow-to-Serverless Deployment](./IN-028-workflow-to-serverless-deployment.md)
- [Ralph Pattern](../../.cursor/rules/ralph.mdc)
- [Modal Comprehensive Guide](../../research/infrastructure/MODAL-COMPREHENSIVE-GUIDE.md)
- [Modal Best Practices](../../.cursor/rules/mcp-modal.mdc)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-28
