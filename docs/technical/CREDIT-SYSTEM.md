# Credit System - Technical Implementation

## Overview

The credit system manages AI image generation quotas with feature-based pricing. Users spend credits per feature, with costs defined by the generation type and model used. All pricing is defined in a single source of truth (`@ryla/shared`).

---

## Single Source of Truth

**All credit pricing is defined in:**
```
libs/shared/src/credits/pricing.ts
```

This file exports:
- `FEATURE_CREDITS` - Cost per feature
- `PLAN_CREDITS` - Monthly credits per plan
- `SUBSCRIPTION_PLANS` - Plan definitions with pricing
- `CREDIT_PACKAGES` - One-time purchase packages
- Helper functions: `getFeatureCost()`, `hasEnoughCredits()`, etc.

**See also:**
- `docs/technical/CREDIT-PRICING-PROPOSAL.md` - Pricing strategy
- `docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md` - Cost/margin analysis

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (apps/web)                      │
├─────────────────────────────────────────────────────────────────┤
│  useCredits()  →  CreditsBadge  →  Header/Sidebar               │
│       ↓                                                          │
│  ZeroCreditsModal  ←  LowBalanceWarning                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ tRPC / REST API
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│               Backend (apps/api + libs/trpc)                     │
├─────────────────────────────────────────────────────────────────┤
│  CreditManagementService   - Check/deduct/refund credits        │
│  credits.getBalance()      - Fetch current balance              │
│  credits.getTransactions() - Credit history                      │
│  generation.create()       - Deducts credits atomically         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Shared Pricing (@ryla/shared)                   │
├─────────────────────────────────────────────────────────────────┤
│  FEATURE_CREDITS           - Cost per feature type              │
│  PLAN_CREDITS              - Monthly credits per subscription   │
│  CREDIT_PACKAGES           - One-time purchase options          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Database (libs/data)                         │
├─────────────────────────────────────────────────────────────────┤
│  user_credits             - Balance & totals per user           │
│  credit_transactions       - Full audit log                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Credit Costs (10x Margin Model)

All credit values are multiplied by 10 for psychological impact (100 credits feels better than 10).

### Feature Costs

| Feature | Credits | Description |
|---------|---------|-------------|
| `base_images` | 100 | Character creation (3 images) |
| `profile_set_fast` | 200 | Profile set, speed mode (8 images) |
| `profile_set_quality` | 300 | Profile set with PuLID (8 images) |
| `studio_fast` | 20 | Single image, speed mode |
| `studio_standard` | 50 | Single image, balanced |
| `studio_batch` | 80 | 4 images in batch |
| `inpaint` | 30 | Edit existing image |
| `upscale` | 20 | Enhance resolution |
| `fal_model` | Dynamic | External API (Fal.ai models - see pricing below) |

### Fal.ai Model Pricing (Dynamic)

Fal.ai models use **dynamic pricing** based on:
- Model selection (70+ models available)
- Image dimensions (credits scale with megapixels)

**Pricing Formula:**
```
Credits = ceil(USD_Cost × 100)
```

Where USD cost is calculated as:
- **Per megapixel models**: `cost_per_MP × (width × height / 1,000,000)`
- **Per image models**: Fixed cost regardless of size

**Example Costs (for 1024×1024 = 1MP image):**

| Model | USD Cost | Credits | Use Case |
|-------|----------|---------|----------|
| `fal-ai/flux/schnell` | $0.003 | **0.3** | Fast generation |
| `fal-ai/flux-2/flash` | $0.005 | **0.5** | Ultra-fast |
| `fal-ai/flux-2/turbo` | $0.008 | **0.8** | Fast FLUX 2 |
| `fal-ai/flux-2` | $0.012 | **1.2** | Standard FLUX 2 |
| `fal-ai/flux/dev` | $0.025 | **2.5** | High quality |
| `fal-ai/flux-2-pro` | $0.03 | **3** | Premium quality |
| `fal-ai/flux-2-max` | $0.07 | **7** | Maximum quality |
| `fal-ai/flux-pro/v1.1-ultra` | $0.06 | **6** | Ultra premium (per image) |
| `fal-ai/imagen4/preview` | $0.04 | **4** | Google Imagen 4 (per image) |
| `fal-ai/gpt-image-1.5` | $0.001 | **0.1** | GPT Image (per image) |

**Full pricing reference:** See `apps/api/src/modules/image/services/fal-image.service.ts` → `FAL_MODEL_PRICING`

**Note:** Credits scale with image size. A 9:16 image (832×1472 = 1.22 MP) costs ~22% more than a 1:1 image (1024×1024 = 1.05 MP).

### Plan Credits

| Plan | Monthly Credits | Price |
|------|-----------------|-------|
| Free | 250 (one-time) | $0 |
| Starter | 3,000/month | $29/mo |
| Pro | 8,000/month | $49/mo |
| Unlimited | ∞ | $99/mo |

---

## Key Files

### Shared (Source of Truth)

| File | Purpose |
|------|---------|
| `libs/shared/src/credits/pricing.ts` | All credit costs, plans, packages |
| `libs/shared/src/credits/index.ts` | Exports for @ryla/shared |
| `apps/api/src/modules/image/services/fal-image.service.ts` | Fal.ai model pricing map (`FAL_MODEL_PRICING`) |

### Backend

