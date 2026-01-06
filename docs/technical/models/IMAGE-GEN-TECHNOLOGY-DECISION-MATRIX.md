# Image Generation – Technology Decision Matrix (MVP)

> **Date**: 2025-12-30  
> **Owner**: Product + Engineering  
> **Scope**: Wizard (base + profile) + Studio (generate + edit + upscale)  
> **Goal**: Define **requirements + acceptance criteria + success metrics** per area, then pick the **smallest set of models/providers** that satisfies MVP.

---

## Working assumptions (confirmed / updated)

- **Speed-first UX** for Wizard profile pictures (show _something_ quickly; consistency can be lower in “fast” mode).
- **External SFW providers** are allowed, but we need a **price matrix** to pick the best (see below).
- **Budget**:
  - **≤ $2** per influencer creation (Wizard base + initial profile set)
  - **≤ $5** per influencer creation including LoRA training
- **NSFW** is required, but we want **only 1–2 NSFW-capable models** for now and we treat NSFW as **on-server** by default.
- We want **3 model options in Studio** to start (1 on-server baseline + 2 external SFW).

---

## Current platform reality (as of today)

### What’s implemented in production code

- **Wizard base images**: ComfyUI workflow (parallel submission)
- **Wizard profile pictures**: ComfyUI workflow (fast mode default; consistent mode optional but currently flaky)
- **Studio generate**: ComfyUI workflow (draft/hq params)
- **Studio inpaint**: ComfyUI Flux inpaint builder exists, but Flux models are not on the current pod

### What’s available on the current ComfyUI pod

- **Installed model family**: Z-Image (diffusion `z_image_turbo_bf16.safetensors`, encoder `qwen_3_4b.safetensors`, VAE `z-image-turbo-vae.safetensors`)
- **Upscaling node types exist** (e.g., `UpscaleModelLoader`, `ImageUpscaleWithModel`), but **upscaler models are not clearly provisioned** (TBD: install real upscaler models).

### External provider credentials exist (but not integrated yet)

From `config/env.template`:

- `REPLICATE_API_TOKEN`
- `FAL_KEY`

---

## MVP Feature Table (single-page view)

This table is the “at a glance” source of truth for **features → requirements → candidate tech**.

<!-- markdownlint-disable MD060 -->

| Area   | Feature                    | What it does                                     | NSFW?                          | Speed AC (P50)                               | Quality expectation (MVP)                                     | Budget target                   | Current status                                  | Success metrics                                      | Candidate models/providers                                                   |
| ------ | -------------------------- | ------------------------------------------------ | ------------------------------ | -------------------------------------------- | ------------------------------------------------------------- | ------------------------------- | ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Wizard | Base images (3 options)    | Generate 3 selectable base identity images       | TBD (confirm)                  | **All 3 < 10s** (requires 3-way parallelism) | Photorealistic face; clean background; 2/3 distinct           | Included in **$2** creation cap | Needs change (2 external + 1 on-server)         | time-to-all-3, distinctness pass rate, error rate    | fal.ai: `fal-ai/flux/schnell`, `fal-ai/flux/dev` + on-server Z-Image Danrisi |
| Wizard | Profile picture set (7–10) | Generated post-create on Profile page (bg)       | Yes (subset)                   | Target: **8 imgs < 60s** (consistency-first) | Consistency-first (reference-based); fast mode optional       | Included in **$2** creation cap | Implemented on Profile page (bg + notification) | time-to-8, completion rate, error rate               | On-server: PuLID (consistent)                                                |
| Wizard | Regenerate a profile pic   | Replace 1 position image (prompt tweak)          | Yes (if that position is NSFW) | **< 15s** (single image)                     | Similar vibe; avoid artifacts; preserve “same person” loosely | Small per-action cost           | Implemented                                     | time-to-1, failure rate                              | On-server: Z-Image Danrisi                                                   |
| Studio | Generate (1–10)            | Generate new post image(s) from prompt + presets | Yes (routing)                  | **First < 20s**, final < 60s (draft)         | Higher fidelity than wizard; controllable AR                  | Per-image budget TBD            | Implemented (1 model wired)                     | time-to-first, time-to-final, cost/image, error rate | Model 1: on-server Z-Image Danrisi; Model 2/3: fal.ai/Replicate TBD          |
| Studio | Edit (inpaint)             | Mask-based edit of an existing image             | Yes (routing)                  | **< 60s**                                    | Respect mask; preserve face; minimal bleed                    | Per-edit cost TBD               | Partially (workflow exists; models missing)     | time-to-edit, mask fidelity pass rate                | On-server: Flux inpaint (models required)                                    |
| Studio | Upscale                    | Upscale generated image (2×/4×)                  | Yes (routing)                  | **< 30s**                                    | Preserve face; avoid plastic artifacts                        | Per-upscale cost TBD            | Blocked (need upscaler model + API path)        | time-to-upscale, artifact rate                       | On-server: ComfyUI upscalers (model required)                                |

