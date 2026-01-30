# EP-058: Modal.com MVP Model Implementation - Requirements

**Initiative**: [IN-020](../../../initiatives/IN-020-modal-mvp-models.md)  
**Status**: P6 - Implementation (In Progress)  
**Created**: 2025-01-21  
**Last Updated**: 2026-01-29

---

## Problem Statement

RYLA MVP requires AI models for scalable image/video generation on Modal.com. Originally scoped for Flux Dev + InstantID + LoRA, the direction has evolved to use **Qwen-Image** models (higher quality, Apache 2.0 license) as primary, with Flux/InstantID as secondary options.

**Who has this problem**:

- Infrastructure team needs scalable, cost-efficient model deployment
- Backend team needs API endpoints for image generation
- Product team needs MVP launch capability

**Why it matters**:

- MVP launch depends on working image generation
- Serverless approach reduces costs vs persistent pods
- Provides infrastructure redundancy (Modal + RunPod)

---

## Current State - Deployed Endpoints

### ✅ Deployed and Working (8 Apps, 20 Endpoints)

#### Primary T2I - Qwen-Image (`ryla-qwen-image`)

| Endpoint                | Purpose                                | Status  | Tested |
| ----------------------- | -------------------------------------- | ------- | ------ |
| `/qwen-image-2512`      | High-quality T2I (50 steps)            | ✅ Live | ✅     |
| `/qwen-image-2512-fast` | Fast T2I with Lightning LoRA (4 steps) | ✅ Live | ✅     |

#### Image Editing - Qwen-Edit (`ryla-qwen-edit`)

| Endpoint                   | Purpose                   | Status  | Tested |
| -------------------------- | ------------------------- | ------- | ------ |
| `/qwen-image-edit-2511`    | Instruction-based editing | ✅ Live | ✅     |
| `/qwen-image-inpaint-2511` | Mask-based inpainting     | ✅ Live | ✅     |

#### Video Generation - Wan 2.6 (`ryla-wan26`)

| Endpoint      | Purpose                  | Status  | Tested |
| ------------- | ------------------------ | ------- | ------ |
| `/wan2.6`     | Text-to-video            | ✅ Live | ✅     |
| `/wan2.6-r2v` | Reference video to video | ✅ Live | ✅     |

#### Z-Image Turbo (`ryla-z-image`)

| Endpoint             | Purpose                           | Status           | Tested |
| -------------------- | --------------------------------- | ---------------- | ------ |
| `/z-image-simple`    | Fast T2I (diffusers)              | ✅ Live          | ✅     |
| `/z-image-danrisi`   | Same as simple (custom nodes N/A) | ✅ Live          | ⚠️     |
| `/z-image-instantid` | Not supported (arch incompatible) | ❌ Returns error | -      |
| `/z-image-pulid`     | Not supported (arch incompatible) | ❌ Returns error | -      |

#### Flux Models (`ryla-flux`)

| Endpoint    | Purpose             | Status  | Tested |
| ----------- | ------------------- | ------- | ------ |
| `/flux`     | Flux Schnell (fast) | ✅ Live | ✅     |
| `/flux-dev` | Flux Dev (quality)  | ✅ Live | ✅     |

#### Face Consistency - InstantID (`ryla-instantid`)

| Endpoint                 | Purpose                    | Status  | Tested |
| ------------------------ | -------------------------- | ------- | ------ |
| `/flux-instantid`        | Face consistency with Flux | ✅ Live | ⚠️     |
| `/sdxl-instantid`        | Face consistency with SDXL | ✅ Live | ⚠️     |
| `/flux-ipadapter-faceid` | IPAdapter FaceID           | ✅ Live | ⚠️     |
| `/flux-pulid`            | PuLID face consistency     | ✅ Live | ⚠️     |

#### LoRA Support (`ryla-lora`)

| Endpoint     | Purpose        | Status  | Tested |
| ------------ | -------------- | ------- | ------ |
| `/flux-lora` | Flux with LoRA | ✅ Live | ⚠️     |

#### Upscaling (`ryla-seedvr2`)

| Endpoint   | Purpose           | Status  | Tested |
| ---------- | ----------------- | ------- | ------ |
| `/seedvr2` | SeedVR2 upscaling | ✅ Live | ⚠️     |

---

## MVP Objective (Updated)

Deploy primary AI models on Modal.com enabling scalable image/video generation:

- ✅ **Qwen-Image 2512**: Primary T2I model (Apache 2.0, ELO 1141)
- ✅ **Qwen-Image Edit 2511**: Primary editing model (Apache 2.0)
- ✅ **Wan 2.6**: Primary video model (Apache 2.0)
- ✅ **Z-Image-Turbo**: Fast T2I option
- ✅ **Flux Dev**: Quality T2I option (requires license for commercial)
- ✅ **InstantID**: Face consistency option
- ✅ **LoRA Support**: Character consistency

---

## Remaining Work

### Phase 6: Implementation Completion

