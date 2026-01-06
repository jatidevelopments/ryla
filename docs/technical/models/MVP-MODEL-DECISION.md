# MVP Model Decision: Final Recommendation

> **Date**: 2025-12-10  
> **Status**: Final Decision for MVP  
> **Based On**: Complete research of all models

---

## Executive Summary

**For MVP, we will use a self-hosted approach on RunPod with Flux Dev as the primary model**, supplemented by Z-Image-Turbo for faster generation where appropriate. This decision is based on:
- ✅ Self-hosting requirement (RunPod infrastructure)
- ✅ NSFW support (critical requirement)
- ✅ Proven LoRA training
- ✅ Cost-effectiveness
- ✅ Open-source (full control)

---

## Decision Matrix

### Requirements for MVP

| Requirement | Priority | Why |
|-------------|----------|-----|
| **Self-Hosting** | CRITICAL | RunPod infrastructure already set up |
| **NSFW Support** | CRITICAL | Core product requirement |
| **LoRA Training** | CRITICAL | Character consistency >95% |
| **Cost-Effective** | HIGH | MVP budget constraints |
| **Proven** | HIGH | Can't risk unproven tech in MVP |
| **Quality** | HIGH | Professional results required |

---

## Model Evaluation

### ❌ Eliminated: Seedream 4.5 / cDream v4

**Reasons**:
- ❌ Cannot self-host (API-only, closed-source)
- ❓ NSFW support unknown
- ❌ External API dependency
- ❌ Less control

**Verdict**: **NOT FOR MVP** (can evaluate for Phase 2 if API access acceptable)

---

### ❌ Eliminated: Nano Banana Pro

**Reasons**:
- ❌ No NSFW support (closed-source)
- ❌ Expensive ($0.15/image)
- ❌ Cannot self-host
- ❌ API-only

**Verdict**: **NOT FOR MVP**

---

### ✅ Selected: Flux Dev (Primary)

**Why Flux Dev Wins**:

1. **Self-Hosting** ✅
   - Open-source
   - Can deploy on RunPod
   - Full control

2. **NSFW Support** ✅
   - Proven uncensored checkpoint
   - Critical for MVP

3. **LoRA Training** ✅
   - Proven with AI Toolkit
   - Excellent consistency (>95%)
   - ~45 minutes training time

4. **Quality** ✅
   - Excellent photorealistic results
   - Proven in production
   - High user satisfaction

5. **Cost** ✅
   - Self-hosted = pay only for GPU time
   - ~$0.05-0.07 per image (estimated)
   - Cost-effective for MVP

6. **Proven** ✅
   - Widely used
   - Extensive documentation
   - Community support

**Use Cases**:
- Base image generation
- Character sheet generation (PuLID + ControlNet)
- LoRA training
- Final generation (with LoRA)
- NSFW content

---

### ✅ Selected: Z-Image-Turbo (Secondary - Test)

**Why Z-Image-Turbo as Secondary**:

1. **Self-Hosting** ✅
   - Open-source
   - Can deploy on RunPod

2. **Speed** ✅
   - 6-7 seconds per image (vs 10-15s for Flux)
   - Faster = better UX

3. **Cost** ✅
   - Lower cost (fewer steps = less compute)
   - Proven LoRA training ($2.26 for 15 images)

4. **Quality** ✅
   - Excellent photorealistic results
   - Proven LoRA training

**Limitations**:
- ❓ NSFW support unknown (needs testing)
- ⚠️ Newer model (less proven than Flux)

**Use Cases** (If NSFW works):
- Base image generation (faster alternative)
- Final generation (SFW only, if NSFW fails)
- Cost-effective generation

**Verdict**: **TEST IN PARALLEL** - Use if NSFW works, fallback to Flux if not

---

### ⚠️ Deferred: Qwen-Image

**Why Deferred**:
- ❓ NSFW support unknown
- ⚠️ More complex setup
- ⚠️ Less proven than Flux
- ✅ Excellent quality (can evaluate later)

