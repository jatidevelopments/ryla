# [EPIC] EP-062: Slack Integration & Workflow Upload

**Status**: Proposed  
**Phase**: P1  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28

> **Initiative**: [IN-031: Agentic ComfyUI Workflow Deployment System](../../../initiatives/IN-031-agentic-workflow-deployment.md)  
> **Depends On**: EP-061 (Moltbot Agent Setup)

---

## Overview

Build Slack integration for the workflow deployment agent, enabling users to upload ComfyUI workflow JSON files and receive real-time status updates, notifications, and deployment results.

---

## P1: Requirements

### Problem Statement

Users need an easy way to submit workflows to the agent and receive updates. Manual file uploads and command-line interfaces are too complex. Slack provides a familiar, accessible interface that integrates with existing workflows.

**Who has this problem**: Users who want to deploy ComfyUI workflows quickly

**Why it matters**: Without easy submission and communication, the agent is not usable

### MVP Objective

**Enable Slack-based workflow submission and notifications:**

- Users can upload workflow.json files to Slack channel
- Users can paste workflow JSON in Slack messages
- Agent receives workflow submissions via Slack webhooks
- Agent sends real-time status updates to Slack
- Agent sends success/failure notifications with endpoint URLs
- Agent sends cost alerts (80% and 100% of limit)

**Measurable**: 
- 100% of workflow submissions via Slack
- Status updates sent within 5 seconds of state change
- Notifications include all required information (endpoint, cost, status)

### Non-Goals

- Interactive Slack commands (future enhancement)
- Workflow deployment logic (separate epic)
- Multi-channel support (single channel for MVP)

### Business Metric

**Target**: A-Activation (Easy workflow submission), C-Core Value (Faster deployment)

---

## P2: Scoping

### Feature List

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Slack Bot Setup | Create Slack bot app, configure webhooks | P0 |
| F2 | File Upload Handler | Handle workflow.json file uploads from Slack | P0 |
| F3 | JSON Message Parser | Parse workflow JSON from Slack messages | P0 |
| F4 | Status Updates | Send real-time status updates to Slack | P0 |
| F5 | Success Notifications | Send success notifications with endpoint URLs | P0 |
| F6 | Error Notifications | Send error notifications with details | P0 |
| F7 | Cost Alerts | Send cost limit warnings (80%, 100%) | P1 |

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| ST-001 | Slack Bot Configuration | Slack bot created, webhook URL configured, bot added to channel |
| ST-002 | File Upload Support | Agent receives workflow.json file uploads, extracts JSON content |
| ST-003 | JSON Message Support | Agent detects JSON in Slack messages, extracts workflow |
| ST-004 | Status Updates | Agent sends status updates (analyzing, deploying, testing) |
| ST-005 | Success Notification | Agent sends success notification with endpoint URL, cost, quality score |
| ST-006 | Error Notification | Agent sends error notification with error details, fix suggestions |
| ST-007 | Cost Alerts | Agent sends cost warnings at 80% and stops at 100% |

---

## P3: Architecture

### Slack Integration Flow

```
User uploads workflow.json
    ↓
Slack sends webhook to agent
    ↓
Agent extracts workflow JSON
    ↓
Agent sends acknowledgment: "📥 Received workflow..."
    ↓
Agent processes workflow (deployment)
    ↓
Agent sends status updates:
  - "📊 Analyzing workflow..."
  - "🔧 Generating code..."
  - "🚀 Deploying to Modal..."
  - "🧪 Testing endpoint..."
    ↓
Agent sends final notification:
  - Success: "✅ Deployment complete! Endpoint: [url]"
  - Failure: "❌ Deployment failed: [error]"
```

### Message Format

**Status Update**:
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
    }
  ]
}
```

**Success Notification**:
```json
{
  "text": "✅ Deployment Complete",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Endpoint:* https://ryla--workflow-name.modal.run\n*Cost:* $3.25 / $20.00\n*Status:* ✅ All tests passed"
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
          "url": "https://ryla--workflow-name.modal.run/health"
        }
      ]
    }
  ]
}
```

---

## Dependencies

- **EP-061**: Moltbot Agent Setup (agent must be running)
- **Slack API**: Slack bot app and webhooks
- **Moltbot**: Slack integration capabilities

---

## Acceptance Criteria

- [ ] Slack bot created and configured
- [ ] Agent receives file uploads from Slack
- [ ] Agent receives JSON messages from Slack
- [ ] Agent sends status updates to Slack
- [ ] Agent sends success notifications with endpoint URLs
- [ ] Agent sends error notifications with details
- [ ] Agent sends cost alerts at 80% and 100%
- [ ] All notifications formatted correctly (Slack blocks)

---

## Timeline

- **Start Date**: 2026-03-01 (after EP-061)
- **Target Completion**: 2026-03-07 (1 week)

---

## References

- [IN-031: Agentic Workflow Deployment](../../../initiatives/IN-031-agentic-workflow-deployment.md)
- [EP-061: Moltbot Agent Setup](./EP-061-moltbot-agent-fly-io-deployment.md)
- [Slack API Documentation](https://api.slack.com/)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-28
