# EP-005 (P3) — Studio Image Assets + Inpainting (No Posts)

Working in **PHASE P3 (Architecture + API)** on **EP-005, ST-030**.

## Goal

Deliver MVP Studio functionality where users can:
- **Generate** new images for a character (“AI influencer”) using Studio presets/options.
- **Select an existing image asset**, change the **prompt**, and **inpaint** a masked region (e.g., “add a nano banana”).

Explicitly **out of MVP**:
- “Post” entity (image + caption + export-ready workflows)
- Caption generation and caption editing flows

---

## Architecture (Layers)

- **apps/web**: Studio UI, mask drawing, polling, gallery views
- **apps/api**: Authenticated endpoints, ComfyUI workflow submission, storage upload, DB persistence
- **libs/business**: Workflow builders (TypeScript `ComfyUIWorkflow`), prompt builders, orchestration helpers
- **libs/data**: DB schema + repositories for image assets

Data flow:
1. Web sends **generate** or **inpaint** request → API
2. API uploads required files (image/mask) to ComfyUI input
3. API queues ComfyUI workflow and returns `promptId`
4. Web polls results endpoint until completed
5. API uploads output to storage and persists as an **image asset**

---

## ComfyUI Inpaint Workflow (What we already have)

Repo contains a Flux inpaint workflow export:
- `libs/comfyui-workflows/flux/inpaint/inpaint.json`

Important: this file is a **ComfyUI UI export**, not directly runnable via `/prompt`. Production execution must use the **ComfyUI “prompt” format** (`ComfyUIWorkflow`), built similarly to:
- `libs/business/src/workflows/z-image-pulid.ts`

### Workflow inputs we need
From the workflow graph:
- **Prompt**: `CLIPTextEncode` positive prompt
- **Negative prompt**: `CLIPTextEncode` negative prompt
- **Image + mask**: `LoadImage` feeds both `pixels` and `mask` into `InpaintModelConditioning`

---

## Decision: Mask transport format (MVP)

### Recommended MVP choice
- **Client produces a single RGBA PNG** where:
  - RGB = original image
  - Alpha = mask (white/opaque = edit, black/transparent = keep)
- Client sends `maskedImageBase64Png` to API.
- API uploads that PNG to ComfyUI input and sets `LoadImage.image` to the uploaded filename.

Why:
- Matches the existing inpaint workflow which uses a single `LoadImage` node to produce **both** `IMAGE` and `MASK`.
- Avoids server-side image compositing dependencies.

### Alternative (later)
Send **mask only** and merge server-side (requires image compositing dependency + more logic).

---

## Proposed API (apps/api)

### 1) Start inpaint edit (new)

`POST /image/edit/inpaint`

Body:
- `characterId` (uuid)
- `sourceImageId` (uuid) — existing image asset
- `prompt` (string) — edit instruction
- `negativePrompt?` (string)
- `maskedImageBase64Png` (string) — RGBA image with alpha mask
- `seed?` (number) — optional reproducibility

Response:
- `promptId` (string) — ComfyUI prompt id
- `status` = `queued`

Notes:
- API must verify ownership of `sourceImageId` + `characterId`.
- API uploads `maskedImageBase64Png` to ComfyUI via `ComfyUIPodClient.uploadImage()` (already implemented).
- API queues inpaint workflow via `ComfyUIPodClient.queueWorkflow()`.

### 2) Poll results (existing)

Reuse existing endpoint pattern:

`GET /image/comfyui/:promptId/results`

Returns:
- `status` (`completed`/`in_progress`/`failed`)
- `images[]` with permanent storage URLs (already uploads to S3/MinIO)

### 3) List image assets (existing-ish)

Use existing gallery controller:

`GET /image-gallery/characters/:characterId/images`

Returns:
- `images[]` from `libs/data/src/schema/images.schema.ts`

Gap:
- It currently returns `images` table rows, which do **not** include Studio preset fields and do not track inpaint lineage.

