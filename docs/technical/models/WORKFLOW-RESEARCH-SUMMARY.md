# ComfyUI Workflow Research Summary

> **Date**: 2026-01-28  
> **Status**: Research Complete  
> **Purpose**: Quick summary of workflow research findings for priority models

---

## ✅ What We Found

### 1. Qwen Image 2512 Workflows

**✅ Official Workflow Downloaded:**
- **Source**: Comfy-Org official GitHub
- **Location**: `workflows/qwen-image-2512-base.json`
- **Status**: ✅ Saved to RYLA workflows database
- **Format**: UI format (needs conversion to API format)

**Workflow Includes:**
- Base Qwen Image 2512 generation (standard workflow)
- 4-step Lightning LoRA variant (faster generation)
- Model download links and setup instructions
- Aspect ratio presets (1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3)

**Custom Nodes Needed:**
- `ComfyUI-QwenImageLoraLoader` - For character LoRA loading
- Standard ComfyUI nodes (CLIPLoader, UNETLoader, VAELoader, KSampler)

**Face Consistency Integration:**
- ⚠️ InstantID - Needs testing (designed for SDXL, may need adaptation)
- ✅ IPAdapter FaceID - Likely compatible (more flexible)

**LoRA Training:**
- ✅ Proven LoRA training support
- Tools: Ostris AI Toolkit, Musubi Tuner
- Dataset: 20-30 images minimum
- Consistency: >95% with trained LoRA

---

### 2. Qwen Image Edit 2511 Workflows

**✅ Already in RYLA:**
- **Found in**: `workflows/260106_MICKMUMPITZ_CCC_3-8_SMPL.json`
- **Includes**: Qwen-Image-Edit-2511 models, LoRA, TextEncodeQwenImageEditPlus nodes
- **Status**: ✅ Already have complex workflow, need to extract simple editing workflow

**Official Sources:**
- ComfyUI Template Library (built-in)
- ComfyICU Cloud: https://comfy.icu/workflows/Ee7RK1hgfe8os8LWUe9ZV
- GitHub: https://github.com/mholtgraewe/comfyui-workflows/blob/main/qwen-image-edit-2511-4steps.json

**Workflow Components:**
- Qwen-Image-Edit-2511 base model (BF16, FP8, or GGUF)
- Qwen2.5-VL 7B text encoder
- Qwen Image VAE
- Optional: Lightning 4-steps LoRA

**Features:**
- ✅ Instruction-driven editing (natural language)
- ✅ Better character consistency (multi-person groups)
- ✅ Strong localized control
- ✅ Built-in LoRA support

---

### 3. Wan 2.6 Workflows

**✅ Already Have Wan 2.1 Workflows:**
- **Location**: `libs/comfyui-workflows/video/wan2.1/`
- **Includes**: Text-to-video, image-to-video, native and GGUF variants
- **Status**: ✅ Can adapt for Wan 2.6

**Wan 2.2 Workflows Available:**
- Official: https://docs.comfy.org/tutorials/video/wan/wan2_2
- ComfyUI Wiki: https://comfyui-wiki.com/en/tutorial/advanced/video/wan2.2/wan2-2-animate
- RYLA has: Sample workflows in `workflows/` directory

**Wan 2.6 R2V Workflow:**
- ❌ **Not found in community** - Must create
- **Research**: R2V supports 1-3 reference videos
- **Parameters**: 720p/1080p, 5-10 seconds, character1/character2/character3 syntax

**LoRA Training:**
- ✅ Proven support (tested on Wan 2.2)
- ⚠️ Complex: MoE architecture requires dual LoRAs
- Training time: 24-72 hours
- VRAM: 24GB+ minimum

---

## ⏳ What Needs to Be Created

### Priority 1: Qwen Image 2512 Workflows

1. **Convert to API Format**
   - Convert `qwen-image-2512-base.json` from UI to API format
   - Test with ComfyUI API
   - Add to workflow registry

2. **Add LoRA Support**
   - Install `ComfyUI-QwenImageLoraLoader` custom node
   - Add LoRA loader to workflow
   - Test with trained LoRAs
   - Verify >95% consistency

3. **Integrate Face Consistency**
   - Test InstantID compatibility
   - Test IPAdapter FaceID compatibility
   - Create integrated workflows
   - Document best approach

4. **Create Complete Pipeline**
   - Base generation → LoRA → Face consistency → Upscale
   - Optimize for AI influencer use case

---

### Priority 2: Qwen Image Edit 2511 Workflows

1. **Extract Simple Workflow**
   - Analyze CCC 3.8 workflow
   - Extract Qwen Image Edit 2511 components
   - Create simplified editing workflow
   - Add to workflow database

2. **Add LoRA Support**
   - Test LoRA loading with editing
   - Verify character consistency in edits
   - Document workflow

3. **Create Inpainting Workflow**
   - Mask-based editing
   - Preserve character consistency
   - Test with various editing scenarios

---

### Priority 3: Wan 2.6 Workflows

