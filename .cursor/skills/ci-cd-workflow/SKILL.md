---
name: ci-cd-workflow
description: Automates CI/CD workflows with AI-powered error fixing. Use when setting up CI/CD, configuring GitHub Actions, automating deployments, or when the user mentions CI/CD, GitHub Actions, or automated workflows.
---

# CI/CD Workflow Automation

Automates CI/CD workflows with AI-powered error fixing and comprehensive testing.

## Quick Start

When setting up CI/CD:

1. **Create Workflow** - Add `.github/workflows/[name].yml`
2. **Define Phases** - Build, test, E2E, deploy
3. **Add AI Agent** - Integrate error fixing
4. **Configure Notifications** - Slack, GitHub status
5. **Test Workflow** - Verify all phases

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
         └─ Failure ──► AI Agent Fix ──► Retry
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
         └─ Failure ──► AI Agent Fix ──► Retry
         │
         ▼
┌─────────────────────────────────────┐
│  Phase 3: E2E Browser Testing        │
│  - Playwright tests                  │
│  - Visual regression                 │
└────────┬────────────────────────────┘
         │
         ├─ Success ──► Phase 4
         │
         └─ Failure ──► AI Agent Analysis
         │
         ▼
┌─────────────────────────────────────┐
│  Phase 4: Deployment (if main)      │
│  - Deploy affected apps              │
│  - Health checks                     │
└─────────────────────────────────────┘
```

## GitHub Actions Workflow

### Basic Structure

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm nx run-many --target=build --all
      
      - name: Lint
        run: pnpm nx run-many --target=lint --all
      
      - name: Type check
        run: pnpm nx run-many --target=type-check --all
```

## Phase 1: Build & Lint

### Build Check

```yaml
- name: Build
  run: pnpm nx run-many --target=build --all
  continue-on-error: false

- name: Check build artifacts
  run: |
    if [ ! -d "dist" ]; then
      echo "Build failed - no dist directory"
      exit 1
    fi
```

### Lint Check

```yaml
- name: Lint
  run: pnpm nx run-many --target=lint --all
  continue-on-error: false
```

### TypeScript Check

```yaml
- name: Type check
  run: pnpm nx run-many --target=type-check --all
  continue-on-error: false
```

### AI Agent Fix (On Failure)

```yaml
- name: AI Agent Fix Build Errors
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      // Call AI agent to fix errors
      // Analyze build logs
      // Create fix commit
      // Retry build
```

## Phase 2: Testing

### Unit & Integration Tests

```yaml
- name: Run tests
  run: pnpm nx run-many --target=test --all
  continue-on-error: false

- name: Test coverage
  run: pnpm nx run-many --target=test --all --coverage
  continue-on-error: false

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### AI Agent Fix (On Failure)

```yaml
- name: AI Agent Fix Test Failures
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      // Analyze test failures
      // Fix failing tests
      // Retry tests
```

## Phase 3: E2E Testing

### Playwright Setup

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm nx e2e web
  continue-on-error: false

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Visual Regression

```yaml
- name: Visual regression tests
  run: pnpm nx e2e web --grep "visual"
  continue-on-error: false
```

## Phase 4: Deployment

### Conditional Deployment

```yaml
deploy:
  needs: [build-and-test, e2e]
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        # Deployment steps
        pnpm nx deploy web
        pnpm nx deploy api
```

### Health Checks

```yaml
- name: Health check
  run: |
    curl -f https://app.ryla.ai/api/health || exit 1
    curl -f https://end.ryla.ai/health || exit 1
```

## AI Agent Integration

### Error Analysis

```yaml
- name: Analyze errors
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      const errors = context.payload;
      // Call AI agent API
      const fixes = await analyzeErrors(errors);
      // Apply fixes
      await applyFixes(fixes);
```

### Auto-Fix Pattern

```yaml
- name: Auto-fix errors
  if: failure()
  run: |
    # Extract error logs
    # Send to AI agent
    # Get fixes
    # Apply fixes
    # Commit fixes
    # Retry step
```

## Notification System

### Slack Notifications

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "CI/CD Pipeline: ${{ job.status }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Pipeline Status:* ${{ job.status }}\n*Branch:* ${{ github.ref }}"
            }
          }
        ]
      }
```

### GitHub Status

```yaml
- name: Update status
  if: always()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.repos.createCommitStatus({
        owner: context.repo.owner,
        repo: context.repo.repo,
        sha: context.sha,
        state: '${{ job.status }}' === 'success' ? 'success' : 'failure',
        context: 'ci/cd',
        description: 'CI/CD pipeline completed'
      });
```

## Best Practices

### 1. Fail Fast

```yaml
# ✅ Good: Fail immediately on error
- name: Build
  run: pnpm nx build web
  continue-on-error: false

# ❌ Bad: Continue on error
- name: Build
  run: pnpm nx build web
  continue-on-error: true
```

### 2. Cache Dependencies

```yaml
# ✅ Good: Cache for faster builds
- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### 3. Parallel Jobs

```yaml
# ✅ Good: Run tests in parallel
jobs:
  test-web:
    runs-on: ubuntu-latest
    steps: [...]
  
  test-api:
    runs-on: ubuntu-latest
    steps: [...]
```

### 4. Conditional Steps

```yaml
# ✅ Good: Only deploy on main
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: pnpm deploy
```

### 5. Artifact Management

```yaml
# ✅ Good: Save build artifacts
- name: Upload build
  uses: actions/upload-artifact@v3
  with:
    name: build-artifacts
    path: dist/
```

## Security

### Secrets Management

```yaml
# ✅ Good: Use secrets
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: deploy.sh
```

### Token Permissions

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
```

## Related Resources

- **Automated Commit SOP**: `docs/ops/AUTOMATED-COMMIT-SOP.md`
- **CI Fix Agent Rules**: `.cursor/rules/ci-fix-agent.mdc`
- **GitHub Actions**: `.github/workflows/`
