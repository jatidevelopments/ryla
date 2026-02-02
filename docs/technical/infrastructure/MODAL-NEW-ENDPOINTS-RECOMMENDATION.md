# Modal: Endpoint Inventory & Recommendations

**Purpose**: Current endpoint inventory and recommendations for new endpoints  
**Last Updated**: 2026-02-02

---

## Current Endpoint Inventory (21 Total)

### Image Generation

| Category         | Endpoints                                                            |
| ---------------- | -------------------------------------------------------------------- |
| **Flux**         | `/flux`, `/flux-dev`, `/flux-dev-lora`                               |
| **SDXL txt2img** | `/sdxl-turbo`, `/sdxl-lightning`                                     |
| **Qwen Image**   | `/qwen-image-2512`, `/qwen-image-2512-fast`, `/qwen-image-2512-lora` |
| **Z-Image**      | `/z-image-simple`, `/z-image-danrisi`, `/z-image-lora`               |

### Face Consistency

| Category | Endpoints                                                  |
| -------- | ---------------------------------------------------------- |
| **Face** | `/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid` |

### Video & Post-Processing

| Category      | Endpoints                                                   |
| ------------- | ----------------------------------------------------------- |
| **Video**     | `/wan2.6`, `/wan2.6-r2v`, `/wan2.6-lora`, `/video-faceswap` |
| **Upscaling** | `/seedvr2`                                                  |

### Editing

| Category      | Endpoints                                           |
| ------------- | --------------------------------------------------- |
| **Qwen Edit** | `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511` |

---

## SDXL Checkpoints (Implemented)

The `/sdxl-instantid` endpoint supports multiple checkpoints via `sdxl_checkpoint` parameter:

| Checkpoint     | Value                                               | Description                            |
| -------------- | --------------------------------------------------- | -------------------------------------- |
| **SDXL Base**  | `sd_xl_base_1.0.safetensors` (default)              | Stability SDXL Base 1.0                |
| **RealVisXL**  | `RealVisXL_V4.0.safetensors`                        | RealVisXL V4 (SG161222)                |
| **Juggernaut** | `Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors` | Juggernaut-XL v9 RunDiffusion Photo v2 |

---

## Future Endpoints (Tier 2)

| #   | Endpoint           | Description                                          | Status  |
| --- | ------------------ | ---------------------------------------------------- | ------- |
| 1   | **`/flux2-klein`** | Flux.2 [klein] (Apache 2.0) when ComfyUI supports it | Waiting |
| 2   | **`/flux2-pro`**   | Flux.2 [pro] if commercial license accepted          | Pending |

---

## Removed/Incompatible Endpoints

These endpoints cannot work due to architecture:

| Endpoint              | Path                 | Reason                                  | Alternative       |
| --------------------- | -------------------- | --------------------------------------- | ----------------- |
| **Wan 2.1**           | `/wan2`              | Model deprecated, not included          | `/wan2.6`         |
| **Flux InstantID**    | `/flux-instantid`    | Shape mismatch (T5XXL+CLIP-L vs CLIP-L) | `/sdxl-instantid` |
| **Z-Image InstantID** | `/z-image-instantid` | Qwen encoder incompatible               | `/sdxl-instantid` |
| **Z-Image PuLID**     | `/z-image-pulid`     | Qwen encoder incompatible               | `/flux-pulid`     |

---

## Recommended Model Selection

### By Use Case

| Use Case             | Primary                 | Alternative   | Notes              |
| -------------------- | ----------------------- | ------------- | ------------------ |
| **Fast preview**     | `/z-image-danrisi`      | `/flux`       | Minimal cold start |
| **Quality T2I**      | `/qwen-image-2512`      | `/flux-dev`   | Hyper-realistic    |
| **Fast quality**     | `/qwen-image-2512-fast` | `/flux`       | 4 steps            |
| **Face consistency** | `/sdxl-instantid`       | `/flux-pulid` | 85-90% match       |
| **Video**            | `/wan2.6`               | -             | Text-to-video      |
| **Video faceswap**   | `/video-faceswap`       | -             | ReActor-based      |
| **Upscaling**        | `/seedvr2`              | -             | 2x realistic       |

### By Speed (Fastest to Slowest)

1. `/z-image-danrisi` (~6s)
2. `/flux` (~29s)
3. `/wan2.6` (~29s)
4. `/sdxl-instantid` (~29s)
5. `/flux-dev` (~37s)
6. `/sdxl-turbo` (~45s)
7. `/z-image-simple` (~51s)
8. `/sdxl-lightning` (~66s)
9. `/qwen-image-2512-fast` (~73s)
10. `/flux-pulid` (~83s)
11. `/video-faceswap` (~85s)
12. `/qwen-image-2512` (~103s)
13. `/seedvr2` (~208s)

### By Cost (Cheapest to Most Expensive)

1. `/z-image-danrisi` ($0.003)
2. `/flux` ($0.016)
3. `/wan2.6` ($0.016)
4. `/sdxl-instantid` ($0.016)
5. `/z-image-lora` ($0.016)
6. `/flux-dev` ($0.020)
7. `/sdxl-turbo` ($0.024)
8. `/wan2.6-lora` ($0.025)
9. `/z-image-simple` ($0.028)
10. `/flux-ipadapter-faceid` ($0.033)
11. `/flux-dev-lora` ($0.033)
12. `/sdxl-lightning` ($0.036)
13. `/qwen-image-2512-fast` ($0.040)
14. `/flux-pulid` ($0.045)
15. `/video-faceswap` ($0.046)
16. `/qwen-image-2512` ($0.056)
17. `/qwen-image-2512-lora` ($0.078)
18. `/seedvr2` ($0.113)
