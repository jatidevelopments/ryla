# Modal: New Endpoints to Create

**Purpose**: Prioritized list of new Modal endpoints and params, based on current stack, SOTA discussion, and RYLA use cases (AI influencer, face consistency, realism, cost/speed).

**Last updated**: 2026-02-01

---

## Implemented (2026-02-01)

### 1. `/sdxl-instantid` – `sdxl_checkpoint` param ✅

**RealVisXL** and **RunDiffusion Photo** are supported via the existing **`sdxl_checkpoint`** request param (no new endpoint).

- **Allowed values** (checkpoint filenames; all downloaded in `ryla-instantid` image):

  - `sd_xl_base_1.0.safetensors` (default) – Stability SDXL Base 1.0
  - `RealVisXL_V4.0.safetensors` – RealVisXL V4 (SG161222)
  - `Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors` – Juggernaut-XL v9 RunDiffusion Photo v2

- **Where**: `apps/modal/apps/instantid/image.py` (downloads), `apps/modal/handlers/instantid.py` (already used `item.get("sdxl_checkpoint", ...)`).

- **License note**: Juggernaut/RunDiffusion may require contacting RunDiffusion for API/commercial use; use at your own compliance.

### 2. `/sdxl-turbo` ✅

- **What**: SDXL Turbo txt2img (1–4 steps, CFG 0). No face; fast drafts/backgrounds.
- **Where**: `ryla-instantid` app. Handler and route in `handlers/instantid.py`; checkpoint `sd_xl_turbo_1.0_fp16.safetensors` in `apps/modal/apps/instantid/image.py`.

### 3. `/sdxl-lightning` ✅

- **What**: SDXL Lightning 4-step txt2img (ByteDance). No face; fast.
- **Where**: Same app. Checkpoint `sdxl_lightning_4step.safetensors`; handler/route in `handlers/instantid.py`.

---

## Current Endpoint Inventory (Summary)

| Category         | Endpoints                                                            |
| ---------------- | -------------------------------------------------------------------- |
| **Flux**         | `/flux`, `/flux-dev`, `/flux-dev-lora`, `/flux-lora`                 |
| **Face**         | `/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid`           |
| **SDXL txt2img** | `/sdxl-turbo`, `/sdxl-lightning` (new)                               |
| **Qwen Image**   | `/qwen-image-2512`, `/qwen-image-2512-fast`, `/qwen-image-2512-lora` |
| **Qwen Edit**    | `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511`                  |
| **Z-Image**      | `/z-image-simple`, `/z-image-danrisi`, `/z-image-lora`               |
| **Video**        | `/wan2`, `/wan2.6`, `/wan2.6-r2v`, `/wan2.6-lora`                    |
| **Other**        | `/seedvr2`, `/video-faceswap`                                        |

---

## Next (Tier 2 – when tooling ready)

| #   | Endpoint           | Description                                           |
| --- | ------------------ | ----------------------------------------------------- |
| 4   | **`/flux2-klein`** | Flux.2 [klein] (Apache 2.0) when ComfyUI supports it. |
| 5   | **`/flux2-pro`**   | Flux.2 [pro] if commercial license accepted.          |

---

## What _not_ to add

- **`/flux-instantid`** – Architecturally incompatible. Use `/sdxl-instantid` or `/flux-ipadapter-faceid`.
- **`/z-image-instantid`**, **`/z-image-pulid`** – Incompatible encoders.
- **Imagen 4 / Ideogram** – API-only; separate integration if needed.