**Verdict**: **PHASE 2** - Evaluate after MVP launch

---

## MVP Architecture

### Phase 1: Base Image Generation

**Primary**: **Flux Dev** (self-hosted on RunPod)
- Generate 3 base image options
- NSFW support (uncensored checkpoint)
- High quality, photorealistic

**Secondary**: **Z-Image-Turbo** (test in parallel)
- If NSFW works, can use for faster generation
- Fallback to Flux if NSFW fails

---

### Phase 2: Skin Enhancement

**Primary**: **Custom Post-Processing** (implement ourselves)
- Research Enhancer V3 API (Phase 2)
- For MVP: Basic skin enhancement or skip

**Verdict**: **SKIP FOR MVP** - Can add in Phase 2

---

### Phase 3: Character Sheet Generation

**Primary**: **PuLID + ControlNet + Flux Dev** (self-hosted)
- Generate 7-10 character sheet images
- Maintain face consistency
- Pose control via ControlNet
- NSFW support

**Dataset Composition**:
- 70% upper body and face
- 20% portrait
- 10% full body

---

### Phase 4: LoRA Training

**Primary**: **AI Toolkit** (self-hosted on RunPod)
- Train on Flux Dev
- 7-10 character sheet images
- ~45 minutes training time
- ~$3-5 cost per character

**Alternative**: **fal.ai 1.2.2 Trainer** (if simpler)
- Test as alternative
- May be easier to integrate

---

### Phase 5: Face Swap (Immediate)

**Primary**: **IPAdapter FaceID + Flux Dev** (self-hosted)
- Available immediately (<15s)
- ~80% face consistency
- NSFW support
- User can generate while LoRA trains

---

### Phase 6: Final Generation (After LoRA Ready)

**Primary**: **Flux Dev + LoRA** (self-hosted)
- >95% face consistency
- NSFW support (uncensored)
- High quality results

**Secondary**: **Z-Image-Turbo + LoRA** (if NSFW works)
- Faster generation (6-7s vs 10-15s)
- Lower cost
- Use for SFW content

---

## Implementation Plan

### Week 1: Infrastructure Setup

1. **Deploy Flux Dev on RunPod**
   - Set up ComfyUI pod with Flux Dev
   - Download uncensored checkpoint
   - Test base image generation

2. **Deploy Z-Image-Turbo (Test)**
   - Set up Z-Image-Turbo on RunPod
   - Test NSFW generation
   - Compare quality with Flux Dev

3. **Set up AI Toolkit**
   - Deploy AI Toolkit on RunPod
   - Test LoRA training pipeline
   - Verify training times and costs

---

### Week 2: Core Features

4. **Base Image Generation Service**
   - Implement Flux Dev base image generation
   - 3 options per generation
   - NSFW routing logic

5. **Character Sheet Generation Service**
   - Implement PuLID + ControlNet workflow
   - Generate 7-10 images
   - Ensure 70/20/10 composition

6. **Face Swap Service**
   - Implement IPAdapter FaceID
   - Immediate generation (<15s)
   - NSFW support

---

### Week 3: LoRA Training & Final Generation

7. **LoRA Training Service**
   - Integrate AI Toolkit
   - Background training pipeline
   - Status tracking

8. **Final Generation Service**
   - Flux Dev + LoRA generation
   - Auto-switch when LoRA ready
   - NSFW routing

9. **Testing & Optimization**
   - End-to-end testing
   - Quality verification
   - Cost optimization

---

## Cost Estimates for MVP

### One-Time Setup
- RunPod infrastructure: Already set up
- Model downloads: Free (open-source)

### Per Character Creation
- Base images (3): ~$0.15-0.21 (Flux Dev)
- Character sheets (10): ~$0.50-0.70 (Flux Dev)
- LoRA training: ~$3-5 (AI Toolkit)
- **Total per character**: ~$3.65-5.91

