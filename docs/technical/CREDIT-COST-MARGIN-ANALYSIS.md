# Credit System - Cost & Margin Analysis

> **Goal**: Price credits to achieve **~10x margin** (we spend $0.01 → user pays 10 credits worth $0.10)

---

## Our Actual Infrastructure Costs

### GPU Hourly Rates (RunPod)

| GPU | Hourly Rate | Per Second |
|-----|-------------|------------|
| RTX 4090 | $0.69/hr | $0.000192/sec |
| RTX 3090 | $0.22/hr | $0.000061/sec |
| A6000 | $0.59/hr | $0.000164/sec |

**We use RTX 4090 → $0.000192/sec**

### Measured Benchmarks (Our Pod, Z-Image Danrisi, Fast Mode)

| Operation | Time | GPU Cost |
|-----------|------|----------|
| Base image (1 image) | ~9.5s | $0.0018 |
| Base images (3 images) | ~28.65s | $0.0055 |
| Profile set (8 images) | ~55.07s | $0.0106 |
| Studio image (1 image) | ~6-10s | $0.0012-0.0019 |

### Per-Image Costs by Model/Provider

| Model | Provider | Cost/Image (1MP) | Notes |
|-------|----------|-------------------|-------|
| Z-Image Turbo (fast) | Self-hosted | **$0.0015** | 9 steps, 768px |
| Z-Image Danrisi (standard) | Self-hosted | **$0.0020** | 12 steps, 1024px |
| Z-Image PuLID (face) | Self-hosted | **$0.0035** | 20 steps, 1024px |
| Flux Dev | Self-hosted | **$0.0050** | 20 steps, 1024px |
| Fal.ai Models | External API | **$0.001 - $0.08** | Dynamic pricing (see below) |

### Fal.ai Model Pricing (2025-01-17)

**Pricing Structure:**
- **Per megapixel**: Cost scales with image size (width × height / 1,000,000)
- **Per image**: Fixed cost regardless of size
- **Per processed megapixel**: For editing models

**Popular Models (for 1024×1024 = 1MP):**

| Model | USD Cost | Credits | Category |
|-------|----------|---------|----------|
| `fal-ai/flux/schnell` | $0.003 | **0.3** | Fast |
| `fal-ai/flux-2/flash` | $0.005 | **0.5** | Ultra-fast |
| `fal-ai/flux-2/turbo` | $0.008 | **0.8** | Fast FLUX 2 |
| `fal-ai/flux-2` | $0.012 | **1.2** | Standard FLUX 2 |
| `fal-ai/flux/dev` | $0.025 | **2.5** | High quality |
| `fal-ai/flux-2-pro` | $0.03 | **3** | Premium |
| `fal-ai/flux-2-max` | $0.07 | **7** | Maximum quality |
| `fal-ai/flux-pro/v1.1-ultra` | $0.06 | **6** | Ultra premium |
| `fal-ai/imagen4/preview` | $0.04 | **4** | Google Imagen 4 |
| `fal-ai/gpt-image-1.5` | $0.001 | **0.1** | GPT Image |
| `fal-ai/z-image/turbo` | $0.005 | **0.5** | Z-Image Turbo |
| `fal-ai/ideogram/v2` | $0.08 | **8** | Typography-focused |

**Full Model List:** 70+ models available. See `apps/api/src/modules/image/services/fal-image.service.ts` → `FAL_MODEL_PRICING` for complete pricing.

**Credit Calculation:**
```
Credits = ceil(USD_Cost × 100)
```

Where USD cost is:
- Per MP: `pricing.costPerMegapixel × megapixels`
- Per image: `pricing.costPerImage`
- Per processed MP: `pricing.costPerProcessedMegapixel × megapixels`

---

## 10x Margin Credit Model (×10 Display Values)

### Credit Value Formula

All credit values are multiplied by 10 for psychological impact.
Users feel like they're getting more value with "3,000 credits" vs "300 credits".

```
1 Credit = $0.001 revenue (what user pays after ×10 scaling)
1 Credit = $0.0001 cost (what we spend)
Margin = 10x
```

### Subscription Pricing with 10x Margin

| Plan | Price | Credits | Credit Value | Max Cost to Us | Actual Margin |
|------|-------|---------|--------------|----------------|---------------|
| **Free** | $0 | 250 | $0.00 | $0.025 | Marketing cost |
| **Starter** | $29/mo | 3,000 | $0.0097/credit | $0.30 | 97x |
| **Pro** | $49/mo | 5,000 | $0.0098/credit | $0.50 | 98x |
| **Unlimited** | $99/mo | ∞ | N/A | Capped by usage | Variable |

