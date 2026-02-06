# [INITIATIVE] IN-036: Modal.com Endpoint Testing & Model Comparison Playground

**Status**: Proposed  
**Created**: 2026-02-03  
**Last Updated**: 2026-02-03  
**Owner**: Infrastructure / Product  
**Stakeholders**: AI/ML, Backend, Product

---

## Executive Summary

**One-sentence description**: Build a minimal, separate app to test and compare all Modal.com AI endpoints side-by-side using preselected character/influencer-style prompts, so we can validate model behaviour and quality without going through the full product.

**Business Impact**: C-Core Value (model selection and quality), E-CAC (catch regressions before production, avoid bad deployments)

---

## Why (Business Rationale)

### Problem Statement

- We have 20+ Modal endpoints (Flux, SDXL, Qwen, Z-Image, Wan video, face consistency, upscaling, etc.) across multiple apps.
- Today we test via Python scripts (`ryla_client.py`, `test-split-apps.py`) or by using the full web app.
- There is no quick way to:
  - Run the **same** high-quality, realistic prompt (e.g. character/influencer) against **multiple** endpoints.
  - Compare outputs **side-by-side** in a UI.
  - Iterate on model choice and prompt quality without touching the main app or writing one-off scripts.

### Current State

- Endpoint testing: CLI/Python only; no dedicated UI.
- Model comparison: Manual (run one endpoint, save image, run another, compare elsewhere).
- Preset prompts: Ad hoc; no curated set for character/influencer/realistic cases.

### Desired State

- A **separate**, minimal app (not inside `apps/web`):
  - Simple, clean (e.g. white) UI.
  - Preselected prompts representing character, influencer, and high-quality realistic cases.
  - Ability to trigger one or many Modal endpoints with the same prompt (or prompt set).
  - Results shown **side-by-side** (e.g. one column per endpoint) with basic metadata (time, cost if available).
- Used to validate endpoints after deploys and to compare models before committing to one in the main product.

### Business Drivers

- **C-Core Value**: Better model selection and prompt design for core generation flows.
- **E-CAC**: Fewer production issues from untested endpoints; faster validation.
- **Risk Mitigation**: Catch regressions and quality issues before they reach users.

---

## How (Approach & Strategy)

### Strategy

1. **Separate app**: New app in the monorepo (e.g. `apps/modal-playground` or `apps/modal-test-ui`), standalone from `apps/web`.
2. **Spec-first**: Scope and UX specified before implementation (this initiative + linked epic/spec).
3. **Preset prompts**: Ship with a small set of curated prompts (character, influencer, realistic); optional custom prompt later.
4. **Call Modal directly or via API**: Decision in epic (direct from playground vs proxy via RYLA API for secrets).
5. **Progressive endpoint coverage**: Start with text-to-image endpoints; add face-consistency and video when needed.

### Key Principles

- Keep the app minimal: no auth initially if internal-only; no full RYLA feature set.
- One source of truth for endpoint list: align with `ENDPOINT_APP_MAP` / `apps/modal/docs/ENDPOINTS-REFERENCE.md`.
- Preset prompts are first-class: represent real use cases (character, influencer, realistic).

### Phases

1. **Phase 1: Spec & scope** – Initiative (this doc), epic, and short app spec. **Target**: 2026-02.
2. **Phase 2: Build** – Implement app: UI, preset prompts, endpoint calls, side-by-side results. **Target**: 2026-02.
3. **Phase 3: Iterate** – Add endpoints (e.g. face, video) and more presets as needed.

### Dependencies

- Modal endpoints deployed and documented (`apps/modal/docs/ENDPOINTS-REFERENCE.md`, `libs/business` modal-client).
- No dependency on main web app feature work.

### Constraints

- Must not complicate the main web app or require it to run.
- Secrets: either env in playground app (e.g. Modal base URL) or proxy via existing API; no hardcoded keys.

---

## When (Timeline & Priority)

### Timeline

- **Start**: 2026-02-03
- **Spec complete**: 2026-02 (this initiative + epic)
- **Target completion**: 2026-02 (MVP of playground app)

### Priority

**Priority Level**: P2

**Rationale**: Improves model validation and developer experience; not blocking current production flows.

### Resource Requirements

- **Team**: 1 developer (frontend + minimal backend or client-only).
- **Budget**: None beyond normal Modal usage when testing.
- **External**: Modal.com (existing).

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Role**: Infrastructure or Product  
**Responsibilities**: Scope, acceptance criteria, and prioritisation of preset prompts and endpoint set.

### Key Stakeholders

