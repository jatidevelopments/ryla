# Automated Commit SOP: AI-Powered CI/CD Workflow

## Overview

This SOP defines an automated workflow that triggers on every commit, performs comprehensive checks, fixes errors autonomously, and runs browser testing—all orchestrated by AI agents.

## Architecture

```
┌─────────────────┐
│  New Commit     │
│  (Push/PR)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Phase 1: Build & Lint Check       │
│  - Run build                        │
│  - Run linter                       │
│  - Check TypeScript                 │
└────────┬────────────────────────────┘
         │
         ├─ Success ──► Phase 2
         │
         └─ Failure ──► AI Agent Fix
                        │
                        └─► Retry Phase 1
                            │
                            ├─ Success ──► Phase 2
                            │
                            └─ Failure ──► Alert + Manual Review
         │
         ▼
┌─────────────────────────────────────┐
│  Phase 2: Unit & Integration Tests  │
│  - Run unit tests                    │
│  - Run integration tests             │
└────────┬────────────────────────────┘
         │
         ├─ Success ──► Phase 3
         │
         └─ Failure ──► AI Agent Fix
                        │
                        └─► Retry Phase 2
         │
         ▼
┌─────────────────────────────────────┐
│  Phase 3: E2E Browser Testing        │
│  - Playwright tests                  │
│  - Visual regression                 │
│  - Cross-browser testing             │
└────────┬────────────────────────────┘
         │
         ├─ Success ──► Phase 4
         │
         └─ Failure ──► AI Agent Analysis
                        │
                        └─► Fix + Retry or Alert
         │
         ▼
┌─────────────────────────────────────┐
│  Phase 4: Deployment (if main)      │
│  - Deploy affected apps              │
│  - Health checks                     │
│  - Post-deploy verification          │
└─────────────────────────────────────┘
```

## Components

### 1. GitHub Actions Workflow
- Triggers on push/PR
- Orchestrates all phases
- Integrates with AI agents

### 2. AI Agent System
- **Cursor Cloud Agents API** (recommended)
- **Alternative:** Custom agent using OpenAI/Anthropic API
- Autonomous error fixing
- Test failure analysis

### 3. Browser Testing
- Playwright for E2E tests
- Visual regression testing
- Cross-browser validation

### 4. Notification System
- Slack alerts
- GitHub status checks
- Email notifications (optional)

---

## Phase 1: Build & Lint Check

### SOP Steps

1. **Checkout Code**
   ```yaml
   - uses: actions/checkout@v4
     with:
       fetch-depth: 0
       lfs: true
   ```

2. **Setup Environment**
   - Node.js 20
   - pnpm via corepack
   - Install dependencies

3. **Run Build**
   ```bash
   pnpm nx run-many --target=build --all --parallel=3
   ```

4. **Run Linter**
   ```bash
   pnpm nx run-many --target=lint --all --parallel=3
   ```

5. **TypeScript Check**
   ```bash
   pnpm nx run-many --target=typecheck --all --parallel=3
   ```

### AI Agent Integration

**On Failure:**
- Agent analyzes error logs
- Identifies root cause
- Creates fix branch
- Applies fixes
- Creates PR with explanation

**Agent Rules:**
```markdown
# .cursor/rules/ci-fix-agent.mdc
When fixing CI build errors:
1. Read error logs carefully
2. Identify the specific file/line causing issue
3. Check if it's a TypeScript error, lint error, or build error
4. Apply minimal fix to resolve issue
5. Ensure fix doesn't break other parts
6. Run build locally if possible before committing
7. Create descriptive commit message
8. Reference original error in commit message
```

---

## Phase 2: Unit & Integration Tests

### SOP Steps

1. **Run Unit Tests**
   ```bash
   pnpm nx run-many --target=test --all --parallel=3
   ```

2. **Run Integration Tests**
   ```bash
   pnpm nx run-many --target=test:integration --all --parallel=2
   ```

3. **Generate Coverage Report**
   ```bash
   pnpm nx run-many --target=test --all --coverage
   ```

### AI Agent Integration

**On Test Failure:**
- Agent reads test output
- Identifies failing test
- Analyzes test code and implementation
- Determines if test or code needs fixing
- Applies fix
- Re-runs tests

**Agent Rules:**
```markdown
# .cursor/rules/test-fix-agent.mdc
When fixing test failures:
1. Read test output to identify failing test
2. Check if test expectation is wrong or code is wrong
3. If test is wrong: Update test to match correct behavior
4. If code is wrong: Fix code to pass test
5. Ensure fix maintains existing passing tests
6. Run tests locally before committing
7. Update test description if behavior changed
```

---

## Phase 3: E2E Browser Testing

### SOP Steps

1. **Install Playwright**
   ```bash
   npx playwright install --with-deps
   ```

2. **Run E2E Tests**
   ```bash
   pnpm playwright test
   ```

3. **Visual Regression**
   ```bash
   pnpm playwright test --update-snapshots
   ```

