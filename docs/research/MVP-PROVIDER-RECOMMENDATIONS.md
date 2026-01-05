# MVP Third-Party Provider Recommendations

> **Date**: 2025-12-17  
> **Status**: Final Recommendations  
> **Purpose**: Clear recommendations for which third-party providers to use for MVP

---

## Executive Summary

Based on MVP requirements analysis, here are the **final recommendations** for third-party providers:

### ✅ **Use Now (MVP)**
1. **RunPod** - Primary image generation (NSFW critical)
2. **Fal.ai** - Fallback image generation (already integrated)
3. **OpenRouter.ai** - Prompt enhancement (replace direct APIs)
4. **Finby** - Payments (already integrated)
5. **PostHog** - Analytics (already integrated)
6. **Supabase Storage** - Image storage (already integrated)

### ⚠️ **Skip for MVP**
1. **Wiro.ai** - Evaluate in Phase 2 (after NSFW verification)
2. **Replicate** - Not needed (RunPod + Fal.ai sufficient)

---

## MVP Needs Analysis

### Critical Requirements

| Need | Priority | Current Status | Requirement |
|------|----------|----------------|-------------|
| **Image Generation (NSFW)** | CRITICAL | ✅ RunPod | Self-hosted, uncensored models |
| **LoRA Training** | CRITICAL | ✅ RunPod | Character consistency >95% |
| **Prompt Enhancement** | HIGH | ⚠️ Direct APIs | LLM-based prompt improvement |
| **Payments** | CRITICAL | ✅ Finby | Subscription processing |
| **Analytics** | HIGH | ✅ PostHog | Event tracking |
| **Storage** | CRITICAL | ✅ Supabase | Image storage |

---

## Provider Recommendations by Use Case

### 1. Image Generation ⭐⭐⭐⭐⭐

#### ✅ **Primary: RunPod (Self-Hosted)**
**Status**: ✅ Already implemented  
**Why**: 
- ✅ **NSFW support** (CRITICAL) - Proven uncensored Flux Dev
- ✅ **Self-hosted** - Full control, no API restrictions
- ✅ **LoRA training** - Required for character consistency
- ✅ **Cost-effective** - Pay only for GPU time
- ✅ **Proven** - Already working in codebase

**Models**:
- Flux Dev (uncensored) - Primary
- Z-Image-Turbo - Secondary (testing)

**Cost**: ~$0.05-0.07/image (dedicated pod) or ~$0.003-0.007/image (serverless)

---

#### ✅ **Fallback: Fal.ai (API)**
**Status**: ✅ Already integrated  
**Why**:
- ✅ Already implemented (`FalImageService`)
- ✅ Fast API-based generation
- ✅ Good for testing/fallback
- ⚠️ NSFW support unknown (model-dependent)

**Models**: Flux models via API

**Cost**: ~$0.05-0.15/image (estimated)

**Use Case**: Fallback when RunPod unavailable, testing new models

---

#### ⚠️ **Skip for MVP: Wiro.ai**
**Status**: ❌ Not implemented  
**Why Skip**:
- ❓ **NSFW support unknown** - Critical requirement
- ❌ **Cannot self-host** - API-only (less control)
- ⚠️ **Pricing unclear** - Need to verify
- ✅ **RunPod already works** - No need to add complexity

**When to Revisit**: Phase 2, after:
- [ ] Verify Seedream 4.5 NSFW support
- [ ] Compare pricing with RunPod
- [ ] Test quality vs Flux Dev

**Potential Use**: 
- Seedream 4.5 for SFW content (if NSFW verified)
- Qwen Image for editing (if NSFW verified)

---

### 2. Prompt Enhancement (LLM) ⭐⭐⭐⭐⭐

#### ✅ **Recommended: OpenRouter.ai**
**Status**: ⚠️ Not implemented (recommend adding)  
**Why**:
- ✅ **Better reliability** - Automatic fallback between providers
- ✅ **Cost savings** - 20-40% cheaper with smart model selection
- ✅ **More models** - 500+ models vs 2 providers currently
- ✅ **Easy integration** - OpenAI-compatible (drop-in replacement)
- ✅ **Single API key** - Simpler than managing multiple keys

**Current Setup**:
- Direct OpenAI API (`OpenAIProvider`)
- Direct Gemini API (`GeminiProvider`)

