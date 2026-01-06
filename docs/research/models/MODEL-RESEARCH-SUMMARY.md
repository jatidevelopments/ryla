# Model Research Summary

> **Date**: 2025-12-10  
> **Status**: Comprehensive Research Complete  
> **Purpose**: Summary of all model research for RYLA image generation

---

## Models Researched

### Base Image Generation Models

1. **Flux Dev** (uncensored)
   - ✅ Proven NSFW support
   - ✅ Proven LoRA training
   - ⭐⭐⭐⭐ Unique faces
   - ⭐⭐⭐ Speed

2. **Z-Image-Turbo**
   - ✅ Proven LoRA training
   - ⭐⭐⭐⭐⭐ Speed (6-7s)
   - ⭐⭐⭐⭐⭐ Cost (low)
   - ❓ NSFW support unknown

3. **Qwen-Image**
   - ✅ Proven LoRA training
   - ⭐⭐⭐⭐⭐ Unique faces
   - ⭐⭐⭐⭐⭐ Quality (excellent skin)
   - ✅ ControlNet support
   - ✅ Depth maps, face detailer
   - ❓ NSFW support unknown

4. **cDream v4**
   - ✅ Excellent quality (recommended in video)
   - ✅ $0.03 per image
   - ✅ Easy to use (no setup)
   - ✅ Edit model available
   - ❓ NSFW support unknown

5. **Nano Banana Pro**
   - ✅ Consistent characters (no LoRA needed)
   - ❌ No NSFW support (closed source)
   - ❌ Expensive ($0.15/image)
   - ✅ Free via Google Gemini (limited)

### Character Sheet Generation Models

1. **PuLID + ControlNet + Flux Dev** (Current)
   - ✅ Proven
   - ✅ NSFW support
   - ⭐⭐⭐⭐ Face consistency
   - ⭐⭐⭐⭐⭐ Pose control

2. **Nano Banana Pro**
   - ⭐⭐⭐⭐⭐ Face consistency
   - ⭐⭐⭐⭐ Pose control
   - ❌ No NSFW support
   - ❌ Expensive ($0.15/image)

3. **Qwen-Image + ControlNet**
   - ⭐⭐⭐⭐⭐ Quality
   - ⭐⭐⭐⭐⭐ Face consistency
   - ⭐⭐⭐⭐⭐ Pose control
   - ✅ Depth maps, face detailer
   - ❓ NSFW support unknown

4. **cDream Edit Model**
   - ✅ Easy to use
   - ✅ $0.03 per image
   - ⭐⭐⭐⭐ Quality
   - ❓ NSFW support unknown

### LoRA Training Tools

1. **AI Toolkit**
   - ✅ Supports Flux and Z-Image-Turbo
   - ✅ Has UI
   - ✅ RunPod template available
   - ⭐⭐⭐ Speed

2. **fal.ai 1.2.2 Trainer**
   - ✅ Super simple (no setup)
   - ✅ Fast
   - ✅ Supports Qwen and 1.2.2 models
   - ✅ Good results
   - ⭐⭐⭐⭐ Speed

3. **flux-dev-lora-trainer**
   - ✅ Proven
   - ✅ Flux only
   - ⭐⭐⭐ Speed

### Face Swap Models

1. **IPAdapter FaceID + Flux Dev**
   - ✅ Proven
   - ✅ NSFW support
   - ⭐⭐⭐⭐ Face consistency (~80%)
   - ⭐⭐⭐⭐ Speed

2. **PuLID + Flux Dev**
   - ✅ Proven
   - ✅ NSFW support
   - ⭐⭐⭐⭐ Face consistency (~80%)
   - ⭐⭐⭐⭐ Speed

---

## Key Findings from Videos

### Video 1: Qwen Image LoRA Workflow (s1HBkfBMcho)

**Key Insights**:
- ✅ Qwen Image LoRA training works
- ✅ Excellent skin quality and facial consistency
- ✅ ControlNet integration for pose control
- ✅ Depth maps and face detailer improve quality
- ✅ Two-pass sampling for higher quality
- ✅ Can generate base portraits

**Workflow Features**:
- ControlNet for pose following
- Depth model for 3D structure
- Face detailer for final refinement
- LoRA stack (multiple LoRAs)

### Video 2: Complete LoRA Training Guide (WUWGZt2UwO0)

**Key Insights**:
- ✅ cDream v4 recommended for base images ($0.03/image)
- ✅ Dataset composition: 70% upper body/face, 20% portrait, 10% full body
- ✅ fal.ai 1.2.2 trainer is simple and effective
- ✅ 1.2.2 model is versatile (video + image)
- ✅ Need 30 images for optimal training (we generate 7-10, may need more)

**Base Image Options**:
1. cDream v4 ($0.03, best quality)
2. Qwen Image (good quality, need setup)
3. Nano Banana (free, lower quality)

