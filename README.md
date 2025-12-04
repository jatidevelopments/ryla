# RYLA MVP

## Project Overview
MVP implementation with layered architecture, automated workflows, and integrated tooling.

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd ryla

# Copy environment config
cp config/env.template .env

# Install dependencies
npm install

# Run development server
npm run dev
```

## Architecture Layers

| Layer | Purpose | Location |
|-------|---------|----------|
| Presentation | API endpoints, controllers | `src/presentation/` |
| Business | Core logic, services, rules | `src/business/` |
| Data | Repositories, persistence | `src/data/` |
| Management | Admin, config, monitoring | `src/management/` |
| Shared | Utilities, types, constants | `src/shared/` |

## Project Structure

```
RYLA/
├── .cursor/rules/        # Cursor AI rules
├── .github/              # GitHub workflows & templates
├── config/               # Configuration files
├── docs/                 # Documentation
├── src/
│   ├── presentation/     # Controllers, routes, middleware, DTOs
│   ├── business/         # Services, models, rules, processes
│   ├── data/             # Repositories, migrations, queries
│   ├── management/       # Admin, config, monitoring, users
│   └── shared/           # Utils, types, constants, validators
└── tests/                # Unit, integration, E2E tests
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Layer responsibilities and data flow |
| [MVP Principles](docs/MVP_PRINCIPLES.md) | Development constraints and decisions |
| [Way of Work](docs/WAY_OF_WORK.md) | Communication and workflow guidelines |
| [Naming Conventions](docs/NAMING_CONVENTIONS.md) | Branches, commits, issues, Slack |
| [Process Map](docs/PROCESS_MAP.md) | Development lifecycle stages |
| [Business Metrics](docs/BUSINESS_METRICS.md) | KPIs and analytics tracking |
| [Integrations](docs/INTEGRATIONS.md) | GitHub, Slack, PostHog, Playwright |
| [Development Lifecycle](docs/DEVELOPMENT_LIFECYCLE.md) | Complete workflow documentation |

## Integrations

- **GitHub**: Issues, PRs, Projects, Actions (CI/CD)
- **Slack**: Team channels for PM, audit, learnings, deploys, alerts
- **PostHog**: Analytics, funnels, feature flags
- **Playwright**: E2E testing

## MVP Principles

- Mobile first design
- >98% browser/device compatibility
- Pareto: 80% value from 20% features
- Functionality > animations
- Measure everything

## Contributing

1. Create issue: `[FEATURE] Description`
2. Create branch: `feat/RYLA-XX-description`
3. Implement with tests
4. Commit: `feat(scope): description [#RYLA-XX]`
5. Open PR and request review
