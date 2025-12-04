# RYLA MVP - Agent Instructions

## Nx Monorepo Structure

```
apps/
  web/       # Main web app (Next.js)
  api/       # Backend API (Node.js)
  admin/     # Admin dashboard (Next.js)
libs/
  shared/    # @ryla/shared - Utils, types
  business/  # @ryla/business - Services, models
  data/      # @ryla/data - Repositories
  ui/        # @ryla/ui - Components
  analytics/ # @ryla/analytics - Events
```

## Architecture
- Apps → Business → Data → DB
- Import via `@ryla/<lib>` aliases
- Never skip layers

## 10-Phase Pipeline
P1→P2→P3→P4→P5→P6→P7→P8→P9→P10

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
- Branches: `epic/ep-001-scope`
- Commits: `feat(ep-001 st-010): description`

## Way of Work
- Communication = cost
- Bullet points > paragraphs
- Async by default
- Learnings → Slack → GitHub → heuristics

## Nx Commands
```bash
nx serve web          # Run web app
nx serve api          # Run API
nx build <app>        # Build app
nx test <lib>         # Test lib
nx affected --target=test  # Test affected
nx graph              # View dependency graph
```

## Integrations
- GitHub: Issues, PRs, Projects, Actions
- Slack: #mvp-ryla-pm, #mvp-ryla-dev, #mvp-ryla-log, #mvp-ryla-learnings
- PostHog: Analytics via @ryla/analytics
- Playwright: E2E tests