#### P6.1: NSFW Testing (Priority: HIGH) ✅ COMPLETE

- [x] Test Qwen-Image 2512 NSFW capabilities - ✅ Supported
- [x] Test Qwen-Image Edit 2511 NSFW capabilities - ✅ Supported
- [x] Test Wan 2.6 NSFW capabilities - ✅ Supported
- [x] Document which models support NSFW - ✅ Updated RYLA-IDEAL-MODEL-STACK.md

#### P6.2: LoRA Integration (Priority: HIGH) ✅ QWEN COMPLETE

**LoRA Support Matrix - All Models:**

| Model/Endpoint           | LoRA Training | LoRA Loading | Tool                | Status                                        |
| ------------------------ | ------------- | ------------ | ------------------- | --------------------------------------------- |
| **Qwen-Image 2512**      | ✅ Supported  | ✅ Live      | AI Toolkit (Ostris) | `/qwen-image-2512-lora` deployed ✅           |
| **Qwen-Image 2512 Fast** | ⚠️ N/A        | ✅ Built-in  | Lightning LoRA      | Already uses LoRA                             |
| **Qwen-Image Edit 2511** | ✅ Supported  | ⏳ Pending   | AI Toolkit (Ostris) | `/qwen-image-edit-lora` planned               |
| **Wan 2.6 Video**        | ✅ Supported  | ✅ Live      | Musubi Tuner        | `/wan2.6-lora` deployed ✅                    |
| **Flux Dev**             | ✅ Supported  | ✅ Live      | AI Toolkit (Ostris) | `/flux-lora` live                             |
| **Flux Schnell**         | ✅ Supported  | ✅ Live      | AI Toolkit (Ostris) | `/flux-lora` live                             |
| **Z-Image Turbo**        | ✅ Supported  | ✅ Live      | AI Toolkit (Ostris) | `/z-image-lora` deployed ✅ (Flux LoRAs only) |

**Completed Tasks:**

- [x] Create `/qwen-image-2512-lora` endpoint (handler in `qwen_image.py`)
- [x] Deploy and test `/qwen-image-2512-lora` endpoint (tested 2026-01-29)
- [x] Add `generateQwenImage2512LoRA` to ModalClient
- [x] Add `generateQwenImage2512LoRA` to ModalJobRunner
- [x] Add `qwen-image-2512-lora` to model registry

**Remaining Tasks:**

- [x] Create `/wan2.6-lora` endpoint for video LoRA (deployed 2026-01-29)
- [x] Create `/z-image-lora` endpoint (deployed 2026-01-29)
- [x] Document LoRA workflow for all models (see `docs/technical/models/LORA-WORKFLOW-GUIDE.md`)
- [x] Research Qwen-Edit LoRA support (AI Toolkit supported, endpoint planned)

**LoRA Endpoint Testing (2026-01-30):**

| Endpoint                | Test Result | Time  | Notes                                  |
| ----------------------- | ----------- | ----- | -------------------------------------- |
| `/flux-lora`            | ✅ PASS     | 29.5s | 203KB PNG                              |
| `/qwen-image-2512-lora` | ✅ PASS     | 54.8s | 289KB PNG                              |
| `/wan2.6-lora`          | ✅ PASS     | 40.0s | 89KB WebP video                        |
| `/z-image-lora`         | ✅ PASS     | 3.08s | 31KB JPEG (requires Flux-format LoRAs) |

**Future LoRA Work:**

- [ ] Create `/qwen-image-edit-lora` endpoint for editing with character LoRA

#### P6.3: Documentation Updates (Priority: MEDIUM)

- [ ] Update ENDPOINT-APP-MAPPING.md with new apps
- [ ] Create API documentation for all endpoints
- [ ] Update RYLA-IDEAL-MODEL-STACK.md with test results

---

### Phase 7: Testing

#### P7.1: End-to-End Testing

- [ ] Test all endpoints with realistic payloads
- [ ] Verify response times < 30s
- [ ] Verify cost tracking accuracy
- [ ] Test error handling

#### P7.2: Integration Testing

- [ ] Test with frontend client
- [ ] Test with existing workflow system
- [ ] Verify backward compatibility

---

### Phase 8: Backend Integration ✅ COMPLETE

#### P8.1: Model Registry Update ✅ COMPLETE

**File**: `libs/shared/src/models/registry.ts`

- [x] Add `qwen-image-2512` to UIModelId
- [x] Add `qwen-image-2512-fast` to UIModelId
- [x] Add `qwen-edit-2511-modal` to UIModelId
- [x] Add `qwen-inpaint-2511` to UIModelId
- [x] Add `wan2.6` to UIModelId
- [x] Add `wan2.6-r2v` to UIModelId
- [x] Map to Modal endpoints (SelfHostedModelId)

#### P8.2: Modal Client Update ✅ COMPLETE

**File**: `libs/business/src/services/modal-client.ts`

