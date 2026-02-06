# Modal Playground – Endpoint Failure Audit

**Date**: 2026-02-06  
**Context**: "Select all" run in Endpoint Playground → 7 ok, 16 failed.  
**Purpose**: List failed endpoints, root causes, and tasks to fix or document.

---

## Summary

| Category | Count | Endpoints |
|----------|--------|-----------|
| **OK** | 7 | Flux Schnell, Flux Dev, Qwen Image 2512, Qwen 2512 Fast, Z-Image Simple, Z-Image Danrisi, WAN 2.6 T2V |
| **404 Not Found** | 2 | SDXL Turbo, SDXL Lightning |
| **400 Missing input (expected)** | 6 | SDXL InstantID, Flux PuLID, Flux IP-Adapter FaceID, Flux Dev LoRA, Qwen 2512 LoRA, WAN 2.6 T2V LoRA |
| **408 Timeout** | 2 | Z-Image LoRA, WAN 2.2 I2V + FaceSwap |
| **500 Invalid image file** | 5 | WAN 2.6 I2V, WAN 2.6 I2V + FaceSwap, WAN 2.2 I2V, Image Face Swap, (same ref/image handling) |
| **500 Invalid video** | 1 | Batch Video Face Swap |
| **500 Missing image field** | 1 | SeedVR2 Upscale |

---

## 1. 404 Not Found (2)

| Endpoint | Error | Likely cause |
|----------|--------|----------------|
| SDXL Turbo | `404 Not Found - {"detail":"Not Found"}` | Route not registered on deployed app or wrong app/URL in API proxy |
| SDXL Lightning | Same | Same |

**Audit tasks**

- [ ] **TASK-404-1** Verify Modal app `ryla-instantid` exposes `POST /sdxl-turbo` and `POST /sdxl-lightning` (see `apps/modal/ENDPOINT-APP-MAPPING.md`, `handlers/instantid.py`).
- [ ] **TASK-404-2** Verify RYLA API playground proxy forwards these paths to the correct Modal base URL (e.g. InstantID app URL).
- [ ] **TASK-404-3** If routes exist but 404 persists: check Modal workspace, app name, and proxy `MODAL_ENDPOINT_URL` / per-endpoint routing.

---

## 2. 400 Missing Input – Expected When Not Configured (6)

User ran "Select all" without uploading reference image or setting LoRA ID. Failures are expected.

| Endpoint | Error | Required input |
|----------|--------|-----------------|
| SDXL InstantID | `reference_image is required` | Ref image (face) |
| Flux PuLID | `reference_image is required for PuLID Flux` | Ref image |
| Flux IP-Adapter FaceID | `reference_image is required` | Ref image |
| Flux Dev LoRA | `lora_id or lora_name is required` | LoRA ID |
| Qwen Image 2512 LoRA | Same | LoRA ID |
| WAN 2.6 T2V LoRA | Same | LoRA ID |

**Audit tasks**

- [ ] **TASK-400-1** **Playground**: Consider blocking Run when required inputs are missing (e.g. disable Run or skip ref/LoRA/image-required endpoints and show a short message: “Upload ref image / set LoRA / upload image for the selected endpoints”).
- [ ] **TASK-400-2** **Docs**: In playground or `ENDPOINTS-REFERENCE.md`, state which endpoints need ref image, LoRA ID, or input image so “Select all” behavior is clear.

---

## 3. 408 Request Timeout (2)

| Endpoint | Error |
|----------|--------|
| Z-Image LoRA | `408 Request Timeout (server/proxy expired)` |
| WAN 2.2 I2V + FaceSwap | Same |

**Audit tasks**

- [ ] **TASK-408-1** Check Modal timeouts for `z-image-lora` and `wan22-i2v-faceswap` (proxy and Modal function timeouts).
- [ ] **TASK-408-2** If cold start is suspected, add a warm-up or document “first call may timeout”.
- [ ] **TASK-408-3** Retry once in playground or document “retry on 408” for long-running endpoints.

---

## 4. 500 “Cannot Identify Image File” (5)

ComfyUI `LoadImage` fails with `PIL.UnidentifiedImageError` on a file in `/root/comfy/ComfyUI/input/`.

| Endpoint | Error pattern |
|----------|----------------|
| WAN 2.6 I2V (Best) | `cannot identify image file '.../76cc0262f665....jpg'` |
| WAN 2.6 I2V + FaceSwap | Same (different file) |
| WAN 2.2 I2V (14B) | Same |
| Image Face Swap | Same (LoadImage node 2) |

