# Credit Pricing System - Business Proposal

## Executive Summary

This proposal defines a **per-feature, per-model credit pricing system** as the single source of truth for all credit costs in RYLA. It replaces the current fragmented approach with a centralized, business-driven pricing configuration.

---

## Current State (Problems)

### 1. Fragmented Cost Definitions

| Location | Draft | HQ |
|----------|-------|-----|
| `libs/data/src/schema/credits.schema.ts` | 1 | 3 |
| `apps/web/constants/pricing.ts` | 5 | 10 |
| `docs/technical/systems/CREDIT-SYSTEM.md` | 5 | 10 |

**Problem**: No single source of truth. Frontend and backend disagree.

### 2. Quality-Based Pricing is Too Simplistic

Current approach only considers "draft" vs "hq" quality mode, but actual costs depend on:
- **Feature type** (base image, profile pictures, studio content)
- **AI model used** (Z-Image-Turbo, Flux Schnell, Fal.ai models)
- **Image count** (batch vs single)
- **Resolution** (768px vs 1024px vs higher)

### 3. Missing Credit Deduction

These features generate images but **don't deduct credits**:
- `ProfilePictureSetService` - generates 7-10 images
- `BaseImageGenerationService` - generates 3 base images
- `CharacterSheetService` - generates 7-10 variations

Only `generation.router.ts` (tRPC) deducts credits.

---

## Proposed Solution

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     libs/shared                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  src/credits/pricing.ts  ← SINGLE SOURCE OF TRUTH         │  │
│  │                                                            │  │
│  │  - Feature costs (by type)                                 │  │
│  │  - Model multipliers                                       │  │
│  │  - Resolution multipliers                                  │  │
│  │  - Plan limits                                             │  │
│  │  - getCreditCost(feature, model, resolution) function      │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        libs/data       libs/trpc       apps/web
        (schema)       (routers)      (frontend)
        
        All import from @ryla/shared/credits