4. **Cross-Browser Testing**
   - Chromium
   - Firefox
   - WebKit

### AI Agent Integration

**On Test Failure:**
- Agent analyzes Playwright report
- Takes screenshots of failures
- Identifies UI issues vs. logic issues
- Fixes code or updates test expectations
- Re-runs tests

**Agent Rules:**
```markdown
# .cursor/rules/e2e-fix-agent.mdc
When fixing E2E test failures:
1. Read Playwright test report
2. Check screenshots/videos of failure
3. Identify if it's:
   - Timing issue (add wait)
   - Selector issue (update selector)
   - Logic issue (fix code)
   - Visual regression (update snapshot if intentional)
4. Apply minimal fix
5. Re-run specific failing test
6. Ensure all E2E tests pass
```

---

## Phase 4: Deployment (Main Branch Only)

### SOP Steps

1. **Detect Affected Apps** (Nx)
2. **Build Docker Images**
3. **Deploy to Staging/Production**
4. **Health Checks**
5. **Post-Deploy Verification**

### AI Agent Integration

**On Deployment Failure:**
- Agent analyzes deployment logs
- Identifies infrastructure vs. code issues
- Suggests rollback if needed
- Creates incident report

---

## Implementation

### Option A: Cursor Cloud Agents API (Recommended)

**Setup:**
1. Get Cursor Cloud Agents API access
2. Configure API key in GitHub Secrets
3. Create agent configuration

**Workflow Integration:**
```yaml
- name: Trigger AI Fix Agent
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      const response = await fetch('https://api.cursor.com/v1/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${{ secrets.CURSOR_API_KEY }}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repository: '${{ github.repository }}',
          branch: '${{ github.ref }}',
          task: 'Fix CI build errors',
          context: {
            phase: 'build',
            errors: '${{ steps.build.outputs.errors }}'
          }
        })
      });
```

### Option B: Custom AI Agent (OpenAI/Anthropic)

**Setup:**
1. Create GitHub Action for AI agent
2. Use OpenAI API or Anthropic API
3. Implement error analysis logic

**Example:**
```typescript
// scripts/ci/ai-fix-agent.ts
import { OpenAI } from 'openai';

async function fixBuildErrors(errorLog: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a CI/CD fix agent. Analyze errors and create fixes.
        Rules: ${readFileSync('.cursor/rules/ci-fix-agent.mdc')}`
      },
      {
        role: 'user',
        content: `Fix these build errors:\n${errorLog}`
      }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'create_fix',
          description: 'Create a fix for the error',
          parameters: {
            type: 'object',
            properties: {
              file: { type: 'string' },
              line: { type: 'number' },
              fix: { type: 'string' }
            }
          }
        }
      }
    ]
  });
  
  // Apply fixes...
}
```

---

## GitHub Actions Workflow

See: `.github/workflows/automated-commit-sop.yml`

---

## Configuration

### Required Secrets

- `CURSOR_API_KEY` - Cursor Cloud Agents API key (Option A)
- `OPENAI_API_KEY` - OpenAI API key (Option B)
- `ANTHROPIC_API_KEY` - Anthropic API key (Option B)
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions
- `SLACK_WEBHOOK` - Slack notifications

### Environment Variables

- `AI_AGENT_ENABLED=true` - Enable AI agent fixes
- `MAX_AUTO_FIX_ATTEMPTS=3` - Max retries before alerting
- `AUTO_CREATE_PR=true` - Auto-create PR for fixes

---

## Monitoring & Alerts

### Success Metrics
- Build success rate
- Test pass rate
- Auto-fix success rate
- Time to fix

### Alert Conditions
- Build fails after 3 auto-fix attempts
- Critical test failures
- Deployment failures
- Agent errors

### Notification Channels
- Slack: `#mvp-ryla-dev`
- GitHub: Status checks
- Email: Critical failures only

---

## Best Practices

1. **Limit Auto-Fix Scope**
   - Only fix obvious errors
   - Don't change business logic
   - Always create PR for review

2. **Human Review**
   - All auto-fixes require PR review
   - Critical changes need manual approval
   - Test fixes before merging

3. **Documentation**
   - Document all auto-fixes
   - Track fix patterns
   - Update SOP based on learnings

4. **Rollback Strategy**
   - Auto-rollback on deployment failure
   - Keep previous version available
   - Quick rollback commands

---

## Troubleshooting

### Agent Not Triggering
- Check API key is set
- Verify workflow permissions
- Check agent configuration

### Agent Creates Bad Fixes
- Review agent rules
- Add more specific constraints
- Require manual approval for complex fixes

### Tests Flaking
- Add retries
- Improve test stability
- Separate flaky tests

---

## Related Documentation

- [CI/CD Setup](./CI-CD-SETUP.md)
- [Testing Best Practices](../testing/BEST-PRACTICES.md)
- [Cursor Rules](../technical/guides/cursor-rules/CURSOR-RULES.md)
- [10-Phase Pipeline](../process/10-PHASE-PIPELINE.md)
