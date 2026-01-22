# Documentation Structure

This document outlines the organization of the RYLA documentation.

## Overview

The documentation is organized by purpose and topic, with clear separation between:
- **Initiatives** - Strategic business goals that drive product development
- **Requirements** - Product requirements and epics
- **Architecture** - System architecture (general vs epic-specific)
- **Specs** - Technical specifications (general vs epic-specific)
- **Research** - Market and technical research
- **Technical** - Implementation guides and technical documentation
- **Operations** - Deployment and operations guides
- **Marketing** - Marketing strategies, tactics, and campaigns

## Directory Structure

```
docs/
├── requirements/          # Product requirements
│   ├── epics/              # Epic requirements (mvp/, funnel/, landing/, admin/, ops/, future/)
│   ├── MVP-SCOPE.md
│   ├── PRODUCT-HYPOTHESIS.md
│   ├── ICP-PERSONAS.md
│   ├── studio-tooltips-analysis.md
│   └── studio-ux-analysis.md
│
├── architecture/          # System architecture
│   ├── general/            # General architecture docs
│   └── epics/              # Epic-specific architecture
│
├── specs/                 # Technical specifications
│   ├── general/            # General specs (design system, tech stack, etc.)
│   ├── epics/              # Epic-specific specs
│   └── integrations/       # Integration specs
│
├── technical/             # Implementation guides
│   ├── guides/             # General guides
│   │   ├── cursor-rules/   # Cursor rules documentation
│   │   ├── file-organization-guide.md
│   │   ├── atomic-lib-builds.md
│   │   ├── browser-compatibility.md
│   │   ├── pre-commit-hooks.md
│   │   ├── INFISICAL-SETUP.md
│   │   ├── INFISICAL-ENVIRONMENTS-STRATEGY.md
│   │   └── INFISICAL-GITHUB-INTEGRATION.md
│   ├── systems/            # System design docs
│   │   ├── dna-implementation-plan.md
│   │   ├── human-description-system.md
│   │   ├── platform-aspect-ratio-mapping.md
│   │   ├── platform-export-implementation.md
│   │   └── wizard-deferred-credits.md
│   ├── models/             # Model technical docs
│   ├── infrastructure/     # Infrastructure & deployment
│   │   ├── runpod/         # RunPod setup
│   │   ├── comfyui/        # ComfyUI setup
│   │   └── deployment/     # Deployment guides
│   ├── integrations/       # Integration guides
│   │   └── mcp-youtube-troubleshooting.md
│   ├── refactoring/        # Refactoring docs
│   │   └── quality-mode-removal.md
│   ├── mobile/             # Mobile-specific docs
│   └── mdc/                # MDC copy guides
│
├── ops/                    # Operations & deployment
│   ├── deployment/         # Deployment guides
│   │   ├── guides/         # Active deployment guides
│   │   └── status/         # Historical status files (archive)
│   ├── setup/              # Setup guides
│   │   ├── guides/         # Active setup guides
│   │   └── status/         # Historical status files (archive)
│   ├── runpod/             # RunPod operations
│   ├── ghcr/               # Container registry
│   ├── workflows/          # Workflow conversion
│   └── status/             # General status files (archive)
│
├── analytics/              # Analytics tracking
├── decisions/              # Architecture decision records (ADRs)
├── initiatives/            # Business initiatives (IN-XXX)
├── journeys/               # User journeys
├── marketing/              # Marketing strategies
├── process/                # Process documentation
│   └── naming-conventions.md
├── planning/              # Planning documents
├── releases/               # Release documentation
│
├── research/               # Market & technical research
│   ├── competitors/        # Competitor research
│   ├── models/             # AI model research
│   ├── providers/          # Service provider research
│   ├── workflows/          # Workflow research (ComfyUI, community)
│   ├── techniques/          # Technical techniques
│   ├── prompts/            # Prompt research
│   ├── learnings/           # Research learnings
│   │   ├── ai-ide-*.md
│   │   ├── cursor-*.md
│   │   ├── rules-to-adopt-*.md
│   │   └── ai-influencer-course/
│   ├── infrastructure/      # Infrastructure research
│   ├── legal_references/    # Legal references
│   ├── recordings/          # Recordings
│   ├── screenshots/         # Screenshots
│   └── youtube-videos/      # YouTube video research
│
├── testing/                 # Testing documentation
└── templates/               # Documentation templates
```

