# RYLA

AI Influencer Creation & Monetization Platform

> **Category**: First integrated "AI Influencer in a Box" with monetization tools  
> **Market**: $97B+ adult content market + $21B influencer market

---

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

### Secrets Management

RYLA uses **Infisical** for secrets. See [config/README.md](./config/README.md) for setup.

```bash
# Run with secrets injected
infisical run --path=/apps/api --path=/shared --env=dev -- pnpm nx serve api
```

---

## 📁 Monorepo Structure

This is an Nx monorepo containing multiple apps and shared libraries.

### Applications

| App           | Domain            | Purpose                     | README                                |
| ------------- | ----------------- | --------------------------- | ------------------------------------- |
| **web**       | `app.ryla.ai`     | Main web application        | [📖 Read](./apps/web/README.md)       |
| **api**       | `end.ryla.ai`     | Backend API (NestJS)        | [📖 Read](./apps/api/README.md)       |
| **funnel**    | `goviral.ryla.ai` | Payment & conversion funnel | [📖 Read](./apps/funnel/README.md)    |
| **landing**   | `www.ryla.ai`     | Marketing website           | [📖 Read](./apps/landing/README.md)   |
| **admin**     | Internal          | Admin dashboard             | [📖 Read](./apps/admin/README.md)     |
| **extension** | Chrome            | Browser extension           | [📖 Read](./apps/extension/README.md) |
| **mcp**       | Internal          | MCP Server for AI agents    | [📖 Read](./apps/mcp/README.md)       |

### Libraries

| Library                     | Purpose                                   | README                                        |
| --------------------------- | ----------------------------------------- | --------------------------------------------- |
| **@ryla/shared**            | Common utilities, types, constants        | [📖 Read](./libs/shared/README.md)            |
| **@ryla/business**          | Business logic, services, rules           | [📖 Read](./libs/business/README.md)          |
| **@ryla/data**              | Database repositories, Drizzle ORM        | [📖 Read](./libs/data/README.md)              |
| **@ryla/ui**                | Shared React components                   | [📖 Read](./libs/ui/README.md)                |
| **@ryla/analytics**         | Event tracking (PostHog)                  | [📖 Read](./libs/analytics/README.md)         |
| **@ryla/payments**          | Payment providers (Finby, Stripe, PayPal) | [📖 Read](./libs/payments/README.md)          |
| **@ryla/email**             | Email templates (React Email)             | [📖 Read](./libs/email/README.md)             |
| **@ryla/trpc**              | Type-safe API layer                       | [📖 Read](./libs/trpc/README.md)              |
| **@ryla/comfyui-workflows** | ComfyUI workflow definitions              | [📖 Read](./libs/comfyui-workflows/README.md) |

---

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

| Layer         | Library           | Responsibility                         |
| ------------- | ----------------- | -------------------------------------- |
| **Apps**      | `apps/*`          | Entry points, routing, HTTP handling   |
| **Business**  | `@ryla/business`  | Business rules, services, domain logic |
| **Data**      | `@ryla/data`      | Database operations, repositories      |
| **Shared**    | `@ryla/shared`    | Utilities, types, constants            |
| **UI**        | `@ryla/ui`        | Shared React components                |
| **Analytics** | `@ryla/analytics` | Event tracking                         |
| **Payments**  | `@ryla/payments`  | Payment providers abstraction          |
| **Email**     | `@ryla/email`     | Email templates                        |
| **tRPC**      | `@ryla/trpc`      | Type-safe API layer                    |

📖 See [Architecture Documentation](./docs/architecture/general/ARCHITECTURE.md) for details.

---

## 🔄 10-Phase Development Pipeline

Every feature follows this pipeline:

```
P1 Requirements → P2 Scoping → P3 Architecture → P4 UI Design
→ P5 Tech Spec → P6 Implementation → P7 Testing
→ P8 Integration → P9 Deploy → P10 Validation
```

