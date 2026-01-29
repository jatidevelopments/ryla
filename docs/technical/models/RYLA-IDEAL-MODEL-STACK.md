# RYLA Ideal Model Stack - Complete Recommendations

> **Date**: 2026-01-28  
> **Status**: Recommendations  
> **Purpose**: Comprehensive model recommendations for all RYLA use cases, optimized for Modal.com deployment, commercial use, NSFW support, and consistency

---

## Executive Summary

This document provides ideal model recommendations for RYLA across all use cases, prioritizing:
1. ✅ **Modal.com deployable** (can self-host and sell)
2. ✅ **Free commercial use** (Apache 2.0 or similar)
3. ✅ **NSFW support** (required for RYLA)
4. ✅ **Consistency capabilities** (LoRA training or multi-reference)
5. ✅ **High quality** (top ELO scores from leaderboards)

**Current RYLA Infrastructure:**
- ✅ Z-Image-Turbo deployed on Modal.com
- ✅ InstantID implemented (face consistency)
- ✅ IPAdapter FaceID implemented (face consistency)
- ✅ LoRA support implemented
- ✅ SeedVR2 (upscaling) implemented
- ✅ Wan2.1 (video) test implementation

---

## Use Case Recommendations

### 1. Text-to-Image Generation

#### Primary Model (Best Overall)

**Qwen Image 2512** ⭐⭐⭐⭐⭐
- **ELO**: 1141
- **License**: Apache 2.0 (free commercial use)
- **Open Source**: ✅ Yes
- **Modal.com**: ✅ Can deploy
- **NSFW**: ❓ Needs testing
- **Consistency**: ⭐⭐⭐⭐⭐ LoRA (proven >95% consistency)
- **Status**: Not yet deployed
- **Why**: Best balance of quality, free commercial use, LoRA consistency, and Modal.com deployment

**Implementation Priority**: HIGH
- Replace or complement Z-Image-Turbo
- Add to Modal.com deployment
- Test NSFW capabilities
- Integrate LoRA training support

#### Secondary Model (High Quality, Paid License)

**FLUX.2 [max]** or **FLUX.2 [pro]**
- **ELO**: 1205/1199 (higher quality than Qwen)
- **License**: ⚠️ Requires paid commercial license
- **Open Source**: ✅ Yes
- **Modal.com**: ✅ Can deploy
- **NSFW**: ✅ Yes (uncensored checkpoints available)
- **Consistency**: ⭐⭐⭐⭐⭐ LoRA (proven >95% consistency)
- **Status**: Not yet deployed
- **Why**: Highest quality option if budget allows for licensing fees

**Implementation Priority**: MEDIUM (if budget allows)
- Contact Black Forest Labs for commercial license pricing
- Compare cost vs. quality benefit over Qwen Image 2512
- Deploy if licensing cost is justified

#### Current Model (Keep as Fallback)

**Z-Image-Turbo**
- **Status**: ✅ Already deployed on Modal.com
- **Speed**: ⭐⭐⭐⭐⭐ (6-7 seconds)
- **Consistency**: ⭐⭐⭐⭐⭐ LoRA (proven)
- **NSFW**: ❓ Needs testing
- **Why**: Fast, proven, already working - keep as fast generation option

---

### 2. Image Editing / Inpainting

#### Primary Model

**Qwen Image Edit 2511** ⭐⭐⭐⭐⭐
- **ELO**: 1149
- **License**: Apache 2.0 (free commercial use)
- **Open Source**: ✅ Yes
- **Modal.com**: ✅ Can deploy
- **NSFW**: ❓ Needs testing
- **Consistency**: ⭐⭐⭐⭐⭐ LoRA (proven >95% consistency)
- **Status**: Not yet deployed
- **Why**: Best editing model with free commercial use and LoRA consistency

**Implementation Priority**: HIGH
- Add to Modal.com deployment
- Test NSFW capabilities
- Integrate with existing editing workflows

#### Alternative (API-Only, Multi-Reference)

