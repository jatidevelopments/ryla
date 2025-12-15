# cDream v4 / Seedream 4.0 - Action Items

> **Date**: 2025-12-10  
> **Status**: Research Complete - Action Required  
> **Priority**: High (Potential primary base image generator)

---

## Critical Verification Tasks

### 1. Identify Exact Service ⚠️ **BLOCKING**

**Task**: Determine which service provides "cDream v4" at $0.03/image

**Options to Test**:
- [ ] **EvoLink** - Claims $0.025/image for Seedream 4.0 API
- [ ] **Atlascloud.ai** - Enterprise Seedream V4 API
- [ ] **ByteDance Seed Platform** - Official platform
- [ ] **Other services** - Various subscription services

**Action**:
1. Visit each service website
2. Check pricing and API availability
3. Sign up for trial/test account
4. Verify $0.025-0.03/image pricing

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

### 2. Test NSFW Support ⚠️ **CRITICAL**

**Task**: Verify if cDream v4 / Seedream 4.0 supports NSFW content

**Why Critical**:
- RYLA requires NSFW support
- Chinese company (ByteDance) may restrict NSFW
- Closed-source service (can't verify)

**Action**:
1. Get API access
2. Generate test NSFW image
3. Document results
4. If fails, mark as SFW-only option

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

**Fallback**: Flux Dev (uncensored) if NSFW fails

---

### 3. Test API Integration

**Task**: Test API endpoints and integration

**Endpoints to Test**:
- [ ] Text-to-image generation
- [ ] Edit model (image-to-image)
- [ ] Authentication
- [ ] Error handling
- [ ] Rate limits

**Action**:
1. Get API documentation
2. Create test integration
3. Test all endpoints
4. Document integration steps

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

### 4. Quality Comparison

**Task**: Compare cDream v4 quality vs alternatives

**Comparison Points**:
- [ ] Base image quality
- [ ] Skin detail
- [ ] Face uniqueness
- [ ] Realism
- [ ] Consistency

**Action**:
1. Generate test images with same prompts
2. Side-by-side comparison
3. Document findings
4. Score vs alternatives

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

### 5. Cost Verification

**Task**: Verify actual costs vs estimates

**Costs to Verify**:
- [ ] Per-image pricing
- [ ] API call costs
- [ ] Any hidden fees
- [ ] Subscription vs pay-per-use

**Action**:
1. Check pricing page
2. Contact sales if needed
3. Calculate actual costs for RYLA use case
4. Compare with alternatives

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

## Integration Tasks (After Verification)

### 6. Create API Client

**Task**: Build TypeScript client for cDream v4 API

**Requirements**:
- [ ] Base image generation
- [ ] Edit model (if available)
- [ ] Error handling
- [ ] Type definitions
- [ ] Rate limiting

**Location**: `libs/business/src/services/cdream-client.ts`

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

### 7. Update Base Image Service

**Task**: Integrate cDream v4 into base image generation service

**Requirements**:
- [ ] Add cDream v4 as option
- [ ] NSFW routing logic
- [ ] Fallback to Flux Dev if NSFW needed
- [ ] Cost tracking

**Location**: `apps/api/src/modules/image/services/base-image-generation.service.ts`

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

### 8. Update Documentation

**Task**: Update all documentation with verified information

**Documents to Update**:
- [ ] `MODEL-CAPABILITIES-MATRIX.md`
- [ ] `IMAGE-GENERATION-FLOW.md`
- [ ] `MODEL-RESEARCH-SUMMARY.md`
- [ ] `CDREAM-V4-RESEARCH.md` (this file)

**Owner**: [TBD]  
**Due Date**: [TBD]  
**Status**: ⚠️ Not Started

---

## Decision Matrix

### If NSFW Works ✅

**Action**: 
- Use cDream v4 as **primary** base image generator
- Use cDream v4 edit model for character sheets (if available)
- Keep Flux Dev as fallback

**Reason**: Cheapest option ($0.025-0.03/image) with excellent quality

---

### If NSFW Fails ❌

**Action**:
- Use cDream v4 for **SFW-only** base images
- Use Flux Dev (uncensored) for **NSFW** base images
- Implement NSFW routing logic

**Reason**: Still cost-effective for SFW, need Flux Dev for NSFW

---

### If API Not Available ⚠️

**Action**:
- Skip cDream v4
- Use Flux Dev or Qwen-Image as primary
- Continue with current plan

**Reason**: Can't integrate without API

---

## Timeline

### Week 1: Verification
- Day 1-2: Identify exact service
- Day 3-4: Test NSFW support
- Day 5: Test API integration

### Week 2: Integration (If Verified)
- Day 1-2: Create API client
- Day 3-4: Update base image service
- Day 5: Testing

### Week 3: Production (If Successful)
- Day 1-2: Deploy and monitor
- Day 3-5: Optimize and document

---

## Resources

- **Research Doc**: `docs/research/CDREAM-V4-RESEARCH.md`
- **Video Reference**: [Complete LoRA Training Guide](https://www.youtube.com/watch?v=WUWGZt2UwO0)
- **EvoLink**: [Seedream 4.0 Pricing](https://evolink.ai/blog/seedream-4-0-pricing-cheapest-api)
- **Atlascloud**: [ByteDance Seedream V4 API](https://www.atlascloud.ai/blog/byte-dance-seedream-v4-api)

---

## Status Summary

| Task | Status | Priority | Blocker |
|------|--------|----------|---------|
| Identify Service | ⚠️ Not Started | High | Yes |
| Test NSFW | ⚠️ Not Started | Critical | Yes |
| Test API | ⚠️ Not Started | High | Yes |
| Quality Test | ⚠️ Not Started | Medium | No |
| Cost Verify | ⚠️ Not Started | Medium | No |
| Create Client | ⚠️ Not Started | Medium | Yes (NSFW) |
| Update Service | ⚠️ Not Started | Medium | Yes (NSFW) |
| Update Docs | ⚠️ Not Started | Low | No |

---

## Next Action

**IMMEDIATE**: Identify exact service and test NSFW support

**Owner**: [TBD]  
**Due**: [TBD]