---

## Minimal persistence model (MVP)

### DB table: `images` (source of truth for Studio assets)

We will treat each generated or edited output as an **image asset** stored in `images`.

Today, `images` already stores:
- `characterId`, `userId`
- `s3Key`, `s3Url`, `thumbnailKey`, `thumbnailUrl`
- `prompt`, `negativePrompt`, `seed`
- `status`, `width`, `height`, `generationError`

### Proposed schema deltas (MVP)

Add columns to support inpainting lineage and reproducibility:
- `sourceImageId` (uuid, nullable) — references `images.id`
- `editType` (text, nullable) — e.g. `'inpaint'`
- `editMaskS3Key` (text, nullable) — store uploaded mask (optional but recommended)

Optional (nice-to-have for debugging):
- `editPrompt` (text, nullable) — if you want to keep “base prompt” separate from “edit prompt”

### Required Studio metadata deltas (MVP)

Because we need structured metadata (not just a combined prompt), each stored image asset MUST include:
- `scene` (enum) — EP-005 scene preset
- `environment` (enum) — EP-005 environment preset
- `outfit` (text)
- `aspectRatio` (enum: `1:1 | 9:16 | 2:3`)
- `qualityMode` (enum: `draft | hq`)
- `nsfw` (boolean)

For edits:
- preserve the source image’s metadata by default
- allow overriding **prompt fields** for the inpaint job while still keeping structured metadata stable

Note: keep EP-005 “posts” table unused in MVP.

---

## Web UX (apps/web)

### Entry points
- From Studio gallery detail panel: add **Edit** button
- From influencer gallery: add **Edit** action on selected image

### MVP editing flow
1. User selects image
2. User clicks **Edit**
3. Modal opens:
   - Prompt input (single line)
   - Mask canvas overlay (brush + erase + clear)
4. On “Apply Edit”:
   - web exports **RGBA PNG** where alpha is mask
   - calls `POST /image/edit/inpaint`
5. Web polls `GET /image/comfyui/:promptId/results`
6. On completion:
   - show new image asset in gallery (source remains unchanged)

Mask constraints:
- Must match the source image dimensions (1024x1024 typical)
- Track approximate `mask_coverage_pct` for analytics

---

## Implementation notes (API)

### Workflow builder (required)
Create a new workflow builder in `libs/business/src/workflows/`:
- `flux-inpaint.ts` exporting `buildFluxInpaintWorkflow({ prompt, negativePrompt, imageFilename, ... })`

Why:
- ComfyUI execution uses `ComfyUIWorkflow` prompt format (map of node-id → `{class_type, inputs}`),
  not the UI export JSON from `libs/comfyui-workflows/`.

### Storage
Reuse existing `ImageStorageService` to upload the output image(s) to S3/MinIO.

### Job identity
Use ComfyUI `promptId` as the job handle for MVP. (Optional later: DB job table for edit jobs.)

---

## Open questions (confirm before P6)

1. **Do we require saving the edit mask** as an asset (`editMaskS3Key`)?
   - Meaning: when a user draws a mask, do we store that mask image in S3/MinIO (like we store generated images),
     so we can later re-run/inspect the edit, debug issues, or re-apply variations.
   - If **yes**: we upload the mask (or the RGBA “masked image”) and store its `s3Key` on the edited image record.
   - If **no**: we treat the mask as ephemeral, used only for that edit job, and not persisted.
   - **Decision: YES, but optional in MVP** — implement if low effort; do not block MVP launch on it.
2. **Should inpaint be allowed on NSFW images** (follow influencer NSFW setting)?
   - **Decision: YES** (per user confirmation).
3. **Do we need Studio preset fields** on `images` in MVP (scene/environment/outfit), or can we defer and rely on prompt text only?
   - **Decision: YES** metadata is crucial; we must store structured fields per image (per user confirmation).