| Phase   | Key Output                              |
| ------- | --------------------------------------- |
| **P1**  | Problem statement, MVP objective        |
| **P2**  | Epics, stories, acceptance criteria     |
| **P3**  | Architecture, data model, API contracts |
| **P4**  | Screens, navigation, interactions       |
| **P5**  | File plan, tech spec, task breakdown    |
| **P6**  | Code implementation                     |
| **P7**  | Unit tests, integration tests           |
| **P8**  | Integration testing, fixes              |
| **P9**  | CI/CD, deployment config                |
| **P10** | Production validation, learnings        |

📖 See [10-Phase Pipeline](./docs/process/10-PHASE-PIPELINE.md) for details.

---

## 📊 Business Metrics (A-E Framework)

Every feature must move at least one metric:

- **A**: **Activation** - Signup → first action completion
- **B**: **Retention** - D7/D30 active users
- **C**: **Core Value** - North Star metric (AI influencers created, content generated)
- **D**: **Conversion** - Trial → paid subscription
- **E**: **CAC** - Customer acquisition cost reduction

📖 See [Business Metrics](./docs/process/BUSINESS-METRICS.md) for details.

---

## 📚 Documentation

### 📂 Documentation Structure

See [docs/STRUCTURE.md](./docs/STRUCTURE.md) for the complete documentation layout.

```
docs/
├── initiatives/      # Strategic business goals (IN-XXX)
├── requirements/     # Product requirements, epics, stories
│   └── epics/       # Organized by: mvp/, funnel/, landing/, future/
├── architecture/    # System architecture (general + epic-specific)
├── specs/           # Technical specifications
├── technical/       # Implementation guides
├── ops/             # Operations, deployment, domains
├── research/        # Market & technical research
├── analytics/       # Tracking plan, events
├── decisions/       # Architecture Decision Records (ADRs)
├── journeys/        # User journeys
├── process/         # Development pipeline, workflows
├── testing/         # Testing documentation
├── learnings/       # Post-mortems, learnings
└── releases/        # Release documentation
```

### Process & Workflow

| Document                                                                 | Description            |
| ------------------------------------------------------------------------ | ---------------------- |
| [10-Phase Pipeline](./docs/process/10-PHASE-PIPELINE.md)                 | Development process    |
| [Business Metrics](./docs/process/BUSINESS-METRICS.md)                   | A-E framework          |
| [Naming Conventions](./docs/NAMING_CONVENTIONS.md)                       | IDs, branches, commits |
| [Mobile Responsiveness](./docs/process/MOBILE-RESPONSIVENESS-PROCESS.md) | Mobile-first process   |

### Product & Requirements

| Document                                                          | Description                |
| ----------------------------------------------------------------- | -------------------------- |
| [MVP Scope](./docs/requirements/MVP-SCOPE.md)                     | Product scope and features |
| [Product Hypothesis](./docs/requirements/PRODUCT-HYPOTHESIS.md)   | Problem, solution, market  |
| [ICP Personas](./docs/requirements/ICP-PERSONAS.md)               | Ideal customer profiles    |
| [Customer Journey](./docs/journeys/CUSTOMER-JOURNEY.md)           | AAARRR funnel              |
| [Studio Capabilities](./docs/requirements/STUDIO-CAPABILITIES.md) | Studio feature overview    |

### Initiatives

Strategic business goals that drive development:

| Document                                                         | Description                  |
| ---------------------------------------------------------------- | ---------------------------- |
| [Initiatives Index](./docs/initiatives/README.md)                | All business initiatives     |
| [Initiative Template](./docs/initiatives/INITIATIVE-TEMPLATE.md) | Template for new initiatives |

### Architecture & Technical

