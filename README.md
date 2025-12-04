# RYLA MVP

## Quick Start

```bash
npm install
nx serve web          # Run web app
nx serve api          # Run API
```

## Nx Monorepo Structure

```
apps/
  web/           # Main web app (Next.js)
  api/           # Backend API (Node.js)
  admin/         # Admin dashboard
libs/
  shared/        # @ryla/shared - Utils, types, constants
  business/      # @ryla/business - Services, models, rules
  data/          # @ryla/data - Repositories, migrations
  ui/            # @ryla/ui - Shared components
  analytics/     # @ryla/analytics - Event tracking
docs/
  journeys/      # Customer + user journeys
  process/       # 10-phase pipeline, metrics
  analytics/     # Tracking plan
  architecture/  # System architecture
  decisions/     # ADRs
  learnings/     # Post-mortems
ai/
  heuristics.md  # AI learnings
  prompts/       # Prompt templates
playwright/
  tests/         # E2E tests
config/
  mcp.config.json
  env.template
```

## Nx Commands

```bash
nx serve <app>           # Development server
nx build <app>           # Production build
nx test <lib>            # Run tests
nx lint <project>        # Lint code
nx affected --target=test    # Test affected
nx graph                 # View dependency graph
```

## Architecture

| Layer | Lib | Import |
|-------|-----|--------|
| Shared | `libs/shared` | `@ryla/shared` |
| Business | `libs/business` | `@ryla/business` |
| Data | `libs/data` | `@ryla/data` |
| UI | `libs/ui` | `@ryla/ui` |
| Analytics | `libs/analytics` | `@ryla/analytics` |

**Flow**: Apps → Business → Data → DB

## 10-Phase Pipeline

```
P1 Requirements → P2 Scoping → P3 Architecture → P4 UI
→ P5 Tech Spec → P6 Implementation → P7 Testing
→ P8 Integration → P9 Deploy → P10 Production
```

## Business Metrics (A-E)

Every feature must move one:
- **A**: Activation (signup → first action)
- **B**: Retention (D7/D30)
- **C**: Core Value (North Star usage)
- **D**: Conversion (trial → paid)
- **E**: CAC (acquisition cost)

## Documentation

| Doc | Purpose |
|-----|---------|
| [10-Phase Pipeline](docs/process/10-PHASE-PIPELINE.md) | Development process |
| [Business Metrics](docs/process/BUSINESS-METRICS.md) | A-E framework |
| [Customer Journey](docs/journeys/CUSTOMER-JOURNEY.md) | AAARRR funnel |
| [Tracking Plan](docs/analytics/TRACKING-PLAN.md) | PostHog events |
| [Naming Conventions](docs/specs/NAMING_CONVENTIONS.md) | IDs, branches, commits |
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