| File | Purpose |
|------|---------|
| `libs/data/src/schema/credits.schema.ts` | DB schema, re-exports pricing |
| `libs/trpc/src/routers/credits.router.ts` | tRPC endpoints for credits |
| `libs/trpc/src/routers/generation.router.ts` | Credit deduction on generation |
| `apps/api/src/modules/credits/services/credit-management.service.ts` | Credit check/deduct/refund service |
| `apps/api/src/modules/auth/services/auth.service.ts` | Credit init on signup |
| `apps/api/src/modules/cron/services/credit-refresh.service.ts` | Monthly credit reset |

### Frontend

| File | Purpose |
|------|---------|
| `apps/web/constants/pricing.ts` | Re-exports from @ryla/shared |
| `apps/web/lib/hooks/use-credits.ts` | React hook for credit data |
| `apps/web/components/credits/credits-badge.tsx` | Balance display in header |
| `apps/web/components/credits/low-balance-warning.tsx` | Warning when credits ≤ 100 |
| `apps/web/components/credits/zero-credits-modal.tsx` | Modal when insufficient |

---

## Database Schema

```typescript
// libs/data/src/schema/credits.schema.ts

// user_credits - One row per user
{
  userId: uuid (FK → users.id, unique),
  balance: integer,           // Current available credits
  totalEarned: integer,       // Lifetime credits received
  totalSpent: integer,        // Lifetime credits consumed
  lowBalanceWarningShown: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}

// credit_transactions - Audit log
{
  id: uuid (PK),
  userId: uuid (FK → users.id),
  type: enum('subscription_grant', 'purchase', 'generation', 'refund', 'bonus', 'admin_adjustment'),
  amount: integer,            // Positive = credit, negative = debit
  balanceAfter: integer,      // Running balance after transaction
  description: text,          // Human-readable description
  referenceId: uuid,          // Job ID, payment ID, etc.
  qualityMode: text,          // Feature ID for analytics
  createdAt: timestamp
}
```

---

## Flows

### 1. User Registration (Credit Initialization)

```typescript
// apps/api/src/modules/auth/services/auth.service.ts

async registerUserByEmail(email, password) {
  const user = await this.usersRepository.create({ ... });

  // Initialize credits with free tier (250 credits)
  const freeCredits = PLAN_CREDIT_LIMITS.free; // 250
  await this.db.insert(userCredits).values({
    userId: user.id,
    balance: freeCredits,
    totalEarned: freeCredits,
  });
}
```

### 2. Credit Check & Deduction (Generation)

```typescript
// apps/api/src/modules/credits/services/credit-management.service.ts

async deductCredits(
  userId: string,
  featureId: FeatureId,
  count: number = 1
): Promise<CreditDeductionResult> {
  // Check if user has enough credits
  const { balance, required } = await this.requireCredits(userId, featureId, count);
  
  // Atomic deduction with transaction log
  await this.db.transaction(async (tx) => {
    await tx.update(userCredits)
      .set({
        balance: balance - required,
        totalSpent: sql`${userCredits.totalSpent} + ${required}`,
      })
      .where(eq(userCredits.userId, userId));

    await tx.insert(creditTransactions).values({
      userId,
      type: 'generation',
      amount: -required,
      balanceAfter: balance - required,
      qualityMode: featureId, // Track feature for analytics
    });
  });
}
```

### 3. Character Controller Integration

```typescript
// apps/api/src/modules/character/character.controller.ts

@Post('generate-profile-picture-set')
async generateProfilePictureSet(@CurrentUser() user, @Body() dto) {
  const imageCount = dto.nsfwEnabled ? 10 : 7;
  const featureId = dto.generationMode === 'consistent' 
    ? 'profile_set_quality' 
    : 'profile_set_fast';

  // Check and deduct credits upfront
  const creditResult = await this.creditService.deductCredits(
    user.userId,
    featureId,
    imageCount
  );

  // Proceed with generation
  const result = await this.profilePictureSetService.generateProfilePictureSet(dto);

  return {
    ...result,
    creditsDeducted: creditResult.creditsDeducted,
    creditBalance: creditResult.balanceAfter,
  };
}
```

### 4. Monthly Credit Refresh

```typescript
// apps/api/src/modules/cron/services/credit-refresh.service.ts

// Credits are RESET, not added (use it or lose it policy)
const creditsToGrant = PLAN_CREDIT_LIMITS[tier];
// starter: 3000, pro: 8000

// Free tier is skipped (one-time credits on signup)
// Unlimited tier is skipped (no credit tracking)
```

---

## UI States

| State | Condition | Component |
|-------|-----------|-----------|
| Normal | balance > 100 | Green badge in header |
| Low | balance ≤ 100 | Orange badge + warning banner |
| Zero | balance < feature cost | Red badge + modal |
| Loading | isLoading | Skeleton/spinner |

---

## API Endpoints

### `credits.getBalance`

```typescript
// Response
{
  balance: 2450,
  totalEarned: 3000,
  totalSpent: 550,
  isLowBalance: false,
  isZeroBalance: false,
  lowBalanceThreshold: 100,
}
```

### `credits.getTransactions`

```typescript
// Input
{ limit?: 20, offset?: 0, type?: 'generation' | 'refund' | ... }

// Response
{
  items: [
    { id, type: 'generation', amount: -50, balanceAfter: 2450, qualityMode: 'studio_standard', ... },
  ],
  total: 15,
}
```

---

## References

- Epic: `docs/requirements/epics/mvp/EP-009-credits.md`
- Pricing Proposal: `docs/technical/CREDIT-PRICING-PROPOSAL.md`
- Cost Analysis: `docs/technical/CREDIT-COST-MARGIN-ANALYSIS.md`
- Schema: `libs/shared/src/credits/pricing.ts`
