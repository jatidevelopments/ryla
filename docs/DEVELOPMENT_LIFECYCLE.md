# Development Lifecycle

## Overview
Complete lifecycle from idea to production with tooling integration.

---

## Lifecycle Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │ IDEATE  │ → │  PLAN   │ → │  BUILD  │ → │  TEST   │        │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
│       │             │             │             │              │
│       ▼             ▼             ▼             ▼              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │ DEPLOY  │ ← │ REVIEW  │ ← │ MEASURE │ ← │  LEARN  │        │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stage Details

### 1. IDEATE
**Purpose:** Capture and validate ideas

| Input | Output | Tools |
|-------|--------|-------|
| User feedback, market research | Validated idea | Slack `#ryla-pm` |
| Business goal | Problem statement | GitHub Discussion |

**Actions:**
- Document the problem
- Validate with stakeholders
- Create initial GitHub issue

---

### 2. PLAN
**Purpose:** Break down into actionable work

| Input | Output | Tools |
|-------|--------|-------|
| Validated idea | Epic + tasks | GitHub Issues |
| Epic issue | Sprint backlog | GitHub Projects |

**Actions:**
- Create [EPIC] issue
- Break into [FEATURE] / [TASK] issues
- Estimate complexity
- Assign to milestone
- Notify `#ryla-pm`

---

### 3. BUILD
**Purpose:** Implement the solution

| Input | Output | Tools |
|-------|--------|-------|
| Task issue | Feature branch | Git |
| Design spec | Working code | Cursor IDE |
| Acceptance criteria | Unit tests | Playwright |

**Actions:**
- Create branch: `feat/RYLA-XX-description`
- Implement following layer architecture
- Write tests alongside
- Commit: `feat(scope): description [#RYLA-XX]`
- Push regularly

---

### 4. TEST
**Purpose:** Verify quality and correctness

| Input | Output | Tools |
|-------|--------|-------|
| Feature branch | Test results | Playwright |
| Code changes | Coverage report | CI/CD |

**Actions:**
- Run unit tests (business layer)
- Run integration tests (layer interactions)
- Run E2E tests (user flows)
- Fix failures before PR

---

### 5. REVIEW
**Purpose:** Ensure code quality

| Input | Output | Tools |
|-------|--------|-------|
| Pull request | Review comments | GitHub |
| Code changes | Approved PR | MCP GitHub |

**Actions:**
- Create PR with description
- Request review
- Address feedback
- Get approval
- Merge to main

---

### 6. DEPLOY
**Purpose:** Release to environments

| Input | Output | Tools |
|-------|--------|-------|
| Merged code | Staging deploy | GitHub Actions |
| QA approval | Production deploy | Vercel |

**Actions:**
- Auto-deploy to staging
- QA verification
- Manual production deploy
- Notify `#ryla-deploys`

---

### 7. MEASURE
**Purpose:** Track impact and behavior

| Input | Output | Tools |
|-------|--------|-------|
| Production feature | Analytics data | PostHog |
| User interactions | Funnel metrics | PostHog |

**Actions:**
- Verify events firing
- Check funnel steps
- Monitor error rates
- Create dashboards

---

### 8. LEARN
**Purpose:** Capture insights and improve

| Input | Output | Tools |
|-------|--------|-------|
| Analytics data | Insights | PostHog |
| Team feedback | Process updates | Slack `#ryla-learnings` |

**Actions:**
- Review metrics weekly
- Capture learnings
- Post to `#ryla-learnings`
- Update documentation
- Improve processes

---

## Tool Integration Map

```
┌──────────────────────────────────────────────────────────────┐
│                     MCP INTEGRATIONS                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   GitHub    │    │    Slack    │    │   PostHog   │      │
│  │             │    │             │    │             │      │
│  │ - Issues    │    │ - #ryla-pm  │    │ - Events    │      │
│  │ - Projects  │    │ - #audit    │    │ - Funnels   │      │
│  │ - PRs       │    │ - #learnings│    │ - Dashboards│      │
│  │ - Actions   │    │ - #deploys  │    │ - Alerts    │      │
│  │ - Repo      │    │ - #alerts   │    │             │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼───────┐                        │
│                    │  Cursor MCP   │                        │
│                    │               │                        │
│                    │ Orchestrates  │                        │
│                    │ all tools     │                        │
│                    └───────────────┘                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Automation Rules

### On Issue Created
```
TRIGGER: [FEATURE] or [BUG] issue created
ACTION:
  - Add to project board
  - Notify #ryla-pm
  - Assign based on layer label
```

### On Branch Push
```
TRIGGER: Push to feature branch
ACTION:
  - Run linting
  - Run unit tests
  - Update issue status
```

### On PR Merged
```
TRIGGER: PR merged to main
ACTION:
  - Deploy to staging
  - Run E2E tests
  - Notify #ryla-deploys
  - Update issue status
```

### On Production Deploy
```
TRIGGER: Production deploy successful
ACTION:
  - Notify #ryla-deploys
  - Close related issues
  - Tag release version
  - Log to #ryla-audit
```

### On Error Spike
```
TRIGGER: Error rate > threshold
ACTION:
  - Notify #ryla-alerts
  - Create [BUG] issue
  - Page on-call if critical
```

---

## Environment Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LOCAL     │ →  │   STAGING   │ →  │ PRODUCTION  │
│             │    │             │    │             │
│ Development │    │ Integration │    │ Live users  │
│ Unit tests  │    │ E2E tests   │    │ Monitoring  │
│ Fast iter.  │    │ QA review   │    │ Analytics   │
└─────────────┘    └─────────────┘    └─────────────┘
```

| Environment | Purpose | Deploy Trigger |
|-------------|---------|----------------|
| Local | Development | Manual |
| Staging | Testing & QA | Auto on merge |
| Production | Live users | Manual approval |

