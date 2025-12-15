# Model Capabilities Matrix

> **Date**: 2025-12-10  
> **Status**: Research & Evaluation  
> **Purpose**: Map models to image generation requirements

---

## Models to Evaluate

1. **Flux Dev** (uncensored available)
2. **Z-Image-Turbo**
3. **Qwen-Image** (LoRA training proven)
4. **cDream v4** (base image generation - $0.03/image)
5. **Nano Banana Pro** (character variations, no NSFW, $0.15/image)
6. **IPAdapter FaceID** / **PuLID** (face consistency)
7. **ControlNet** (pose control)
8. **SeedVR2 FP16** (upscaling)
9. **Wan 2.2** (video, future)
10. **1.2.2 Model** (video + image, versatile for LoRA training)

---

## Step 1: Base Image Generation

**Requirements**: Unique face, realistic, high-res, clean background, skin detail, NSFW support, speed, cost

| Model | Unique Face | Realistic | High-Res | NSFW | Speed | Cost | API | Score |
|-------|------------|-----------|----------|------|-------|------|-----|-------|
| **Flux Dev** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ | **9/10** |
| **Z-Image-Turbo** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ❓ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **7/10*** |
| **Qwen-Image** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ❓ | ⭐⭐⭐ | ⭐⭐⭐ | ❓ | **8/10*** |
| **Seedream 4.5** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ❓ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **9/10*** |
| **Note**: API-only, cannot self-host |
| **cDream v4 / Seedream 4.0** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ❓ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **8/10*** |
| **Nano Banana Pro** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ❌ | ⭐⭐⭐⭐ | ⭐⭐ | ✅ | **5/10** |

*If NSFW/API works

**Recommendation**: 
- **Base Images**: Test **Seedream 4.5** (latest, best quality, $10/month via Chat LLM Teams) or **cDream v4** ($0.03/image, excellent quality) or **Qwen-Image** (unique faces)
- **Fallback**: **Flux Dev** (proven NSFW)
- **Not Recommended**: **Nano Banana Pro** (no NSFW, expensive for production)

---

## Step 2: Skin Enhancement

**Requirements**: Imperfections, texture detail, quality preservation, speed, API

| Model/Tool | Imperfections | Texture | Quality | Speed | API | Score |
|------------|---------------|---------|---------|-------|-----|-------|
| **Enhancer V3** | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | ❓ | **8/10*** |
| **Custom Post-Processing** | ⚠️ | ⚠️ | ⚠️ | ⭐⭐⭐ | ✅ | **5/10** |
| **Qwen-Image Editing** | ⚠️ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❓ | **6/10*** |

*Need to research API

**Recommendation**: Research Enhancer V3 API, fallback to custom post-processing

---

## Step 3: Character Sheet Generation (7-10 images)

**Requirements**: Face consistency, pose variety, quality match, NSFW support, unique variations, speed, cost

| Model/Approach | Face Consistency | Pose Control | Quality | NSFW | Speed | Cost | Score |
|----------------|------------------|--------------|---------|------|-------|------|-------|
| **PuLID + ControlNet + Flux Dev** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | **9/10** |
| **Nano Banana Pro** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | ⭐⭐ | **6/10** |
| **Qwen-Image + ControlNet** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❓ | ⭐⭐⭐ | ⭐⭐⭐ | **8/10*** |
| **cDream Edit Model** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❓ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **7/10*** |

*If NSFW/API works

**Recommendation**: 
- **Primary**: **PuLID + ControlNet + Flux Dev** (proven, NSFW works)
- **Alternative**: **Qwen-Image + ControlNet** (excellent quality, need NSFW verification)
- **Not Recommended**: **Nano Banana Pro** (no NSFW, expensive $0.15/image)

---

## Step 4: LoRA Training

**Requirements**: Model support, training speed, quality output, cost, API/service

| Tool | Model Support | Speed | Quality | Cost | API | Score |
|------|---------------|-------|---------|------|-----|-------|
| **AI Toolkit (Flux)** | ✅ Flux | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | **9/10** |
| **AI Toolkit (Z-Image)** | ✅ Z-Image | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **9/10** |
| **fal.ai 1.2.2 Trainer** | ✅ 1.2.2, Qwen | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | **9/10** |
| **flux-dev-lora-trainer** | ✅ Flux | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | **8/10** |

**Recommendation**: 
- **Primary**: **AI Toolkit** (supports Flux and Z-Image, has UI)
- **Alternative**: **fal.ai 1.2.2 Trainer** (simple, fast, supports Qwen and 1.2.2)

---

## Step 5: Face Swap Generation (IMMEDIATE - While LoRA Trains)

**Requirements**: Face consistency (~80%), speed (<15s), pose control, NSFW routing, quality, cost, immediate availability

