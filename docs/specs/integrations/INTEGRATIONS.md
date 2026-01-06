# MCP Integrations

## Overview
Tool integrations for automated development workflows.

---

## GitHub (MCP)

### Purpose
- Issue management
- Repository operations
- Pull request automation
- Project tracking

### Setup
1. Create Personal Access Token (PAT)
2. Add to credentials:
   ```
   GITHUB_TOKEN=ghp_xxxxx
   GITHUB_OWNER=your-org
   GITHUB_REPO=ryla
   ```

### MCP Commands
```
# Issues
mcp github create-issue --title "[FEATURE] Title" --body "..."
mcp github list-issues --state open --labels "priority:high"
mcp github update-issue --id 42 --state closed

# PRs
mcp github create-pr --title "feat: description" --base main --head feat/branch
mcp github merge-pr --id 15 --method squash

# Projects
mcp github move-card --project "MVP" --column "In Progress" --issue 42
```

### Automation Triggers
| Event | Action |
|-------|--------|
| Issue created | Add to project board |
| PR merged | Close linked issues |
| Label added | Notify Slack channel |

---

## Slack (MCP)

### Purpose
- Team notifications
- Audit logging
- Knowledge capture
- Alerts

### Channels
| Channel | Purpose | Automation |
|---------|---------|------------|
| `#ryla-dev` | Development discussion | Manual |
| `#ryla-pm` | Project management | Issue updates |
| `#ryla-audit` | Audit logs | All actions |
| `#ryla-learnings` | Knowledge capture | Weekly digest |
| `#ryla-deploys` | Deploy notifications | CI/CD |
| `#ryla-alerts` | System alerts | Monitoring |

### Setup
1. Create Slack App
2. Add Bot Token Scopes:
   - `chat:write`
   - `channels:read`
   - `channels:join`
3. Create webhooks for each channel
4. Add to credentials:
   ```
   SLACK_BOT_TOKEN=xoxb-xxxxx
   SLACK_WEBHOOK_AUDIT=https://hooks.slack.com/...
   SLACK_WEBHOOK_LEARNINGS=https://hooks.slack.com/...
   SLACK_WEBHOOK_DEPLOYS=https://hooks.slack.com/...
   SLACK_WEBHOOK_ALERTS=https://hooks.slack.com/...
   ```

### MCP Commands
```
# Send message
mcp slack send --channel "#ryla-deploys" --message "DEPLOY: staging v1.0.0 success"

# Post learning
mcp slack send --channel "#ryla-learnings" --message "LEARNING: testing - always mock at boundaries"

# Alert
mcp slack send --channel "#ryla-alerts" --message "ALERT: error rate > 5%"
```

### Message Formats
```
# Status update
STATUS: RYLA-42 in-progress

# Completion
DONE: RYLA-42 user authentication implemented

# Blocker
BLOCKED: RYLA-42 waiting on API spec

# Deploy
DEPLOY: staging v1.2.3 success

# Learning
LEARNING: architecture - keep services stateless

# Alert
ALERT: [severity] [description]
```

---

## RunPod (MCP)

### Purpose
- GPU infrastructure management
- Pod lifecycle management
- Serverless endpoint configuration
- Template management
- Network volume management

### Setup
1. Get RunPod API key from https://www.runpod.io/console/user/settings
2. Configure MCP server in `.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "runpod": {
         "command": "npx",
         "args": ["@runpod/mcp-server@latest"],
         "env": {
           "RUNPOD_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```
3. Add to credentials:
   ```
   RUNPOD_API_KEY=rpa_xxxxx
   ```
4. Restart Cursor to load MCP server

### MCP Commands
```
# List pods
List all my RunPod pods

# Create pod
Create a RunPod pod with GPU type RTX 4090

# Manage endpoints
Show me my RunPod serverless endpoints
Create a new serverless endpoint

# Templates
List all RunPod templates
Create a template for my workflow

# Network volumes
List my network volumes
Create a 100GB network volume
```

### Use Cases
- On-demand GPU pods for AI model training/inference
- Serverless endpoints for scalable AI workloads
- Template-based deployments for repeatable setups
- Network volumes for persistent data storage

