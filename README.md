# RYLA MVP

## Quick Start

```bash
cp config/env.template .env
npm install
npm run dev
```

## Architecture

| Layer | Purpose | Location |
|-------|---------|----------|
| Presentation | API, controllers | `src/presentation/` |
| Business | Logic, services | `src/business/` |
| Data | Repositories | `src/data/` |
| Management | Admin, config | `src/management/` |
| Shared | Utils, types | `src/shared/` |

## 10-Phase Pipeline

```
P1 Requirements → P2 Scoping → P3 Architecture → P4 UI → P5 Tech Spec
→ P6 Implementation → P7 Testing → P8 Integration → P9 Deploy → P10 Production
```

## Business Metrics (A-E)

Every feature must move one:
- **A**: Activation (signup → first action)
- **B**: Retention (D7/D30)
- **C**: Core Value (North Star usage)
- **D**: Conversion (trial → paid)
- **E**: CAC (acquisition cost)

## Project Structure

```
docs/
  requirements/       # P1 outputs
  architecture/       # P3 outputs
  analytics/          # Tracking plan
  specs/              # Technical specs
  process/            # 10-phase, metrics
  decisions/          # ADRs
  learnings/          # Post-mortems
  releases/           # Release notes
src/
  presentation/       # Controllers, routes, DTOs
  business/           # Services, models, rules
  data/               # Repositories, migrations
  management/         # Admin, config, monitoring
  shared/             # Utils, types, constants
tests/
  unit/
  integration/
playwright/
  tests/              # E2E tests
ai/
  heuristics.md       # AI learnings
  prompts/            # Prompt templates
config/
  env.template
  credentials.csv.example
  mcp.config.json
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [10-Phase Pipeline](docs/process/10-PHASE-PIPELINE.md) | Development process |
| [Business Metrics](docs/process/BUSINESS-METRICS.md) | A-E framework |
| [Tracking Plan](docs/analytics/TRACKING-PLAN.md) | PostHog events |
| [Naming Conventions](docs/specs/NAMING_CONVENTIONS.md) | IDs, branches, commits |
| [ADR Template](docs/decisions/ADR-TEMPLATE.md) | Decision records |
| [Heuristics](ai/heuristics.md) | AI learnings |

## Naming

- Epics: `EP-XXX`
- Stories: `ST-XXX`
- Tasks: `TSK-XXX`
- Branches: `epic/ep-001-scope`
- Commits: `feat(ep-001 st-010): description`

## Slack Channels

- `#mvp-ryla-pm` - Project management
- `#mvp-ryla-dev` - Development
- `#mvp-ryla-log` - Audit (read-only)
- `#mvp-ryla-learnings` - Knowledge capture

## Integrations

- **GitHub**: Issues, PRs, Projects, Actions
- **Slack**: Structured events, learnings loop
- **PostHog**: Analytics, funnels, feature flags
- **Playwright**: E2E tests, analytics verification
