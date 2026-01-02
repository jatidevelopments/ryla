# ComfyUI Wiki Workflows Analysis for RYLA MVP

> **Date**: 2025-01-17  
> **Source**: `libs/comfyui-workflows/` (cloned from comfyui-wiki/workflows)  
> **Purpose**: Identify workflows useful for RYLA MVP (EP-005: Content Studio)

---

## Executive Summary

Analysis of 30+ workflows from ComfyUI Wiki library to identify those relevant for RYLA MVP. Focus areas:
- **Text-to-Image (T2I)** workflows for content generation
- **Inpainting/Outpainting** for post-processing
- **LoRA integration** workflows (RYLA trains custom LoRAs)
- **Face consistency** patterns (RYLA uses IPAdapter + LoRA)

**Key Finding**: Flux workflows are highly relevant as RYLA uses Flux Dev as primary model. LoRA workflows provide patterns for custom LoRA integration.

---

## RYLA MVP Requirements (EP-005)

### Current Tech Stack
- **Primary Model**: Flux Dev (uncensored checkpoint for NSFW)
- **Secondary Model**: Z-Image-Turbo (testing)
- **Face Consistency**: 
  - Tier 1: IPAdapter FaceID (immediate, ~80% consistency)
  - Tier 2: Custom LoRA (after training, >95% consistency)
- **Infrastructure**: RunPod serverless endpoints
- **Use Case**: Generate influencer-style content with consistent faces

### Key Requirements
1. ✅ Text-to-image generation (core MVP)
2. ✅ LoRA support (custom character LoRAs)
3. ✅ NSFW support (uncensored models)
4. ⚠️ Inpainting/outpainting (post-processing, nice-to-have)
5. ❌ Video generation (Phase 2+)
6. ❌ 3D generation (not MVP)

---

## Workflow Analysis by Category

### Category 1: Text-to-Image (T2I) — **HIGH PRIORITY**

#### 1.1 Flux Dev T2I (`flux/text_to_image/flux_dev_t5fp16.json`)

**Purpose**: Standard Flux Dev text-to-image generation

**Key Features**:
- Uses Flux Dev model (matches RYLA primary model)
- T5 text encoder (FP16)
- Standard KSampler workflow
- VAE decode for final image

**RYLA Relevance**: ⭐⭐⭐ **HIGH**
- **Direct Match**: RYLA uses Flux Dev as primary model
- **Use Case**: Base workflow for content generation
- **Integration**: Can be adapted for RYLA's prompt structure
- **NSFW**: Works with uncensored Flux Dev checkpoint

**Required Models**:
- `flux1-fill-dev.safetensors` (or uncensored variant)
- T5 text encoder
- Flux VAE

**Custom Nodes**: None (uses core ComfyUI nodes)

**Action**: ✅ **Use as reference** for Flux Dev T2I implementation

---

#### 1.2 Flux Kontext (`flux/kontext/flux_kontext_dev_gguf.json`)

**Purpose**: Flux Kontext workflow (advanced context handling)

**Key Features**:
- GGUF format (quantized)
- Kontext integration for better context understanding
- Optimized for memory efficiency

**RYLA Relevance**: ⭐⭐ **MEDIUM**
- **Use Case**: Alternative Flux workflow if memory is constrained
- **Note**: RYLA uses FP16/FP8, not GGUF (but pattern is useful)
- **Integration**: Lower priority, but good reference for optimization

**Action**: ⚠️ **Reference only** - RYLA doesn't use GGUF format

---

#### 1.3 HIDream I1 (`image-generation/hidream-i1/t2i/`)

**Purpose**: HIDream I1 model workflows (native and GGUF)

**Key Features**:
- Native FP8 workflow: `native-hidream-i1-dev-fp8.json`
- GGUF workflow: `gguf-hidream-i1.json`
- High-quality image generation

**RYLA Relevance**: ⭐ **LOW**
- **Reason**: RYLA uses Flux Dev, not HIDream
- **Use Case**: Reference for FP8 optimization patterns
- **Note**: Different model architecture

**Action**: ❌ **Skip** - Different model, not relevant for MVP

---

### Category 2: Inpainting — **MEDIUM PRIORITY**

#### 2.1 Flux Inpaint (`flux/inpaint/inpaint.json`)

**Purpose**: Inpainting with Flux Dev model

**Key Features**:
- Uses Flux Dev for inpainting
- Mask-based editing
- Maintains consistency with original image

**RYLA Relevance**: ⭐⭐ **MEDIUM**
- **Use Case**: Post-processing, fixing artifacts, editing generated images
- **MVP Priority**: Not core MVP feature, but useful for quality improvement
- **Integration**: Can be added as Phase 1.5 feature

**Required Models**:
- `flux1-fill-dev.safetensors` (same as T2I)
- Inpainting mask input

**Action**: ⚠️ **Reference for future** - Not MVP critical but useful pattern

---

#### 2.2 Flux Outpaint (`flux/outpaint/`)

**Purpose**: Outpainting (extending image beyond original boundaries)

**Key Features**:
- Extends image canvas
- Maintains style consistency
- Useful for aspect ratio adjustments