```

---

## Credit Pricing Structure

### 1. Feature-Based Costs

Each feature has a **base cost** that reflects its computational complexity and business value.

| Feature ID | Feature Name | Description | Base Cost | Images |
|------------|--------------|-------------|-----------|--------|
| `base_image` | Character Base Image | Initial character creation (3 images) | 10 | 3 |
| `profile_set` | Profile Picture Set | Full profile set (7-10 images) | 25 | 7-10 |
| `studio_single` | Studio Generation | Single image in content studio | 3 | 1 |
| `studio_batch` | Studio Batch | Batch generation (2-4 images) | 8 | 2-4 |
| `inpaint` | Image Inpainting | Edit existing image | 2 | 1 |
| `upscale` | Image Upscale | Enhance resolution | 2 | 1 |

### 2. Model Multipliers

Different AI models have different costs based on:
- GPU time required
- External API costs (Fal.ai)
- Quality output

| Model ID | Model Name | Provider | Speed | Quality | Multiplier |
|----------|------------|----------|-------|---------|------------|
| `z-image-turbo` | Z-Image Turbo | Self-hosted | Fast | Standard | 1.0× |
| `z-image-danrisi` | Z-Image Danrisi | Self-hosted | Fast | Better | 1.0× |
| `z-image-pulid` | Z-Image PuLID | Self-hosted | Medium | Face-consistent | 1.5× |
| `flux-schnell` | Flux Schnell | Self-hosted | Fast | Standard | 1.0× |
| `flux-dev` | Flux Dev | Self-hosted | Slow | High | 2.0× |
| `fal-schnell` | Fal Schnell | Fal.ai API | Fast | Standard | 1.2× |
| `fal-dev` | Fal Dev | Fal.ai API | Medium | High | 2.5× |
| `fal-pro` | Fal Pro 1.1 | Fal.ai API | Slow | Premium | 3.0× |

### 3. Resolution Multipliers

Higher resolutions require more GPU memory and time.

| Resolution | Pixels | Multiplier |
|------------|--------|------------|
| Standard (768×768) | 590K | 0.8× |
| Default (1024×1024) | 1M | 1.0× |
| High (1280×1280) | 1.6M | 1.3× |
| Ultra (1536×1536) | 2.4M | 1.8× |

### 4. Quality Mode Multipliers

| Mode | Description | Multiplier |
|------|-------------|------------|
| `fast` | Speed-optimized (fewer steps) | 0.8× |
| `standard` | Balanced (default steps) | 1.0× |
| `quality` | Quality-optimized (more steps) | 1.5× |

---

## Cost Calculation Formula

```typescript
function getCreditCost(params: {
  feature: FeatureId;
  model: ModelId;
  resolution?: ResolutionId;
  quality?: QualityMode;
  count?: number;
}): number {
  const baseCost = FEATURE_COSTS[params.feature].baseCost;
  const modelMultiplier = MODEL_MULTIPLIERS[params.model];
  const resolutionMultiplier = RESOLUTION_MULTIPLIERS[params.resolution ?? 'default'];
  const qualityMultiplier = QUALITY_MULTIPLIERS[params.quality ?? 'standard'];
  const count = params.count ?? 1;
  
  const totalCost = Math.ceil(
    baseCost * modelMultiplier * resolutionMultiplier * qualityMultiplier * count
  );
  
  return Math.max(1, totalCost); // Minimum 1 credit
}
```

---

## Example Calculations

| Scenario | Feature | Model | Resolution | Quality | Count | Calculation | Total |
|----------|---------|-------|------------|---------|-------|-------------|-------|
| Create character | `base_image` | z-image-turbo | 1024 | fast | 1 | 10 × 1.0 × 1.0 × 0.8 | **8** |
| Profile pictures | `profile_set` | z-image-pulid | 1024 | standard | 1 | 25 × 1.5 × 1.0 × 1.0 | **38** |
| Quick studio shot | `studio_single` | z-image-turbo | 768 | fast | 1 | 3 × 1.0 × 0.8 × 0.8 | **2** |
| Quality studio shot | `studio_single` | fal-dev | 1024 | quality | 1 | 3 × 2.5 × 1.0 × 1.5 | **12** |
| Premium batch | `studio_batch` | fal-pro | 1280 | quality | 1 | 8 × 3.0 × 1.3 × 1.5 | **47** |

---

## Plan Limits

| Plan | Price | Monthly Credits | Per-Credit Value | Target User |
|------|-------|-----------------|------------------|-------------|
| **Free** | $0 | 20 (one-time) | N/A | Trial users |
| **Starter** | $29/mo | 150 | $0.19 | Hobbyists |
| **Pro** | $49/mo | 400 | $0.12 | Creators |
| **Unlimited** | $99/mo | ∞ | N/A | Power users |

### What Can You Do With Credits?

| Plan | Free (20) | Starter (150) | Pro (400) |
|------|-----------|---------------|-----------|
| Create characters | 2 | 15 | 40 |
| Profile picture sets | 0 | 3 | 10 |
| Studio quick shots | 10 | 75 | 200 |
| Studio quality shots | 1 | 12 | 33 |

---

## Implementation Plan

### Phase 1: Single Source of Truth

Create `libs/shared/src/credits/pricing.ts`:

```typescript
// Feature costs
export const FEATURE_COSTS = {
  base_image: { id: 'base_image', name: 'Character Base Image', baseCost: 10, defaultImages: 3 },
  profile_set: { id: 'profile_set', name: 'Profile Picture Set', baseCost: 25, defaultImages: 8 },
  studio_single: { id: 'studio_single', name: 'Studio Single', baseCost: 3, defaultImages: 1 },
  studio_batch: { id: 'studio_batch', name: 'Studio Batch', baseCost: 8, defaultImages: 4 },
  inpaint: { id: 'inpaint', name: 'Image Inpainting', baseCost: 2, defaultImages: 1 },
  upscale: { id: 'upscale', name: 'Image Upscale', baseCost: 2, defaultImages: 1 },
} as const;

// Model multipliers
export const MODEL_MULTIPLIERS = {
  'z-image-turbo': 1.0,
  'z-image-danrisi': 1.0,
  'z-image-pulid': 1.5,
  'flux-schnell': 1.0,
  'flux-dev': 2.0,
  'fal-schnell': 1.2,
  'fal-dev': 2.5,
  'fal-pro': 3.0,
} as const;

