# RYLA Priority Deployment Plan - MVP Focus

> **Date**: 2026-01-28  
> **Status**: Deployment Plan  
> **Purpose**: Prioritized deployment plan focusing on user value (consistency, hyper-realistic) and MVP requirements

---

## Executive Summary

**Deployment Priority**: Focus on models that deliver the **highest user value** (consistency + hyper-realistic) for MVP capabilities:
1. Text-to-image
2. Character face swap
3. Image editing
4. Text-to-video
5. Image-to-video

**Key Principle**: Deploy models that enable **>95% consistency** (LoRA) and **hyper-realistic quality** while maintaining **free commercial use** and **NSFW support**.

---

## Current Status

### ✅ Already Deployed/Working

- **Z-Image-Turbo** - Text-to-image (fast, 6-7s, LoRA proven)
- **InstantID** - Face consistency (85-90%, already implemented)
- **IPAdapter FaceID** - Face consistency for Flux (80-85%, already implemented)
- **LoRA Infrastructure** - Training support (already implemented)
- **SeedVR2** - Upscaling (already implemented)
- **Wan2.1** - Text-to-video (test implementation, needs upgrade)

### ❌ Missing/Blocked

- **Flux Dev** - Blocked (text encoder path issues)
- **Image Editing** - Workflow exists but models missing
- **Image-to-Video** - Not fully working
- **High-Quality Text-to-Image** - Need better than Z-Image-Turbo for hyper-realistic

---

## Priority Deployment Plan

### 🥇 Priority 1: Text-to-Image + Face Consistency (Week 1-2)

**Goal**: Enable hyper-realistic, consistent character generation

#### 1.1 Deploy Qwen Image 2512 (Text-to-Image)

**Why First:**
- ⭐ **Best user value**: Hyper-realistic quality (ELO 1141) + LoRA consistency (>95%)
- ✅ **Free commercial use**: Apache 2.0 license (no licensing fees)
- ✅ **Modal.com deployable**: Can self-host and sell
- ✅ **LoRA proven**: >95% consistency with trained LoRA
- ✅ **Complements Z-Image-Turbo**: Keep Z-Image for fast generation, Qwen for quality

**User Impact:**
- Hyper-realistic image generation
- Maximum character consistency (>95% with LoRA)
- Free commercial use (no cost per image)

**Implementation:**
- Add Qwen Image 2512 to Modal.com deployment
- Test NSFW capabilities
- Integrate LoRA training support (infrastructure already exists)
- Add to model registry

**Estimated Time**: 3-5 days

#### 1.2 Verify Face Consistency (Already Implemented)

**Status**: ✅ Already working
- **InstantID**: 85-90% consistency (already deployed)
- **IPAdapter FaceID**: 80-85% consistency (already deployed)
- **LoRA Training**: >95% consistency (infrastructure ready)

**Action**: ✅ No deployment needed - already complete

**User Impact:**
- Immediate face consistency (InstantID, IPAdapter FaceID)
- Maximum consistency (LoRA training)

---

### 🥈 Priority 2: Image Editing (Week 2-3)

**Goal**: Enable image editing/inpainting for MVP

#### 2.1 Deploy Qwen Image Edit 2511 (Image Editing)

**Why Second:**
- ⭐ **Best editing model**: High quality (ELO 1149) + LoRA consistency (>95%)
- ✅ **Free commercial use**: Apache 2.0 license
- ✅ **Modal.com deployable**: Can self-host
- ✅ **LoRA proven**: >95% consistency with trained LoRA
- ✅ **MVP requirement**: Image editing needed for Studio

**User Impact:**
- High-quality image editing
- Consistent character editing (with LoRA)
- Free commercial use

**Implementation:**
- Add Qwen Image Edit 2511 to Modal.com deployment
- Test NSFW capabilities
- Integrate with existing editing workflows
- Add to model registry

**Estimated Time**: 3-5 days

---

### 🥉 Priority 3: Video Generation (Week 3-4)

**Goal**: Enable text-to-video and image-to-video for MVP

#### 3.1 Upgrade Wan2.1 to Wan 2.6 (Text-to-Video + Image-to-Video)

**Why Third:**
- ⭐ **Top quality**: Highest ELO scores (1228-1305)
- ✅ **R2V consistency**: Reference-to-video for immediate consistency (no training)
- ✅ **LoRA support**: Maximum consistency (>95% with trained LoRA)
- ✅ **Dual capability**: Supports both text-to-video and image-to-video
- ⚠️ **Commercial use**: Via API (not free, but can deploy on Modal.com)

**User Impact:**
- High-quality video generation
- Immediate consistency (R2V, no training)
- Maximum consistency (LoRA training)

**Implementation:**
- Upgrade Wan2.1 to Wan 2.6 on Modal.com
- Implement R2V (reference-to-video) support
- Test LoRA training support (complex but possible)
- Test NSFW capabilities
- Add text-to-video and image-to-video endpoints

**Estimated Time**: 5-7 days

**Alternative (If API costs too high):**
- Deploy **Wan 2.5** (Apache 2.0, free commercial use)
- Lower quality (ELO 1132) but free licensing