**Validation**: If each credit costs us $0.0001 in GPU time, 5,000 credits = $0.50 cost, $49 revenue = **98x margin**

---

## Feature Credit Costs (Based on Real Costs)

### Formula

All values ×10 for psychological impact (users see "100 credits" not "10").

```
Credits = ceil(ActualCost ÷ $0.0001) × SafetyBuffer × ModelMultiplier
```

- **SafetyBuffer**: 1.5x (covers overhead, storage, bandwidth)
- **ModelMultiplier**: 1.0x (self-hosted) or 5-10x (Fal.ai external)

### Self-Hosted Features (Z-Image/Flux)

| Feature | Images | GPU Time | GPU Cost | +50% Buffer | Credits |
|---------|--------|----------|----------|-------------|---------|
| **Base Image Set** | 3 | 28.65s | $0.0055 | $0.008 | **100** |
| **Profile Set (fast)** | 8 | 55s | $0.0106 | $0.016 | **200** |
| **Profile Set (PuLID)** | 8 | 90s | $0.017 | $0.026 | **300** |
| **Studio Single (fast)** | 1 | 6s | $0.0012 | $0.002 | **20** |
| **Studio Single (quality)** | 1 | 15s | $0.003 | $0.0045 | **50** |
| **Studio Batch (4 images)** | 4 | 24s | $0.0046 | $0.007 | **80** |
| **Inpaint** | 1 | 10s | $0.002 | $0.003 | **30** |
| **Upscale** | 1 | 8s | $0.0015 | $0.002 | **20** |

### Fal.ai External Features (Dynamic Pricing)

Fal.ai models use dynamic pricing based on model selection and image dimensions.

**Example Costs (for 1024×1024 = 1MP image):**

| Model | API Cost | Credits | Margin |
|-------|----------|---------|--------|
| **Fal Schnell** | $0.003 | **0.3** | 100x |
| **Fal Dev** | $0.025 | **2.5** | 100x |
| **Fal Pro Ultra** | $0.06 | **6** | 100x |
| **Fal FLUX 2 Max** | $0.07 | **7** | 100x |

**Note:** Credits scale with image size. A 9:16 image (1.22 MP) costs ~22% more than 1:1 (1.05 MP).

**Full pricing:** See `apps/api/src/modules/image/services/fal-image.service.ts` → `FAL_MODEL_PRICING`

---

## Final Credit Pricing Table

### Feature Costs (Single Source of Truth)

| Feature ID | Description | Credits | Real Cost | Margin |
|------------|-------------|---------|-----------|--------|
| `base_images` | Character creation (3 images) | **100** | $0.006 | 160x |
| `profile_set_fast` | Profile set, speed mode (8 images) | **200** | $0.011 | 180x |
| `profile_set_quality` | Profile set, PuLID mode (8 images) | **300** | $0.017 | 170x |
| `studio_fast` | Studio single, speed (1 image) | **20** | $0.001 | 200x |
| `studio_standard` | Studio single, standard (1 image) | **50** | $0.003 | 160x |
| `studio_batch` | Studio batch (4 images) | **80** | $0.005 | 160x |
| `inpaint` | Edit existing image | **30** | $0.002 | 150x |
| `upscale` | Enhance resolution | **20** | $0.002 | 100x |
| `fal_model` | Fal.ai models (dynamic) | **0.1 - 8** | $0.001 - $0.08 | 100x |

**Fal.ai Model Examples (1MP image):**
- `fal-ai/flux/schnell`: 0.3 credits ($0.003)
- `fal-ai/flux/dev`: 2.5 credits ($0.025)
- `fal-ai/flux-2-max`: 7 credits ($0.07)
- `fal-ai/imagen4/preview`: 4 credits ($0.04 per image)

See `FAL_MODEL_PRICING` in `fal-image.service.ts` for complete pricing table.

---

## Plan Value Analysis

### What Each Plan Gets

| Action | Cost | Free (250) | Starter (3,000) | Pro (5,000) |
|--------|------|------------|-----------------|-------------|
| Create character | 100 | 2 | 30 | 50 |
| Profile set (fast) | 200 | 1 | 15 | 25 |
| Profile set (quality) | 300 | 0 | 10 | 16 |
| Studio quick shot | 20 | 12 | 150 | 250 |
| Studio standard shot | 50 | 5 | 60 | 100 |
| Studio batch (4) | 80 | 3 | 37 | 62 |

### Typical User Journey (Credits Used)

| Step | Action | Credits |
|------|--------|---------|
| 1 | Create character (base images) | 100 |
| 2 | Generate profile set (fast) | 200 |
| 3 | Generate 10 studio images | 200-500 |
| **Total for 1 character** | | **500-800** |

