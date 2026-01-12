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

---

**Last Updated**: 2026-01-XX