**RYLA Relevance**: ⭐ **LOW**
- **Use Case**: Post-processing, aspect ratio conversion
- **MVP Priority**: Not critical for MVP
- **Note**: RYLA generates in target aspect ratio, less need for outpaint

**Action**: ❌ **Skip for MVP** - Low priority

---

### Category 3: LoRA Integration — **HIGH PRIORITY**

#### 3.1 Wan 2.1 LoRA (`video/wan2.1_lora/`)

**Purpose**: LoRA integration workflows for Wan 2.1 video model

**Key Features**:
- Multiple variants: native, GGUF, Kijai
- LoRA loading and application
- Video generation with LoRA

**RYLA Relevance**: ⭐⭐ **MEDIUM**
- **Use Case**: Reference for LoRA integration patterns
- **Note**: RYLA uses Flux Dev + LoRA, not Wan 2.1
- **Pattern**: LoRA loading/application pattern is transferable

**Key Workflows**:
- `wan2.1_lora_comfyui_native.json` - Native ComfyUI LoRA integration
- `wan2.1_lora_gguf_480P.json` - GGUF variant
- `wan2.1_lora_kijai_480P.json` - Kijai wrapper variant

**Action**: ⚠️ **Reference for LoRA patterns** - Not direct use but good reference

---

### Category 4: Video Generation — **LOW PRIORITY (Phase 2+)**

#### 4.1 Wan 2.1 I2V (`video/wan2.1/native/`)

**Purpose**: Image-to-video with Wan 2.1

**Key Features**:
- I2V (Image-to-Video) conversion
- Multiple resolutions: 480P, 720P
- Native and GGUF variants

**RYLA Relevance**: ⭐ **LOW** (Phase 2+)
- **Use Case**: Future "bring photos to life" feature
- **MVP Priority**: Not MVP scope (EP-005 is image generation only)
- **Note**: RYLA MVP focuses on images, video is Phase 2

**Action**: ❌ **Skip for MVP** - Phase 2 feature

---

#### 4.2 HunyuanVideo (`video/HunyuanVideo/I2V/`)

**Purpose**: HunyuanVideo I2V workflows

**Key Features**:
- Alternative video generation model
- Multiple implementation variants

**RYLA Relevance**: ⭐ **LOW** (Phase 2+)
- **Reason**: Video generation not in MVP
- **Note**: Different model architecture than RYLA stack

**Action**: ❌ **Skip for MVP** - Phase 2 feature

---

### Category 5: Other Workflows — **LOW PRIORITY**

#### 5.1 Relighting (`image-generation/relighting/`)

**Purpose**: Image relighting workflows

**RYLA Relevance**: ⭐ **LOW**
- **Use Case**: Post-processing, not core generation
- **MVP Priority**: Not critical

**Action**: ❌ **Skip for MVP**

---

#### 5.2 3D Generation (`3d/`)

**Purpose**: 3D model generation

**RYLA Relevance**: ❌ **NONE**
- **Reason**: Not in RYLA scope

**Action**: ❌ **Skip**

---

#### 5.3 Audio Generation (`audio/`)

**Purpose**: Audio generation workflows

**RYLA Relevance**: ❌ **NONE**
- **Reason**: Not in RYLA scope

**Action**: ❌ **Skip**

---

## Recommended Workflows for RYLA MVP

### Priority 1: Core T2I Workflow

**✅ Flux Dev T2I** (`flux/text_to_image/flux_dev_t5fp16.json`)
- **Status**: Use as reference
- **Action**: Adapt for RYLA's prompt structure and LoRA integration
- **Integration**: Convert to TypeScript in `libs/business/src/workflows/`

**Key Adaptations Needed**:
1. Add LoRA loading node (for custom character LoRAs)
2. Add IPAdapter FaceID node (for face swap mode)
3. Integrate RYLA prompt builder
4. Add NSFW routing logic

---

### Priority 2: LoRA Integration Pattern

**⚠️ Wan 2.1 LoRA** (`video/wan2.1_lora/wan2.1_lora_comfyui_native.json`)
- **Status**: Reference for LoRA patterns
- **Action**: Study LoRA loading/application pattern
- **Integration**: Apply pattern to Flux Dev workflow

**Key Patterns to Extract**:
1. LoRA model loading
2. LoRA strength/weight configuration
3. Multiple LoRA stacking (if needed)

---

### Priority 3: Inpainting (Future)

**⚠️ Flux Inpaint** (`flux/inpaint/inpaint.json`)
- **Status**: Reference for future feature
- **Action**: Document for Phase 1.5 post-processing features
- **Integration**: Not MVP, but useful for quality improvement

---

## Workflow Comparison Matrix