**Seedream 4.5**
- **ELO**: 1202 (highest quality editing)
- **License**: ✅ Commercial use via API
- **Open Source**: ❌ No (API-only)
- **Modal.com**: ❌ Cannot deploy (API-only)
- **NSFW**: ❓ Unknown
- **Consistency**: ⭐⭐⭐⭐⭐ Multi-ref (excellent multi-reference editing)
- **Status**: Already documented in RYLA
- **Why**: Highest quality editing, excellent multi-reference support, but API-only

**Implementation Priority**: MEDIUM
- Use for high-quality editing when API cost is acceptable
- Integrate as external API option
- Compare quality vs. Qwen Image Edit 2511

---

### 3. Text-to-Video Generation

#### Primary Model

**Wan 2.6** ⭐⭐⭐⭐⭐
- **ELO**: 1228-1305 (top performer)
- **License**: ✅ Commercial use via API
- **Open Source**: ❌ No (but can deploy on Modal.com)
- **Modal.com**: ✅ Can deploy
- **NSFW**: ❓ Needs testing
- **Consistency**: ⭐⭐⭐⭐⭐ R2V + LoRA (excellent reference-to-video + LoRA training)
- **Status**: Test implementation exists (Wan2.1)
- **Why**: Top quality, R2V for immediate consistency, LoRA for maximum consistency

**Implementation Priority**: HIGH
- Upgrade from Wan2.1 to Wan 2.6
- Implement R2V (reference-to-video) for consistency
- Test LoRA training support (complex but possible)
- Test NSFW capabilities

#### Alternative (Free Commercial Use)

**Wan 2.5**
- **ELO**: 1132
- **License**: Apache 2.0 (free commercial use)
- **Open Source**: ✅ Yes
- **Modal.com**: ✅ Can deploy
- **NSFW**: ❓ Needs testing
- **Consistency**: ⭐⭐⭐⭐ R2V (good reference-to-video)
- **Status**: Not yet deployed
- **Why**: Free commercial use, good quality, R2V consistency

**Implementation Priority**: MEDIUM
- Consider if Wan 2.6 API costs are too high
- Deploy on Modal.com for free commercial use
- Test NSFW capabilities

#### API-Only Options (High Quality)

**Runway Gen-4.5** (ELO 1236)
- **License**: ✅ Commercial license on paid plans ($9.90+/month)
- **Why**: Highest quality, but API-only and subscription-based

**Kling 2.5/2.6** (ELO 1228-1305)
- **License**: ✅ Commercial use on paid plans ($0.049-0.098/second)
- **Why**: High quality with native audio, but API-only

**Implementation Priority**: LOW (use as fallback if self-hosted options fail)

---

### 4. Image-to-Video Generation

#### Primary Model

**Wan 2.6** ⭐⭐⭐⭐⭐
- **ELO**: 1305 (highest quality)
- **License**: ✅ Commercial use via API
- **Modal.com**: ✅ Can deploy
- **Consistency**: ⭐⭐⭐⭐⭐ R2V + LoRA
- **Why**: Highest quality, R2V for consistency, can deploy on Modal.com

**Implementation Priority**: HIGH
- Same as text-to-video (Wan 2.6 supports both)

#### Alternative

**Wan 2.5**
- **ELO**: 1132
- **License**: Apache 2.0 (free commercial use)
- **Why**: Free commercial use alternative

---

### 5. Video Editing

#### Current Status

**No dedicated video editing models** in top leaderboards. Video editing typically uses:
- Image-to-video models with reference frames
- Frame-by-frame image editing + video generation
- Specialized video editing tools (not in leaderboards)

#### Recommendations

**Use Image Editing Models + Video Generation:**
1. Edit frames using **Qwen Image Edit 2511** or **Seedream 4.5**
2. Generate video using **Wan 2.6** with edited frames as reference

**Future Research:**
- Monitor for video editing-specific models
- Consider frame interpolation models for smooth transitions

---

### 6. Face Swapping / Face Consistency

#### Primary Method (Already Implemented)

**InstantID** ⭐⭐⭐⭐⭐
- **Consistency**: 85-90% face match
- **Status**: ✅ Already implemented in codebase
- **Modal.com**: ✅ Deployed (`/sdxl-instantid` endpoint)
- **NSFW**: ✅ Yes
- **Why**: Best balance of consistency and speed, already proven in production

