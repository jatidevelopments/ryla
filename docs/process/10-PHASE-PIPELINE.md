# 10-Phase Development Pipeline

Every feature follows this pipeline. **No phase skipped.**

## Initiative Context

**Before starting the pipeline**, check if the epic is part of a business initiative:
- If yes, read the initiative document (`docs/initiatives/IN-XXX-*.md`) first
- Understand the "why" and success criteria
- Ensure the epic contributes to initiative goals
- Reference the initiative in the epic document

**Initiative → Epic → Story → Task**

Initiatives are strategic business goals that span multiple epics. Epics implement parts of initiatives. This pipeline applies to epics and stories.

---

## P1: Requirements

**Inputs:**
- Raw business idea or problem statement
- Known constraints (time, budget, tech)

**Outputs:**
- Clarified problem statement (2-5 sentences)
- MVP objective (measurable, 1-2 sentences)
- Non-goals (explicitly out-of-scope)
- Business metric target (A/B/C/D/E)

**Output file:** `docs/requirements/EP-XXX-requirements.md`

**Acceptance rules:**
- If problem is vague → ask clarifying questions
- MVP objective MUST be measurable (e.g., "User can X within Y clicks")
- Must identify which business metric (A-E) this moves

---

## P2: Scoping

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

**Acceptance rules:**
- Every epic MUST map to MVP objective
- Each epic MUST have explicit acceptance criteria
- Analytics events MUST be defined per epic

---

## P3: Architecture

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

**Acceptance rules:**
- Every epic/AC covered by components + APIs + data
- Event schema covers all user actions
- Avoid unnecessary complexity

---

## P4: UI Skeleton

**Inputs:**
- User stories/epics
- Functional architecture

**Outputs:**
- Screen list and navigation structure
- Component list per screen
- Interaction notes (UI → API, success/failure states)
- Interaction → event mapping

**Output file:** `docs/specs/epics/EP-XXX-ui-skeleton.md`

**Acceptance rules:**
- No mystery screens: every screen maps to epic/story
- All main flows described end-to-end
- Every interaction has defined analytics event

---

## P5: Technical Spec

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

**Acceptance rules:**
- Each task has defined INPUTS and OUTPUTS
- Every epic/story covered by at least one task
- Dependencies and order clearly stated

---

## P6: Implementation

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

**Output:** Code in `apps/`, `libs/` + PRs

**Acceptance rules:**
- Small, focused changes only
- Analytics integrated via `analytics.capture()`
- If AC cannot be met → state why + what's missing

---

## P7: Testing & QA

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

**Acceptance rules:**
- All critical paths have test coverage
- Analytics events verified in E2E
- If tests cannot be added → explain why + plan

---

## P8: Integration

**Inputs:**
- Application code
- Tests passing

**Outputs:**
- Integration validation notes
- List of issues found
- Fixes applied
- Stability confirmation

**Output file:** `docs/releases/EP-XXX-integration.md`

**Acceptance rules:**
- Main user journeys work without errors
- No hardcoded secrets
- No environment-specific hacks

---

## P9: Deployment Prep

**Inputs:**
- Stabilised codebase

**Outputs:**
- CI/CD configuration (GitHub Actions)
- Env variable list + explanation
- Deployment checklist

**Output:** `.github/workflows/`, `docs/releases/EP-XXX-deploy-plan.md`

**Acceptance rules:**
- Production build succeeds
- All env vars declared and documented
- Smoke test plan ready

---

## P10: Production Validation

**Inputs:**
- Deployed application

**Outputs:**
- Smoke test checklist + results
- Funnel verification
- Blocker bug list (if any)
- Learnings documented
- Follow-up epics/tasks

**Output file:** `docs/releases/EP-XXX-validation.md`, `docs/learnings/EP-XXX-learnings.md`

**Acceptance rules:**
- No blocker bugs on main value path
- Funnels tracking correctly in PostHog
- Critical issues listed with priority

---

## Phase Checklist Template

```markdown
# EP-XXX: [Epic Name] - Phase Checklist

## P1: Requirements
- [ ] Problem statement (2-5 sentences)
- [ ] MVP objective (measurable)
- [ ] Non-goals listed
- [ ] Business metric (A/B/C/D/E): ___

## P2: Scoping
- [ ] Feature list
- [ ] Epic created in GitHub
- [ ] Acceptance criteria (3-6 per epic)
- [ ] Analytics AC defined
- [ ] Non-MVP items listed

## P3: Architecture
- [ ] Functional design
- [ ] Data model
- [ ] API contracts
- [ ] Component map
- [ ] Event schema
- [ ] Funnels defined

## P4: UI Skeleton
- [ ] Screens listed
- [ ] Navigation flow
- [ ] Interaction → event mapping

## P5: Technical Spec
- [ ] File plan
- [ ] Task breakdown (ST-XXX, TSK-XXX)
- [ ] Tracking plan

## P6: Implementation
- [ ] Code complete
- [ ] Analytics integrated
- [ ] AC status: ✅/⚠️/❌

## P7: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Analytics verified

## P8: Integration
- [ ] PR merged
- [ ] Issues fixed
- [ ] Stable

## P9: Deployment
- [ ] CI/CD ready
- [ ] Env vars set
- [ ] Smoke plan ready

## P10: Production
- [ ] Smoke tests pass
- [ ] Funnel verified
- [ ] Learnings documented
- [ ] Next steps defined
```
