# Documentation Structure

This document outlines the organization of the RYLA documentation.

## Overview

The documentation is organized by purpose and topic, with clear separation between:
- **Requirements** - Product requirements and epics
- **Architecture** - System architecture (general vs epic-specific)
- **Specs** - Technical specifications (general vs epic-specific)
- **Research** - Market and technical research
- **Technical** - Implementation guides and technical documentation
- **Operations** - Deployment and operations guides

## Directory Structure

```
docs/
├── requirements/           # Product requirements
│   ├── epics/            # Epic requirements (mvp/, funnel/, landing/, future/)
│   ├── landing-page/     # Landing page content and copy
│   └── wizard/           # Wizard audit and requirements
│
├── architecture/         # System architecture
│   ├── general/         # General architecture docs
│   └── epics/           # Epic-specific architecture
│
├── specs/               # Technical specifications
│   ├── general/        # General specs (design system, tech stack, etc.)
│   ├── epics/          # Epic-specific specs
│   └── integrations/   # Integration specs
│
├── research/            # Market & technical research
│   ├── competitors/    # Competitor research
│   │   ├── pricing/   # Pricing data and strategy
│   │   ├── ux-analysis/ # UX/UI analysis
│   │   └── individual/ # Individual competitor deep-dives
│   ├── models/         # AI model research
│   ├── providers/      # Service provider research
│   ├── workflows/      # Workflow research (ComfyUI, community)
│   ├── techniques/     # Technical techniques
│   ├── prompts/        # Prompt research
│   └── learnings/      # Research learnings
│
├── technical/           # Implementation guides
│   ├── systems/        # System design docs
│   ├── models/         # Model technical docs
│   ├── infrastructure/ # Infrastructure & deployment
│   │   ├── runpod/    # RunPod setup
│   │   ├── comfyui/   # ComfyUI setup
│   │   └── deployment/ # Deployment guides
│   ├── integrations/  # Integration guides
│   ├── refactoring/   # Refactoring docs
│   ├── mobile/        # Mobile-specific docs
│   ├── mdc/           # MDC copy guides
│   └── guides/        # General guides
│
├── ops/                # Operations & deployment
│   ├── deployment/    # Deployment guides
│   ├── runpod/        # RunPod operations
│   ├── ghcr/          # Container registry
│   └── workflows/     # Workflow conversion
│
├── analytics/          # Analytics tracking
├── decisions/          # Architecture decision records
├── journeys/           # User journeys
├── process/            # Process documentation
├── planning/           # Planning documents
└── releases/           # Release documentation
```

## Key Changes (January 2026)

### Research Folder
- **Consolidated competitors**: All competitor files moved to `competitors/` with subfolders
- **Grouped by topic**: Models, providers, workflows, techniques, prompts, learnings
- **Eliminated duplication**: Removed duplicate competitor-pricing directory

### Technical Folder
- **Grouped by topic**: Systems, models, infrastructure, integrations, refactoring, mobile, mdc, guides
- **Better organization**: Related docs grouped together for easier discovery

### Architecture & Specs
- **Separated general from epic-specific**: Clear distinction between general docs and epic-specific docs
- **Consistent structure**: Both folders follow the same pattern

### Requirements
- **Renamed**: `landing-page-copy/` → `landing-page/` for clarity

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

## Cross-References

When referencing files in documentation, use the new paths:
- Architecture: `docs/architecture/epics/EP-XXX-*.md` (epic-specific) or `docs/architecture/general/*.md` (general)
- Specs: `docs/specs/epics/EP-XXX-*.md` (epic-specific) or `docs/specs/general/*.md` (general)
- Technical: `docs/technical/systems/*.md`, `docs/technical/models/*.md`, etc.
- Research: `docs/research/competitors/pricing/*.md`, `docs/research/models/*.md`, etc.

## Benefits

1. **Clearer organization**: Related documents grouped together
2. **Easier discovery**: Topic-based structure makes finding docs easier
3. **Reduced duplication**: Eliminated duplicate competitor pricing files
4. **Better scalability**: Structure supports growth without clutter
5. **Consistent patterns**: Similar organization across architecture, specs, and technical folders

