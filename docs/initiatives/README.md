# Business Initiatives

This directory contains high-level business initiatives that drive product development, feature planning, and strategic decisions.

## What is an Initiative?

An **Initiative** is a strategic business goal that:
- Addresses a business problem or opportunity
- Spans multiple epics or features
- Has clear success criteria and measurable outcomes
- Guides product roadmap and prioritization

**Initiative → Epics → Stories → Tasks**

## Structure

```
docs/initiatives/
├── README.md                    # This file
├── INITIATIVE-TEMPLATE.md       # Template for new initiatives
├── IN-001-*.md                  # Individual initiative files
├── IN-002-*.md
└── ...
```

## Initiative Lifecycle

1. **Proposed** - Initiative identified, template filled out
2. **Active** - Initiative is driving current work
3. **On Hold** - Temporarily paused, may resume
4. **Completed** - Success criteria met, initiative closed
5. **Cancelled** - Initiative abandoned, reason documented

## Naming Convention

- **Format**: `IN-XXX-[short-description].md`
- **Example**: `IN-001-cloudflare-migration.md`
- **Numbering**: Sequential, starting from IN-001

## When to Create an Initiative

Create an initiative when:
- ✅ A strategic business goal requires multiple epics
- ✅ You need to coordinate work across teams/areas
- ✅ Success requires measurable business outcomes
- ✅ The goal spans multiple quarters or phases
- ✅ You need to track progress against business metrics

**Don't create an initiative for:**
- ❌ Single epic or feature (use epic instead)
- ❌ Technical refactoring (use ADR or technical doc)
- ❌ Bug fixes or small improvements

## Initiative vs Epic

| Aspect | Initiative | Epic |
|--------|-----------|------|
| **Scope** | Strategic business goal | Feature area |
| **Duration** | Months/quarters | Weeks/months |
| **Output** | Business outcomes | Product features |
| **Contains** | Multiple epics | Multiple stories |
| **Success** | Business metrics | Feature completion |

## Related Documentation

- **Epics**: `docs/requirements/epics/` - Features that implement initiatives
- **ADRs**: `docs/decisions/` - Architecture decisions
- **Process**: `docs/process/` - Development processes
- **Business Metrics**: `docs/process/BUSINESS-METRICS.md` - A-E metrics framework

## Index

