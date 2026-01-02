# EP-005 (P5) — Studio Generation + Inpaint (No Posts): File Plan + Tasks

Working in **PHASE P5 (File plan + tasks)** on **EP-005, ST-030**.

## Scope (MVP)

- **Generate images** (image assets) from Studio presets/options
- **Inpaint edit**: select image → prompt change → mask → new edited image asset (source unchanged)
- **NSFW allowed** (follows influencer/character setting)
- **Per-image structured metadata required**: `scene`, `environment`, `outfit`, `aspectRatio`, `qualityMode`, `nsfw`
- **Mask persistence**: **optional** in MVP (nice-to-have)

Explicitly out of MVP:
- Posts/captions/export-ready entity
- Advanced editing beyond basic inpaint

---

## Current reality (starting point)

- Web Studio is UI-heavy but **generation/editing are not wired**.
- API has ComfyUI primitives:
  - upload file to ComfyUI input folder: `ComfyUIPodClient.uploadImage()`
  - queue workflow: `ComfyUIPodClient.queueWorkflow()`
  - poll history + download base64 results: `ComfyUIPodClient.getJobStatus()`
  - upload outputs to S3/MinIO: `ImageStorageService.uploadImages(...)`
- DB has `images` table but **missing required Studio metadata** and **no edit lineage**.

---

## Proposed API surface (apps/api)

### Endpoints (MVP)

1) **Start Studio generation**

`POST /image/generate/studio`

Body (MVP):
- `characterId` (uuid)
- `scene` (enum)
- `environment` (enum)
- `outfit` (string)
- `aspectRatio` (`1:1 | 9:16 | 2:3`)
- `qualityMode` (`draft | hq`)
- `count` (1–10)
- `nsfw` (boolean)

Response:
- `promptIds: string[]` (ComfyUI prompt ids; one per image)
- `status: 'queued'`

2) **Start inpaint edit**

`POST /image/edit/inpaint`

Body (MVP):
- `characterId` (uuid)
- `sourceImageId` (uuid)
- `prompt` (string) — edit instruction (“add a nano banana…”)
- `negativePrompt?` (string)
- `maskedImageBase64Png` (string) — RGBA PNG, alpha = mask
- `seed?` (number)

Response:
- `promptId: string`
- `status: 'queued'`

3) **Poll ComfyUI results** (existing pattern)

`GET /image/comfyui/:promptId/results`

Response:
- `status: 'completed' | 'in_progress' | 'failed'`
- `images: [{ url, thumbnailUrl, s3Key }]`

4) **List images for character** (existing)

`GET /image-gallery/characters/:characterId/images`

Response:
- `images: Image[]`

---

## Data model (libs/data)

### Required schema updates (MVP)

Update `libs/data/src/schema/images.schema.ts` to include:
- `scene` (enum)
- `environment` (enum)
- `outfit` (text)
- `aspectRatio` (enum)
- `qualityMode` (enum)
- `nsfw` (boolean)

Lineage for edits:
- `sourceImageId` (uuid, nullable) → self FK to `images.id`
- `editType` (text, nullable) — `'inpaint'`

Nice-to-have (optional MVP):
- `editMaskS3Key` (text, nullable)

### Repository

Create `libs/data/src/repositories/images.repository.ts`:
- `createImageAsset(...)`
- `listByCharacterId(characterId, userId)`
- `getById(imageId)`

Keep repository concerns only (no business rules).

---

## Business layer (libs/business)

### Workflow builders (required)

Add `libs/business/src/workflows/flux-inpaint.ts`:
- `buildFluxInpaintWorkflow({ prompt, negativePrompt, imageFilename, seed, steps, cfg }) => ComfyUIWorkflow`

Add `libs/business/src/workflows/studio-generation.ts`:
- `buildStudioImageWorkflow({ prompt, negativePrompt, seed, width, height, steps, cfg }) => ComfyUIWorkflow`
  - Uses existing workflow registry approach (similar to `z-image-pulid.ts` but without custom nodes)

Export them from `libs/business/src/workflows/index.ts`.

### Mapping helpers (required)