- [x] Add Qwen-Image endpoint support (generateQwenImage2512, generateQwenImage2512Fast)
- [x] Add Qwen-Edit endpoint support (editQwenImage2511, inpaintQwenImage2511)
- [x] Add Wan 2.6 endpoint support (generateWan26, generateWan26R2V)
- [x] Add request/response types

#### P8.3: Workflow Detector Update ✅ COMPLETE

**File**: `libs/business/src/services/modal-workflow-detector.ts`

- [x] Route Qwen-Image workflows
- [x] Route Qwen-Edit workflows
- [x] Route Wan 2.6 workflows
- [x] Add new workflow types to DetectedWorkflow

#### P8.4: Studio Generation Service ✅ COMPLETE

**File**: `apps/api/src/modules/image/services/studio-generation.service.ts`

- [x] Add Qwen model support (qwen-image-2512, qwen-image-2512-fast)
- [x] Update provider selection logic (Qwen on Modal supports NSFW)
- [x] Route Qwen models to Modal endpoints
- [x] Add `submitQwenImage` method to ModalJobRunnerAdapter
- [x] Add Qwen methods to ModalJobRunner (generateQwenImage2512, generateQwenImage2512Fast, editQwenImage2511, inpaintQwenImage2511)

---

### Phase 9: Frontend Integration ✅ PARTIAL COMPLETE

#### P9.1: Model Selector Update ✅ COMPLETE

- [x] Add Qwen-Image 2512 to model registry with `isMVP: true`
- [x] Add Qwen-Image 2512 Fast to model registry with `isMVP: true`
- [x] Update model descriptions (supportsNSFW: true)
- [x] Add ByteDance icon to ModelIcon component
- [x] Update defaultModelOptions in UI lib (Qwen Fast as recommended)

#### P9.2: Studio Page Integration

- [x] Models automatically appear via `getModelsForStudioMode()` with `isMVP: true`
- [ ] Add inpainting UI for mask editing
- [ ] Test end-to-end studio generation with Qwen models

#### P9.3: Video Generation UI

- [ ] Add Wan 2.6 to video generation
- [ ] Add reference video upload for R2V
- [ ] Update video preview component

---

### Phase 10: Production Validation

#### P10.1: Performance Validation

- [ ] Verify < 30s response times
- [ ] Monitor cold start times
- [ ] Track cost per generation

#### P10.2: Quality Validation

- [ ] Compare output quality vs benchmarks
- [ ] Validate face consistency (if using InstantID)
- [ ] Validate LoRA character consistency

#### P10.3: User Testing

- [ ] Gather user feedback on new models
- [ ] Track generation success rate
- [ ] Monitor error rates

---

## Success Criteria

### Technical Success (Updated)

- [x] Qwen-Image 2512 generates images successfully
- [x] Qwen-Image Edit 2511 editing works
- [x] Qwen-Image Inpaint 2511 inpainting works
- [x] Wan 2.6 video generation works
- [x] All models accessible via unified API endpoints
- [x] Model persistence working (volumes mounted)
- [ ] API response time < 30s per generation (average)
- [ ] NSFW capabilities validated
- [ ] LoRA integration working for Qwen

### Business Success

- [ ] MVP Content Studio (EP-005) can use Modal backend
- [ ] Cost per generation < $0.50 (pay-per-use model)
- [x] Infrastructure redundancy achieved (Modal + RunPod)
- [ ] Documentation complete for API usage

---

## Endpoint-to-App Mapping (Complete)

| App Name          | Endpoints                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| `ryla-qwen-image` | `/qwen-image-2512`, `/qwen-image-2512-fast`                                   |
| `ryla-qwen-edit`  | `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511`                           |
| `ryla-wan26`      | `/wan2.6`, `/wan2.6-r2v`                                                      |
| `ryla-z-image`    | `/z-image-simple`, `/z-image-danrisi`, `/z-image-instantid`, `/z-image-pulid` |
| `ryla-flux`       | `/flux`, `/flux-dev`                                                          |
| `ryla-instantid`  | `/flux-instantid`, `/sdxl-instantid`, `/flux-ipadapter-faceid`, `/flux-pulid` |
| `ryla-lora`       | `/flux-lora`                                                                  |
| `ryla-seedvr2`    | `/seedvr2`                                                                    |

---

## API Base URLs

```
https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run
https://ryla--ryla-qwen-edit-comfyui-fastapi-app.modal.run
https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run
https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run
https://ryla--ryla-flux-comfyui-fastapi-app.modal.run
https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run
https://ryla--ryla-lora-comfyui-fastapi-app.modal.run
https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run
```

---

## References

- Initiative: `docs/initiatives/IN-020-modal-mvp-models.md`
- Model Stack: `docs/technical/models/RYLA-IDEAL-MODEL-STACK.md`
- Endpoint Mapping: `apps/modal/ENDPOINT-APP-MAPPING.md`
- Content Studio Epic: `docs/requirements/epics/mvp/EP-005-content-studio.md`