1. **Adapt Existing Workflows**
   - Update Wan 2.1/2.2 workflows for Wan 2.6
   - Update model references
   - Test compatibility

2. **Create R2V Workflow** ⚠️ **NEW - No Existing Workflow**
   - Research R2V API parameters
   - Create workflow structure
   - Test with 1-3 reference videos
   - Verify character consistency

3. **Create LoRA Workflow**
   - Dual LoRA loading (high-noise + low-noise)
   - Test LoRA application
   - Document complex setup

---

## 📋 Workflow Sources

### Official Sources (Recommended)

| Workflow | Source | Status |
|----------|--------|--------|
| **Qwen Image 2512** | https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_Image_2512.json | ✅ Downloaded |
| **Qwen Image Edit 2511** | ComfyUI Template Library | ⏳ Extract from CCC 3.8 |
| **Wan 2.2** | https://docs.comfy.org/tutorials/video/wan/wan2_2 | ✅ Available |

### Community Sources

| Workflow | Source | Status |
|----------|--------|--------|
| **Qwen Image Edit 2511** | https://comfy.icu/workflows/Ee7RK1hgfe8os8LWUe9ZV | ✅ Available |
| **Wan2.1 Stand In** | https://www.runcomfy.com/comfyui-workflows/wan2-1-stand-in-in-comfyui-character-consistent-video-workflow | ✅ Available |
| **Wan 2.2 Animate** | https://comfyui-wiki.com/en/tutorial/advanced/video/wan2.2/wan2-2-animate | ✅ Available |

### Custom Nodes Required

| Node | Source | Purpose |
|------|--------|---------|
| **ComfyUI-QwenImageLoraLoader** | https://github.com/ussoewwin/ComfyUI-QwenImageLoraLoader | LoRA loading for Qwen models |
| **ComfyUI_InstantID** | https://github.com/cubiq/ComfyUI_InstantID | Face consistency (85-90%) |
| **IPAdapterFaceID** | Standard ComfyUI | Face consistency (80-85%) |

---

## 🎯 Key Findings for AI Influencers

### Hyper-Realistic Quality

**Qwen Image 2512:**
- ✅ "Dramatically more realistic human faces"
- ✅ Reduced "AI look"
- ✅ Enhanced human realism
- ✅ Fine natural details

**Workflow Requirements:**
- Use official ComfyUI workflow
- Optimize prompts for hyper-realistic portraits
- Use SeedVR2 for upscaling (already in RYLA)

---

### Character Consistency

**Maximum Consistency (>95%):**
- ✅ LoRA Training - Proven for Qwen Image 2512
- ✅ LoRA Training - Proven for Qwen Image Edit 2511
- ⚠️ LoRA Training - Complex for Wan 2.6 (dual LoRAs, 24-72 hours)

**Good Consistency (85-90%):**
- ✅ InstantID - Already implemented in RYLA
- ✅ IPAdapter FaceID - Already implemented in RYLA

**Quick Consistency (No Training):**
- ✅ Wan 2.6 R2V - Reference-to-video (1-3 reference videos)

---

## 📝 Implementation Checklist

### Week 1: Foundation

- [x] Download Qwen Image 2512 official workflow
- [ ] Convert Qwen Image 2512 workflow to API format
- [ ] Extract Qwen Image Edit 2511 from CCC 3.8 workflow
- [ ] Install `ComfyUI-QwenImageLoraLoader` custom node
- [ ] Test workflows in ComfyUI

### Week 2: Face Consistency

- [ ] Test InstantID with Qwen Image 2512
- [ ] Test IPAdapter FaceID with Qwen Image 2512
- [ ] Create integrated workflows
- [ ] Document best approach

### Week 3: LoRA Integration

- [ ] Add LoRA loader to Qwen Image 2512 workflow
- [ ] Test LoRA loading and application
- [ ] Verify >95% consistency
- [ ] Create LoRA workflows

### Week 4: Video Workflows

- [ ] Adapt Wan 2.1/2.2 workflows for Wan 2.6
- [ ] Create Wan 2.6 R2V workflow (new)
- [ ] Test R2V with reference videos
- [ ] Document R2V workflow

### Week 5: Integration

- [ ] Convert all workflows to API format
- [ ] Add to workflow registry
- [ ] Create Modal handlers
- [ ] Test end-to-end pipelines

---

## 🔗 Quick Links

**Official Workflows:**
- Qwen Image 2512: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_Image_2512.json
- Qwen Image Edit: ComfyUI Template Library
- Wan 2.2: https://docs.comfy.org/tutorials/video/wan/wan2_2

**Custom Nodes:**
- Qwen LoRA Loader: https://github.com/ussoewwin/ComfyUI-QwenImageLoraLoader
- InstantID: https://github.com/cubiq/ComfyUI_InstantID

**Model Downloads:**
- Qwen Image 2512: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Qwen Image Edit 2511: https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI

**Full Research**: See `COMFYUI-WORKFLOW-RESEARCH.md` for complete details

---

**Last Updated**: 2026-01-28  
**Maintained By**: Infrastructure Team