<!-- markdownlint-enable MD060 -->

Notes:

- Exact external model IDs + $/image must be validated via **benchmarks** (Fal + Replicate).
- NSFW is treated as **on-server** by default; we keep NSFW to **1–2 models** for MVP.

## Research conclusions (feeds this matrix)

This section summarizes what our existing research implies for the MVP decisions above.

### Speed + cost (on-server)

- **Z-Image-Turbo** is consistently reported as **~6–7s per image** at **8–9 steps** and is generally **cheaper** than Flux because it needs fewer steps. See `docs/research/Z-IMAGE-VS-FLUX-RECOMMENDATION.md`.
- **Flux Dev (uncensored)** is slower (often **10–15s**) but has the strongest **known NSFW** path and broader community support. See `docs/research/MODEL-RESEARCH-SUMMARY.md`.

### External base-image candidates (SFW-first)

- **cDream v4 / Seedream 4.x** is repeatedly cited as **high quality** and **cheap (~$0.025–0.03/image)**, but **NSFW support is unknown / likely restricted**. Treat as **SFW-only until verified**. See `docs/research/CDREAM-V4-RESEARCH.md`.
- **Seedream 4.5** appears especially strong for **editing, multi-reference (10 images), prompt adherence, and text rendering**, but it is **not self-hostable**; access is via API (including fal.ai). **NSFW is unknown**. See `docs/research/SEEDREAM-4.5-UPDATE.md` + `docs/research/SEEDREAM-4.5-SELF-HOSTING.md`.

### Base images: time-to-all-3 < 10s (primary target)

- Hitting **all 3 base images < 10s** requires either:
  - **More GPU parallelism** (true concurrent inference / multiple workers), or
  - **External SFW APIs** that can fan out across provider capacity.
- We now treat this as the **primary base-images SLA**, which is why the matrix recommends **3 external model calls in parallel** for Wizard base images.

### Upscaling

- Best-in-class upscaling research points to **SeedVR2 (FP16 7B)** quality, but it requires specific ComfyUI custom nodes and meaningful VRAM; also can introduce **waxy/plastic skin** if not tuned. See `docs/research/upscaling-techniques.md`.

### Pipeline quality (base image foundation)

- Research strongly suggests **base image quality is the foundation**; consider a **single “skin enhancement” step** immediately after base selection to improve downstream consistency/realism (and reduce per-image fixes later). See `docs/research/AI-INFLUENCER-WORKFLOW-LEARNINGS.md`.

## Areas in the app (feature matrix)

### 1) Wizard – Base Images (3 options)

**User goal**: pick a strong base identity quickly.  
**System goal**: produce 3 _distinct_ high-quality candidates with low wait time.

#### Base images – Capabilities needed

- **Speed to first image** (perceived performance)
- **Diversity** across 3 images (faces/looks not near-duplicates)
- **Photorealism** (minimum quality bar)
- **SFW/NSFW routing** (if base images can be NSFW in MVP; confirm)
- **Deterministic seeds** (reproducibility for debugging)

#### Base images – Acceptance Criteria (MVP)

- AC1: 3 images queued in parallel; user sees **first image < 10s** (P50) and **all 3 < 30s** (P50)
- AC2: at least **2/3 images are meaningfully distinct** (manual QA rubric; later automated similarity threshold)
- AC3: failures surface to UI within **< 3s** of being known (no infinite “waiting”)

#### Base images – Success metrics

- A: Wizard completion rate (base → next step) ≥ TBD%
- Time-to-first-image P50/P90
- Time-to-3-images P50/P90
- User abandon rate during base generation ≤ TBD%

#### Base images – Model/provider slots (MVP recommendation)

- Slot A (default): **On-server ComfyUI Z-Image Danrisi** (fast + cheap, meets $2 constraint)
- Slot B/C (optional later): External SFW providers (Fal/Replicate) only if we can justify
  quality uplift and keep creation under **$2**.

> NOTE: We should not pick “3 different models” until we confirm which external models we’re allowed to use + budget.

---

### 2) Wizard – Profile Pictures (set of 7–10)

**User goal**: get a usable profile set quickly.  
**System goal**: speed-first; keep a “consistent” option but default to fast.

#### Profile pictures – Capabilities needed

- **Fast mode**: no reference upload, lower steps/res, stream results progressively
- **Consistent mode** (optional): higher face consistency, slower, can be flaky depending on nodes
- **NSFW subset**: generate NSFW positions when enabled; must run on-server

#### Profile pictures – Acceptance Criteria (MVP)

- AC1: Fast mode default; **first profile image < 10–15s P50**, **full set (8 images) < 60s P50**
- AC2: Progress indicator shows correct total count (no “0/0”)
- AC3: If any job fails, UI transitions to failed (with error) **without waiting for timeout**
- AC4: NSFW positions are generated via on-server route when enabled

