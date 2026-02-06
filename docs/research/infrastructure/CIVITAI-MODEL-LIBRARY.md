# Civitai Model Library (Modal Deployment)

Maintainable catalog of Civitai models approved for RYLA Modal deployment. Single source of truth for choosing which models to preload, which LoRAs to offer, and how they map to endpoints.

**Data file:** `civitai-model-library.json`  
**Initiative:** IN-037 (Civitai Crawler/Scraper)

---

## Purpose

- **Choose from a list** – Pick models for a given Modal app (e.g. Flux, ZImage, WAN) without hardcoding URLs.
- **Stable references** – Use `id` and `civitaiModelId` / `civitaiVersionId` for scripts and automation.
- **Usage hints** – Strength ranges and trigger words live in one place for API defaults and docs.
- **Deployment flags** – `deployment.modalEnabled` and notes track what’s actually deployed.

---

## Schema (per model)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable RYLA id (e.g. `civitai-realistic-snapshot-zit`). Use in configs. |
| `civitaiModelId` | number | Civitai model ID from URL (`/models/123` → 123). |
| `civitaiVersionId` | number \| null | Pinned version ID if needed (`?modelVersionId=456`). |
| `name` | string | Display name. |
| `slug` | string | URL slug (last path segment on Civitai). |
| `type` | string | `LoRA` \| `Checkpoint` \| `Checkpoint Merge` \| etc. |
| `baseModel` | string | e.g. `ZImageTurbo`, `Flux.2 Klein 9B-base`, `WAN 2.2`. |
| `useCase` | string | `t2i_style` \| `t2i_photorealism` \| `t2i_base` \| `image_edit_consistency` \| `video_i2v` \| etc. |
| `civitaiUrl` | string | Full Civitai URL. |
| `usage` | object | `recommendedStrength`, `strengthRange`, `triggerWords`, `notes`. |
| `deployment` | object | `modalEnabled`, `notes` (which Modal endpoint / when to enable). |

---

## How to use for Modal deployment

1. **Filter by base model**  
   For a Modal app that runs ZImageTurbo, filter `baseModel === "ZImageTurbo"` to get LoRAs and checkpoints to preload or offer.

2. **Resolve download URL**  
   - With version pin: `https://civitai.com/api/download/models/{civitaiVersionId}`  
   - Without pin: use Civitai API to get default version’s primary file, then download by version ID.

3. **Default strength / trigger words**  
   Use `usage.recommendedStrength` and `usage.triggerWords` in API request builders and UI so users get good defaults.

4. **Enable on Modal**  
   Set `deployment.modalEnabled: true` when the model is actually deployed; use `deployment.notes` for which endpoint or image it’s used with.

---

## Adding or updating models

1. **Add an entry** to `models` in `civitai-model-library.json`:
   - `id`: kebab-case, prefixed with `civitai-` and a short slug (e.g. `civitai-my-lora`).
   - `civitaiModelId`: from Civitai URL `/models/<id>`.
   - `civitaiVersionId`: optional; set if you need a specific version.
   - Fill `name`, `slug`, `type`, `baseModel`, `useCase`, `civitaiUrl`, `usage`, `deployment`.

2. **Update `_meta.count`** to match the length of `models`.

3. **Optional:** Run any existing crawler/scripts (IN-037) to refresh metadata from Civitai; then merge in usage/deployment fields by hand.

---

## Current models (summary)

Full list: **50 models** in `civitai-model-library.json`. Sample by base:

| baseModel | count | ids (sample) |
|-----------|-------|---------------|
| ZImageTurbo | 12 | civitai-realistic-snapshot-zit, civitai-nsfw-master-flux, civitai-instagramification, civitai-turbo-pussy-z, civitai-zimage-turbo-nsfw-stable-yogi, … |
| SDXL / SDXL 1.0 | 2 | civitai-intorealism-xl, civitai-intorealism-ultra |
| WAN 2.2 | 2 | civitai-wan22-i2v-14b, civitai-wan-22-i2v-enhanced-lightning-svi |
| Flux.2 Klein 9B / Qwen | 2 | civitai-consistence-edit-lora, civitai-qwen-4-play-aio-nsfw |
| Other / multi-base | 5 | civitai-midjourney-artful-nsfw, civitai-bondage-go-bdsm-lora, civitai-moody-porn-mix, civitai-beyond-reality, civitai-snofs-sex-nudes-other-fun-stuff |

All currently have `deployment.modalEnabled: false`. Flip to `true` and set `deployment.notes` when each is wired into a Modal endpoint.

---

## Related docs

- **IN-037:** `docs/initiatives/IN-037-civitai-crawler-scraper.md`
- **RunComfy workflow catalog:** `runcomfy-workflow-catalog.json`, `runcomfy-workflow-shortlist.json`
- **Modal deployment:** `docs/ops/deployment/modal/README.md`, `apps/modal/`