**Proposed Setup**:
- OpenRouter.ai as primary (with automatic fallback)
- Direct APIs as fallback

**Implementation**: 
- Create `OpenRouterProvider` class
- Replace/enhance current `AIProvider` implementations
- Estimated time: 4-6 hours

**Cost Savings**: 20-40% reduction with DeepSeek/Qwen models

---

#### ⚠️ **Keep as Fallback: Direct APIs**
**Status**: ✅ Already implemented  
**Why Keep**:
- ✅ Reliability fallback
- ✅ Already working
- ✅ No vendor lock-in

**Use Case**: Fallback if OpenRouter fails

---

### 3. LoRA Training ⭐⭐⭐⭐⭐

#### ✅ **Primary: RunPod (AI Toolkit)**
**Status**: ✅ Already planned  
**Why**:
- ✅ **Self-hosted** - Full control
- ✅ **NSFW support** - Required for character training
- ✅ **Proven** - AI Toolkit supports Flux and Z-Image
- ✅ **Cost-effective** - ~$2-5 per character

**Alternative**: Fal.ai 1.2.2 Trainer (if simpler, but NSFW unknown)

---

### 4. Payments ⭐⭐⭐⭐⭐

#### ✅ **Finby**
**Status**: ✅ Already integrated  
**Why**: 
- ✅ Already implemented
- ✅ Subscription processing
- ✅ Webhook support

**No changes needed**

---

### 5. Analytics ⭐⭐⭐⭐⭐

#### ✅ **PostHog**
**Status**: ✅ Already integrated  
**Why**:
- ✅ Already implemented
- ✅ Event tracking
- ✅ Free tier sufficient for MVP

**No changes needed**

---

### 6. Storage ⭐⭐⭐⭐⭐

#### ✅ **Supabase Storage**
**Status**: ✅ Already integrated  
**Why**:
- ✅ Already implemented
- ✅ Image storage
- ✅ Thumbnail generation

**No changes needed**

---

## Final Provider Stack for MVP

### Image Generation Stack

```
Primary: RunPod (Self-Hosted)
  ├── Flux Dev (uncensored) - NSFW support
  ├── Z-Image-Turbo - Fast generation
  └── LoRA Training (AI Toolkit)

Fallback: Fal.ai (API)
  └── Flux models - Testing/fallback
```

**Decision**: ✅ **Keep current stack** - RunPod primary, Fal.ai fallback

---

### Prompt Enhancement Stack

```
Primary: OpenRouter.ai (NEW - Recommended)
  ├── 500+ models available
  ├── Automatic fallback
  └── Cost optimization

Fallback: Direct APIs
  ├── OpenAI API
  └── Gemini API
```

**Decision**: ✅ **Add OpenRouter.ai** - Better reliability and cost savings

---

### Other Services

```
Payments: Finby ✅ (no change)
Analytics: PostHog ✅ (no change)
Storage: Supabase Storage ✅ (no change)
```

---

## Implementation Priority

### High Priority (Do Now)

#### 1. Add OpenRouter.ai for Prompt Enhancement ⭐⭐⭐⭐⭐
**Effort**: 4-6 hours  
**Impact**: High (cost savings, reliability)  
**Risk**: Low (drop-in replacement, fallback available)

**Steps**:
1. Create `OpenRouterProvider` class
2. Add to `ai-enhancer.ts`
3. Test with existing prompts
4. Deploy with fallback to direct APIs

---

### Medium Priority (Phase 2)

#### 2. Evaluate Wiro.ai for Image Generation ⭐⭐⭐
**Effort**: 1-2 weeks (testing)  
**Impact**: Medium (if NSFW works, could add Seedream 4.5)  
**Risk**: Medium (NSFW unknown, new dependency)

**Steps**:
1. Verify Seedream 4.5 NSFW support
2. Test quality vs Flux Dev
3. Compare costs
4. If successful, add as alternative for SFW content

---

## Cost Analysis

### Current MVP Costs (Estimated)

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| **RunPod** | $50-500 | Depends on volume (serverless vs dedicated) |
| **Fal.ai** | $0-50 | Fallback only |
| **OpenAI/Gemini** | $10-30 | Prompt enhancement |
| **Finby** | Variable | Per transaction |
| **PostHog** | $0 | Free tier |
| **Supabase Storage** | $0-10 | Free tier sufficient |
| **Total** | **$60-590** | + Finby fees |