| Workflow | Model | RYLA Match | MVP Priority | Action |
|----------|-------|------------|--------------|--------|
| **Flux Dev T2I** | Flux Dev | ✅ Direct | ⭐⭐⭐ HIGH | ✅ Use as reference |
| **Flux Kontext** | Flux Dev (GGUF) | ⚠️ Partial | ⭐⭐ MEDIUM | ⚠️ Reference only |
| **Flux Inpaint** | Flux Dev | ✅ Direct | ⭐⭐ MEDIUM | ⚠️ Future feature |
| **Flux Outpaint** | Flux Dev | ✅ Direct | ⭐ LOW | ❌ Skip for MVP |
| **Wan 2.1 LoRA** | Wan 2.1 | ⚠️ Pattern | ⭐⭐ MEDIUM | ⚠️ Reference pattern |
| **Wan 2.1 I2V** | Wan 2.1 | ❌ Different | ⭐ LOW | ❌ Phase 2+ |
| **HIDream I1** | HIDream | ❌ Different | ⭐ LOW | ❌ Skip |
| **HunyuanVideo** | HunyuanVideo | ❌ Different | ⭐ LOW | ❌ Phase 2+ |

---

## Integration Plan

### Step 1: Analyze Flux Dev T2I Workflow

**File**: `libs/comfyui-workflows/flux/text_to_image/flux_dev_t5fp16.json`

**Tasks**:
1. ✅ Document workflow structure
2. ✅ Identify node types and connections
3. ✅ Map to RYLA's workflow builder (`libs/business/src/workflows/`)
4. ✅ Identify where to add LoRA loading
5. ✅ Identify where to add IPAdapter FaceID

### Step 2: Extract LoRA Integration Pattern

**File**: `libs/comfyui-workflows/video/wan2.1_lora/wan2.1_lora_comfyui_native.json`

**Tasks**:
1. ✅ Study LoRA loading mechanism
2. ✅ Understand LoRA strength configuration
3. ✅ Apply pattern to Flux Dev workflow

### Step 3: Create RYLA-Specific Workflow

**Location**: `libs/business/src/workflows/flux-dev-t2i.ts`

**Components**:
1. Base Flux Dev T2I (from ComfyUI Wiki workflow)
2. LoRA integration (from Wan 2.1 LoRA pattern)
3. IPAdapter FaceID integration (RYLA-specific)
4. RYLA prompt builder integration

---

## Missing Workflows (Not in Library)

### What RYLA Needs But Library Doesn't Have

1. **IPAdapter FaceID Integration**
   - Library doesn't have IPAdapter workflows
   - RYLA already has this in `workflows/` directory
   - ✅ Already implemented

2. **PuLID Integration**
   - Library doesn't have PuLID workflows
   - RYLA already has this in `workflows/` directory
   - ✅ Already implemented

3. **Custom LoRA Training Workflows**
   - Library focuses on LoRA usage, not training
   - RYLA uses RunPod templates for training
   - ✅ Already handled via RunPod

4. **Z-Image-Turbo Workflows**
   - Library doesn't have Z-Image workflows
   - RYLA already has this in `workflows/` directory
   - ✅ Already implemented

---

## Recommendations

### For MVP (EP-005)

1. **✅ Use Flux Dev T2I workflow as base**
   - Adapt for RYLA's prompt structure
   - Add LoRA integration
   - Add IPAdapter FaceID for face swap mode

2. **⚠️ Reference LoRA patterns from Wan 2.1 workflows**
   - Extract LoRA loading/application pattern
   - Apply to Flux Dev workflow

3. **❌ Skip video, 3D, audio workflows**
   - Not in MVP scope
   - Document for future phases

4. **⚠️ Consider inpainting for Phase 1.5**
   - Not critical for MVP
   - Useful for quality improvement

### Implementation Priority

| Priority | Workflow | Status | Timeline |
|----------|----------|--------|----------|
| P1 | Flux Dev T2I + LoRA | ✅ Reference available | MVP |
| P2 | IPAdapter FaceID | ✅ Already implemented | MVP |
| P3 | Inpainting | ⚠️ Reference available | Phase 1.5 |
| P4 | Video I2V | ⚠️ Reference available | Phase 2 |

---

## Next Steps

1. **Immediate**:
   - ✅ Analyze Flux Dev T2I workflow structure
   - ✅ Document node connections and parameters
   - ✅ Map to RYLA workflow builder

2. **Short-term**:
   - Extract LoRA integration pattern
   - Create RYLA-specific Flux Dev + LoRA workflow
   - Test in ComfyUI before TypeScript conversion

3. **Medium-term**:
   - Document inpainting workflow for future use
   - Keep video workflows for Phase 2 planning

---

## Related Documents

- `docs/research/community-workflows/ANALYSIS.md` - Instara workflows analysis
- `docs/requirements/epics/mvp/EP-005-content-studio.md` - MVP requirements
- `libs/business/src/workflows/` - RYLA workflow implementations
- `workflows/` - RYLA workflow JSON files

---

## Conclusion

**Key Finding**: The ComfyUI Wiki library provides excellent reference workflows for Flux Dev T2I, which directly matches RYLA's primary model. The LoRA integration patterns from Wan 2.1 workflows are also valuable references.

**Action Items**:
1. ✅ Use Flux Dev T2I as base workflow reference
2. ✅ Extract LoRA patterns for integration
3. ✅ Combine with RYLA's existing IPAdapter/PuLID workflows
4. ⚠️ Document inpainting for future use

**MVP Status**: ✅ **Sufficient reference material available** for MVP implementation.