| Model/Approach | Face Consistency | Speed | Pose Control | NSFW | Quality | Cost | Score |
|----------------|------------------|-------|--------------|------|---------|------|-------|
| **IPAdapter FaceID + Flux Dev** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **9/10** |
| **PuLID + Flux Dev** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **9/10** |
| **IPAdapter FaceID + Z-Image-Turbo** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❓ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **8/10*** |
| **Nano Banana Pro** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❓ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **7/10*** |

*If NSFW/API works

**Recommendation**: **IPAdapter FaceID + Flux Dev** (proven, NSFW works, immediate)

---

## Step 6: Final Generation with LoRA

### 6a: New Generation (Text-to-Image)

**Requirements**: Character consistency (>95%), pose control, NSFW routing, speed, quality, cost

| Model | Consistency | Pose | NSFW | Speed | Quality | Cost | Score |
|-------|-------------|------|------|-------|---------|------|-------|
| **Flux Dev + LoRA** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **10/10** |
| **Z-Image-Turbo + LoRA** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❓ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **8/10*** |
| **Qwen-Image + LoRA** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❓ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **7/10*** |

*If NSFW/LoRA works

**Recommendation**: 
- **SFW**: Z-Image-Turbo + LoRA (if NSFW works) - faster, cheaper
- **NSFW**: Flux Dev (uncensored) + LoRA - proven

### 6b: Upscaling

**Requirements**: Detail preservation, face preservation, speed, API

| Model | Detail Preserve | Face Preserve | Speed | API | Score |
|-------|----------------|---------------|-------|-----|-------|
| **SeedVR2 FP16** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❓ | **9/10*** |
| **Qwen-Image Editing** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❓ | **7/10*** |
| **Flux Dev** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | **6/10** |

*Need to research API

**Recommendation**: **SeedVR2 FP16** (proven quality), research API

### 6c: Editing

**Requirements**: Precise editing, quality preservation, face preservation, API

| Model | Precise Edit | Quality | Face Preserve | API | Score |
|-------|--------------|---------|---------------|-----|-------|
| **Qwen-Image** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❓ | **8/10*** |
| **Flux Dev** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | **7/10** |

*Need to research API

**Recommendation**: **Qwen-Image** (better editing), research API

---

## Summary Matrix

| Step | Primary Model | Secondary Model | Technology |
|------|---------------|-----------------|------------|
| **1. Base Image** | cDream v4 OR Qwen-Image | Flux Dev (fallback) | Text-to-image |
| **2. Skin Enhancement** | Enhancer V3 | Custom post-processing | Image enhancement |
| **3. Character Sheets** | PuLID + ControlNet + Flux Dev | Qwen-Image + ControlNet (test) | Image-to-image |
| **4. LoRA Training** | AI Toolkit OR fal.ai 1.2.2 | flux-dev-lora-trainer | LoRA training |
| **5. Face Swap** | IPAdapter FaceID + Flux Dev | PuLID + Flux Dev | Face consistency |
| **6a. Final Gen (SFW)** | Z-Image-Turbo + LoRA | Flux Dev + LoRA | Text-to-image + LoRA |
| **6a. Final Gen (NSFW)** | Flux Dev (uncensored) + LoRA | - | Text-to-image + LoRA |
| **6b. Upscaling** | SeedVR2 FP16 | Qwen-Image | Image upscaling |
| **6c. Editing** | Qwen-Image | cDream Edit Model | Image editing |

---

## Research Needed

### High Priority
1. **cDream v4 / Seedream 4.0**: ⚠️ **VERIFY EXACT SERVICE** - API availability, NSFW support, $0.025-0.03/image pricing verification
2. **Qwen-Image**: NSFW support, API availability, base image quality, LoRA training on RunPod
3. **Enhancer V3**: API availability, integration feasibility
4. **Z-Image-Turbo**: NSFW uncensored checkpoint availability
5. **fal.ai 1.2.2 Trainer**: Integration with our pipeline, cost comparison

### Medium Priority
6. **Nano Banana Pro**: API availability (already know: no NSFW, $0.15/image - too expensive)
7. **Qwen-Image**: ControlNet integration, depth maps, face detailer

### Medium Priority
5. **SeedVR2 FP16**: API availability for upscaling
6. **Qwen-Image**: LoRA training compatibility
7. **Qwen-Image**: Editing API availability

### Low Priority
8. **Wan 2.2**: Video generation (Phase 2+)

---

## Next Steps

1. **Test Qwen-Image** for base image uniqueness
2. **Research Nano Banana** API and NSFW support
3. **Research Enhancer V3** API for skin enhancement
4. **Test Z-Image-Turbo** NSFW support
5. **Update implementation plan** with model routing logic

