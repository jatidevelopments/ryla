# Modal Endpoint Playground App – Scope & Spec

**Initiative**: [IN-036](../../initiatives/IN-036-modal-endpoint-testing-playground.md)  
**Status**: Spec complete  
**Last Updated**: 2026-02-03

---

## Purpose

Minimal, separate app to test and compare Modal.com AI endpoints with preselected prompts. Same prompt → multiple endpoints → side-by-side results in the UI.

---

## App placement

- **New app** in monorepo: `apps/modal-playground` (or `apps/modal-test-ui`).
- **Not** part of `apps/web`; runs standalone (e.g. `pnpm nx serve modal-playground`).
- Stack: Next.js or Vite + React + TypeScript; simple, minimal UI (e.g. white/light theme).

---

## Core flows

1. **Choose preset prompt** – User picks one of N presets (e.g. Character portrait, Influencer post, Realistic scene).
2. **Select endpoints** – User selects one or more Modal endpoints (e.g. Flux, Flux Dev, SDXL Turbo, Qwen, Z-Image).
3. **Run** – App sends the same prompt (and any required params) to each selected endpoint.
4. **View results** – Results shown side-by-side: image (or video link) per endpoint, plus metadata (time, cost from headers if available).

Optional later: custom prompt input, reference image upload for face-consistency endpoints.

---

## Preset prompts (MVP)

Curated, high-quality prompts representing real use cases. Suggested categories:

| Preset ID   | Name / description           | Example prompt (to be finalised) |
|------------|-------------------------------|-----------------------------------|
| character  | Character portrait           | e.g. “Portrait of a young woman, soft lighting, photorealistic, 8k” |
| influencer | Influencer / social post      | e.g. “Lifestyle photo, café setting, natural light, candid, high quality” |
| realistic  | Realistic / product-style     | e.g. “Product shot, clean background, studio lighting, sharp” |

Exact copy to be agreed with product/owner; store in app config or JSON.

---

## Endpoints in scope

- **Target**: All ~21 Modal endpoints (see `apps/modal/docs/ENDPOINTS-REFERENCE.md`, `libs/business/src/services/modal-client.ts`).
- **UI**: Add support for reference image upload (face-consistency endpoints), video input, and LoRA selection as needed so every endpoint can be tested from the playground.
- Implement in phases: start with text-to-image (no extra inputs), then add reference image, video, and LoRA inputs in the UI.

---

## UI (high level)

- **Simple, clean layout** (e.g. white background, minimal chrome).
- **Top**: Preset selector (dropdown or cards) + optional custom prompt field (Phase 2).
- **Middle**: Endpoint multi-select (checkboxes or chips) + “Run” button.
- **Bottom**: Side-by-side result grid:
  - One column/card per endpoint.
  - Each card: endpoint name, output image (or video thumbnail/link), duration, cost (from `X-Cost-USD` / `X-Execution-Time-Sec` if returned).
- Loading states per endpoint; show errors inline per card.

---

## Call path

**Decision: Option B – Via RYLA API.** Playground calls RYLA API; API calls Modal. Keeps Modal URL/keys server-side; no secrets in the playground app.

See IN-036 Decisions section for call-path decision. “Open Questions”.

---

## Non-goals (MVP)

- No auth (local only).
- No persistence of results (optional later).
- No integration with main web app.
- LoRA/reference image/video inputs: supported in UI when we add those endpoints (phase 2+).

---

## Docs

- How to run the app (README in `apps/modal-playground`).
- What each preset represents (short description in UI or README).
- Which endpoints are in scope and what inputs they need (link to `ENDPOINTS-REFERENCE.md`).

---

## References

- [IN-036: Modal Endpoint Testing Playground](../../initiatives/IN-036-modal-endpoint-testing-playground.md)
- [Modal Endpoints Reference](../../../apps/modal/docs/ENDPOINTS-REFERENCE.md)
- [Endpoint–app mapping](../../../apps/modal/ENDPOINT-APP-MAPPING.md)
- `libs/business/src/services/modal-client.ts`