**Starter (3,000 credits)**: ~4-6 characters/month  
**Pro (5,000 credits)**: ~6-10 characters/month

---

## Margin Validation by Scenario

### Worst Case: Power User on Starter Plan

Assume user maximizes every credit:
- 3,000 credits → all on studio_fast (20 credits each) = 150 images
- Our cost: 150 × $0.001 = $0.15
- Revenue: $29
- **Margin: 193x** ✅

### Average Case: Normal User

Typical usage pattern:
- 3 characters × 300 credits = 900 credits
- 50 studio images × 30 credits = 1,500 credits
- Total: 2,400 credits used
- Our cost: ~$0.25
- Revenue: $29
- **Margin: 116x** ✅

### Worst Case: Heavy Fal.ai Usage (Pro Plan)

User uses all credits on Fal.ai Pro:
- 5,000 credits ÷ 1,800 = 2.7 images
- Our cost: 2.7 × $0.15 = $0.40
- Revenue: $49
- **Margin: 122x** ✅

---

## Unlimited Plan Economics

### Break-Even Analysis

At $99/month, how much can an unlimited user generate before we lose money?

- Revenue: $99
- Target margin: 10x → max cost = $9.90
- Studio fast images ($0.001 each): **9,900 images**
- Profile sets ($0.011 each): **900 sets**

**Reality**: Even a very heavy user won't generate 9,900 images/month. Average is probably 500-1,000 images.

### Unlimited User Protection

1. **Fair use policy**: Cap at 10,000 generations/month
2. **Rate limiting**: Max 100 generations/hour
3. **Priority queuing**: Unlimited users get lower priority during peak

---

## Recommended Final Pricing

### Subscription Plans

| Plan | Price | Credits/Month | Effective $/Credit |
|------|-------|---------------|-------------------|
| **Free** | $0 | 250 (one-time) | Gift |
| **Starter** | $29/mo | 3,000 | $0.0097 |
| **Pro** | $49/mo | 5,000 | $0.0098 |
| **Unlimited** | $99/mo | ∞ (fair use) | N/A |

### Credit Packages (One-Time)

| Package | Price | Credits | $/Credit | Save % | Margin |
|---------|-------|---------|----------|--------|--------|
| **500 credits** | $9.99 | 500 | $0.020 | - | 200x |
| **1,500 credits** | $24.99 | 1,500 | $0.017 | 17% | 167x |
| **3,500 credits** | $49.99 | 3,500 | $0.014 | 29% | 143x |
| **7,500 credits** | $89.99 | 7,500 | $0.012 | 40% | 120x |
| **15,000 credits** | $149.99 | 15,000 | $0.010 | 50% | 100x |

*Credit packages priced higher per credit than subscriptions to encourage recurring revenue*

**Comparison to Subscriptions:**
- Subscription: ~$0.0097-0.0098/credit
- Packages: $0.010-0.020/credit (2-100% more expensive)

---

## Implementation

### Single Source of Truth

All these values will be in:

```typescript
// libs/shared/src/credits/pricing.ts

export const FEATURE_CREDITS = {
  base_images: 100,
  profile_set_fast: 200,
  profile_set_quality: 300,
  studio_fast: 20,
  studio_standard: 50,
  studio_batch: 80,
  inpaint: 30,
  upscale: 20,
  fal_schnell: 600,
  fal_dev: 1200,
  fal_pro: 1800,
} as const;

export const PLAN_CREDITS = {
  free: 250,
  starter: 3000,
  pro: 5000,
  unlimited: Infinity,
} as const;

export const CREDIT_PACKAGES = [
  { id: 'credits_500', credits: 500, price: 9.99 },
  { id: 'credits_1500', credits: 1500, price: 24.99, savePercent: 17 },
  { id: 'credits_3500', credits: 3500, price: 49.99, savePercent: 29 },
  { id: 'credits_7500', credits: 7500, price: 89.99, savePercent: 40 },
  { id: 'credits_15000', credits: 15000, price: 149.99, savePercent: 50 },
];
```

---

## Summary

| Metric | Target | Actual |
|--------|--------|--------|
| **Margin (minimum)** | 100x | 100-200x (self-hosted) |
| **Margin (Fal.ai)** | 100x | 120x |
| **Cost per credit** | $0.0001 | $0.00005-0.0001 |
| **Revenue per credit** | $0.01 | $0.0097-0.0098 |

**Conclusion**: With the ×10 display multiplier, the pricing model achieves **100-200x margins** on self-hosted features and **120x margins** on external API features. Users perceive more value with bigger credit numbers (3,000 credits sounds better than 300).

