# MVP Model Requirements for Modal.com Implementation

> **Date**: 2025-01-21  
> **Status**: Requirements Review  
> **Purpose**: Confirm MVP models and Modal.com implementation plan

---

## MVP Model Requirements (From Docs)

### Primary Models for MVP

Based on `docs/requirements/epics/mvp/EP-005-content-studio.md` and `docs/technical/models/MVP-MODEL-DECISION.md`:

#### 1. **Flux Dev** (Primary - Required)
- **Purpose**: Main text-to-image generation model
- **NSFW**: ✅ Yes (uncensored checkpoint)
- **Use Cases**:
  - Content Studio generation (primary)
  - Base image generation (wizard)
  - Profile picture generation
  - Final generation with LoRA (>95% consistency)
- **Models Needed**:
  - `flux1-dev-fp8.safetensors` (or FP16) - Diffusion model
  - `clip_l.safetensors` - CLIP text encoder
  - `t5xxl_fp16.safetensors` - T5 text encoder
  - `ae.safetensors` - VAE
- **Status**: ⚠️ **NOT YET IMPLEMENTED** on Modal

#### 2. **Z-Image-Turbo** (Secondary - Testing)
- **Purpose**: Faster alternative, testing NSFW support
- **NSFW**: ❓ Testing (may not support)
- **Use Cases**:
  - Fast generation (6-7s vs 10-15s)
  - SFW content (if NSFW doesn't work)
- **Models Needed**:
  - `z_image_turbo_bf16.safetensors` - Diffusion model
  - `qwen_3_4b.safetensors` - Text encoder
  - `z-image-turbo-vae.safetensors` - VAE
- **Status**: ✅ **ALREADY IMPLEMENTED** (`comfyui_danrisi.py`)

#### 3. **InstantID** (Face Consistency - Recommended ⭐)
- **Purpose**: Face consistency for immediate generation (85-90% consistency)
- **NSFW**: ✅ Yes
- **Use Cases**:
  - Immediate generation while LoRA trains
  - Face consistency before LoRA ready
  - **Better than PuLID** for extreme angles and single-image workflows
- **Models Needed**:
  - `ip-adapter.bin` (~1.69GB) - InstantID IP-Adapter
  - `diffusion_pytorch_model.safetensors` (~2.50GB) - InstantID ControlNet
  - InsightFace antelopev2 models
- **Status**: ✅ **ALREADY IMPLEMENTED** in codebase (`libs/business/src/workflows/z-image-instantid.ts`)
- **Status on Modal**: ⚠️ **NOT YET IMPLEMENTED** on Modal
- **Custom Nodes**: `ComfyUI_InstantID` (required)
- **Advantages over PuLID**:
  - Better consistency (85-90% vs 80%)
  - Better extreme angle handling
  - More stable
  - Already proven in production codebase

#### 4. **IPAdapter FaceID Plus** (Alternative - Optional)
- **Purpose**: Face swap with better lighting (80-85% consistency)
- **NSFW**: ✅ Yes
- **Use Cases**:
  - Alternative to InstantID if needed
  - Better lighting blending than PuLID
- **Models Needed**:
  - `ip-adapter-faceid-plusv2_sd15.bin` (or similar)
  - FaceID model files
- **Status**: ⚠️ **PARTIALLY IMPLEMENTED** in codebase
- **Status on Modal**: ⚠️ **NOT YET IMPLEMENTED** on Modal
- **Custom Nodes**: `ComfyUI_IPAdapter_plus` (required)
- **Note**: Lower consistency than InstantID, but better lighting handling

#### 5. **PuLID** (Character Sheet Generation - Alternative)
- **Purpose**: Generate character sheet images (7-10 variations)
- **NSFW**: ✅ Yes
- **Use Cases**:
  - Character sheet generation for LoRA training
  - Background generation workflow
- **Models Needed**:
  - `pulid_flux_v0.9.1.safetensors` - PuLID model
  - InsightFace models
  - EVA CLIP models
- **Status**: ✅ **ALREADY IMPLEMENTED** in codebase
- **Status on Modal**: ⚠️ **NOT YET IMPLEMENTED** on Modal
- **Custom Nodes**: `ComfyUI_PuLID` (required)
- **Note**: InstantID may be better alternative for character sheets too (needs testing)

#### 5. **LoRA Support** (Character Consistency - Required)
- **Purpose**: Custom character LoRAs for >95% consistency
- **NSFW**: ✅ Yes
- **Use Cases**:
  - Final generation after LoRA training
  - High-quality character consistency
- **Models Needed**:
  - User-trained LoRA models (stored per character)
  - LoRA loader support
- **Status**: ⚠️ **NOT YET IMPLEMENTED** on Modal
- **Note**: LoRA training happens separately (RunPod/AI Toolkit), but Modal needs to load/use trained LoRAs

#### 6. **Flux Inpaint** (Editing - Optional for MVP)
- **Purpose**: Image editing/inpainting
- **NSFW**: ✅ Yes
- **Use Cases**:
  - Studio edit mode
  - Mask-based editing
- **Models Needed**:
  - `flux1-fill-dev.safetensors` - Flux Fill model
  - Same encoders as Flux Dev
- **Status**: ⚠️ **NOT YET IMPLEMENTED** on Modal
- **Priority**: P1 (nice-to-have, not critical for MVP)

---

## Currently Implemented on Modal

### ✅ What We Have

1. **Flux Schnell** (Test Implementation)
   - ✅ Model downloaded and working
   - ✅ Simple text-to-image workflow
   - ⚠️ **NOT MVP requirement** (too fast, lower quality than Flux Dev)

2. **Wan2.1** (Test Implementation)
   - ✅ Model downloaded and working
   - ✅ Text-to-video workflow
   - ⚠️ **NOT MVP requirement** (video is Phase 2+)

3. **Z-Image-Turbo** (Danrisi Workflow)
   - ✅ Models uploaded to volume
   - ✅ Custom nodes (RES4LYF) installed
   - ✅ Full workflow implemented
   - ✅ **MVP requirement** (secondary model)

---

## What Needs to Be Implemented on Modal for MVP

### Priority 1: Core MVP Requirements

#### 1. **Flux Dev Workflow** (P0 - Critical)
- **Status**: ❌ Not implemented
- **Required**:
  - Download Flux Dev models (diffusion, CLIP, T5, VAE)
  - Create Flux Dev text-to-image workflow
  - Support NSFW (uncensored checkpoint)
  - Support LoRA loading
  - Support IPAdapter FaceID integration
- **Files to Create**:
  - `comfyui_flux_dev.py` - Flux Dev workflow
  - `workflow_flux_dev_api.json` - Base workflow template
- **Integration**: Add to unified `comfyui_ryla.py` app

#### 2. **IPAdapter FaceID Integration** (P0 - Critical)
- **Status**: ❌ Not implemented
- **Required**:
  - Install `ComfyUI_IPAdapter_plus` custom node
  - Download IPAdapter FaceID models
  - Create face swap workflow (Flux Dev + IPAdapter)
  - Support reference image input
- **Files to Create**:
  - Update `comfyui_ryla.py` to support IPAdapter workflows
  - `workflow_flux_faceid_api.json` - Face swap workflow
- **Use Case**: Immediate generation while LoRA trains

#### 3. **LoRA Loading Support** (P0 - Critical)
- **Status**: ❌ Not implemented
- **Required**:
  - Support LoRA model loading from volume
  - Create LoRA-enabled workflows (Flux Dev + LoRA)
  - Support trigger words
  - Support LoRA strength control
- **Files to Create**:
  - Update `comfyui_ryla.py` to support LoRA parameter
  - `workflow_flux_lora_api.json` - LoRA workflow
- **Use Case**: Final generation after LoRA training

#### 4. **PuLID Integration** (P0 - Critical for Character Sheets)
- **Status**: ❌ Not implemented
- **Required**:
  - Install `ComfyUI_PuLID` custom node
  - Download PuLID models (pulid_flux, InsightFace, EVA CLIP)
  - Create PuLID workflow for character sheet generation
- **Files to Create**:
  - `comfyui_pulid.py` - PuLID workflow
  - `workflow_pulid_api.json` - Character sheet workflow
- **Use Case**: Generate 7-10 character sheet images for LoRA training

### Priority 2: Nice-to-Have (MVP)

#### 5. **Flux Inpaint** (P1 - Optional)
- **Status**: ❌ Not implemented
- **Required**:
  - Download `flux1-fill-dev.safetensors`
  - Create inpaint workflow
  - Support mask input
- **Files to Create**:
  - Update `comfyui_ryla.py` to support inpaint endpoint
  - `workflow_flux_inpaint_api.json` - Inpaint workflow
- **Use Case**: Studio edit mode

---

## Implementation Plan for Modal

### Phase 1: Core MVP Models (Week 1)

1. **Add Flux Dev to Unified App**
   ```python
   # In comfyui_ryla.py
   @modal.fastapi_endpoint(method="POST")
   def flux_dev(self, item: Dict):
       """Flux Dev text-to-image with LoRA/IPAdapter support"""
       # Support:
       # - Base generation
       # - LoRA loading (if lora_id provided)
       # - IPAdapter FaceID (if reference_image provided)
   ```

2. **Add InstantID Support** ⭐ (Recommended over IPAdapter/PuLID)
   - Install `ComfyUI_InstantID` custom node during image build
   - Download InstantID models (IP-Adapter, ControlNet, InsightFace)
   - Create InstantID workflow endpoint
   - Support for Flux Dev and Z-Image-Turbo

3. **Add IPAdapter FaceID Support** (Optional - Alternative)
   - Install custom node during image build
   - Download IPAdapter models
   - Create face swap workflow endpoint
   - **Note**: InstantID is preferred, but IPAdapter can be fallback

4. **Add LoRA Loading**
   - Support LoRA models from volume
   - Create LoRA-enabled workflow builder
   - Support trigger words and strength

### Phase 2: Character Sheet Generation (Week 1-2)

5. **Add Character Sheet Generation**
   - **Option A (Recommended)**: Use InstantID for character sheets
     - Test InstantID for generating 7-10 variations
     - May work better than PuLID for character sheets
   - **Option B (Fallback)**: Add PuLID Workflow
     - Install PuLID custom node
     - Download PuLID models
     - Create character sheet generation endpoint

### Phase 3: Optional Features (Week 2)

6. **Add Flux Inpaint** (if time permits)
   - Download Flux Fill model
   - Create inpaint workflow endpoint

---

## Model Storage Requirements

### Volume Structure

```
ryla-models/
├── checkpoints/
│   ├── flux1-dev-fp8.safetensors (or FP16)
│   ├── flux1-fill-dev.safetensors (inpaint)
│   ├── z_image_turbo_bf16.safetensors (existing)
│   └── [user LoRAs]/
│       └── character-{id}.safetensors
├── clip/
│   ├── clip_l.safetensors (Flux)
│   └── qwen_3_4b.safetensors (Z-Image, existing)
├── text_encoders/
│   └── t5xxl_fp16.safetensors (Flux)
├── vae/
│   ├── ae.safetensors (Flux)
│   └── z-image-turbo-vae.safetensors (existing)
├── loras/
│   └── [user LoRAs]/
│       └── character-{id}.safetensors
├── ipadapter/
│   └── ip-adapter-faceid-plusv2_sd15.bin
└── pulid/
    ├── pulid_flux_v0.9.1.safetensors
    ├── [insightface models]
    └── [eva clip models]
```

### Model Sizes (Estimated)

| Model | Size | Priority |
|-------|------|----------|
| Flux Dev (FP8) | ~12 GB | P0 |
| Flux Dev CLIP/T5/VAE | ~8 GB | P0 |
| Z-Image-Turbo | ~20 GB | ✅ Already uploaded |
| IPAdapter FaceID | ~500 MB | P0 |
| PuLID | ~2 GB | P0 |
| Flux Inpaint | ~12 GB | P1 |
| **Total (P0)** | **~42 GB** | |
| **Total (P0+P1)** | **~54 GB** | |

---

## Custom Nodes Required

### P0 (Critical)

1. **ComfyUI_InstantID** ⭐ (Recommended)
   - Purpose: InstantID face consistency (better than PuLID)
   - Install: `comfy node install ComfyUI_InstantID` or `git clone https://github.com/cubiq/ComfyUI_InstantID.git`
   - Status: ✅ Already implemented in codebase, needs Modal implementation

2. **ComfyUI_IPAdapter_plus** (Optional - Alternative)
   - Purpose: IPAdapter FaceID support (alternative to InstantID)
   - Install: `comfy node install ComfyUI_IPAdapter_plus`
   - Status: ⚠️ Partially implemented in codebase

3. **ComfyUI_PuLID** (Optional - Fallback)
   - Purpose: PuLID face consistency (fallback if InstantID doesn't work for character sheets)
   - Install: `comfy node install ComfyUI_PuLID`
   - Status: ✅ Already implemented in codebase

4. **RES4LYF** (Already installed)
   - Purpose: Z-Image-Turbo Danrisi workflow
   - Status: ✅ Already working

### P1 (Optional)

4. **ControlNet** (for PuLID pose control)
   - Purpose: Pose control in character sheets
   - Install: `comfy node install ComfyUI_ControlNet_aux`

---

## API Endpoints Needed

### Current (Working)
- ✅ `/flux` - Flux Schnell (test, not MVP)
- ✅ `/wan2` - Wan2.1 video (test, not MVP)
- ✅ `/workflow` - Custom workflow JSON

### Needed for MVP

1. **`/flux-dev`** - Flux Dev text-to-image
   - Support: base generation, LoRA, InstantID
   - Parameters: prompt, negative_prompt, width, height, steps, cfg, seed, lora_id, reference_image

2. **`/flux-instantid`** - Flux Dev + InstantID ⭐ (Recommended)
   - Support: face consistency generation (better than PuLID/IPAdapter)
   - Parameters: prompt, reference_image, instantid_strength, controlnet_strength, etc.

3. **`/flux-faceid`** - Flux Dev + IPAdapter FaceID (Optional - Alternative)
   - Support: face swap generation (alternative to InstantID)
   - Parameters: prompt, reference_image, strength, etc.

4. **`/flux-lora`** - Flux Dev + LoRA
   - Support: LoRA-enabled generation
   - Parameters: prompt, lora_id, trigger_word, strength, etc.

5. **`/character-sheets`** - Character sheet generation
   - Support: Generate 7-10 character sheet images
   - **Option A (Recommended)**: Use InstantID
   - **Option B (Fallback)**: Use PuLID
   - Parameters: reference_image, count, poses, etc.

6. **`/flux-inpaint`** - Flux Fill inpaint (optional)
   - Support: Mask-based editing
   - Parameters: image, mask, prompt, etc.

---

## Confirmation Checklist

### Models to Implement

- [ ] **Flux Dev** (primary model) - P0
- [ ] **InstantID** (face consistency) - P0 ⭐ **RECOMMENDED** (better than PuLID/IPAdapter)
- [ ] **LoRA loading** (character consistency) - P0
- [ ] **PuLID** (character sheets) - P1 (fallback, InstantID may work better)
- [ ] **IPAdapter FaceID** (alternative) - P1 (optional, InstantID preferred)
- [ ] **Flux Inpaint** (editing) - P1
- [x] **Z-Image-Turbo** (secondary) - ✅ Already done
- [x] **Flux Schnell** (test) - ✅ Already done (not MVP)
- [x] **Wan2.1** (test) - ✅ Already done (not MVP)

### Custom Nodes to Install

- [ ] **ComfyUI_InstantID** - P0 ⭐ **RECOMMENDED**
- [ ] **ComfyUI_IPAdapter_plus** - P1 (optional, InstantID preferred)
- [ ] **ComfyUI_PuLID** - P1 (optional, InstantID may work better)
- [x] **RES4LYF** - ✅ Already done
- [ ] **ControlNet** (optional) - P1

### Workflows to Create

- [ ] Flux Dev base workflow
- [ ] Flux Dev + InstantID workflow ⭐ **RECOMMENDED**
- [ ] Flux Dev + LoRA workflow
- [ ] InstantID character sheet workflow (test if better than PuLID)
- [ ] PuLID character sheet workflow (fallback)
- [ ] Flux Dev + IPAdapter FaceID workflow (optional alternative)
- [ ] Flux Inpaint workflow (optional)

---

## Next Steps

1. **Confirm with user**: Which models to prioritize?
2. **Start implementation**: Begin with Flux Dev (P0)
3. **Add IPAdapter**: Face consistency support
4. **Add LoRA**: Character consistency support
5. **Add PuLID**: Character sheet generation

---

## References

- MVP Scope: `docs/requirements/MVP-SCOPE.md`
- EP-005: `docs/requirements/epics/mvp/EP-005-content-studio.md`
- Model Decision: `docs/technical/models/MVP-MODEL-DECISION.md`
- Studio Model Selection: `docs/technical/models/MVP-STUDIO-MODEL-SELECTION.md`