---

## PostHog (Analytics)

### Purpose
- User behavior tracking
- Funnel analysis
- Feature flags
- A/B testing

### Setup
1. Create PostHog project
2. Get API key
3. Add to credentials:
   ```
   ANALYTICS_POSTHOG_KEY=phc_xxxxx
   ANALYTICS_POSTHOG_HOST=https://app.posthog.com
   ```

### SDK Integration
```javascript
// Initialize
import posthog from 'posthog-js';

posthog.init(process.env.ANALYTICS_POSTHOG_KEY, {
  api_host: process.env.ANALYTICS_POSTHOG_HOST,
  autocapture: true,
  capture_pageview: true
});

// Identify user
posthog.identify(userId, {
  email: user.email,
  plan: user.plan
});

// Track event
posthog.capture('feature_used', {
  feature: 'export',
  format: 'pdf'
});

// Feature flags
if (posthog.isFeatureEnabled('new-onboarding')) {
  // Show new onboarding
}
```

### Key Events to Track
| Event | When | Properties |
|-------|------|------------|
| `user_signed_up` | Registration | source, plan |
| `user_activated` | First key action | time_to_activate |
| `feature_used` | Feature interaction | feature, count |
| `user_converted` | Paid subscription | plan, trial_days |
| `user_churned` | Cancellation | reason, lifetime |
| `error_occurred` | User-facing error | type, message |

### Funnels to Create
1. **Signup Funnel**: Visit → Signup → Activate
2. **Conversion Funnel**: Activate → Trial → Paid
3. **Feature Adoption**: Feature A → Feature B → Feature C

---

## Playwright (Testing)

### Purpose
- End-to-end testing
- Browser automation
- Visual regression
- Cross-browser testing

### Setup
1. Install Playwright:
   ```bash
   npm init playwright@latest
   ```
2. Configure:
   ```
   PLAYWRIGHT_BASE_URL=http://localhost:3000
   PLAYWRIGHT_HEADLESS=true
   ```

### Directory Structure
```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── onboarding.spec.ts
│   ├── core-feature.spec.ts
│   └── payment.spec.ts
├── fixtures/
│   └── test-data.ts
└── playwright.config.ts
```

### Example Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user to sign up', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123');
    await page.click('[data-testid="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'wrong@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="submit"]');
    
    await expect(page.locator('[data-testid="error"]')).toContainText('Invalid credentials');
  });
});
```

### CI Integration
```yaml
# .github/workflows/test.yml
- name: Run Playwright tests
  run: npx playwright test
  env:
    PLAYWRIGHT_BASE_URL: ${{ secrets.STAGING_URL }}
```

---

## GitHub Actions (CI/CD)

### Purpose
- Continuous integration
- Automated testing
- Deployment pipeline

### Workflows

#### Test on PR
```yaml
# .github/workflows/test.yml
name: Test
on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npx playwright test
```

#### Deploy to Staging
```yaml
# .github/workflows/staging.yml
name: Deploy Staging
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Notify Slack
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_DEPLOYS }} \
            -d '{"text":"DEPLOY: staging ${{ github.sha }} success"}'
```

#### Deploy to Production
```yaml
# .github/workflows/production.yml
name: Deploy Production
on:
  workflow_dispatch:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Notify Slack
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_DEPLOYS }} \
            -d '{"text":"DEPLOY: production ${{ github.ref_name }} success"}'
```

---

## Integration Checklist

### Initial Setup
- [ ] Create GitHub repository
- [ ] Create Slack workspace/channels
- [ ] Create PostHog project
- [ ] Setup Vercel project
- [ ] Configure RunPod MCP server (`.cursor/mcp.json`)
- [ ] Configure GitHub Actions secrets

### Credentials Storage
- [ ] Add all tokens to `config/credentials.csv`
- [ ] Add env vars to `config/env.template`
- [ ] Configure CI/CD secrets in GitHub

### Verification
- [ ] Test GitHub MCP commands
- [ ] Test Slack webhooks
- [ ] Test RunPod MCP commands (list pods, endpoints)
- [ ] Verify PostHog events
- [ ] Run Playwright tests
- [ ] Trigger test deployment