#### Profile pictures – Success metrics

- A: Wizard completion rate (profile step) ≥ TBD%
- P50/P90 time-to-first-profile-image
- P50/P90 time-to-complete-set
- Error rate ≤ TBD%

#### Profile pictures – Model/provider slots (proposal)

- Fast (SFW + NSFW capable): **ComfyUI Z-Image Danrisi**
- Consistent (SFW + NSFW capable): **LoRA once trained** — _PuLID currently unreliable on this pod; treat as non-MVP until fixed_
- Optional external SFW accelerator: **TBD** (only if we need even faster perceived-first-image)

---

### 3) Studio – Generate (single image / batch)

**User goal**: generate high-quality posts with control (aspect ratio, style, scene, lighting).  
**System goal**: 3 models to start; clear routing; consistent UX.

#### Studio generate – Capabilities needed

- Multiple **model choices** (3)
- **Aspect ratio** support (1:1, 9:16, 2:3, …)
- **Quality tiers** (draft/hq)
- **NSFW routing** for NSFW-enabled influencer
- **Batch** generation (1–10)
- **Persist results** to DB + storage

#### Studio generate – Acceptance Criteria (MVP)

- AC1: 3 selectable model options in Studio settings (backed by real providers)
- AC2: NSFW-enabled influencer routes generation to on-server provider
- AC3: draft/hq tiers map to concrete params (steps/cfg/res or provider quality)
- AC4: P50 time-to-first-image < 20s, P50 time-to-final-image < 60s (draft) — TBD final targets

#### Studio generate – Success metrics

- C: Images generated per active creator per week
- P50/P90 time-to-first-image
- Cost per image (by provider)
- Failure rate by provider/model

#### Studio generate – Model/provider slots (MVP recommendation)

- Model 1 (baseline, NSFW-capable): **On-server ComfyUI (Z-Image Danrisi)**
  - Always available, covers NSFW.
- Model 2 (SFW “premium quality”): **fal.ai (TBD exact model)**
- Model 3 (SFW “fast/cheap”): **fal.ai or Replicate (TBD exact model)**

Selection should be driven by the **price matrix** + benchmark comparisons.

---

### 4) Studio – Edit (Inpaint)

**User goal**: edit part of an image (clothing, background object, etc.).  
**System goal**: stable edits without identity collapse.

#### Studio edit – Capabilities needed

- Inpaint workflow, mask support
- Preserve face/identity as much as possible
- Prefer on-server for NSFW

#### Studio edit – Acceptance Criteria (MVP)

- AC1: Inpaint request returns a new asset; original preserved
- AC2: Edit region respects mask (no large bleed)
- AC3: P50 time-to-result < 60s (TBD)

#### Studio edit – Notes

- Flux inpaint workflow exists in code (`buildFluxInpaintWorkflow`) but **requires Flux models on pod**.

---

### 5) Studio – Upscale

**User goal**: increase resolution / sharpness for posting.  
**System goal**: preserve face, avoid plastic skin, keep cost bounded.

#### Studio upscale – Capabilities needed

- Upscale models provisioned on pod
- Fast enough to feel “tool-like”

#### Studio upscale – Acceptance Criteria (MVP)

- AC1: Upscale available for generated images (2×/4× options TBD)
- AC2: P50 time-to-upscale < 30s (TBD)
- AC3: No major artifacts (manual QA rubric)

#### Studio upscale – Notes

- Upscaling node types exist on the pod; **we still need to install at least one upscaler model** and implement an API path.

---

## MVP decision matrix (what we pick)

We will select providers/models by scoring them against these weighted criteria (per area):

- **Speed to first result** (Wizard: highest weight)
- **Quality bar** (Studio: highest weight)
- **NSFW capability** (hard constraint for NSFW routes)
- **Cost** (hard constraint: budget TBD)
- **Reliability** (error rate, timeouts)
- **Operability** (self-host control, observability)

## Price matrix (required before choosing external providers)

See:

- `docs/technical/IMAGE-GEN-PRICE-MATRIX.md`

---

## Open decisions (need your input to finalize)

1. **Exact external model picks** (SFW-only)
   - Which fal.ai model is “premium quality” and which is “fast/cheap”.
2. **NSFW model count (1–2)** and the exact on-server model(s)
   - Current on-server: Z-Image Danrisi (NSFW capability still needs explicit validation).
3. **Target SLAs** (P50/P90) per area
   - Base (first/3), Profile (first/set), Studio (first/final), Upscale (time)

---

## Recommendation (based on current implementation + pod)

For MVP, keep a safe baseline that is actually runnable today:

- **On-server**: Z-Image Danrisi (Wizard + Studio default; NSFW routing where needed)
- **External SFW**: pick **two** from Fal/Replicate _once we confirm the exact models and cost ceiling_
- **Consistency**: move from PuLID to **LoRA** for “consistent mode” once training is ready (Phase 2 or background step)
