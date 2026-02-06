# RYLA RunComfy-Only Shortlist (IN-038)

**Purpose**: If RYLA used **only RunComfy** (no Modal), these are the workflows to deploy per use case.  
**Use this** when choosing which RunComfy workflows to deploy and wire into the app.

---

## Already deployed (try first)

These RunComfy deployments are **live** and should be tried first. Wire them in RYLA (RunComfy service / provider config) and validate.

| Name                                       | Deployment ID | GPU         | Instances | Status  |
| ------------------------------------------ | ------------- | ----------- | --------- | ------- |
| RunComfy/Z-Image                           | 8486...6273   | 48G (A6000) | 0-1       | Standby |
| RunComfy/UltraRealisticV2                  | 5208...af12   | 48G (A6000) | 0-1       | Standby |
| RunComfy/PuLID-Flux-II                     | cc27...6e8b   | 48G (A6000) | 0-1       | Standby |
| RunComfy/Z-Image-ControlNet                | 1f47...1129   | 48G (A6000) | 0-1       | Standby |
| RunComfy/Image-Bypass                      | da83...18fb   | 48G (A6000) | 0-1       | Standby |
| RunComfy/SCAIL                             | 63c3...2860   | 48G (A6000) | 0-1       | Standby |
| RunComfy/Z-Image-Finetuned-Models          | 2c28...16a3   | 48G (A6000) | 0-1       | Standby |
| RunComfy/Fantasy-Portrait                  | 31f2...ff41   | 48G (A6000) | 0-1       | Standby |
| RunComfy/FLUX-Klein-Editing                | 7d77...f5ba   | 48G (A6000) | 0-1       | Standby |
| RunComfy/Flux-Klein-Face-Swap              | 78aa...af0d   | 48G (A6000) | 0-1       | Standby |
| RunComfy/Z-Image-I2I-Ultimate-Photorealism | 0d6d...8e26   | 48G (A6000) | 0-1       | Standby |

**Use-case mapping (for integration):**

| Deployment                        | RYLA use case                           |
| --------------------------------- | --------------------------------------- |
| Z-Image                           | T2I (fast)                              |
| UltraRealisticV2                  | T2I (quality / photorealistic)          |
| PuLID-Flux-II                     | Face / character consistency            |
| Z-Image-ControlNet                | T2I with control (depth/canny/pose)     |
| Image-Bypass                      | T2I (detection-bypass flow)             |
| SCAIL                             | Pose-based character animation (video)  |
| Z-Image-Finetuned-Models          | T2I (finetuned variants)                |
| Fantasy-Portrait                  | T2I (fantasy/portrait)                  |
| FLUX-Klein-Editing                | Image editing (inpaint/outpaint/remove) |
| Flux-Klein-Face-Swap              | Face swap                               |
| Z-Image-I2I-Ultimate-Photorealism | Image-to-image (photorealism)           |

Full deployment IDs: RunComfy dashboard → Deployments, or `GET https://api.runcomfy.net/prod/v2/deployments` with Bearer token. **API reference**: [RUNCOMFY-API-ENDPOINTS.md](./RUNCOMFY-API-ENDPOINTS.md) (endpoints, auth, overrides, params).

---

## Still need to deploy

Compared to the **minimal RunComfy-only set**, the following use cases are **not** covered by the 11 deployments above. Deploy these on RunComfy if you want full MVP coverage.

| Use case                        | Primary workflow to deploy             | Slug                                                                  |
| ------------------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| **Video (T2V)**                 | Hunyuan Video 1.5 \| Text to Video     | `hunyuan-video-1-5-in-comfyui-efficient-text-to-video-workflow`       |
|                                 | _or_ SVD + SD \| Text to Video         | `comfyui-stable-video-diffusion-svd-workflow-text2video`              |
|                                 | _or_ Wan 2.2 \| Complete Workflow      | `comfyui-wan-2-2-image-generation-complete-workflow-pack`             |
| **Video (I2V)**                 | SVD + FreeU \| Image to Video          | `comfyui-stable-video-diffusion-svd-and-freeu-workflow-image2video`   |
|                                 | _or_ LivePortrait \| Animate Portraits | `comfyui-liveportrait-workflow-animate-portraits`                     |
| **Upscaling**                   | ControlNet Tile + 4x UltraSharp        | `comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp` |
|                                 | _or_ Flux Upscaler 4K–32K              | `flux-upscaler-4k-8k-16k-32k-image-upscaler`                          |
| **LoRA (training / inference)** | FLUX LoRA Training                     | `comfyui-flux-lora-training-detailed-guides`                          |

**Summary:** Deploy **at least one** of: Video T2V, Video I2V, Upscaling, LoRA. That’s **4 use-case gaps**; you can cover each with one workflow from the table (or add backups later).

---

## RYLA use cases → RunComfy workflow picks (catalog)

