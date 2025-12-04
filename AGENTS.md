# RYLA MVP - Agent Instructions

## Architecture
- Layer flow: Presentation → Business → Data → DB
- Never skip layers
- Management layer can access all

## Code Style
- Self-documenting names
- Small functions
- Explicit error handling
- Tests for business logic

## 10-Phase Pipeline
P1 Requirements → P2 Scoping → P3 Architecture → P4 UI → P5 Tech Spec → P6 Implementation → P7 Testing → P8 Integration → P9 Deploy Prep → P10 Production

No phase skipped.

## Business Metrics (A-E)
Every feature must move one:
- A: Activation
- B: Retention
- C: Core Value
- D: Conversion
- E: CAC

## Naming
- Epics: `EP-XXX`
- Stories: `ST-XXX`
- Tasks: `TSK-XXX`
- Branches: `epic/ep-001-scope` or `feat/st-010-feature`
- Commits: `feat(ep-001 st-010): description`

## Way of Work
- Communication = cost
- Bullet points > paragraphs
- Async by default
- Learnings → Slack → GitHub → heuristics

## Integrations
- GitHub: Issues, PRs, Projects, Actions
- Slack: #mvp-ryla-pm, #mvp-ryla-dev, #mvp-ryla-log, #mvp-ryla-learnings
- PostHog: Analytics, funnels
- Playwright: E2E tests