## Key Changes

### Root-Level Cleanup (January 2026)
- **Moved**: `NAMING_CONVENTIONS.md` → `process/naming-conventions.md`
- **Moved**: `studio-tooltips-analysis.md` → `requirements/studio-tooltips-analysis.md`

### Technical Folder Reorganization (January 2026)
- **Created**: `technical/guides/cursor-rules/` for Cursor rules documentation
- **Organized guides**: File organization, browser compatibility, atomic lib builds, pre-commit hooks
- **Moved Infisical docs**: All Infisical setup guides → `technical/guides/`
- **Organized systems**: DNA, human description, platform docs → `technical/systems/`
- **Organized refactoring**: Quality mode removal → `technical/refactoring/`
- **Moved integrations**: MCP YouTube troubleshooting → `technical/integrations/`
- **Moved requirements**: Studio UX analysis → `requirements/`

### Ops Directory Reorganization (January 2026)
- **Separated guides from status**: Active guides in `guides/`, historical status in `status/`
- **Deployment**: `ops/deployment/guides/` and `ops/deployment/status/`
- **Setup**: `ops/setup/guides/` and `ops/setup/status/`
- **General status**: `ops/status/` for general status files

### Research Directory Organization (January 2026)
- **Created**: `research/learnings/` for research learnings
- **Moved**: AI IDE, Cursor, and rules research → `research/learnings/`
- **Moved**: `ai-influencer-course/` → `research/learnings/ai-influencer-course/`

### Previous Changes
- **Research Folder**: Consolidated competitors, grouped by topic (models, providers, workflows, techniques, prompts)
- **Architecture & Specs**: Separated general from epic-specific
- **Marketing Folder**: New folder for marketing strategies, tactics, and campaigns

## Navigation

Each major folder contains README.md files for navigation:
- `research/competitors/README.md`
- `research/models/README.md`
- `research/providers/README.md`
- `research/workflows/README.md`
- `technical/systems/README.md`
- `technical/models/README.md`
- `technical/infrastructure/README.md`
- `architecture/general/README.md`
- `specs/general/README.md`
- `marketing/README.md`

## Cross-References

When referencing files in documentation, use the new paths:
- **Architecture**: `docs/architecture/epics/EP-XXX-*.md` (epic-specific) or `docs/architecture/general/*.md` (general)
- **Specs**: `docs/specs/epics/EP-XXX-*.md` (epic-specific) or `docs/specs/general/*.md` (general)
- **Technical Guides**: `docs/technical/guides/cursor-rules/*.md`, `docs/technical/guides/file-organization-guide.md`, etc.
- **Technical Systems**: `docs/technical/systems/*.md` (DNA, human description, platform docs)
- **Technical Integrations**: `docs/technical/integrations/*.md`
- **Technical Refactoring**: `docs/technical/refactoring/*.md`
- **Process**: `docs/process/naming-conventions.md`
- **Requirements**: `docs/requirements/studio-tooltips-analysis.md`, `docs/requirements/studio-ux-analysis.md`
- **Ops Guides**: `docs/ops/deployment/guides/*.md`, `docs/ops/setup/guides/*.md`
- **Ops Status**: `docs/ops/deployment/status/*.md`, `docs/ops/setup/status/*.md` (archive)
- **Research**: `docs/research/competitors/pricing/*.md`, `docs/research/models/*.md`, `docs/research/learnings/*.md`
- **Marketing**: `docs/marketing/*.md` (strategies, content, channels, campaigns)

## Benefits

1. **Clearer organization**: Related documents grouped together
2. **Easier discovery**: Topic-based structure makes finding docs easier
3. **Reduced duplication**: Eliminated duplicate competitor pricing files
4. **Better scalability**: Structure supports growth without clutter
5. **Consistent patterns**: Similar organization across architecture, specs, and technical folders