---

## Complete MVP Capability Matrix

| MVP Capability | Current Status | Priority Deployment | User Value | Timeline |
|----------------|----------------|---------------------|------------|----------|
| **Text-to-Image** | ✅ Z-Image-Turbo (fast) | 🥇 **Qwen Image 2512** | ⭐⭐⭐⭐⭐ Hyper-realistic + LoRA consistency | Week 1-2 |
| **Character Face Swap** | ✅ InstantID + IPAdapter FaceID | ✅ **Already Complete** | ⭐⭐⭐⭐⭐ 85-90% (InstantID) or >95% (LoRA) | ✅ Done |
| **Image Editing** | ⚠️ Workflow exists, models missing | 🥈 **Qwen Image Edit 2511** | ⭐⭐⭐⭐⭐ High quality + LoRA consistency | Week 2-3 |
| **Text-to-Video** | ⚠️ Wan2.1 (test, needs upgrade) | 🥉 **Wan 2.6** | ⭐⭐⭐⭐⭐ Top quality + R2V consistency | Week 3-4 |
| **Image-to-Video** | ❌ Not working | 🥉 **Wan 2.6** (same as text-to-video) | ⭐⭐⭐⭐⭐ Top quality + R2V consistency | Week 3-4 |

---

## Deployment Sequence

### Week 1-2: Foundation (Text-to-Image + Face Consistency)

**Day 1-3: Deploy Qwen Image 2512**
- Download models (~57.7 GB)
- Create Modal.com deployment
- Test basic text-to-image generation
- Verify model loading and inference

**Day 4-5: Integrate LoRA Support**
- Test LoRA loading with Qwen Image 2512
- Verify >95% consistency with trained LoRA
- Add to model registry

**Day 6-7: Test NSFW Capabilities**
- Test NSFW generation
- Verify uncensored behavior
- Document NSFW support status

**Day 8-10: Production Integration**
- Add to Studio workflows
- Update model selection UI
- Test end-to-end user flows
- Performance testing

**Result**: ✅ Hyper-realistic text-to-image with >95% consistency

---

### Week 2-3: Image Editing

**Day 1-3: Deploy Qwen Image Edit 2511**
- Download models
- Create Modal.com deployment
- Test image editing/inpainting

**Day 4-5: Integrate with Workflows**
- Connect to existing editing workflows
- Test mask-based editing
- Verify LoRA consistency in edits

**Day 6-7: Test NSFW Capabilities**
- Test NSFW editing
- Verify uncensored behavior

**Day 8-10: Production Integration**
- Add to Studio edit mode
- Update UI for editing
- Test end-to-end editing flows

**Result**: ✅ High-quality image editing with >95% consistency

---

### Week 3-4: Video Generation

**Day 1-3: Upgrade to Wan 2.6**
- Download Wan 2.6 models
- Replace Wan2.1 deployment
- Test text-to-video generation

**Day 4-5: Implement R2V (Reference-to-Video)**
- Add R2V endpoint support
- Test 1-3 reference video inputs
- Verify character consistency across shots

**Day 6-7: Test LoRA Training Support**
- Research Wan 2.6 LoRA training (complex, MoE architecture)
- Test if LoRA training is feasible
- Document requirements (24GB+ VRAM, 24-72 hours)

**Day 8-10: Production Integration**
- Add text-to-video and image-to-video endpoints
- Update Studio for video generation
- Test end-to-end video flows

**Result**: ✅ High-quality video generation with R2V consistency

---

## User Value Analysis

### Priority 1: Qwen Image 2512 (Text-to-Image)

**User Value Score**: ⭐⭐⭐⭐⭐ (5/5)

**Consistency**: ⭐⭐⭐⭐⭐
- LoRA training: >95% consistency (proven)
- Better than current Z-Image-Turbo for consistency

**Hyper-Realistic**: ⭐⭐⭐⭐⭐
- ELO 1141 (high quality)
- "Dramatically more realistic human faces" (research)
- Reduced "AI look"

**Commercial Use**: ⭐⭐⭐⭐⭐
- Apache 2.0 (free commercial use)
- No licensing fees
- Can deploy on Modal.com and sell

**NSFW**: ⭐⭐⭐⭐
- Needs testing (likely supported as open source)

**Total Score**: 19/20 ⭐⭐⭐⭐⭐

---

### Priority 2: Qwen Image Edit 2511 (Image Editing)

**User Value Score**: ⭐⭐⭐⭐⭐ (5/5)

**Consistency**: ⭐⭐⭐⭐⭐
- LoRA training: >95% consistency (proven)
- Maintains character consistency in edits

**Hyper-Realistic**: ⭐⭐⭐⭐⭐
- ELO 1149 (high quality editing)
- Preserves realism in edits

**Commercial Use**: ⭐⭐⭐⭐⭐
- Apache 2.0 (free commercial use)
- No licensing fees

**NSFW**: ⭐⭐⭐⭐
- Needs testing (likely supported)

**Total Score**: 19/20 ⭐⭐⭐⭐⭐

---

### Priority 3: Wan 2.6 (Video)

