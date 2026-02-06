# RYLA RunComfy Workflow Criteria & Shortlist (IN-038 Phase 2)

**Purpose**: Define which RunComfy workflows fit RYLA’s MVP and how to prioritize them.  
**Input**: RunComfy catalog (`runcomfy-workflow-catalog.json`) and downloaded workflows (`runcomfy-workflows/<slug>/workflow.json`).  
**Output**: Shortlist of workflows to deploy on RunComfy as **the** generation provider (RunComfy-only; Modal not in scope here).

---

## 1. RYLA requirements (what we need)

From MVP scope, EP-005 (Content Studio), EP-058 (Modal MVP models), and product hypothesis:

### 1.1 Use cases (MVP)

| Use case                         | Description                                            | Priority |
| -------------------------------- | ------------------------------------------------------ | -------- |
| **T2I (text-to-image)**          | Generate images from prompt; quality + optional speed  | P0       |
| **Face / character consistency** | Same face across images (AI influencer)                | P0       |
| **Image editing**                | Instruction-based edit, inpainting (mask), outpainting | P0       |
| **Video (T2V / I2V / R2V)**      | Text-to-video, image-to-video, reference-to-video      | P0       |
| **Upscaling**                    | Improve resolution of images (and optionally video)    | P1       |
| **LoRA**                         | Character LoRA training + inference                    | P0       |
| **Video face swap**              | Swap face in video (e.g. ReActor)                      | P1       |

### 1.2 Technical / business criteria

- **NSFW**: Must support or allow NSFW (required for RYLA positioning).
- **License**: Prefer Apache 2.0 or equivalent (free commercial use).
- **Deployable as API**: RunComfy “Deploy as API” or callable endpoint.
- **Quality / reliability**: Prefer workflows that deliver good face consistency, resolution, and stability.

---

## 2. RunComfy workflow categories (for tagging)

Map each catalog workflow into **one primary category** and **priority**:

| Category             | Keywords (title/description)                                               | RYLA priority |
| -------------------- | -------------------------------------------------------------------------- | ------------- |
| **t2i**              | text-to-image, text to image, T2I, SDXL, Flux, Qwen, portrait              | P0            |
| **face_consistency** | InstantID, PuLID, IPAdapter FaceID, face consistency, consistent character | P0            |
| **image_edit**       | edit, inpainting, inpaint, outpainting, outpaint                           | P0            |
| **video_t2v**        | text-to-video, text to video, T2V, AnimateDiff, SVD, Wan, video generation | P0            |
| **video_i2v**        | image-to-video, image to video, I2V                                        | P0            |
| **video_r2v**        | reference-to-video, R2V, reference video                                   | P1            |
| **upscale**          | upscale, upscaler, super-resolution, 4x, SeedVR, Real-ESRGAN               | P1            |
| **lora**             | LoRA, lora training, lora inference                                        | P0            |
| **face_swap**        | face swap, ReActor, swap face                                              | P1            |
| **other**            | style transfer, 3D, audio, background removal, etc.                        | P2            |

---

## 3. RunComfy-only picks (which workflows to use)

**If RYLA uses only RunComfy** (no Modal), use the dedicated shortlist:

→ **[RYLA-RUNCOMFY-ONLY-SHORTLIST.md](./RYLA-RUNCOMFY-ONLY-SHORTLIST.md)**

It lists **one primary workflow per use case** (plus optional backups) and a **minimal set of 9 workflows** that cover MVP: T2I (quality + fast), face consistency, image editing, video (T2V + I2V), upscaling, LoRA, face swap.

The full **tagged catalog** (all candidates by category) is in [runcomfy-workflow-shortlist.json](./runcomfy-workflow-shortlist.json). Regenerate with: `npx tsx scripts/runcomfy-tag-workflows-for-ryla.ts`.

---

## 4. How to use this doc

1. **Criteria** (Section 1): Use to say “yes/no” for a RunComfy workflow (use case, NSFW, license, API).
2. **Categories** (Section 2): Tag catalog workflows by title/description (script or manual).
3. **RunComfy-only shortlist** (Section 3): Use the linked doc to choose which workflows to deploy on RunComfy.
4. **Next**: Deploy chosen workflows on RunComfy (Phase 3), then integrate via RunComfy service in RYLA (Phase 4) per IN-038.

---

## 5. References

- **RunComfy-only shortlist**: [RYLA-RUNCOMFY-ONLY-SHORTLIST.md](./RYLA-RUNCOMFY-ONLY-SHORTLIST.md)
- **Tagged catalog**: [runcomfy-workflow-shortlist.json](./runcomfy-workflow-shortlist.json), [runcomfy-workflow-shortlist.md](./runcomfy-workflow-shortlist.md)
- Initiative: [IN-038 RunComfy Workflow Catalog & RYLA Integration](../../initiatives/IN-038-runcomfy-workflow-catalog-integration.md)
- Catalog: [runcomfy-workflow-catalog.json](./runcomfy-workflow-catalog.json)
- Downloaded workflows: [runcomfy-workflows/](./runcomfy-workflows/)
- Studio: [EP-005 Content Studio](../../requirements/epics/mvp/EP-005-content-studio.md), [STUDIO-CAPABILITIES.md](../../requirements/STUDIO-CAPABILITIES.md)