// Resolution multipliers
export const RESOLUTION_MULTIPLIERS = {
  small: 0.8,    // 768px
  default: 1.0,  // 1024px
  large: 1.3,    // 1280px
  ultra: 1.8,    // 1536px
} as const;

// Quality multipliers
export const QUALITY_MULTIPLIERS = {
  fast: 0.8,
  standard: 1.0,
  quality: 1.5,
} as const;

// Plan limits (monthly)
export const PLAN_LIMITS = {
  free: 20,       // One-time on signup
  starter: 150,   // Monthly
  pro: 400,       // Monthly
  unlimited: Infinity,
} as const;

// Central cost calculation
export function getCreditCost(params: CreditCostParams): number {
  // ... implementation
}
```

### Phase 2: Update All Consumers

1. **Remove** `CREDIT_COSTS` from:
   - `libs/data/src/schema/credits.schema.ts`
   - `apps/web/constants/pricing.ts`

2. **Update** all services to use `getCreditCost()`:
   - `libs/trpc/src/routers/generation.router.ts`
   - `apps/api/src/modules/image/services/profile-picture-set.service.ts`
   - `apps/api/src/modules/image/services/base-image-generation.service.ts`
   - `apps/api/src/modules/image/services/studio-generation.service.ts`

### Phase 3: Add Credit Deduction Service

Create centralized credit deduction in `libs/business/src/services/credit.service.ts`:

```typescript
export class CreditService {
  async checkAndDeduct(params: {
    db: NodePgDatabase;
    userId: string;
    feature: FeatureId;
    model: ModelId;
    resolution?: ResolutionId;
    quality?: QualityMode;
    count?: number;
    referenceId?: string;
  }): Promise<{ success: boolean; cost: number; newBalance: number }> {
    const cost = getCreditCost(params);
    
    return await this.db.transaction(async (tx) => {
      // 1. Check balance (with row lock)
      // 2. Deduct credits
      // 3. Log transaction
      // 4. Return result
    });
  }
}
```

---

## Migration Path

### Step 1: Add New System (Non-Breaking)
- Create `@ryla/shared/credits` module
- Add new pricing configuration
- Add `getCreditCost()` function

### Step 2: Update Backends to Use New System
- Update generation router
- Add credit deduction to all image services
- Ensure all generation paths charge credits

### Step 3: Update Frontend
- Import costs from `@ryla/shared`
- Update cost previews
- Update pricing displays

### Step 4: Clean Up
- Remove old `CREDIT_COSTS` exports
- Update documentation
- Add tests

---

## Analytics Integration

Track credit usage with rich context:

```typescript
analytics.capture('credits_consumed', {
  userId,
  feature: 'studio_single',
  model: 'z-image-pulid',
  resolution: 'default',
  quality: 'standard',
  baseCost: 3,
  finalCost: 5,
  multipliers: {
    model: 1.5,
    resolution: 1.0,
    quality: 1.0,
  },
  balanceAfter: 95,
});
```

---

## Decision Matrix: Why This Approach?

| Criterion | Quality-Based (Current) | Feature-Based (Proposed) |
|-----------|------------------------|--------------------------|
| **Simplicity** | Simple but misleading | Slightly complex but accurate |
| **Fairness** | Unfair (same cost for different features) | Fair (cost reflects value) |
| **Flexibility** | Hard to adjust | Easy to tune per feature |
| **Business Control** | Limited | Full control over pricing |
| **User Transparency** | Confusing | Clear value proposition |

---

## Next Steps

1. **Review** this proposal with stakeholders
2. **Finalize** credit values based on business goals
3. **Implement** Phase 1 (single source of truth)
4. **Test** with existing features
5. **Roll out** to all image generation services

---

## References

- Current Epic: `docs/requirements/epics/mvp/EP-009-credits.md`
- Current Implementation: `docs/technical/systems/CREDIT-SYSTEM.md`
- Workflow Registry: `libs/business/src/workflows/registry.ts`