| Document                                                               | Description               |
| ---------------------------------------------------------------------- | ------------------------- |
| [Architecture Overview](./docs/architecture/general/ARCHITECTURE.md)   | System architecture       |
| [MVP Architecture](./docs/architecture/general/MVP-ARCHITECTURE.md)    | MVP-specific architecture |
| [User Flows](./docs/architecture/general/USER-FLOWS.md)                | User flow diagrams        |
| [External Dependencies](./docs/specs/general/EXTERNAL-DEPENDENCIES.md) | APIs, services            |
| [Tech Stack](./docs/specs/general/TECH-STACK.md)                       | Technology stack          |
| [Design System](./docs/specs/general/DESIGN-SYSTEM.md)                 | UI design system          |

### Infrastructure & Operations

| Document                                                   | Description                |
| ---------------------------------------------------------- | -------------------------- |
| [Domain Registry](./docs/ops/DOMAIN-REGISTRY.md)           | Production domains         |
| [Deployment Guide](./docs/ops/DEPLOYMENT-QUICK-START.md)   | Quick start for deployment |
| [Fly.io Deployment](./docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md) | Fly.io setup               |
| [CI/CD Setup](./docs/ops/CI-CD-SETUP.md)                   | GitHub Actions config      |
| [Cloudflare Setup](./docs/ops/CLOUDFLARE-SETUP-INDEX.md)   | Cloudflare configuration   |
| [RunPod Operations](./docs/ops/runpod/)                    | GPU infrastructure         |

### Technical Guides

| Document                                                            | Description         |
| ------------------------------------------------------------------- | ------------------- |
| [Infisical Setup](./docs/technical/INFISICAL-SETUP.md)              | Secrets management  |
| [Drizzle Migration](./docs/technical/guides/DRIZZLE-MIGRATION.md)   | Database migrations |
| [Drizzle Schemas](./docs/technical/guides/DRIZZLE-SCHEMAS.md)       | Schema patterns     |
| [Git LFS Setup](./docs/technical/guides/GIT-LFS-SETUP.md)           | Large file storage  |
| [Image Optimization](./docs/technical/guides/IMAGE-OPTIMIZATION.md) | Image compression   |
| [File Organization](./docs/technical/FILE-ORGANIZATION-GUIDE.md)    | Code organization   |
| [Infrastructure](./docs/technical/infrastructure/README.md)         | Infrastructure docs |

### Analytics

| Document                                               | Description        |
| ------------------------------------------------------ | ------------------ |
| [Tracking Plan](./docs/analytics/TRACKING-PLAN.md)     | PostHog events     |
| [TikTok Tracking](./docs/analytics/TIKTOK-TRACKING.md) | TikTok pixel setup |

### Research

| Document                                                                    | Description         |
| --------------------------------------------------------------------------- | ------------------- |
| [Competitors Index](./docs/research/competitors/README.md)                  | Competitor research |
| [Pricing Strategy](./docs/research/competitors/pricing/PRICING-STRATEGY.md) | Pricing analysis    |
| [Models Research](./docs/research/models/)                                  | AI model research   |
| [Providers Research](./docs/research/providers/)                            | Service providers   |
| [Workflows Research](./docs/research/workflows/)                            | ComfyUI workflows   |

### Architecture Decisions

| ADR                                                                          | Description           |
| ---------------------------------------------------------------------------- | --------------------- |
| [ADR-001](./docs/decisions/ADR-001-database-architecture.md)                 | Database architecture |
| [ADR-003](./docs/decisions/ADR-003-comfyui-pod-over-serverless.md)           | ComfyUI pod decision  |
| [ADR-004](./docs/decisions/ADR-004-fly-io-deployment-platform.md)            | Fly.io deployment     |
| [ADR-005](./docs/decisions/ADR-005-cloudflare-r2-storage.md)                 | Cloudflare R2 storage |
| [ADR-006](./docs/decisions/ADR-006-runpod-serverless-over-dedicated-pods.md) | RunPod serverless     |

### Testing

| Document                                           | Description        |
| -------------------------------------------------- | ------------------ |
| [Best Practices](./docs/testing/BEST-PRACTICES.md) | Testing guidelines |

### Learnings