One **primary** (and optional **backup**) per use case. All slugs exist in the RunComfy catalog and in `runcomfy-workflows/<slug>/workflow.json` where downloaded.

| Use case                             | Primary workflow                               | Slug                                                                                             | Backup (optional)                                                                                                                      |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **T2I (text-to-image)**              | FLUX \| Art Image Generation                   | `comfyui-flux-a-new-art-image-generation`                                                        | SDXL Turbo: `text-to-image-with-sdxl-turbo`                                                                                            |
| **T2I (fast)**                       | SDXL Turbo \| Rapid Text to Image              | `text-to-image-with-sdxl-turbo`                                                                  | —                                                                                                                                      |
| **Face / character consistency**     | IPAdapter FaceID Plus \| Consistent Characters | `create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus`                             | InstantID: `comfyui-instantid-workflow`; PuLID: `comfyui-pulid-customized-face-generation`                                             |
| **Image editing (inpaint/outpaint)** | Flux Klein \| Inpaint / Remove / Outpaint      | `flux-klein-unified-image-editing-inpaint-remove-outpaint-in-comfyui-advanced-image-restoration` | Outpainting: `comfyui-image-outpainting-workflow`                                                                                      |
| **Video (T2V)**                      | Hunyuan Video 1.5 \| Text to Video             | `hunyuan-video-1-5-in-comfyui-efficient-text-to-video-workflow`                                  | SVD + SD: `comfyui-stable-video-diffusion-svd-workflow-text2video`; Wan 2.2: `comfyui-wan-2-2-image-generation-complete-workflow-pack` |
| **Video (I2V)**                      | SVD + FreeU \| Image to Video                  | `comfyui-stable-video-diffusion-svd-and-freeu-workflow-image2video`                              | LivePortrait: `comfyui-liveportrait-workflow-animate-portraits`                                                                        |
| **Upscaling**                        | ControlNet Tile + 4x UltraSharp                | `comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp`                            | Flux Upscaler 4K–32K: `flux-upscaler-4k-8k-16k-32k-image-upscaler`; 8K SUPIR: `8k-image-upscaling-supir-4x-foolhardy-remacri`          |
| **LoRA (training / inference)**      | FLUX LoRA Training                             | `comfyui-flux-lora-training-detailed-guides`                                                     | Hunyuan LoRA: `hunyuan-lora-custom-loras`; Wan 2.1 LoRA: `wan-2-1-lora-customizable-ai-video-generation`                               |
| **Face swap**                        | ReActor \| Fast Face Swap                      | `comfyui-reactor-workflow-fast-face-swap`                                                        | ReActor professional: `comfyui-reactor-face-swap-professional-ai-face-animation`                                                       |

---

## Minimal RunComfy-only set (smallest deploy)

If you want the **fewest** RunComfy deployments that still cover RYLA MVP:

| #   | Use case         | Pick                            | Slug                                                                                             |
| --- | ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | T2I              | FLUX \| Art Image Generation    | `comfyui-flux-a-new-art-image-generation`                                                        |
| 2   | T2I fast         | SDXL Turbo                      | `text-to-image-with-sdxl-turbo`                                                                  |
| 3   | Face consistency | IPAdapter FaceID Plus           | `create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus`                             |
| 4   | Image editing    | Flux Klein Inpaint/Outpaint     | `flux-klein-unified-image-editing-inpaint-remove-outpaint-in-comfyui-advanced-image-restoration` |
| 5   | Video T2V        | Hunyuan Video 1.5               | `hunyuan-video-1-5-in-comfyui-efficient-text-to-video-workflow`                                  |
| 6   | Video I2V        | SVD + FreeU                     | `comfyui-stable-video-diffusion-svd-and-freeu-workflow-image2video`                              |
| 7   | Upscaling        | ControlNet Tile + 4x UltraSharp | `comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp`                            |
| 8   | LoRA             | FLUX LoRA Training              | `comfyui-flux-lora-training-detailed-guides`                                                     |
| 9   | Face swap        | ReActor Fast Face Swap          | `comfyui-reactor-workflow-fast-face-swap`                                                        |

**9 workflows** cover T2I (quality + fast), face consistency, editing, video (T2V + I2V), upscaling, LoRA, and face swap.

---

## Notes

- **NSFW**: Confirm per workflow on RunComfy (model cards / docs); RYLA requires NSFW-capable pipelines.
- **License**: Prefer Apache 2.0 or equivalent for commercial use.
- **Deploy**: Use RunComfy “Deploy as API” for each; then register endpoints in RYLA (e.g. RunComfy service or provider config).
- **Catalog**: Full tagged list in [runcomfy-workflow-shortlist.json](./runcomfy-workflow-shortlist.json). Criteria in [RYLA-RUNCOMFY-WORKFLOW-CRITERIA.md](./RYLA-RUNCOMFY-WORKFLOW-CRITERIA.md).