**Implementation**: ✅ Complete
- Use for immediate face consistency (no training needed)
- Better than PuLID for extreme angles
- Already used in `profile-picture-set.service.ts`

#### Secondary Method (For Flux Models)

**IPAdapter FaceID (Flux)** ⭐⭐⭐⭐
- **Consistency**: 80-85% face match
- **Status**: ✅ Implemented (`/flux-ipadapter-faceid` endpoint)
- **Modal.com**: ✅ Deployed
- **NSFW**: ✅ Yes
- **Why**: Compatible with Flux Dev (InstantID incompatible with Flux)

**Implementation**: ✅ Complete
- Use for Flux Dev face consistency
- Alternative to InstantID for Flux workflows

#### Maximum Consistency Method

**LoRA Training** ⭐⭐⭐⭐⭐
- **Consistency**: >95% face match
- **Status**: ✅ Infrastructure implemented
- **Models**: Works with Qwen Image 2512, FLUX.2, Z-Image-Turbo
- **Why**: Best consistency for production quality

**Implementation**: ✅ Complete (training infrastructure)
- Use for maximum consistency (>95%)
- Train LoRAs for long-term character use
- Works with all primary text-to-image models

---

### 7. Upscaling

#### Current Model

**SeedVR2** ⭐⭐⭐⭐⭐
- **Status**: ✅ Already implemented on Modal.com
- **Quality**: Excellent upscaling quality
- **Why**: Already working, proven quality

**Implementation**: ✅ Complete
- Keep as primary upscaling solution
- Monitor for newer upscaling models if needed

---

### 8. Background Removal

#### Current Status

**Not in leaderboards** - Background removal is typically a separate specialized model.

#### Recommendations

**Research Needed:**
- Check for open-source background removal models
- Consider API services (Remove.bg, etc.) if needed
- May not be critical for MVP

---

## Complete Model Stack Summary

### Text-to-Image
1. **Primary**: Qwen Image 2512 (free commercial, LoRA consistency)
2. **Secondary**: FLUX.2 [max]/[pro] (if budget allows, highest quality)
3. **Fast Fallback**: Z-Image-Turbo (already deployed, fast)

### Image Editing
1. **Primary**: Qwen Image Edit 2511 (free commercial, LoRA consistency)
2. **Alternative**: Seedream 4.5 (API-only, highest quality, multi-reference)

### Text-to-Video
1. **Primary**: Wan 2.6 (top quality, R2V + LoRA consistency)
2. **Alternative**: Wan 2.5 (free commercial use)

### Image-to-Video
1. **Primary**: Wan 2.6 (top quality, R2V + LoRA consistency)
2. **Alternative**: Wan 2.5 (free commercial use)

### Face Consistency
1. **Quick**: InstantID (85-90%, already implemented)
2. **Flux**: IPAdapter FaceID (80-85%, already implemented)
3. **Maximum**: LoRA Training (>95%, infrastructure ready)

### Upscaling
1. **Primary**: SeedVR2 (already implemented)

---

## Implementation Roadmap

> **📋 See `RYLA-PRIORITY-DEPLOYMENT-PLAN.md` for detailed, prioritized deployment plan with timelines and user value analysis.**

### Phase 1: High Priority (Next 2-4 weeks)

1. **Deploy Qwen Image 2512 on Modal.com** ⭐ **PRIORITY 1**
   - Add to Modal.com deployment
   - Test NSFW capabilities
   - Integrate LoRA training support
   - Replace or complement Z-Image-Turbo
   - **User Value**: Hyper-realistic + >95% consistency

2. **Deploy Qwen Image Edit 2511 on Modal.com** ⭐ **PRIORITY 2**
   - Add editing capabilities
   - Test NSFW capabilities
   - Integrate with existing workflows
   - **User Value**: High-quality editing + >95% consistency

3. **Upgrade Wan2.1 to Wan 2.6** ⭐ **PRIORITY 3**
   - Implement R2V (reference-to-video)
   - Test LoRA training support
   - Test NSFW capabilities
   - **User Value**: Top-quality video + R2V consistency

### Phase 2: Medium Priority (Next 1-2 months)