**Root cause**: When **no reference (or input) image** is uploaded, the playground still sends `reference_image: ''` (or empty). Backend decodes empty string → empty bytes, writes a 0-byte file, and ComfyUI fails with “cannot identify image file”.

**Audit tasks**

- [ ] **TASK-500-IMG-1** **Backend (Modal)**: In handlers that save ref/source image (e.g. `wan26._save_image_to_input`, instantid, ipadapter_faceid, pulid, qwen_image face swap), validate **before** writing: if `reference_image` (or equivalent) is missing or decodes to 0 bytes, return **400** with a clear message (e.g. “reference_image is required (non-empty base64 data URL)”) instead of writing and returning 500.
- [ ] **TASK-500-IMG-2** **Playground**: For endpoints with `needsRefImage` or `needsImage`, either skip the request when the corresponding upload is empty or send nothing and rely on backend 400 (and ensure error UX shows “upload ref/image”).
- [ ] **TASK-500-IMG-3** Apply the same validation for any “source_image” / “face_image” used in face-swap and I2V flows.

---

## 5. 500 Invalid Video – Batch Video Face Swap (1)

| Endpoint | Error |
|----------|--------|
| Batch Video Face Swap | `moov atom not found` / `Invalid data found when processing input` (ffmpeg) |

**Root cause**: Input was not a valid video (e.g. empty, or data URL stored as file without proper decode). Playground uses “Input image” for Batch Video Face Swap; this endpoint expects a **video** (`source_video`). So either wrong input type (image instead of video) or empty/invalid payload was sent.

**Audit tasks**

- [ ] **TASK-500-VID-1** **Playground**: Ensure Batch Video Face Swap has a **video** upload (and optionally label it “Source video” in UI). Map that to `source_video` in the body (see `body-builder.ts`: `source_video: inputImageDataUrl`).
- [ ] **TASK-500-VID-2** **Backend**: Validate `source_video` before processing (non-empty, valid base64, decode length > 0). Return 400 with a clear message if invalid.
- [ ] **TASK-500-VID-3** **Constants**: Confirm `batch-video-faceswap` is marked as needing video (e.g. `needsVideo: true`) and playground uses a video picker when applicable.

---

## 6. 500 Missing “image” Field – SeedVR2 Upscale (1)

| Endpoint | Error |
|----------|--------|
| SeedVR2 Upscale | `Missing 'image' field in request. Provide base64-encoded image.` |

**Root cause**: When no input image is uploaded, playground sends `image: ''`. Backend treats falsy `image_data` as missing and raises. So SeedVR2 is being called without a valid image.

**Audit tasks**

- [ ] **TASK-500-SEED-1** **Playground**: Do not call SeedVR2 when “Input image” is not uploaded (skip in batch or disable Run for that endpoint), or send a clear “no image” and let backend return 400.
- [ ] **TASK-500-SEED-2** **Backend**: Optionally return 400 with message like “image is required (non-empty base64 data URL)” when `image` is missing or empty, so the response is 400 instead of 500.
- [ ] **TASK-500-SEED-3** **Body builder**: Document that for `isUpscale`/SeedVR2, `inputImageDataUrl` must be set when endpoint is selected; otherwise skip or show validation message.

---

## 7. Checklist Summary

| # | Task | Owner | Priority |
|---|------|--------|----------|
| 1 | Verify SDXL Turbo / Lightning routes and API proxy (404) | Backend/DevOps | P1 |
| 2 | Playground: block or skip Run when ref/LoRA/image missing | Frontend | P2 |
| 3 | Modal: validate ref/source image before write; return 400 if empty | Backend | P1 |
| 4 | Playground: Batch Video Face Swap = video upload + correct body | Frontend | P2 |
| 5 | Modal: validate source_video and return 400 if invalid | Backend | P2 |
| 6 | Playground: don’t call SeedVR2 without input image (or show validation) | Frontend | P2 |
| 7 | Review timeouts for Z-Image LoRA and WAN 2.2 I2V + FaceSwap (408) | DevOps | P2 |
| 8 | Docs: list required inputs per endpoint for “Select all” behavior | Docs | P3 |

---

## References

- Playground body builder: `apps/modal-playground/lib/body-builder.ts`
- Playground constants: `apps/modal-playground/lib/constants.ts`
- Modal endpoint mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`
- Modal endpoints reference: `apps/modal/docs/ENDPOINTS-REFERENCE.md`
- WAN 2.6 image save: `apps/modal/handlers/wan26.py` (`_save_image_to_input`)
- SeedVR2 handler: `apps/modal/handlers/seedvr2.py` (image field check)