| ID | Name | Status | Target Metric | Owner |
|----|------|--------|---------------|-------|
| [IN-001](./IN-001-cloudflare-infrastructure.md) | Cloudflare Infrastructure Migration | Active | E-CAC, A-Activation | Infrastructure Team |
| [IN-002](./IN-002-character-dna-enhancement.md) | Character DNA Enhancement System | Proposed | C-Core Value, A-Activation | Product Team |
| [IN-003](./IN-003-sfw-nsfw-separation.md) | SFW/NSFW Content Separation for Growth & Marketability | Proposed | A-Activation, D-Conversion, E-CAC | Product Team |
| [IN-004](./IN-004-wizard-image-generation.md) | Wizard Image Generation & Asset Creation | Proposed | A-Activation, C-Core Value | Product Team |
| [IN-005](./IN-005-bunny-cdn-production.md) | Bunny CDN Production Implementation | Proposed | E-CAC, C-Core Value | Infrastructure Team |
| [IN-006](./IN-006-lora-character-consistency.md) | LoRA Character Consistency System | Proposed | B-Retention, C-Core Value | Product Team |
| [IN-007](./IN-007-comfyui-infrastructure-improvements.md) | ComfyUI Infrastructure Improvements (MDC-Inspired) | Proposed | C-Core Value, B-Retention, E-CAC | Infrastructure Team |
| [IN-008](./IN-008-comfyui-dependency-management.md) | ComfyUI Dependency Management & Versioning System | Proposed | E-CAC, C-Core Value, B-Retention | Infrastructure Team |
| [IN-009](./IN-009-wizard-deferred-credits.md) | Wizard Deferred Credit System | Active | D-Conversion, A-Activation, C-Core Value | Product Team |
| [IN-010](./IN-010-denrisi-workflow-serverless-validation.md) | Denrisi Workflow Serverless Validation & Testing Framework | Proposed | C-Core Value, E-CAC, B-Retention | Infrastructure Team |
| [IN-011](./IN-011-template-gallery-content-library.md) | Template Gallery & Content Library | **Completed** | C-Core Value, A-Activation, B-Retention | Product Team |
| [IN-012](./IN-012-social-platform-integration.md) | Social Platform Integration | Proposed (Future) | B-Retention, C-Core Value, D-Conversion | Product Team |
| [IN-013](./IN-013-platform-browse-style-transfer.md) | Platform Browse & Style Transfer | Proposed (Future) | A-Activation, C-Core Value | Product Team |
| [IN-014](./IN-014-admin-back-office.md) | Admin Back-Office Application | Proposed | E-CAC, B-Retention, D-Conversion | Engineering Team |
| [IN-015](./IN-015-comfyui-workflow-api-alternatives.md) | ComfyUI Workflow-to-API Platform Evaluation | **Active** | E-CAC, C-Core Value, B-Retention, A-Activation | Infrastructure Team |
| [IN-016](./IN-016-ai-face-swap-parasite-seo.md) | AI Face Swap & Video Swap with Parasite SEO Strategy | Proposed | A-Activation, C-Core Value, E-CAC | Growth Team |
| [IN-017](./IN-017-curated-template-library.md) | Curated Template Library | **Active** | A-Activation, C-Core Value | Product Team |
| [IN-018](./IN-018-competitor-prompt-library.md) | Competitor Prompt Library & Prompt Engineering Enhancement | Proposed | C-Core Value, A-Activation, B-Retention | Product Team |
| [IN-019](./IN-019-automated-workflow-analyzer.md) | Automated ComfyUI Workflow Analyzer & Deployment Code Generator | Proposed | E-CAC, C-Core Value, B-Retention, A-Activation | Infrastructure Team |
| [IN-020](./IN-020-modal-mvp-models.md) | Modal.com MVP Model Implementation | Active | C-Core Value, E-CAC, A-Activation | Infrastructure Team |
| [IN-021](./IN-021-posthog-analytics-web-app.md) | PostHog Analytics Implementation in Web App | Proposed (Draft) | A-Activation, B-Retention, C-Core Value, D-Conversion, E-CAC | Product Team |
| [IN-022](./IN-022-social-media-pixel-tracking.md) | Social Media Pixel Tracking Infrastructure | **Completed** | A-Activation, D-Conversion, E-CAC | Growth Team |
| [IN-023](./IN-023-fly-io-deployment-infrastructure.md) | Fly.io Deployment Infrastructure & Infisical Integration | Active (Ready) | E-CAC, C-Core Value, B-Retention | Infrastructure Team |
| [IN-024](./IN-024-modal-code-organization.md) | Modal.com Code Organization & Best Practices | Active | E-CAC, C-Core Value, B-Retention | Infrastructure Team |
| [IN-025](./IN-025-forgot-password-feature.md) | Forgot Password Feature Completion | Active | A-Activation, B-Retention | Product Team |
| [IN-026](./IN-026-comprehensive-testing-implementation.md) | Comprehensive Testing Implementation | Proposed | C-Core Value, B-Retention, E-CAC | Engineering Team |
| [IN-027](./IN-027-multi-agent-orchestration-system.md) | Multi-Agent Orchestration System | Proposed | E-CAC, C-Core Value, B-Retention | Engineering Team |
| [IN-028](./IN-028-workflow-to-serverless-deployment.md) | Zero-Setup Workflow-to-Serverless Deployment | Proposed | E-CAC, C-Core Value, A-Activation, B-Retention | Infrastructure Team |
| [IN-029](./IN-029-cursor-skills-migration.md) | Cursor Skills Migration | Proposed | C-Core Value, E-CAC | Engineering Team |
| [IN-030](./IN-030-vast-ai-alternative-infrastructure.md) | Vast.ai Alternative Infrastructure Evaluation | Proposed | E-CAC, C-Core Value, B-Retention | Infrastructure Team |
| [IN-031](./IN-031-agentic-workflow-deployment.md) | Agentic ComfyUI Workflow Deployment System | Proposed | E-CAC, C-Core Value, A-Activation, B-Retention | Infrastructure Team |
| [IN-032](./IN-032-funnel-supabase-to-backend-migration.md) | Funnel Supabase to Backend Migration | Active | E-CAC, C-Core Value, B-Retention, A-Activation | Engineering Team |

---

**Last Updated**: 2026-01-28