4. **Evaluate FLUX.2 Commercial License**
   - Contact Black Forest Labs for pricing
   - Compare cost vs. quality benefit
   - Deploy if justified

5. **Integrate Seedream 4.5 API**
   - Add as high-quality editing option
   - Compare with Qwen Image Edit 2511
   - Use for multi-reference workflows

### Phase 3: Low Priority (Future)

6. **Monitor for New Models**
   - Video editing models
   - Background removal models
   - New open-source alternatives

---

## Cost Analysis

### Free Commercial Use Models (No Licensing Fees)

- **Qwen Image 2512**: Free (self-hosted on Modal.com)
- **Qwen Image Edit 2511**: Free (self-hosted on Modal.com)
- **Wan 2.5**: Free (self-hosted on Modal.com)
- **Z-Image-Turbo**: Free (already deployed)
- **InstantID**: Free (already deployed)
- **IPAdapter FaceID**: Free (already deployed)
- **SeedVR2**: Free (already deployed)

**Total Licensing Cost**: $0/month

### Paid License Models (If Used)

- **FLUX.2 [max]/[pro]**: Contact Black Forest Labs for pricing
- **Wan 2.6**: Commercial via API (pricing varies)

### API-Only Models (If Used)

- **Seedream 4.5**: $0.045/image
- **Runway Gen-4.5**: $9.90+/month subscription
- **Kling 2.5/2.6**: $0.049-0.098/second

---

## NSFW Support Status

### Confirmed NSFW Support
- ✅ **FLUX.2 family** (uncensored checkpoints available)
- ✅ **Z-Image-Turbo** (needs verification)
- ✅ **InstantID** (works with NSFW)
- ✅ **IPAdapter FaceID** (works with NSFW)
- ✅ **LoRA Training** (works with NSFW models)

### Needs Testing
- ❓ **Qwen Image 2512** (open source, needs testing)
- ❓ **Qwen Image Edit 2511** (open source, needs testing)
- ❓ **Wan 2.5/2.6** (needs testing)

### No NSFW Support
- ❌ **Nano Banana Pro** (Google proprietary, no NSFW)
- ❌ **Seedream 4.5** (likely restricted, needs verification)

---

## Consistency Capabilities Summary

### Maximum Consistency (>95%)
- **LoRA Training**: Qwen Image 2512, FLUX.2 family, Z-Image-Turbo
- **Wan 2.6 LoRA**: Complex but possible (24-72 hours training)

### Good Consistency (85-90%)
- **InstantID**: Already implemented, 85-90% consistency
- **Wan 2.6 R2V**: Reference-to-video, no training needed

### Multi-Reference Consistency
- **Seedream 4.5**: Excellent multi-reference editing (6-9 images)
- **Wan 2.6 R2V**: Multi-reference video (1-3 reference videos)

---

## Recommendations Summary

### ✅ Immediate Actions

1. **Deploy Qwen Image 2512** - Best overall text-to-image model
2. **Deploy Qwen Image Edit 2511** - Best editing model
3. **Upgrade to Wan 2.6** - Best video model with R2V

### ⚠️ Evaluate

4. **FLUX.2 Commercial License** - If budget allows and quality justifies cost
5. **Seedream 4.5 API** - For high-quality multi-reference editing

### ✅ Already Complete

6. **InstantID** - Face consistency (already implemented)
7. **IPAdapter FaceID** - Flux face consistency (already implemented)
8. **LoRA Infrastructure** - Training support (already implemented)
9. **SeedVR2** - Upscaling (already implemented)
10. **Z-Image-Turbo** - Fast generation (already deployed)

---

## Next Steps

1. **Test NSFW capabilities** for Qwen Image 2512, Qwen Image Edit 2511, and Wan 2.5/2.6
2. **Deploy Qwen Image 2512** on Modal.com
3. **Deploy Qwen Image Edit 2511** on Modal.com
4. **Upgrade Wan2.1 to Wan 2.6** with R2V support
5. **Evaluate FLUX.2 commercial license** pricing
6. **Integrate Seedream 4.5 API** for high-quality editing

---

**Last Updated**: 2026-01-28  
**Maintained By**: Infrastructure Team