**User Value Score**: ⭐⭐⭐⭐ (4/5)

**Consistency**: ⭐⭐⭐⭐⭐
- R2V: Excellent (no training needed)
- LoRA: >95% (complex but possible)

**Hyper-Realistic**: ⭐⭐⭐⭐⭐
- ELO 1228-1305 (top quality)
- Best video quality available

**Commercial Use**: ⭐⭐⭐
- Commercial via API (not free)
- Can deploy on Modal.com but API costs apply

**NSFW**: ⭐⭐⭐⭐
- Needs testing

**Total Score**: 17/20 ⭐⭐⭐⭐

**Alternative: Wan 2.5** (if API costs too high)
- Free commercial use (Apache 2.0)
- Lower quality (ELO 1132)
- Total Score: 18/20 ⭐⭐⭐⭐

---

## Recommended Deployment Order

### ✅ Phase 1: Foundation (Week 1-2)

1. **Qwen Image 2512** (Text-to-Image)
   - Highest user value
   - Enables hyper-realistic + >95% consistency
   - Free commercial use
   - Foundation for all other features

2. **Face Consistency** (Already Complete)
   - InstantID: 85-90% (already working)
   - IPAdapter FaceID: 80-85% (already working)
   - LoRA: >95% (infrastructure ready)

**Result**: Users can generate hyper-realistic, consistent characters

---

### ✅ Phase 2: Editing (Week 2-3)

3. **Qwen Image Edit 2511** (Image Editing)
   - Enables MVP editing capability
   - Maintains consistency in edits
   - Free commercial use

**Result**: Users can edit images while maintaining character consistency

---

### ✅ Phase 3: Video (Week 3-4)

4. **Wan 2.6** (Text-to-Video + Image-to-Video)
   - Enables MVP video capabilities
   - R2V for immediate consistency
   - Top quality

**Result**: Users can generate videos with consistent characters

---

## Cost Analysis

### Free Commercial Use Stack (Recommended)

- **Qwen Image 2512**: $0 (self-hosted on Modal.com)
- **Qwen Image Edit 2511**: $0 (self-hosted on Modal.com)
- **Wan 2.5** (alternative): $0 (self-hosted on Modal.com)
- **InstantID**: $0 (already deployed)
- **IPAdapter FaceID**: $0 (already deployed)
- **LoRA Infrastructure**: $0 (already implemented)

**Total Licensing Cost**: $0/month

**Modal.com Infrastructure Costs**: Pay-per-use (only when generating)

### Paid Option (If Budget Allows)

- **Wan 2.6**: Commercial via API (pricing varies)
- **FLUX.2 [max]/[pro]**: Commercial license (contact Black Forest Labs)

---

## NSFW Testing Priority

### Critical (Block MVP if fails)

1. **Qwen Image 2512** - Primary text-to-image model
2. **Qwen Image Edit 2511** - Primary editing model

### Important (Nice to have)

3. **Wan 2.5/2.6** - Video models (can use API alternatives if needed)

### Testing Plan

1. Test basic NSFW prompts
2. Verify uncensored behavior
3. Test with LoRA (if NSFW LoRA available)
4. Document NSFW support status
5. Fallback plan if NSFW not supported

---

## Success Metrics

### Phase 1 (Text-to-Image + Face Consistency)

- ✅ Qwen Image 2512 deployed and working
- ✅ LoRA training verified (>95% consistency)
- ✅ NSFW support confirmed
- ✅ User can generate hyper-realistic, consistent characters

### Phase 2 (Image Editing)

- ✅ Qwen Image Edit 2511 deployed and working
- ✅ Editing maintains character consistency
- ✅ NSFW support confirmed
- ✅ User can edit images while maintaining consistency

### Phase 3 (Video)

- ✅ Wan 2.6 deployed and working
- ✅ R2V consistency verified
- ✅ Text-to-video and image-to-video working
- ✅ User can generate videos with consistent characters

---

## Risk Mitigation

### Risk 1: Qwen Image 2512 NSFW Not Supported

**Mitigation**:
- Test NSFW early (Day 6-7 of Phase 1)
- Fallback: FLUX.2 [dev] (proven NSFW, but requires commercial license)
- Alternative: Keep Z-Image-Turbo if NSFW works

### Risk 2: Wan 2.6 API Costs Too High

**Mitigation**:
- Deploy Wan 2.5 (free commercial use) as alternative
- Compare API costs vs. self-hosting costs
- Use API only if self-hosting not feasible

### Risk 3: LoRA Training Complex for Wan 2.6

**Mitigation**:
- Start with R2V (no training needed)
- Research LoRA training separately
- Use R2V for immediate consistency, LoRA for future enhancement

---

## Next Steps

1. **Approve deployment plan** - Confirm priorities and timeline
2. **Start Phase 1** - Deploy Qwen Image 2512
3. **Test NSFW early** - Verify NSFW support before full integration
4. **Monitor costs** - Track Modal.com usage and costs
5. **Iterate based on user feedback** - Adjust priorities based on actual usage

---

**Last Updated**: 2026-01-28  
**Maintained By**: Infrastructure Team
