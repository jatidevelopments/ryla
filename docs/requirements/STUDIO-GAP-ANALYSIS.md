# Studio (EP-005) Gap Analysis — Requirements vs Repository

Working in **PHASE P2 (Epics + AC discovery)** on **Epic EP-005, Story ST-TBD**.

This document maps **EP-005 acceptance criteria** to what currently exists in the repository, highlights missing functionality, and calls out key integration gaps between **apps/web ↔ apps/api ↔ libs**.

---

## Inputs (Sources)

- **Requirements**: `docs/requirements/epics/mvp/EP-005-content-studio.md`
- **Web (Studio UI)**:
  - `apps/web/app/influencer/[id]/studio/page.tsx`
  - `apps/web/app/studio/page.tsx`
  - `apps/web/components/studio/*`
  - `apps/web/components/studio/generation/*`
- **API (Image generation + gallery)**:
  - `apps/api/src/modules/image/image.controller.ts`
  - `apps/api/src/modules/character/character.controller.ts`
  - `apps/api/src/modules/image-gallery/*`
- **DB schema**:
  - `libs/data/src/schema/images.schema.ts`
  - `libs/data/src/schema/characters.schema.ts`
  - (Phase 2+) `libs/data/src/schema/posts.schema.ts`

---

## Reality Check: “Studio” in the repo today

There are effectively **two Studio surfaces** in the web app:

- **Per-influencer Studio**: `/influencer/[id]/studio`
  - Has **scene/environment/outfit/aspect ratio/quality/NSFW toggles**
  - **Generation is mocked** (sleeps for 3s, creates placeholder item with empty `imageUrl`)
  - Saves to **localStorage store** (`libs/business/src/store/influencer.store.ts`)

- **Global Studio (“All Images”)**: `/studio`
  - Shows an “all images” gallery and a bottom “generation bar”
  - Uses the same **local store posts**, not backend
  - `onGenerate` is **TODO** (mock delay, no API call)

Backend-wise:

- Image generation endpoints exist, but **they are wizard-oriented** and/or not wired to Studio UI:
  - `POST /characters/generate-base-images` (ComfyUI)
  - `POST /characters/generate-profile-picture-set` (ComfyUI PuLID)
  - `POST /characters/generate-character-sheet` (RunPod batch)
  - `POST /image/generate/face-swap` (RunPod, DB-tracked generation job)
  - `GET /image/jobs/:jobId` (DB-tracked generation job poll)

**MVP note**: EP-005 was refined to keep “posts/captions” out of MVP. The missing piece for MVP is: **create/list generated image assets** (not posts), with enough metadata to support filters + regeneration.

---

## EP-005 Acceptance Criteria Mapping

Legend:
- ✅ Implemented
- ⚠️ Partially implemented / UI-only
- ❌ Missing

### AC-1: Content Studio Access
- [x] User can open Content Studio from AI Influencer profile: ⚠️ (UI route exists; no backend integration)
- [x] Studio shows AI Influencer name and avatar: ✅ (web UI)
- [x] All generation options visible: ⚠️ (some options exist; pack count not implemented; model/mode not surfaced)
- [x] Credit cost calculated and displayed: ⚠️ (UI calculation only; not enforced via backend credits)

**Evidence**: `apps/web/app/influencer/[id]/studio/page.tsx`, `apps/web/lib/hooks/use-credits.ts`

### AC-2: Scene Selection
- [x] User can select from 8 scene presets: ✅ (UI has 8 options)
- [x] Scene affects generation prompt: ❌ (no backend generation)
- [x] Visual cards or dropdown with descriptions: ✅ (UI chips)
- [x] Default: Professional portrait: ❌ (current default uses `casual-day`, not in option list)

**Evidence**: `apps/web/app/influencer/[id]/studio/page.tsx`, `libs/shared/src/constants/studio/scene-options.ts`

### AC-3: Environment Selection
- [x] User can select from 7 environment presets: ✅ (UI)
- [x] Environment affects generation prompt: ❌
- [x] Visual cards or dropdown with descriptions: ✅
- [x] Default: Studio (plain background): ✅

**Evidence**: `libs/shared/src/constants/studio/environment-options.ts`