### Per Image Generation
- Face Swap (immediate): ~$0.05-0.07 (Flux Dev)
- Final Generation (with LoRA): ~$0.05-0.07 (Flux Dev)

### Monthly Costs (Estimated)
- GPU rental: ~$200-400/month (depending on usage)
- Per-character costs: ~$3.65-5.91
- Per-image costs: ~$0.05-0.07

**For 100 characters + 10,000 images/month**:
- Characters: $365-591
- Images: $500-700
- GPU: $200-400
- **Total**: ~$1,065-1,691/month

---

## Risk Mitigation

### Risk 1: Z-Image-Turbo NSFW Fails

**Mitigation**:
- Test early (Week 1)
- Have Flux Dev as primary
- Z-Image-Turbo is optional enhancement

### Risk 2: LoRA Training Takes Too Long

**Mitigation**:
- Face Swap available immediately
- Background training doesn't block users
- Can optimize training parameters

### Risk 3: Quality Not Meeting Standards

**Mitigation**:
- Test extensively before launch
- Have fallback models ready
- Can iterate on prompts/workflows

### Risk 4: Costs Higher Than Expected

**Mitigation**:
- Monitor costs closely
- Optimize generation parameters
- Can switch to Z-Image-Turbo if faster/cheaper

---

## Success Criteria

### MVP Launch Criteria

1. ✅ Base image generation works (<30s for 3 images)
2. ✅ Character sheet generation works (<5 min for 10 images)
3. ✅ LoRA training works (<45 min per character)
4. ✅ Face Swap works immediately (<15s)
5. ✅ Final generation works (>95% consistency)
6. ✅ NSFW support works (uncensored checkpoint)
7. ✅ Costs within budget (~$1,000-1,700/month for 100 chars + 10k images)

---

## Phase 2 Considerations

### Models to Evaluate After MVP

1. **Seedream 4.5** (if API access acceptable)
   - Text rendering (for marketing materials)
   - Multi-image editing (better character sheets)
   - Precise editing (character variations)

2. **Qwen-Image** (if NSFW works)
   - Unique faces
   - Excellent quality
   - ControlNet integration

3. **Enhancer V3** (skin enhancement)
   - API integration
   - Better skin quality

---

## Final Recommendation

### ✅ **USE FOR MVP**:

1. **Flux Dev** (Primary)
   - Self-hosted on RunPod
   - NSFW support
   - Proven LoRA training
   - Excellent quality

2. **Z-Image-Turbo** (Secondary - Test)
   - Test NSFW support
   - Use if works, fallback to Flux if not

3. **AI Toolkit** (LoRA Training)
   - Self-hosted on RunPod
   - Proven with Flux Dev

4. **IPAdapter FaceID** (Face Swap)
   - Immediate generation
   - NSFW support

### ❌ **NOT FOR MVP**:

1. Seedream 4.5 (API-only, cannot self-host)
2. Nano Banana Pro (no NSFW, expensive)
3. Qwen-Image (defer to Phase 2)
4. cDream v4 (API-only, cannot self-host)

---

## Next Steps

1. **Deploy Flux Dev on RunPod** (Week 1)
2. **Test Z-Image-Turbo NSFW** (Week 1)
3. **Implement base image generation** (Week 2)
4. **Implement character sheet generation** (Week 2)
5. **Implement face swap** (Week 2)
6. **Implement LoRA training** (Week 3)
7. **Implement final generation** (Week 3)
8. **End-to-end testing** (Week 3)

---

## References

- [Flux Dev Research](./MODEL-CAPABILITIES-MATRIX.md)
- [Z-Image-Turbo Research](../research/z-image-turbo-model.md)
- [Image Generation Flow](./IMAGE-GENERATION-FLOW.md)
- [Seedream 4.5 Research](../research/SEEDREAM-4.5-UPDATE.md)

---

## Tags

#mvp #decision #flux-dev #z-image-turbo #self-hosting #runpod #lora-training #nsfw-support #ep-001 #ep-005

