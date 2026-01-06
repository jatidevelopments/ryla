# Wiro.ai Research & MVP Integration Analysis

> **Date**: 2025-12-17  
> **Status**: Research & Evaluation  
> **Purpose**: Analyze Wiro.ai as unified API platform for RYLA MVP image generation  
> **Source**: [Wiro.ai](https://wiro.ai/)

---

## Executive Summary

**Wiro.ai** is a unified API platform providing access to **hundreds of AI models** through a single interface. It offers models for image generation, video generation, text generation, and audio generation, with clear pricing and simple integration.

**Key Finding**: Wiro.ai provides access to several models already in RYLA's research pipeline (Seedream 4.5, Nano Banana Pro, Qwen Image) plus many others, potentially simplifying integration and providing fallback options.

**Recommendation**: **Evaluate as alternative/complement to Fal.ai** for API-based image generation. Particularly valuable for accessing Seedream 4.5 and Qwen Image models that are already on RYLA's evaluation list.

---

## Platform Overview

### What is Wiro.ai?

- **Type**: Unified API platform for AI models
- **Purpose**: Single API to access hundreds of AI models
- **Value Proposition**: "No infrastructure, no complexity" - add AI to apps in minutes
- **Target**: Developers building AI-powered applications
- **Website**: https://wiro.ai/

### Key Features

1. **Unified API Interface**
   - Single API endpoint for all models
   - Consistent request/response format
   - Simple integration

2. **Wide Model Selection**
   - 82+ tools/models available
   - Image generation (8 models)
   - Image editing (29 models)
   - Video generation (16 models)
   - Text generation (7 models)
   - Audio generation (4 models)

3. **Developer-Friendly**
   - Fast integration
   - Clear documentation
   - Simple pricing model
   - Task history tracking

---

## Relevant Models for RYLA MVP

### Image Generation Models

#### 1. ByteDance/seedream-v4-5 ⭐⭐⭐⭐⭐
**Status**: Already in RYLA research pipeline

- **Purpose**: Fast high-resolution image generation and editing
- **Features**:
  - Text-to-image
  - Multi-image input
  - Advanced creative workflows
  - High resolution
- **Pricing**: Not shown in search results (need to verify)
- **RYLA Relevance**: ⭐⭐⭐⭐⭐ **HIGH** - Already identified as top candidate in `MODEL-CAPABILITIES-MATRIX.md`
- **Use Case**: Base image generation, potentially replacing Flux Dev for SFW content

**From RYLA Research**:
- Score: 9/10 (if NSFW works)
- Quality: ⭐⭐⭐⭐⭐
- Speed: ⭐⭐⭐⭐⭐
- Cost: ⭐⭐⭐⭐⭐
- API: ✅ Yes

---

#### 2. ByteDance/seedream-v4 ⭐⭐⭐⭐
**Status**: Alternative to v4.5

- **Purpose**: Fast high-resolution image generation and editing
- **Features**: Similar to v4.5, earlier version
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐⭐ **MEDIUM** - Fallback if v4.5 unavailable
- **Use Case**: Base image generation

---

#### 3. google/nano-banana-pro ⭐⭐⭐
**Status**: Already evaluated, not recommended

- **Purpose**: Google's Gemini 3 Pro Image Preview model
- **Features**: Text-to-image, image-to-image
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐ **LOW** - Already identified as:
  - No NSFW support ❌
  - Expensive ($0.15/image) ⚠️
  - Score: 5/10 in research
- **Use Case**: Not recommended for MVP

**From RYLA Research** (`MODEL-CAPABILITIES-MATRIX.md`):
- Score: 5/10
- NSFW: ❌ No
- Cost: ⭐⭐ (expensive)
- Recommendation: "Not Recommended: Nano Banana Pro (no NSFW, expensive $0.15/image)"

---

#### 4. pruna/qwen-image-edit-plus ⭐⭐⭐⭐
**Status**: New discovery

- **Purpose**: Qwen Image Edit Plus powered by Pruna AI
- **Features**: Image editing capabilities
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐⭐ **MEDIUM-HIGH** - Qwen Image already in research pipeline
- **Use Case**: Image editing, post-processing

**From RYLA Research**:
- Qwen-Image identified as candidate for:
  - Base image generation (unique faces)
  - Image editing (precise editing)
  - Score: 8/10 (if NSFW works)

---

#### 5. pruna/wan-image-small ⭐⭐⭐
**Status**: New discovery

- **Purpose**: Highly optimized, resource-efficient AI model
- **Features**: Rapid high-quality, cinematic images from text
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐ **MEDIUM** - Could be useful for fast generation
- **Use Case**: Fast image generation

---

#### 6. reve/Generate, reve/Remix, reve/Edit ⭐⭐⭐⭐
**Status**: New discovery

- **Purpose**: Reve models for generation, remixing, and editing
- **Features**:
  - `reve/Generate`: Text-to-image
  - `reve/Remix`: Combine text + reference images
  - `reve/Edit`: Modify existing images with text
  - Fast versions available (`reve/Remix-Fast`, `reve/Edit-Fast`)
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐⭐ **MEDIUM-HIGH** - Could be useful for:
  - Fast generation (fast versions)
  - Image remixing with reference images
  - Image editing workflows
- **Use Case**: Alternative to Flux Dev for certain workflows

---

### Video Generation Models (Phase 2+)

#### 1. openai/sora-2, openai/sora-2-pro ⭐⭐⭐⭐⭐
**Status**: Future consideration

- **Purpose**: OpenAI's Sora 2 models for video generation
- **Features**: Text-to-video, image-to-video
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐ **LOW** (Phase 2+) - Video generation not in MVP
- **Use Case**: Future video features

---

#### 2. google/veo3.1-fast ⭐⭐⭐⭐
**Status**: Future consideration

- **Purpose**: High-fidelity 720p/1080p videos with audio
- **Features**: Image-to-video, scene control
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐ **LOW** (Phase 2+) - Video generation not in MVP
- **Use Case**: Future video features

---

#### 3. MiniMax/hailuo-2.3-Fast ⭐⭐⭐⭐
**Status**: Future consideration

- **Purpose**: Optimized for low latency, stable motion
- **Features**: Large animation sets, motion previews
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐ **LOW** (Phase 2+) - Video generation not in MVP
- **Use Case**: Future video features

---

### Specialized Tools

#### 1. wiro/camera-angle-editor ⭐⭐⭐⭐
**Status**: Potentially useful

- **Purpose**: Instantly change camera perspective and angle of existing images
- **Features**:
  - Spatial reconstruction
  - Photorealistic new viewpoints
  - No reshoots needed
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐⭐⭐ **MEDIUM-HIGH** - Could be useful for:
  - Character sheet generation (different angles)
  - Post-processing existing images
  - Creating variations from single image
- **Use Case**: Alternative to ControlNet for angle variations

---

#### 2. wiro/Product-Photoshoot ⭐⭐⭐
**Status**: Not directly relevant

- **Purpose**: Generate polished product images
- **Features**: Adaptive lighting, varied angles, contextual scenes
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐ **LOW** - Product photography not RYLA's use case
- **Use Case**: Not applicable

---

#### 3. wiro/Virtual-Try-On ⭐⭐⭐
**Status**: Not directly relevant

- **Purpose**: Hyper-realistic apparel fitting
- **Features**: Texture mapping, pose alignment, fabric simulation
- **Pricing**: Not shown (need to verify)
- **RYLA Relevance**: ⭐⭐ **LOW** - Virtual try-on not RYLA's use case
- **Use Case**: Not applicable

---

## Pricing Analysis

### Pricing Model

From the website, Wiro.ai appears to use:
- **Budget-based pricing**: $25 budget shown in examples
- **Per-request pricing**: Models have per-request costs
- **Example pricing shown**:
  - `seedance-pro-v1.5`: $0.072 - $0.624 per request (varies by duration/resolution)
  - Various models with different pricing tiers

### Pricing Comparison

| Model | Wiro.ai (Estimated) | Current RYLA | Notes |
|-------|---------------------|--------------|-------|
| **Seedream 4.5** | TBD | Not integrated | Need to verify pricing |
| **Nano Banana Pro** | TBD | $0.15/image (from research) | Already expensive |
| **Qwen Image** | TBD | Not integrated | Need to verify pricing |
| **Flux Dev** | N/A | RunPod (self-hosted) | Different model |
| **Z-Image-Turbo** | N/A | RunPod (self-hosted) | Different model |

**⚠️ Action Required**: Verify exact pricing for relevant models before integration

---

## Integration Analysis

### Current RYLA Architecture

**Current Setup**:
1. **RunPod** (Primary): Self-hosted ComfyUI infrastructure
   - Flux Dev (uncensored for NSFW)
   - Z-Image-Turbo
   - PULID workflows
   - LoRA training
   - Full control, custom workflows

2. **Fal.ai** (Alternative API): Already integrated
   - `FalImageService` implemented
   - Used for Flux models via API
   - Fallback when RunPod unavailable
   - Location: `apps/api/src/modules/image/services/fal-image.service.ts`

3. **Replicate** (Mentioned, not actively used)
   - Listed in `EXTERNAL-DEPENDENCIES.md`
   - Not currently integrated

### How Wiro.ai Fits

#### Option 1: Alternative to Fal.ai ⭐⭐⭐⭐
**Best for: API-based image generation**

**Advantages**:
- Access to Seedream 4.5 (already in research pipeline)
- Access to Qwen Image models
- Unified API (similar to Fal.ai)
- Multiple model options (fallback if one fails)
- Simple integration

**Disadvantages**:
- Need to verify NSFW support for each model
- Pricing may be higher than self-hosted RunPod
- Less control than self-hosted
- New dependency (adds complexity)

**Implementation**:
- Create `WiroImageService` similar to `FalImageService`
- Add as alternative provider in `StudioGenerationService`
- Use for Seedream 4.5 and Qwen Image models

---

#### Option 2: Complement to Current Stack ⭐⭐⭐⭐⭐
**Best for: Specific use cases**

**Use Cases**:
1. **Seedream 4.5** for SFW base image generation
   - If NSFW support verified
   - Potentially better quality than Flux Dev
   - Faster than RunPod (API vs self-hosted)

2. **Qwen Image** for image editing
   - Precise editing capabilities
   - Post-processing workflows
   - Image enhancement

3. **Reve models** for fast generation
   - Fast versions for quick iterations
   - Remix capabilities with reference images

4. **Camera Angle Editor** for character sheets
   - Alternative to ControlNet for angle variations
   - Faster than generating new images

**Implementation**:
- Keep RunPod as primary (NSFW, LoRA, full control)
- Use Wiro.ai for specific models/use cases
- Route requests based on:
  - Model availability
  - NSFW requirement
  - Speed requirements
  - Cost optimization

---

#### Option 3: Fallback Provider ⭐⭐⭐
**Best for: Reliability**

**Use Cases**:
- When RunPod is down
- When Fal.ai is unavailable
- When specific model needed (Seedream 4.5, Qwen Image)

**Implementation**:
- Add as third-tier fallback
- Priority: RunPod → Fal.ai → Wiro.ai
- Use for specific models not available elsewhere

---

## MVP Integration Recommendations

### High Priority (Implement Now)

#### 1. Seedream 4.5 Integration ⭐⭐⭐⭐⭐
**Why**: Already in research pipeline, top candidate

**Steps**:
1. Verify NSFW support
2. Verify pricing
3. Create `WiroImageService` (similar to `FalImageService`)
4. Add `ByteDance/seedream-v4-5` as model option
5. Test quality vs Flux Dev
6. Add to model selection logic

**Estimated Time**: 2-3 days

**Use Case**: SFW base image generation (if NSFW works, could replace Flux Dev for some use cases)

---

#### 2. Qwen Image Integration ⭐⭐⭐⭐
**Why**: Already in research pipeline, good for editing

**Steps**:
1. Verify NSFW support
2. Verify pricing
3. Add Qwen Image models to `WiroImageService`
4. Test for:
   - Base image generation (unique faces)
   - Image editing (precise editing)
5. Compare with current methods

**Estimated Time**: 2-3 days

**Use Case**: Image editing, alternative base image generation

---

### Medium Priority (Test in Parallel)

#### 3. Reve Models Integration ⭐⭐⭐
**Why**: Fast generation, remix capabilities

**Steps**:
1. Test `reve/Generate` for fast text-to-image
2. Test `reve/Remix` for reference image workflows
3. Test `reve/Edit` for image editing
4. Compare speed/quality with current methods

**Estimated Time**: 1-2 days

**Use Case**: Fast generation, image remixing

---

#### 4. Camera Angle Editor ⭐⭐⭐
**Why**: Could simplify character sheet generation

**Steps**:
1. Test `wiro/camera-angle-editor` for angle variations
2. Compare with ControlNet approach
3. Evaluate quality and speed

**Estimated Time**: 1 day

**Use Case**: Character sheet generation (alternative to ControlNet)

---

### Low Priority (Future Consideration)

#### 5. Video Models (Phase 2+)
- Sora 2, Veo 3.1, Hailuo 2.3
- Not in MVP scope
- Monitor for Phase 2

---

## Comparison: Wiro.ai vs Current Stack

| Aspect | RunPod (Current) | Fal.ai (Current) | Wiro.ai (Proposed) |
|--------|------------------|------------------|-------------------|
| **Type** | Self-hosted infrastructure | API provider | API provider |
| **Control** | ⭐⭐⭐⭐⭐ Full control | ⭐⭐⭐ Limited | ⭐⭐⭐ Limited |
| **NSFW Support** | ✅ Full (uncensored models) | ⚠️ Varies by model | ⚠️ Need to verify |
| **Cost** | ⭐⭐⭐⭐ Self-hosted (pay for GPU time) | ⭐⭐⭐ Per-request | ⭐⭐⭐ Per-request |
| **Speed** | ⭐⭐⭐ Medium (self-hosted) | ⭐⭐⭐⭐ Fast (API) | ⭐⭐⭐⭐ Fast (API) |
| **Model Selection** | ⭐⭐⭐⭐ Custom (any model) | ⭐⭐⭐⭐ Many models | ⭐⭐⭐⭐⭐ 82+ models |
| **Seedream 4.5** | ❌ Not available | ❌ Not available | ✅ Available |
| **Qwen Image** | ⚠️ Need to set up | ❌ Not available | ✅ Available |
| **LoRA Training** | ✅ Full support | ⚠️ Limited | ❌ Not available |
| **Custom Workflows** | ✅ Full (ComfyUI) | ❌ Limited | ❌ Limited |
| **Integration Complexity** | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Low | ⭐⭐⭐⭐ Low |

---

## Implementation Plan

### Phase 1: Research & Verification (Week 1)

1. **Verify Model Availability**
   - [ ] Check Seedream 4.5 NSFW support
   - [ ] Check Qwen Image NSFW support
   - [ ] Verify pricing for relevant models
   - [ ] Test API access and rate limits

2. **Compare with Current Stack**
   - [ ] Quality comparison: Seedream 4.5 vs Flux Dev
   - [ ] Speed comparison: Wiro.ai vs RunPod vs Fal.ai
   - [ ] Cost comparison: Wiro.ai vs RunPod vs Fal.ai

---

### Phase 2: Integration (Week 2-3)

1. **Create WiroImageService**
   - [ ] Create `apps/api/src/modules/image/services/wiro-image.service.ts`
   - [ ] Similar structure to `FalImageService`
   - [ ] Support for Seedream 4.5 and Qwen Image models
   - [ ] Error handling and retry logic

2. **Update Studio Generation**
   - [ ] Add Wiro.ai as provider option in `StudioGenerationService`
   - [ ] Add model selection logic
   - [ ] Route requests based on model availability

3. **Update Configuration**
   - [ ] Add `WIRO_API_KEY` to env vars
   - [ ] Update `EXTERNAL-DEPENDENCIES.md`
   - [ ] Add to service configuration

---

### Phase 3: Testing & Optimization (Week 4)

1. **Quality Testing**
   - [ ] Test Seedream 4.5 for base image generation
   - [ ] Test Qwen Image for editing
   - [ ] Compare results with current methods

2. **Performance Testing**
   - [ ] Measure API response times
   - [ ] Test rate limits
   - [ ] Optimize request batching

3. **Cost Analysis**
   - [ ] Track costs per generation
   - [ ] Compare with RunPod costs
   - [ ] Optimize model selection based on cost

---

## Code Structure

### Proposed Service Structure

```typescript
// apps/api/src/modules/image/services/wiro-image.service.ts

@Injectable()
export class WiroImageService {
  private readonly logger = new Logger(WiroImageService.name);
  
  // Similar to FalImageService structure
  async runSeedreamV45(input: WiroRunInput): Promise<WiroRunOutput>
  async runQwenImage(input: WiroRunInput): Promise<WiroRunOutput>
  async runReveGenerate(input: WiroRunInput): Promise<WiroRunOutput>
  // ... other models
}
```

### Integration Points

1. **StudioGenerationService**
   - Add `wiro` as provider option
   - Model selection logic

2. **BaseImageGenerationService**
   - Add Wiro.ai support for base images
   - Fallback chain: RunPod → Fal.ai → Wiro.ai

3. **Model Registry**
   - Add Wiro.ai models to `libs/shared/src/models/registry.ts`
   - Update UI model selector

---

## Risks & Considerations

### Risks

1. **NSFW Support Unknown**
   - ⚠️ Need to verify for each model
   - ⚠️ May limit use cases
   - **Mitigation**: Test before integration

2. **Pricing Uncertainty**
   - ⚠️ Pricing not fully disclosed in search results
   - ⚠️ May be expensive at scale
   - **Mitigation**: Verify pricing, compare with alternatives

3. **Vendor Lock-in**
   - ⚠️ New dependency
   - ⚠️ API changes could break integration
   - **Mitigation**: Abstract service layer, keep alternatives

4. **Model Availability**
   - ⚠️ Models may be removed/changed
   - ⚠️ No control over model updates
   - **Mitigation**: Monitor changes, have fallbacks

### Considerations

1. **Keep RunPod as Primary**
   - Full control for NSFW content
   - LoRA training capabilities
   - Custom workflows

2. **Use Wiro.ai for Specific Models**
   - Seedream 4.5 (if NSFW works)
   - Qwen Image (for editing)
   - Models not available elsewhere

3. **Maintain Fallback Chain**
   - RunPod → Fal.ai → Wiro.ai
   - Ensure reliability

---

## Questions to Resolve

### High Priority

1. **NSFW Support**
   - [ ] Does Seedream 4.5 support NSFW?
   - [ ] Does Qwen Image support NSFW?
   - [ ] What are the limitations?

2. **Pricing**
   - [ ] What is the exact pricing for Seedream 4.5?
   - [ ] What is the exact pricing for Qwen Image?
   - [ ] Are there volume discounts?
   - [ ] What are rate limits?

3. **API Details**
   - [ ] What is the API endpoint structure?
   - [ ] What is the authentication method?
   - [ ] What are request/response formats?
   - [ ] What are error handling requirements?

### Medium Priority

4. **Model Capabilities**
   - [ ] What are the exact capabilities of each model?
   - [ ] What are the input/output formats?
   - [ ] What are the limitations?

5. **Performance**
   - [ ] What are typical response times?
   - [ ] What are rate limits?
   - [ ] What is the reliability/SLA?

---

## Next Steps

1. **Immediate** (This Week):
   - [ ] Sign up for Wiro.ai account
   - [ ] Review API documentation
   - [ ] Test Seedream 4.5 API
   - [ ] Verify NSFW support
   - [ ] Get pricing information

2. **Short-term** (Next 2 Weeks):
   - [ ] Implement `WiroImageService`
   - [ ] Integrate Seedream 4.5
   - [ ] Test quality vs Flux Dev
   - [ ] Compare costs

3. **Medium-term** (Next Month):
   - [ ] Integrate Qwen Image models
   - [ ] Test Reve models
   - [ ] Evaluate Camera Angle Editor
   - [ ] Optimize model selection logic

---

## References

- **Wiro.ai Website**: https://wiro.ai/
- **RYLA Research**: `docs/technical/MODEL-CAPABILITIES-MATRIX.md`
- **Current Integration**: `apps/api/src/modules/image/services/fal-image.service.ts`
- **External Dependencies**: `docs/specs/EXTERNAL-DEPENDENCIES.md`

---

**Last Updated**: 2025-12-17  
**Next Review**: After API testing and pricing verification

