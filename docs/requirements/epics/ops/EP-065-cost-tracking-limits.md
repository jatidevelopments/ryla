# [EPIC] EP-065: Cost Tracking & Limits

**Status**: Proposed  
**Phase**: P1  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28

> **Initiative**: [IN-031: Agentic ComfyUI Workflow Deployment System](../../../initiatives/IN-031-agentic-workflow-deployment.md)  
> **Depends On**: EP-063 (Workflow Deployment Orchestration)

---

## Overview

Implement cost tracking and enforcement for workflow deployments, preventing runaway costs and providing cost visibility to users.

---

## P1: Requirements

### Problem Statement

Workflow deployments can incur costs (Modal.com deployment, execution, etc.). Without cost tracking and limits, deployments could exceed budgets or cause unexpected charges.

**Who has this problem**: Users and infrastructure team need cost control

**Why it matters**: Prevents budget overruns and unexpected charges

### MVP Objective

**Implement cost tracking and limit enforcement:**

- Track costs per deployment (Modal deployment, execution)
- Enforce cost limit: $20 per workflow (configurable)
- Send cost alerts at 80% of limit
- Stop deployment if limit exceeded
- Report costs in Slack notifications
- Track total costs across deployments

**Measurable**: 
- 100% of deployments respect cost limits
- Cost alerts sent at 80% threshold
- Deployments stopped at 100% limit
- Cost tracking accurate within 5%

### Non-Goals

- Advanced cost optimization (separate work)
- Cost prediction (track actual costs only)
- Multi-currency support (USD only)

### Business Metric

**Target**: E-CAC (Cost Control), Risk Mitigation

---

## P2: Scoping

### Feature List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Cost Tracking | Track costs per deployment (Modal, execution) | P0 |
| F2 | Cost Limit Enforcement | Enforce $20 limit per workflow | P0 |
| F3 | Cost Alerts | Send alerts at 80% and 100% of limit | P0 |
| F4 | Cost Reporting | Report costs in Slack notifications | P0 |
| F5 | Cost Aggregation | Track total costs across deployments | P1 |

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| ST-001 | Cost Tracking | Agent tracks Modal deployment costs |
| ST-002 | Cost Limit | Agent enforces $20 limit per workflow |
| ST-003 | Cost Alerts | Agent sends alerts at 80% and 100% of limit |
| ST-004 | Cost Reporting | Agent reports costs in Slack notifications |
| ST-005 | Cost Aggregation | Agent tracks total costs across deployments |

---

## P3: Architecture

### Cost Tracking

```typescript
class CostTracker {
  private costs: Map<string, number> = new Map();
  
  async trackDeployment(
    workflowId: string,
    cost: number
  ): Promise<void> {
    this.costs.set(workflowId, cost);
  }
  
  async checkLimit(
    workflowId: string,
    limit: number
  ): Promise<{ withinLimit: boolean; current: number; remaining: number }> {
    const current = this.costs.get(workflowId) || 0;
    const remaining = limit - current;
    
    return {
      withinLimit: current < limit,
      current,
      remaining,
    };
  }
  
  getTotalCost(): number {
    return Array.from(this.costs.values()).reduce((a, b) => a + b, 0);
  }
}
```

### Cost Limit Enforcement

```typescript
async function deployWithCostLimit(
  workflowJson: string,
  costLimit: number = 20
): Promise<DeploymentResult> {
  const tracker = new CostTracker();
  
  // Track deployment cost
  const deploymentCost = await getModalDeploymentCost();
  await tracker.trackDeployment(workflowId, deploymentCost);
  
  // Check limit
  const { withinLimit, current } = await tracker.checkLimit(workflowId, costLimit);
  
  if (!withinLimit) {
    throw new Error(`Cost limit exceeded: $${current} / $${costLimit}`);
  }
  
  // Alert at 80%
  if (current > costLimit * 0.8) {
    await sendSlackAlert(`⚠️ Approaching cost limit: $${current} / $${costLimit}`);
  }
  
  // Continue deployment...
}
```

---

## Dependencies

- **EP-063**: Workflow Deployment Orchestration (must have deployment flow)
- **EP-062**: Slack Integration (for cost alerts)

---

## Acceptance Criteria

- [ ] Agent tracks deployment costs accurately
- [ ] Agent enforces $20 limit per workflow
- [ ] Agent sends alerts at 80% of limit
- [ ] Agent stops deployment at 100% limit
- [ ] Agent reports costs in Slack notifications
- [ ] Cost tracking accurate within 5%

---

## Timeline

- **Start Date**: 2026-04-05 (after EP-064)
- **Target Completion**: 2026-04-11 (1 week)

---

## References

- [IN-031: Agentic Workflow Deployment](../../../initiatives/IN-031-agentic-workflow-deployment.md)
- [EP-063: Workflow Deployment Orchestration](./EP-063-workflow-deployment-orchestration.md)
- [EP-062: Slack Integration](./EP-062-slack-integration-workflow-upload.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-28