| Role           | Involvement | Responsibilities                 |
| -------------- | ----------- | -------------------------------- |
| Infrastructure | High        | Modal endpoints, app hosting     |
| Product/AI     | Medium      | Preset prompt set, quality bar   |
| Backend        | Low         | Optional proxy for Modal if used |

### Communication

- **Updates**: When spec is locked and when MVP is ready.
- **Audience**: #mvp-ryla-dev, initiative owner.

---

## Success Criteria

### Primary Success Metrics

| Metric                   | Target                                             | Measurement                         | Timeline |
| ------------------------ | -------------------------------------------------- | ----------------------------------- | -------- |
| Playground app usable    | Can run locally (or deployed)                      | Dev runs app, triggers 2+ endpoints | Phase 2  |
| Side-by-side comparison  | Same prompt, N endpoints                           | UI shows N results in one view      | Phase 2  |
| Preset prompts available | ≥3 presets (e.g. character, influencer, realistic) | Documented in app/spec              | Phase 2  |

### Business Metrics Impact

**Target Metric**: [x] C-Core Value [x] E-CAC

**Expected Impact**:

- **C**: Better model and prompt choices for core generation.
- **E**: Fewer costly production issues from untested endpoints.

### Definition of Done (Initiative)

- [ ] Initiative and epic(s) written and agreed.
- [ ] Playground app exists, runs, and can call at least 2 Modal image endpoints.
- [ ] At least one preset prompt category (e.g. character or influencer) implemented.
- [ ] Side-by-side result view implemented.
- [ ] Brief docs: how to run the app and what each preset represents.

### Not Done Criteria

- Success criteria above not met.
- No preset prompts or no side-by-side comparison.
- Testing only via existing Python scripts with no new UI.

---

## Related Work

### Epics

| Epic   | Name                          | Status   | Link                                                                                                                                     |
| ------ | ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| EP-079 | Modal Endpoint Playground App | Proposed | [docs/requirements/epics/ops/EP-079-modal-endpoint-playground-app.md](../requirements/epics/ops/EP-079-modal-endpoint-playground-app.md) |

### App spec

- [docs/specs/modal/MODAL-PLAYGROUND-APP-SPEC.md](../specs/modal/MODAL-PLAYGROUND-APP-SPEC.md)

### Dependencies

- **Blocked by**: None.
- **Blocks**: Nothing critical.
- **Related initiatives**: IN-020 (Modal MVP Models), IN-024 (Modal Code Organization).

### Documentation

- Modal endpoints: `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- Endpoint–app mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`, `libs/business/src/services/modal-client.ts`
- Deployment: `docs/ops/deployment/modal/`

---

## Risks & Mitigation

| Risk                        | Probability | Impact | Mitigation                                                                               |
| --------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------- |
| Scope creep                 | Medium      | Medium | Keep to “simple white app + presets + side-by-side”; defer extra features to later epic. |
| Modal URL/secrets in client | Low         | Medium | Use env vars or proxy via API; documented in epic.                                       |
| Too many endpoints          | Low         | Low    | Start with subset (e.g. text-to-image); add face/video in Phase 3.                       |

---

## Progress Tracking

### Current Phase

**Phase**: 1 – Spec & scope  
**Status**: On Track

### Recent Updates

- **2026-02-03**: Initiative created; epic EP-079 and app spec added. Decisions locked: local, no auth, proxy via RYLA API, all ~21 endpoints with UI for ref image/video/LoRA later, presets agreed.

### Next Steps

1. Create epic for “Modal Endpoint Playground App” and link to this initiative.
2. Write short app spec (scope, endpoints in scope, preset prompts, UI layout).
3. Confirm open questions (see **Open Questions** below) with stakeholders.
4. Implement MVP (Phase 2) per EP-079.

---

## Decisions (2026-02-03)

1. **Hosting**: Local only (`pnpm nx serve modal-playground`). No deployment required for MVP.
2. **Auth**: No auth.
3. **Call path**: **Option B** – Proxy through RYLA API. Playground calls RYLA API; API calls Modal. Keeps Modal URL/keys server-side.
4. **Endpoints in scope**: Aim for **all ~21 endpoints**. Handle reference image / video / LoRA inputs in the UI as needed (e.g. upload reference image for face-consistency, optional LoRA picker later).
5. **Preset prompts**: Yes – agree on 3–5 presets (e.g. Character portrait, Influencer post, Realistic product shot); final copy to be provided.

---

## References

- `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- `libs/business/src/services/modal-client.ts`
- `docs/initiatives/IN-020-modal-mvp-models.md`
- `docs/initiatives/IN-024-modal-code-organization.md`