**Training Process**:
1. Create base image
2. Create dataset (30 images)
3. Choose keyword (unique trigger word)
4. Train on fal.ai (simple, fast)
5. Convert for ComfyUI
6. Use in ComfyUI

### Video 3: Nano Banana Pro (Up1sgf1QTTU)

**Key Insights**:
- ✅ Can generate consistent characters without LoRA
- ❌ No NSFW support (closed source)
- ❌ Expensive ($0.15/image)
- ✅ Free via Google Gemini (limited)
- ✅ Good for quick testing/prototyping
- ⚠️ Not cost-effective for production

**Use Cases**:
- Quick testing (free via Gemini)
- Base image generation (if NSFW not needed)
- Dataset creation for LoRA training
- Not recommended for production (too expensive)

---

## Updated Recommendations

### Step 1: Base Image Generation

**Primary Options**:
1. **cDream v4** ($0.03/image, excellent quality) - **Test First**
2. **Qwen-Image** (excellent quality, unique faces) - **Test Second**
3. **Flux Dev** (proven NSFW) - **Fallback**

**Not Recommended**:
- **Nano Banana Pro** (no NSFW, expensive for production)

### Step 2: Skin Enhancement

**Options**:
1. **Enhancer V3** (research API)
2. **Custom post-processing** (fallback)

### Step 3: Character Sheet Generation

**Primary**: **PuLID + ControlNet + Flux Dev** (proven, NSFW works)

**Alternative**: **Qwen-Image + ControlNet** (test quality, verify NSFW)

**Not Recommended**: **Nano Banana Pro** (no NSFW, expensive)

**Dataset Composition**:
- Generate 10-15 images
- Select best 7-10
- Ensure: 70% upper body/face, 20% portrait, 10% full body

### Step 4: LoRA Training

**Primary**: **AI Toolkit** (supports Flux and Z-Image-Turbo)

**Alternative**: **fal.ai 1.2.2 Trainer** (simple, fast, supports Qwen)

**Model Options**:
- Flux Dev (proven)
- Z-Image-Turbo (faster, cheaper)
- Qwen-Image (excellent quality)
- 1.2.2 (versatile, video + image)

### Step 5: Face Swap

**Primary**: **IPAdapter FaceID + Flux Dev** (proven, NSFW works)

### Step 6: Final Generation

**SFW**: **Z-Image-Turbo + LoRA** (if NSFW works) - faster, cheaper

**NSFW**: **Flux Dev (uncensored) + LoRA** - proven

---

## Research Priorities

### Critical (Blocking)
1. **cDream v4**: API availability, NSFW support, pricing
2. **Qwen-Image**: NSFW support, API availability
3. **Z-Image-Turbo**: NSFW uncensored checkpoint

### High Priority
4. **Enhancer V3**: API availability for skin enhancement
5. **fal.ai 1.2.2 Trainer**: Integration with our pipeline
6. **Qwen-Image**: LoRA training on RunPod

### Medium Priority
7. **Nano Banana Pro**: Already know limitations (no NSFW, expensive)
8. **Qwen-Image**: ControlNet, depth maps, face detailer integration

---

## Cost Analysis

### Base Image Generation (3 images)
- **cDream v4**: $0.09 (3 × $0.03)
- **Qwen-Image**: ~$0.10-0.15 (estimated)
- **Flux Dev**: ~$0.15-0.20 (estimated)
- **Nano Banana**: $0.45 (3 × $0.15) - **Too expensive**

### Character Sheet Generation (10 images)
- **PuLID + ControlNet + Flux**: ~$0.20-0.50
- **Nano Banana**: $1.50 (10 × $0.15) - **Too expensive**
- **cDream Edit**: $0.30 (10 × $0.03)

### LoRA Training
- **AI Toolkit**: ~$2-5 (one-time)
- **fal.ai 1.2.2**: ~$2-5 (one-time)

### Final Generation (per image)
- **Z-Image-Turbo + LoRA**: ~$0.001-0.01 (after training)
- **Flux Dev + LoRA**: ~$0.01-0.02 (after training)
- **Nano Banana**: $0.15 - **Too expensive**

---

## Next Steps

1. **Test cDream v4 API**: Check availability, NSFW support, pricing
2. **Test Qwen-Image**: NSFW support, API availability, base image quality
3. **Update Dataset Generation**: Ensure 70/20/10 composition
4. **Research fal.ai Integration**: Can we automate LoRA training?
5. **Compare Training Tools**: AI Toolkit vs fal.ai 1.2.2 trainer

---

## References

- [Qwen Image LoRA Workflow](https://www.youtube.com/watch?v=s1HBkfBMcho)
- [Complete LoRA Training Guide](https://www.youtube.com/watch?v=WUWGZt2UwO0)
- [Nano Banana Pro Overview](https://www.youtube.com/watch?v=Up1sgf1QTTU)
- [Z-Image-Turbo Research](./z-image-turbo-model.md)
- [Flux Dev Research](./Z-IMAGE-VS-FLUX-RECOMMENDATION.md)

