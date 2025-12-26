# RYLA

AI Influencer Creation & Monetization Platform

> **Category**: First integrated "AI Influencer in a Box" with monetization tools  
> **Market**: $97B+ adult content market + $21B influencer market

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:all          # Start all apps (web, api, funnel, landing)
pnpm nx serve web     # Main web app
pnpm nx serve api     # Backend API
pnpm nx serve funnel  # Payment funnel
pnpm nx serve landing # Landing page
```

## 📁 Monorepo Structure

This is an Nx monorepo containing multiple apps and shared libraries.

### Applications

| App | Domain | Purpose | README |
|-----|--------|---------|--------|
| **[web](./apps/web/README.md)** | `app.ryla.ai` | Main web application | [📖 Read](./apps/web/README.md) |
| **[api](./apps/api/README.md)** | `end.ryla.ai` | Backend API (NestJS) | [📖 Read](./apps/api/README.md) |
| **[funnel](./apps/funnel/README.md)** | `goviral.ryla.ai` | Payment & conversion funnel | [📖 Read](./apps/funnel/README.md) |
| **[landing](./apps/landing/README.md)** | `www.ryla.ai` | Marketing website | [📖 Read](./apps/landing/README.md) |
| **[admin](./apps/admin/README.md)** | Internal | Admin dashboard | [📖 Read](./apps/admin/README.md) |
| **[extension](./apps/extension/README.md)** | Chrome | Browser extension | [📖 Read](./apps/extension/README.md) |

### Libraries

| Library | Purpose | README |
|---------|---------|--------|
| **[@ryla/shared](./libs/shared/README.md)** | Common utilities, types, constants | [📖 Read](./libs/shared/README.md) |
| **[@ryla/business](./libs/business/README.md)** | Business logic, services, rules | [📖 Read](./libs/business/README.md) |
| **[@ryla/data](./libs/data/README.md)** | Database repositories, migrations | [📖 Read](./libs/data/README.md) |
| **[@ryla/ui](./libs/ui/README.md)** | Shared React components | [📖 Read](./libs/ui/README.md) |
| **[@ryla/analytics](./libs/analytics/README.md)** | Event tracking (PostHog) | [📖 Read](./libs/analytics/README.md) |
| **[@ryla/payments](./libs/payments/README.md)** | Payment providers (Stripe, Finby, PayPal) | [📖 Read](./libs/payments/README.md) |
| **[@ryla/email](./libs/email/README.md)** | Email templates (React Email) | [📖 Read](./libs/email/README.md) |
| **[@ryla/trpc](./libs/trpc/README.md)** | Type-safe API layer | [📖 Read](./libs/trpc/README.md) |
| **[@ryla/comfyui-workflows](./libs/comfyui-workflows/README.md)** | ComfyUI workflow definitions | [📖 Read](./libs/comfyui-workflows/README.md) |

### Documentation

```
docs/
  requirements/    # Product requirements, epics, stories
  technical/       # Technical specifications
  architecture/   # System architecture
  process/         # 10-phase pipeline, workflows
  analytics/       # Tracking plan, events
  research/       # Market research, competitors
  decisions/       # Architecture Decision Records (ADRs)
  learnings/       # Post-mortems, learnings
  ops/             # Operations, deployment, domains
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

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│           Apps Layer                    │
│  (web, api, funnel, landing, admin)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Business Logic Layer              │
│        (@ryla/business)                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Data Access Layer                │
│         (@ryla/data)                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Database                       │
│      (PostgreSQL via Supabase)           │
└─────────────────────────────────────────┘
```

**Rule**: Apps → Business → Data → DB (never skip layers)

### Layer Responsibilities

| Layer | Library | Responsibility |
|-------|---------|----------------|
| **Apps** | `apps/*` | Entry points, routing, HTTP handling |
| **Business** | `@ryla/business` | Business rules, services, domain logic |
| **Data** | `@ryla/data` | Database operations, repositories |
| **Shared** | `@ryla/shared` | Utilities, types, constants |
| **UI** | `@ryla/ui` | Shared React components |
| **Analytics** | `@ryla/analytics` | Event tracking |
| **Payments** | `@ryla/payments` | Payment providers abstraction |
| **Email** | `@ryla/email` | Email templates |
| **tRPC** | `@ryla/trpc` | Type-safe API layer |

## 🔄 10-Phase Development Pipeline

Every feature follows this pipeline:

```
P1 Requirements → P2 Scoping → P3 Architecture → P4 UI Design
→ P5 Tech Spec → P6 Implementation → P7 Testing
→ P8 Integration → P9 Deploy → P10 Validation
```

| Phase | Key Output |
|-------|------------|
| **P1** | Problem statement, MVP objective |
| **P2** | Epics, stories, acceptance criteria |
| **P3** | Architecture, data model, API contracts |
| **P4** | Screens, navigation, interactions |
| **P5** | File plan, tech spec, task breakdown |
| **P6** | Code implementation |
| **P7** | Unit tests, integration tests |
| **P8** | Integration testing, fixes |
| **P9** | CI/CD, deployment config |
| **P10** | Production validation, learnings |

📖 See [10-Phase Pipeline](docs/process/10-PHASE-PIPELINE.md) for details.

## 📊 Business Metrics (A-E Framework)

Every feature must move at least one metric:

- **A**: **Activation** - Signup → first action completion
- **B**: **Retention** - D7/D30 active users
- **C**: **Core Value** - North Star metric (AI influencers created, content generated)
- **D**: **Conversion** - Trial → paid subscription
- **E**: **CAC** - Customer acquisition cost reduction

📖 See [Business Metrics](docs/process/BUSINESS-METRICS.md) for details.

## 📚 Documentation

### Process & Workflow
- [10-Phase Pipeline](docs/process/10-PHASE-PIPELINE.md) - Development process
- [Business Metrics](docs/process/BUSINESS-METRICS.md) - A-E framework
- [Naming Conventions](docs/specs/NAMING_CONVENTIONS.md) - IDs, branches, commits

### Product & Requirements
- [MVP Scope](docs/requirements/MVP-SCOPE.md) - Product scope and features
- [Product Hypothesis](docs/requirements/PRODUCT-HYPOTHESIS.md) - Problem, solution, market
- [Customer Journey](docs/journeys/CUSTOMER-JOURNEY.md) - AAARRR funnel

### Technical
- [Architecture](docs/architecture/MVP-ARCHITECTURE.md) - System architecture
- [Tracking Plan](docs/analytics/TRACKING-PLAN.md) - PostHog events
- [Domain Registry](docs/ops/DOMAIN-REGISTRY.md) - Production domains
- [External Dependencies](docs/specs/EXTERNAL-DEPENDENCIES.md) - APIs, services

### AI & Research
- [Heuristics](ai/heuristics.md) - AI learnings
- [Competitors](docs/research/COMPETITORS.md) - Market analysis

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: XState (funnel), Zustand (app state)
- **Forms**: React Hook Form
- **API Client**: tRPC (type-safe)

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Cache**: Redis
- **Queue**: Bull (Redis-based)

### Infrastructure
- **Hosting**: Fly.io, Vercel
- **Database**: Supabase
- **Storage**: AWS S3 / MinIO
- **Analytics**: PostHog
- **Payments**: Stripe, Finby, PayPal
- **AI**: Replicate, RunPod (ComfyUI)

## 📝 Naming Conventions

- **Epics**: `EP-XXX` (e.g., `EP-001`)
- **Stories**: `ST-XXX` (e.g., `ST-010`)
- **Tasks**: `TSK-XXX` (e.g., `TSK-001`)
- **Branches**: `epic/ep-001-scope` or `feat/st-010-feature`
- **Commits**: `feat(ep-001 st-010): description`

## 🔗 Links

- **Production**: [app.ryla.ai](https://app.ryla.ai)
- **Landing**: [www.ryla.ai](https://www.ryla.ai)
- **Funnel**: [goviral.ryla.ai](https://goviral.ryla.ai)
- **API Docs**: [end.ryla.ai/docs](https://end.ryla.ai/docs)

## 📞 Communication

- `#mvp-ryla-pm` - Project management
- `#mvp-ryla-dev` - Development
- `#mvp-ryla-log` - Audit (read-only)
- `#mvp-ryla-learnings` - Knowledge capture