### With OpenRouter.ai

| Service | Monthly Cost | Savings |
|---------|-------------|---------|
| **RunPod** | $50-500 | No change |
| **Fal.ai** | $0-50 | No change |
| **OpenRouter.ai** | $6-18 | **20-40% savings** vs direct APIs |
| **Finby** | Variable | No change |
| **PostHog** | $0 | No change |
| **Supabase Storage** | $0-10 | No change |
| **Total** | **$56-578** | **$4-12/month savings** |

**Annual Savings**: ~$50-150/year

---

## Risk Assessment

### Low Risk ✅

1. **OpenRouter.ai**
   - ✅ OpenAI-compatible (standard API)
   - ✅ Fallback to direct APIs available
   - ✅ No breaking changes
   - ✅ Easy to test

### Medium Risk ⚠️

2. **Wiro.ai**
   - ⚠️ NSFW support unknown
   - ⚠️ New dependency
   - ⚠️ Pricing unclear
   - ✅ Can skip for MVP (not critical)

---

## Decision Matrix

| Provider | Use Case | MVP Status | Recommendation | Priority |
|----------|----------|------------|----------------|----------|
| **RunPod** | Image generation | ✅ Implemented | ✅ **Keep as primary** | CRITICAL |
| **Fal.ai** | Image generation (fallback) | ✅ Implemented | ✅ **Keep as fallback** | HIGH |
| **OpenRouter.ai** | Prompt enhancement | ❌ Not implemented | ✅ **Add now** | HIGH |
| **Wiro.ai** | Image generation (alternative) | ❌ Not implemented | ⚠️ **Skip for MVP** | LOW |
| **Finby** | Payments | ✅ Implemented | ✅ **Keep** | CRITICAL |
| **PostHog** | Analytics | ✅ Implemented | ✅ **Keep** | HIGH |
| **Supabase Storage** | Image storage | ✅ Implemented | ✅ **Keep** | CRITICAL |

---

## Action Items

### Immediate (This Week)

- [ ] **Add OpenRouter.ai** for prompt enhancement
  - [ ] Create `OpenRouterProvider` class
  - [ ] Test with existing prompts
  - [ ] Deploy with fallback
  - [ ] Monitor costs

### Short-term (Next 2 Weeks)

- [ ] **Test OpenRouter models** for prompt enhancement
  - [ ] Compare quality (DeepSeek, Qwen vs OpenAI/Gemini)
  - [ ] Measure cost savings
  - [ ] Optimize model selection

### Medium-term (Phase 2)

- [ ] **Evaluate Wiro.ai** for image generation
  - [ ] Verify Seedream 4.5 NSFW support
  - [ ] Test quality vs Flux Dev
  - [ ] Compare costs
  - [ ] Decide if worth adding

---

## Summary

### ✅ **Recommended MVP Stack**

1. **Image Generation**: RunPod (primary) + Fal.ai (fallback)
2. **Prompt Enhancement**: OpenRouter.ai (new) + Direct APIs (fallback)
3. **LoRA Training**: RunPod (AI Toolkit)
4. **Payments**: Finby
5. **Analytics**: PostHog
6. **Storage**: Supabase Storage

### ⚠️ **Skip for MVP**

1. **Wiro.ai** - Evaluate in Phase 2 after NSFW verification
2. **Replicate** - Not needed (RunPod + Fal.ai sufficient)

### 💰 **Expected Savings**

- **OpenRouter.ai**: $4-12/month (20-40% savings on prompt enhancement)
- **Total MVP cost**: $56-578/month (vs $60-590 without OpenRouter)

---

## References

- **Current Implementation**: `docs/specs/EXTERNAL-DEPENDENCIES.md`
- **Image Generation**: `docs/research/FAL-AI-VS-RUNPOD-COMPARISON.md`
- **Wiro.ai Research**: `docs/research/WIRO-AI-RESEARCH.md`
- **OpenRouter Research**: `docs/research/OPENROUTER-AI-RESEARCH.md`
- **MVP Requirements**: `docs/requirements/epics/mvp/EP-005-content-studio.md`
- **Model Decision**: `docs/technical/MVP-MODEL-DECISION.md`

---

**Last Updated**: 2025-12-17  
**Status**: Final recommendations for MVP