### AC-4: Outfit Changes
- [x] Keep current outfit (default): ✅ (UI)
- [x] Change outfit from 20 options: ⚠️ (UI currently surfaces only a subset)
- [x] Outfit applies to this generation only: ⚠️ (UI state only; no persistence semantics)
- [x] AI Influencer default outfit unchanged: ⚠️ (UI state only)

**Evidence**: `apps/web/app/influencer/[id]/studio/page.tsx`, `libs/shared/src/constants/character/outfit-options.ts`

### AC-5: Generation Options
- [x] Aspect ratio (1:1, 9:16, 2:3): ✅ (UI)
- [x] Quality (Draft/HQ): ✅ (UI)
- [x] Image count (1, 5, 10): ❌ (not implemented in Studio generation)
- [x] NSFW toggle visible if AI Influencer has it enabled: ❌ (UI shows toggle unconditionally)

### AC-6: Generation Flow
- [x] Generate starts generation: ⚠️ (mock only)
- [x] Progress indicator shows status: ⚠️ (spinner only; no “X of Y”)
- [x] Images appear as they complete: ❌
- [x] Error handling with retry: ⚠️ (retry exists visually in some cards, but no backing state)

### AC-7: Face Consistency
- [x] Same AI Influencer produces similar faces: ❌ (not wired)
- [x] Face Swap mode works immediately: ⚠️ (backend has face-swap endpoint, but Studio doesn’t call it)
- [x] LoRA mode auto activates when ready: ❌ (no LoRA orchestration exposed to Studio)
- [x] Consistency maintained across sessions: ❌
- [x] Seamless switch face swap → LoRA: ❌

### AC-8: Image Pack
- [x] Generate 1–10 images per request: ❌
- [x] Maintain face consistency: ❌
- [x] Progress (X of Y): ❌
- [x] Partial success handled: ❌

### AC-9: Image Editing (Inpaint)
- [x] Select an existing image asset and open edit flow: ❌
- [x] Provide edit prompt + mask: ❌
- [x] Apply edit to create a new edited image asset (source unchanged): ❌
- [x] Retry on failure with prompt/mask preserved: ❌

---

## Key Integration Gaps (Web ↔ API ↔ Services)

- **Missing “Studio generation” endpoint** aligned to EP-005 (`scene`, `environment`, `outfit`, `aspect_ratio`, `quality_mode`, `count`).
- **No persistence of Studio output (MVP image assets)**:
  - Web stores generated items in localStorage via `libs/business/src/store/influencer.store.ts`
  - Backend has an `images` table (`libs/data/src/schema/images.schema.ts`), but Studio does not write/read it yet (and it currently lacks Studio preset fields).
- **Inconsistent naming/IDs**:
  - EP-005 uses `professional_portrait` etc (snake_case)
  - Web uses `professional-portrait` etc (kebab-case)
  - API and DB use **characters**, while web UI refers to **influencers**
- **Analytics not wired**:
  - EP-005 defines events (`studio_opened`, `generation_started`, etc.)
  - Studio pages do not currently call `@ryla/analytics`
- **Missing inpainting flow**:
  - No API endpoint to submit an inpaint edit job
  - No UI mask tooling to collect/export mask
  - No persistence/linkage of edited image asset back to its source

---

## Recommended Next Stories (Implementation Plan Preview)

These are the minimal “connective tissue” stories needed to make Studio real:

- **[STORY] ST-028**: Real pack generation (1–10) + progress + partial success
- **[STORY] ST-030+ (new, MVP)**: Image asset persistence + list images for influencer + like/download actions backed by DB
- **[STORY] ST-031+ (new, MVP)**: Align preset IDs + enforce typed enums end-to-end (`ScenePreset`, `EnvironmentPreset`)
- **[STORY] ST-032+ (new, MVP)**: Analytics wiring per EP-005 table
- **[STORY] ST-030 (MVP)**: Inpaint edit: select image → prompt + mask → new edited image asset
- **(Phase 2+)**: Posts + captions + export-ready entity (do not implement in MVP)

---

## Notes

This repo already contains most “building blocks” for an EP-005 Studio:
- prompt builder infrastructure (`PromptBuilder`, prompt sets)
- ComfyUI adapters + storage upload pipeline
- DB schema for `posts` with exact EP-005 metadata (Phase 2+)

The missing piece for MVP is primarily the **end-to-end integration** (controllers/services/repos/hooks) and **replacement of mocked UI generation** with real calls + persistence of **image assets**.


