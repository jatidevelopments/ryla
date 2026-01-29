# Epic Implementation - Reference Guide

Detailed reference for epic implementation workflow.

## 10-Phase Pipeline Details

### P1: Requirements

**Inputs:**
- Raw business idea or problem statement
- Known constraints (time, budget, tech)

**Outputs:**
- Clarified problem statement (2-5 sentences)
- MVP objective (measurable, 1-2 sentences)
- Non-goals (explicitly out-of-scope)
- Business metric target (A/B/C/D/E)

**Output file:** `docs/requirements/EP-XXX-requirements.md`

### P2: Scoping

**Inputs:**
- Clarified problem statement
- MVP objective

**Outputs:**
- Feature list
- Epic list (EP-IDs)
- Acceptance criteria per epic (3-6 items each)
- Analytics acceptance criteria
- Non-MVP items list

**Output file:** `docs/requirements/EP-XXX-requirements.md` + GitHub Epic issue

### P3: Architecture

**Inputs:**
- Epics and acceptance criteria

**Outputs:**
- Functional architecture (frontend/backend split)
- Data model (entities, relationships, constraints)
- API contract list (endpoints, payloads, responses)
- Component architecture
- Event schema (PostHog events)
- Funnel definitions

**Output file:** `docs/architecture/epics/EP-XXX-architecture.md`

### P4: UI Skeleton

**Inputs:**
- User stories/epics
- Functional architecture

**Outputs:**
- Screen list and navigation structure
- Component list per screen
- Interaction notes (UI → API, success/failure states)
- Interaction → event mapping
- **Journey documentation updated** (if screens/routes changed)

**Output file:** `docs/specs/epics/EP-XXX-ui-skeleton.md`

### P5: Technical Spec

**Inputs:**
- Architecture
- Screen/component map
- API contracts

**Outputs:**
- File plan (files to create/modify + purpose)
- Technical spec (logic flows, env vars, dependencies)
- Task breakdown (ST-XXX stories, TSK-XXX tasks)
- Tracking plan (where each event fires)

**Output file:** `docs/specs/epics/EP-XXX-tech-spec.md`

### P6: Implementation

**Inputs:**
- Task definition
- File plan
- Acceptance criteria

**Outputs (per task):**
- Restated task
- Short plan + files to change
- Code changes (small patches)
- Self-review
- Acceptance criteria status (✅/⚠️/❌)
- **Journey documentation updated** (if routes/screens changed)

**Output:** Code in `apps/`, `libs/` + PRs

### P7: Testing & QA

**Inputs:**
- Implemented code
- Acceptance criteria

**Outputs:**
- Unit tests
- Integration tests
- Playwright E2E tests
- Analytics verification tests
- Test-to-AC mapping
- Remaining risks/untested areas

**Output:** Tests in `tests/`, `playwright/`

### P8: Integration

**Inputs:**
- Application code
- Tests passing

**Outputs:**
- Integration validation notes
- List of issues found
- Fixes applied
- Stability confirmation

**Output file:** `docs/releases/EP-XXX-integration.md`

### P9: Deployment Prep

**Inputs:**
- Stabilised codebase

**Outputs:**
- CI/CD configuration (GitHub Actions)
- Env variable list + explanation
- Deployment checklist

**Output:** `.github/workflows/`, `docs/releases/EP-XXX-deploy-plan.md`

### P10: Production Validation

**Inputs:**
- Deployed application

**Outputs:**
- Smoke test checklist + results
- Funnel verification
- Blocker bug list (if any)
- Learnings documented
- Follow-up epics/tasks
- **Journey documentation verified** (final check)

**Output file:** `docs/releases/EP-XXX-validation.md`, `docs/learnings/EP-XXX-learnings.md`

## Initiative Context

**Before starting the pipeline**, check if the epic is part of a business initiative:
- If yes, read the initiative document (`docs/initiatives/IN-XXX-*.md`) first
- Understand the "why" and success criteria
- Ensure the epic contributes to initiative goals
- Reference the initiative in the epic document

**Initiative → Epic → Story → Task**

## Epic Status Tracking

**Epic Status Values:**
- **Proposed** - Requirements/scoping complete (P1-P2)
- **In Progress** - Architecture/implementation (P3-P6)
- **In Review** - Testing/deployment (P7-P9)
- **Completed** - Production validated (P10 complete)
- **On Hold** - Temporarily paused
- **Cancelled** - Abandoned

**Update epic status:**
1. Update status field at top of epic file
2. Update README status column in epic directory
3. Update phase field if phase changed
4. Update "Last Updated" date

## Related Documentation

- 10-Phase Pipeline: `docs/process/10-PHASE-PIPELINE.md`
- Pipeline Enforcement: `.cursor/rules/pipeline-enforcement.mdc`
- Initiative Guidelines: `.cursor/rules/initiatives.mdc`
- Architecture: `.cursor/rules/architecture.mdc`
