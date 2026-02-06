# [EPIC] EP-079: Modal Endpoint Playground App

**Status**: Proposed  
**Phase**: P1–P2 (Requirements / Scope)  
**Initiative**: [IN-036](../../../initiatives/IN-036-modal-endpoint-testing-playground.md)  
**Created**: 2026-02-03  
**Last Updated**: 2026-02-03

---

## Overview

Build a minimal, separate app to test and compare Modal.com AI endpoints side-by-side using preselected character/influencer-style prompts. Enables validation of model behaviour and quality without using the full product or ad hoc scripts.

### Business Value

- **C-Core Value**: Better model and prompt selection for core generation.
- **E-CAC**: Catch endpoint regressions before production; faster validation after deploys.

### Scope

**In scope:**

- New app in monorepo (e.g. `apps/modal-playground`), standalone from `apps/web`.
- Simple, minimal UI (e.g. white/light theme).
- Preset prompts: at least one category (character or influencer or realistic); 3–5 presets agreed with product.
- Multi-select endpoints; run same prompt against selected endpoints.
- Side-by-side results: image per endpoint, plus time/cost from response headers when available.
- Target: all ~21 Modal endpoints; UI to support reference image, video, and LoRA inputs as needed (phased: start text-to-image, then add inputs).

**Out of scope (MVP):**

- Auth (local only, no auth).
- Persistence of results.
- Integration with main web app.

**Phased UI for all endpoints:** Add reference image upload (face-consistency), video input, and LoRA selection in the UI so all ~21 endpoints can be tested; start with text-to-image, then add inputs as needed.

### Dependencies

- Modal endpoints deployed and documented.
- **Call path**: Proxy via RYLA API (playground → API → Modal). API must expose a way for the playground to trigger Modal endpoints (or reuse existing image-generation API).

---

## Spec & References

- **App spec**: [docs/specs/modal/MODAL-PLAYGROUND-APP-SPEC.md](../../../specs/modal/MODAL-PLAYGROUND-APP-SPEC.md)
- **Initiative**: [IN-036 Modal Endpoint Testing Playground](../../../initiatives/IN-036-modal-endpoint-testing-playground.md)
- **Endpoint reference**: `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- **Modal client**: `libs/business/src/services/modal-client.ts`

---

## Acceptance Criteria (draft)

1. **AC1**: App runs locally via Nx (e.g. `pnpm nx serve modal-playground`).
2. **AC2**: User can select one preset prompt from a small set (≥3 presets).
3. **AC3**: User can select one or more text-to-image Modal endpoints from a defined list.
4. **AC4**: “Run” sends the selected prompt to each selected endpoint and displays results side-by-side (one card/column per endpoint).
5. **AC5**: Each result card shows endpoint name, output image, and if available: execution time and cost (from Modal response headers).
6. **AC6**: Errors and loading states are shown per endpoint.
7. **AC7**: README describes how to run the app and what each preset represents.

---

## Stories (to be broken down in P5)

- Story: New app scaffold (`apps/modal-playground`).
- Story: Preset prompt config and UI (selector).
- Story: Endpoint list and multi-select UI.
- Story: Call Modal (direct or via API), parse response (image + headers).
- Story: Side-by-side result grid and metadata display.
- Story: Error and loading handling.
- Story: README and minimal docs.

---

## Decisions (from IN-036)

- Hosting: local only. Auth: none. Call path: via RYLA API. Endpoints: all ~21; add reference image / video / LoRA inputs in UI as needed. Preset prompts: 3–5 agreed; copy TBD.