Add `libs/business/src/studio/`:
- `studio-presets.ts` to map `scene/environment` → prompt fragments (using `@ryla/shared` constants)
- `id-normalization.ts` to normalize kebab-case ↔ snake_case where needed (web currently kebab; DB enums likely snake)

---

## API implementation (apps/api)

### New module (recommended)

Create `apps/api/src/modules/studio/`:
- `studio.module.ts`
- `studio.controller.ts`
- `studio.service.ts`
- `dto/req/generate-studio.dto.ts`
- `dto/req/inpaint.dto.ts`

Responsibilities:
- Validate auth + ownership (character + image)
- Build workflows using `@ryla/business`
- Upload masked image to ComfyUI input (`ComfyUIJobRunnerAdapter.uploadImage`)
- Queue workflows (`ComfyUIJobRunnerAdapter.queueWorkflow`)
- Persist `images` rows with metadata + status (`pending/generating/completed`)
- On poll completion: upload outputs to S3, update `images` rows to `completed`

### Extend existing results endpoint

`apps/api/src/modules/image/image.controller.ts` already has:
- `GET /image/comfyui/:promptId/results` calling `BaseImageGenerationService.getJobResults(...)`

We need a parallel service for **generic ComfyUI prompt results**:
- New `ComfyUIResultsService` (or extend `BaseImageGenerationService`) to:
  - fetch job status for promptId
  - upload output to S3
  - update the corresponding `images` row(s)

---

## Web implementation (apps/web)

### UI entry points

1) `/studio` (global) and `/influencer/[id]/studio` (per influencer):
- Replace mocked generation handlers with calls to business client layer (or `apps/web/lib/api/*` if we keep parity with existing approach).
- Add polling to update the gallery as images complete.

2) Image detail panel:
- Add **Edit** button → opens Inpaint modal

### Inpaint modal (new)

Create `apps/web/components/studio/edit/`:
- `inpaint-modal.tsx` (prompt input + canvas + actions)
- `mask-canvas.tsx` (draw/erase/clear; exports RGBA PNG)
- `types.ts`

### Client API wrapper

Prefer adding:
- `apps/web/lib/api/studio.ts`:
  - `startStudioGeneration(...)`
  - `startInpaintEdit(...)`
  - `pollComfyUIResults(promptId)`

---

## Analytics (libs/analytics)

Wire events from EP-005:
- `studio_opened`
- `generation_started` / `generation_image_completed` / `generation_pack_completed` / `generation_failed`
- `image_edit_opened` / `inpaint_started` / `inpaint_completed` / `inpaint_failed`

Add capture calls in:
- `apps/web/app/studio/page.tsx`
- `apps/web/app/influencer/[id]/studio/page.tsx`
- new inpaint modal

---

## Task breakdown (P6-ready)

### [TASK] TSK-EP005-001: DB schema updates for image assets
- Add required metadata fields to `images` schema + migration
- Add edit lineage fields (`sourceImageId`, `editType`, optional `editMaskS3Key`)

### [TASK] TSK-EP005-002: Data repository for images
- Implement `ImagesRepository` in `libs/data`

### [TASK] TSK-EP005-003: Workflow builders
- Add `buildFluxInpaintWorkflow`
- Add `buildStudioImageWorkflow`

### [TASK] TSK-EP005-004: API endpoints (studio generate + inpaint)
- Add `StudioModule` (controller/service/dtos)
- Ownership validation (character + source image)
- Queue workflows + persist jobs to `images`

### [TASK] TSK-EP005-005: Results reconciliation + persistence
- On polling completion, upload output to storage and update `images` rows
- Ensure metadata is stored for every generated/edited image

### [TASK] TSK-EP005-006: Web wiring (generation)
- Replace mock generate handlers
- Implement polling UI (progress, partial completion)
- Update gallery from API-backed images

### [TASK] TSK-EP005-007: Web wiring (inpaint)
- Add “Edit” entry point on image selection
- Implement mask canvas + RGBA export
- Call `POST /image/edit/inpaint` + poll results

### [TASK] TSK-EP005-008: Analytics
- Add capture calls per event table

---

## Acceptance criteria mapping

- **AC-1..AC-8**: generation options + pack/progress + persistence of metadata per image
- **AC-9**: inpaint edit flow


