# 10-Phase Development Pipeline

## Overview
Every feature follows this pipeline. No phase skipped.

---

## P1: Requirements
- [ ] Problem statement defined
- [ ] MVP objective clear
- [ ] Non-goals listed
- [ ] Business metrics identified (which of A-E?)

**Output**: `docs/requirements/EP-XXX-requirements.md`

---

## P2: Scoping
- [ ] Feature list
- [ ] Epics defined
- [ ] Acceptance criteria written
- [ ] Analytics AC defined

**Output**: GitHub Epic issue `[EPIC] EP-XXX: Title`

---

## P3: Architecture
- [ ] Functional design
- [ ] Data model
- [ ] API contracts
- [ ] Component map
- [ ] Event schema
- [ ] Funnels defined

**Output**: `docs/architecture/EP-XXX-architecture.md`

---

## P4: UI Skeleton
- [ ] Screens listed
- [ ] Navigation flow
- [ ] Interaction → event mapping

**Output**: `docs/specs/EP-XXX-ui-skeleton.md`

---

## P5: Technical Spec
- [ ] File plan
- [ ] Task breakdown (ST-XXX stories, TSK-XXX tasks)
- [ ] Tracking plan

**Output**: `docs/specs/EP-XXX-tech-spec.md`

---

## P6: Implementation
- [ ] Small patches
- [ ] Analytics integrated via `analytics.capture()`
- [ ] AC validation in progress

**Output**: Code + PRs

---

## P7: Testing & QA
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Playwright E2E tests pass
- [ ] Analytics verification

**Output**: All tests green

---

## P8: Integration
- [ ] Integration notes
- [ ] Fixes applied
- [ ] Stability verified

**Output**: PR merged to main

---

## P9: Deployment Prep
- [ ] CI/CD configured
- [ ] Env vars set
- [ ] Smoke test plan ready

**Output**: Ready for production

---

## P10: Production Validation
- [ ] Smoke tests pass
- [ ] Funnel check complete
- [ ] Learnings documented
- [ ] Next steps defined

**Output**: `docs/learnings/EP-XXX-learnings.md`

---

## Phase Checklist Template

```markdown
# EP-XXX: [Epic Name] - Phase Checklist

## P1: Requirements
- [ ] Problem statement
- [ ] MVP objective
- [ ] Non-goals
- [ ] Business metric (A/B/C/D/E)

## P2: Scoping
- [ ] Feature list
- [ ] Epic created
- [ ] Acceptance criteria
- [ ] Analytics AC

## P3: Architecture
- [ ] Functional design
- [ ] Data model
- [ ] API contracts
- [ ] Event schema
- [ ] Funnels

## P4: UI Skeleton
- [ ] Screens
- [ ] Navigation
- [ ] Event mapping

## P5: Technical Spec
- [ ] File plan
- [ ] Task breakdown
- [ ] Tracking plan

## P6: Implementation
- [ ] Code complete
- [ ] Analytics integrated
- [ ] AC met

## P7: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Analytics verified

## P8: Integration
- [ ] PR merged
- [ ] Stable

## P9: Deployment
- [ ] CI/CD ready
- [ ] Env vars set
- [ ] Smoke plan ready

## P10: Production
- [ ] Smoke tests pass
- [ ] Funnel verified
- [ ] Learnings documented
```