| Document                                                               | Description             |
| ---------------------------------------------------------------------- | ----------------------- |
| [AI Agent TDD](./docs/learnings/AI-AGENT-TDD-RALPH-LOOP.md)            | AI development patterns |
| [Video Generation](./docs/learnings/VIDEO-GENERATION-VIRAL-CONTENT.md) | Video content learnings |

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS
- **State**: Zustand 5, XState (funnel)
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **API Client**: tRPC (type-safe)

### Backend

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Cache**: Redis
- **Queue**: Bull (Redis-based)

### Infrastructure

- **Hosting**: Fly.io, Vercel
- **Database**: Supabase
- **Storage**: Cloudflare R2 (S3-compatible)
- **CDN**: Cloudflare
- **Analytics**: PostHog
- **Payments**: Finby, Stripe, PayPal
- **AI**: Replicate, RunPod (ComfyUI)
- **Secrets**: Infisical

---

## 🔧 Nx Commands

```bash
# Development
pnpm nx serve <app>              # Development server
pnpm nx build <app>              # Production build
pnpm nx test <lib>               # Run tests
pnpm nx lint <project>           # Lint code
pnpm nx e2e <app>-e2e            # E2E tests

# Workspace
pnpm nx affected --target=test   # Test affected projects
pnpm nx affected --target=build  # Build affected projects
pnpm nx graph                    # View dependency graph
pnpm nx reset                    # Reset Nx cache

# Run multiple
pnpm nx run-many --target=build --projects=web,api
```

---

## 📝 Naming Conventions

| Type            | Format                             | Example              |
| --------------- | ---------------------------------- | -------------------- |
| **Initiatives** | `IN-XXX`                           | `IN-001`             |
| **Epics**       | `EP-XXX`                           | `EP-001`             |
| **Stories**     | `ST-XXX`                           | `ST-010`             |
| **Tasks**       | `TSK-XXX`                          | `TSK-120`            |
| **Branches**    | `epic/ep-001-scope`                | `feat/st-010-login`  |
| **Commits**     | `feat(ep-001 st-010): description` | Conventional commits |

📖 See [Naming Conventions](./docs/NAMING_CONVENTIONS.md) for full details.

---

## 🤖 AI Agent Instructions

For AI agents working on this codebase, see:

- [AGENTS.md](./AGENTS.md) - Agent-specific instructions
- [.cursor/rules/](./docs/technical/CURSOR-RULES.md) - Cursor IDE rules

---

## 🔗 Production Links

| Service      | Domain                                       | Description       |
| ------------ | -------------------------------------------- | ----------------- |
| **Web App**  | [app.ryla.ai](https://app.ryla.ai)           | Main application  |
| **Landing**  | [www.ryla.ai](https://www.ryla.ai)           | Marketing website |
| **Funnel**   | [goviral.ryla.ai](https://goviral.ryla.ai)   | Payment funnel    |
| **API Docs** | [end.ryla.ai/docs](https://end.ryla.ai/docs) | API documentation |

---

## 📞 Communication

| Channel               | Purpose            |
| --------------------- | ------------------ |
| `#mvp-ryla-pm`        | Project management |
| `#mvp-ryla-dev`       | Development        |
| `#mvp-ryla-log`       | Audit (read-only)  |
| `#mvp-ryla-learnings` | Knowledge capture  |

---

## 📂 Additional Resources

### Scripts & Utilities

- [scripts/README.md](./scripts/README.md) - Available scripts
- [config/README.md](./config/README.md) - Configuration setup

### Cursor Rules (for AI Development)

All development rules are in `.cursor/rules/`:

| Rule                       | Purpose                 |
| -------------------------- | ----------------------- |
| `pipeline-enforcement.mdc` | 10-phase pipeline       |
| `architecture.mdc`         | Architecture patterns   |
| `typescript.mdc`           | TypeScript guidelines   |
| `testing-standards.mdc`    | Testing standards       |
| `security.mdc`             | Security best practices |

📖 See [Rules Index](./.cursor/rules/rules-index.mdc) for all available rules.

---

## 🏷️ License

Proprietary - All rights reserved.
