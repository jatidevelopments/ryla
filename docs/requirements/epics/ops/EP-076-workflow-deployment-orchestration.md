# [EPIC] EP-076: Workflow Deployment Orchestration

**Status**: Proposed  
**Phase**: P1  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28

> **Initiative**: [IN-031: Agentic ComfyUI Workflow Deployment System](../../../initiatives/IN-031-agentic-workflow-deployment.md)  
> **Depends On**: EP-061 (Moltbot Agent Setup), EP-062 (Slack Integration), IN-028 (Workflow Deployment Tools)

---

## Overview

Build the core orchestration logic that coordinates workflow analysis, code generation, Modal deployment, and endpoint testing using existing workflow-deployer tools.

---

## P1: Requirements

### Problem Statement

We have workflow analysis and code generation tools (from IN-028), but no orchestration layer to coordinate the full deployment process. The agent needs to:
- Analyze workflow JSON
- Generate deployment code
- Deploy to Modal.com
- Test the endpoint
- Handle the full flow autonomously

**Who has this problem**: Infrastructure team needs autonomous deployment orchestration

**Why it matters**: Without orchestration, manual steps are still required

### MVP Objective

**Build orchestration layer that coordinates full deployment process:**

- Agent analyzes workflow JSON using existing tools
- Agent generates deployment code using existing tools
- Agent deploys to Modal.com using Modal CLI
- Agent tests deployed endpoint (health check, basic generation test)
- Agent coordinates all steps in sequence
- Agent handles basic errors (retry, timeout)

**Measurable**: 
- 90%+ workflows deploy successfully on first attempt
- Full deployment completes in < 10 minutes
- All orchestration steps execute in correct order

### Non-Goals

- Advanced error handling (separate epic)
- Cost tracking (separate epic)
- Quality evaluation (separate epic)

### Business Metric

**Target**: C-Core Value (Faster Workflow Deployment), E-CAC (Reduced Deployment Time)

---

## P2: Scoping

### Feature List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Workflow Analysis Integration | Integrate with workflow-deployer analyze tool | P0 |
| F2 | Code Generation Integration | Integrate with workflow-deployer generate tool | P0 |
| F3 | Modal Deployment | Deploy generated code to Modal.com | P0 |
| F4 | Endpoint Health Check | Test endpoint health after deployment | P0 |
| F5 | Basic Generation Test | Test endpoint with minimal workflow | P0 |
| F6 | Orchestration Flow | Coordinate all steps in sequence | P0 |
| F7 | Basic Error Handling | Handle timeouts, retries for deployment | P1 |

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| ST-001 | Workflow Analysis | Agent analyzes workflow JSON, extracts dependencies |
| ST-002 | Code Generation | Agent generates Modal deployment code from analysis |
| ST-003 | Modal Deployment | Agent deploys code to Modal.com, gets endpoint URL |
| ST-004 | Health Check | Agent tests endpoint health, verifies it's accessible |
| ST-005 | Generation Test | Agent tests endpoint with sample workflow, verifies response |
| ST-006 | Full Orchestration | Agent coordinates all steps, completes deployment end-to-end |

---

## P3: Architecture

### Orchestration Flow

```
Workflow JSON Input
    ↓
1. Analyze Workflow
   - Extract dependencies
   - Identify custom nodes
   - Identify models
    ↓
2. Generate Code
   - Generate Modal Python code
   - Include dependencies
   - Include custom nodes
    ↓
3. Deploy to Modal
   - Run `modal deploy`
   - Monitor deployment
   - Get endpoint URL
    ↓
4. Test Endpoint
   - Health check: GET /health
   - Generation test: POST /generate
   - Verify response
    ↓
Success: Return endpoint URL
```

### Integration with Existing Tools

**Workflow Analyzer** (`scripts/workflow-deployer/`):
```typescript
import { analyzeWorkflow } from '@ryla/workflow-deployer';

const analysis = await analyzeWorkflow(workflowJson);
// Returns: { dependencies, customNodes, models, ... }
```

**Code Generator** (`scripts/workflow-deployer/`):
```typescript
import { generateModalCode } from '@ryla/workflow-deployer';

const code = await generateModalCode(analysis);
// Returns: Python code for Modal deployment
```

**Modal Deployment**:
```typescript
import { exec } from 'child_process';

await exec('modal deploy workflow.py');
// Returns: Endpoint URL
```

---

## Dependencies

- **EP-061**: Moltbot Agent Setup (agent must be running)
- **EP-062**: Slack Integration (for notifications)
- **IN-028**: Workflow Deployment Tools (analysis and code generation)

---

## Acceptance Criteria

- [ ] Agent analyzes workflow JSON successfully
- [ ] Agent generates deployment code successfully
- [ ] Agent deploys to Modal.com successfully
- [ ] Agent tests endpoint health check
- [ ] Agent tests endpoint generation
- [ ] Full orchestration completes end-to-end
- [ ] Deployment completes in < 10 minutes
- [ ] 90%+ success rate on first attempt

---

## Timeline

- **Start Date**: 2026-03-08 (after EP-062)
- **Target Completion**: 2026-03-21 (2 weeks)

---

## References

- [IN-031: Agentic Workflow Deployment](../../../initiatives/IN-031-agentic-workflow-deployment.md)
- [IN-028: Workflow-to-Serverless Deployment](../../../initiatives/IN-028-workflow-to-serverless-deployment.md)
- [EP-061: Moltbot Agent Setup](./EP-061-moltbot-agent-fly-io-deployment.md)
- [EP-062: Slack Integration](./EP-062-slack-integration-workflow-upload.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-28
