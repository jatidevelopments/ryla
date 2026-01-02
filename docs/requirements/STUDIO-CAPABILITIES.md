# Studio Capabilities (Current vs Planned)

Working in **PHASE P2 (Epics + AC discovery)** on **Epic EP-005, Story ST-TBD**.

This document explains what the Studio can do **today** in the repository, what is **available in backend services but not wired**, and what is **intended** per EP-005/EP-008.

---

## Current (as implemented in `apps/web`)

### Per-influencer Studio (`/influencer/[id]/studio`)

- **Select scene preset** (8 options): ✅ UI
- **Select environment preset** (7 options): ✅ UI
- **Select outfit**:
  - Keep current: ✅ UI
  - Pick from a subset of outfits: ⚠️ (not all 20 exposed)
- **Select format**:
  - Aspect ratio (1:1, 9:16, 2:3): ✅ UI
- **Select quality**:
  - Draft / HQ toggle: ✅ UI (used only for credit “cost” display)
- **NSFW toggle**: ✅ UI (not yet gated by influencer config)
- **Generate**: ⚠️ mocked (simulates a delay, creates a placeholder item without an image URL)
- **Caption editing**: ⚠️ exists in UI, but **should be Phase 2+** per scope refinement
- **Save**: ⚠️ local-only (persists to `localStorage` store, not DB)

Source: `apps/web/app/influencer/[id]/studio/page.tsx`, `libs/business/src/store/influencer.store.ts`

### Global Studio (`/studio`)

- **View all images** across influencers: ⚠️ local-only (reads in-memory / localStorage store)
- **Filter & sort**:
  - Filter by influencer, status, aspect ratio
  - Sort by newest/oldest
- **Select an image** and see details: ✅ UI
- **Like / delete**: ⚠️ local-only (store actions)
- **Download**: ✅ downloads `imageUrl` directly if available (for real URLs)
- **Bottom generation bar**:
  - Prompt input: ✅ UI
  - Influencer picker: ✅ UI
  - Model picker / quality / aspect ratio / batch size / “Styles & Scenes”: ✅ UI
  - Generate: ❌ not wired (mock delay; TODO to call API)

Source: `apps/web/app/studio/page.tsx`, `apps/web/components/studio/*`, `apps/web/components/studio/generation/*`

---

## Backend capabilities that exist (but Studio doesn’t call yet)

### Generation (Wizard-oriented today)

- **Base images** (3 image options): ✅ `POST /characters/generate-base-images` (ComfyUI)
- **Profile picture sets** (7–10 images, PuLID face consistency): ✅ `POST /characters/generate-profile-picture-set` (ComfyUI)
- **Character sheet** (7–10 variations): ✅ `POST /characters/generate-character-sheet` (RunPod)

### DB readiness (Phase 2+ “posts”)

- `posts` table exists with:
  - `scene`, `environment`, `outfit`, `aspect_ratio`, `quality_mode`, `nsfw`
  - `caption`, `liked`, `exported`
  - `prompt`, `negative_prompt`, `seed`

Source: `libs/data/src/schema/posts.schema.ts`

---

## Planned (MVP intent)

From EP-005 (“Content Studio & Generation”):

- Build prompts from:
  - AI influencer config (appearance + default outfit)
  - selected scene + environment + optional outfit override
- Generate 1–10 images per request with progress
- Persist generated results as **image assets** so they appear in gallery
- Support face consistency strategy:
  - “instant” face consistency immediately
  - later auto-upgrade to LoRA/HD when trained
- Image editing (basic inpainting):
  - select an existing image asset
  - provide edit prompt + mask
  - apply inpainting to create a new edited image asset
- Capture analytics events:
  - `studio_opened`, `generation_started`, `generation_pack_completed`, etc.

From EP-008 (“Image Gallery & Downloads”):

- View all generated images for a character
- Download single image and ZIP download
- “Generate more” from gallery (delegates to EP-005)

### Explicitly out of MVP (Phase 2+)

- “Post” entity (image + caption as export-ready content)
- Caption generation and caption editing flows
- Export-ready workflows tied to “posts”
- Advanced image editing beyond basic inpainting (layers, multi-step tooling)

---

## Known mismatches to resolve before implementation

- **Naming**: web uses “influencer”, API/DB use “character” (needs consistent public model naming)
- **Preset IDs**: web uses kebab-case (`professional-portrait`), DB enums use snake_case (`professional_portrait`)
- **Persistence**: web currently uses `zustand` localStorage store; MVP should persist **image assets** (not posts)
- **Analytics**: Studio UI currently does not call `@ryla/analytics` events described in EP-005


