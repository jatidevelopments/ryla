# Credit System - Technical Implementation

## Overview

The credit system manages AI image generation quotas. Users spend credits to generate content, with costs varying by quality mode. Credits are granted on signup and via subscription purchases.

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
                             │ tRPC
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      tRPC Router (libs/trpc)                     │
├─────────────────────────────────────────────────────────────────┤
│  credits.getBalance()     - Fetch current balance               │
│  credits.getTransactions() - Credit history                      │
│  credits.refundFailedJob() - Refund failed generations          │
│  generation.create()       - Deducts credits atomically         │
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

## Database Schema

### Tables

```typescript
// libs/data/src/schema/credits.schema.ts

// user_credits - One row per user
{
  userId: uuid (FK → users.id, unique),
  balance: integer,           // Current available credits
  totalEarned: integer,       // Lifetime credits received
  totalSpent: integer,        // Lifetime credits consumed
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
  referenceId: text,          // Job ID, payment ID, etc.
  metadata: jsonb,            // Additional context
  createdAt: timestamp
}
```

### Migration

```sql
-- apps/api/src/database/migrations/0001_moaning_thunderball.sql

CREATE TYPE credit_transaction_type AS ENUM (
  'subscription_grant', 'purchase', 'generation', 
  'refund', 'bonus', 'admin_adjustment'
);

CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

---

## Credit Costs

| Action | Cost |
|--------|------|
| Character generation (draft) | 5 credits |
| Character generation (HQ) | 10 credits |
| Content generation (draft) | 5 credits |
| Content generation (HQ) | 10 credits |

Defined in `libs/data/src/schema/credits.schema.ts`:

```typescript
export const CREDIT_COSTS = {
  generation_draft: 5,
  generation_hq: 10,
} as const;
```

---

## Plan Limits

| Plan | Monthly Credits |
|------|-----------------|
| Free (trial) | 10 (one-time on signup) |
| Starter ($29/mo) | 100 |
| Pro ($49/mo) | 300 |
| Unlimited ($99/mo) | Infinity |

Defined in `libs/data/src/schema/credits.schema.ts`:

```typescript
export const PLAN_CREDIT_LIMITS = {
  free: 10,
  starter: 100,
  pro: 300,
  unlimited: Infinity,
} as const;
```

---

## Key Files

### Backend

| File | Purpose |
|------|---------|
| `libs/data/src/schema/credits.schema.ts` | DB schema, costs, plan limits |
| `libs/trpc/src/routers/credits.router.ts` | tRPC endpoints for credits |
| `libs/trpc/src/routers/generation.router.ts` | Credit deduction on generation |
| `libs/payments/src/credits/credit-grant.service.ts` | Subscription credit grants |
| `apps/api/src/modules/auth/services/auth.service.ts` | Credit init on signup |
| `apps/funnel/app/api/finby/notification/route.ts` | Webhook triggers credit grant |

### Frontend

| File | Purpose |
|------|---------|
| `apps/web/lib/hooks/use-credits.ts` | React hook for credit data |
| `apps/web/components/credits/credits-badge.tsx` | Displays balance in header (clickable → buy-credits) |
| `apps/web/components/credits/low-balance-warning.tsx` | Warning when credits ≤ 10 |
| `apps/web/components/credits/zero-credits-modal.tsx` | Modal when insufficient credits |
| `apps/web/components/app-shell.tsx` | Integrates credit components |
| `apps/web/components/wizard/step-generate.tsx` | Checks credits before generation |
| `apps/web/app/influencer/[id]/studio/page.tsx` | Checks credits before generation |
| `apps/web/app/pricing/page.tsx` | Subscription plans page |
| `apps/web/app/buy-credits/page.tsx` | One-time credit purchase page |
| `apps/web/components/pricing/plan-card.tsx` | Subscription plan card component |
| `apps/web/components/pricing/credit-package-card.tsx` | Credit package card component |
| `apps/web/constants/pricing.ts` | Pricing constants (plans & packages) |

---

## Flows

### 1. User Registration (Credit Initialization)

```typescript
// apps/api/src/modules/auth/services/auth.service.ts

async registerUserByEmail(email, password) {
  // Create user...
  const user = await this.usersRepository.create({ ... });

  // Initialize credits with 10 free credits
  await this.db.insert(schema.userCredits).values({
    userId: user.id,
    balance: PLAN_CREDIT_LIMITS.free,  // 10
    totalEarned: PLAN_CREDIT_LIMITS.free,
  });
}
```

### 2. Credit Check & Deduction (Generation)

```typescript
// libs/trpc/src/routers/generation.router.ts

create: protectedProcedure.mutation(async ({ ctx, input }) => {
  const creditCost = input.qualityMode === 'hq' 
    ? CREDIT_COSTS.generation_hq 
    : CREDIT_COSTS.generation_draft;

  // Atomic check and deduct
  await ctx.db.transaction(async (tx) => {
    const [credits] = await tx
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, ctx.userId))
      .for('update');

    if (!credits || credits.balance < creditCost) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient credits' });
    }

    // Deduct credits
    await tx.update(userCredits)
      .set({
        balance: credits.balance - creditCost,
        totalSpent: credits.totalSpent + creditCost,
      })
      .where(eq(userCredits.userId, ctx.userId));

    // Log transaction
    await tx.insert(creditTransactions).values({
      userId: ctx.userId,
      type: 'generation',
      amount: -creditCost,
      balanceAfter: credits.balance - creditCost,
      referenceId: jobId,
    });
  });

  // Proceed with generation...
});
```

### 3. Subscription Credit Grant (Webhook)

```typescript
// libs/payments/src/credits/credit-grant.service.ts

async grantSubscriptionCredits(userId: string, planId: string) {
  const creditsToGrant = PLAN_CREDIT_LIMITS[planId];

  await db.transaction(async (tx) => {
    // Upsert credits (add to existing balance)
    const [updated] = await tx
      .insert(userCredits)
      .values({ userId, balance: creditsToGrant, totalEarned: creditsToGrant })
      .onConflictDoUpdate({
        target: userCredits.userId,
        set: {
          balance: sql`${userCredits.balance} + ${creditsToGrant}`,
          totalEarned: sql`${userCredits.totalEarned} + ${creditsToGrant}`,
        },
      })
      .returning();

    // Log transaction
    await tx.insert(creditTransactions).values({
      userId,
      type: 'subscription_grant',
      amount: creditsToGrant,
      balanceAfter: updated.balance,
      description: `Monthly credits for ${planId} plan`,
    });
  });
}
```

### 4. Failed Generation Refund

```typescript
// libs/trpc/src/routers/credits.router.ts

refundFailedJob: protectedProcedure.mutation(async ({ ctx, input }) => {
  // Find the original transaction for this job
  const [originalTx] = await ctx.db
    .select()
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.referenceId, input.jobId),
        eq(creditTransactions.type, 'generation'),
        eq(creditTransactions.userId, ctx.userId),
      )
    );

  if (!originalTx) throw new TRPCError({ code: 'NOT_FOUND' });

  const refundAmount = Math.abs(originalTx.amount);

  // Add credits back
  await ctx.db.transaction(async (tx) => {
    const [updated] = await tx
      .update(userCredits)
      .set({
        balance: sql`${userCredits.balance} + ${refundAmount}`,
        totalSpent: sql`${userCredits.totalSpent} - ${refundAmount}`,
      })
      .where(eq(userCredits.userId, ctx.userId))
      .returning();

    await tx.insert(creditTransactions).values({
      userId: ctx.userId,
      type: 'refund',
      amount: refundAmount,
      balanceAfter: updated.balance,
      referenceId: input.jobId,
      description: 'Refund for failed generation',
    });
  });
});
```

---

## Frontend Integration

### useCredits Hook

```typescript
// apps/web/lib/hooks/use-credits.ts

export function useCredits() {
  const { data, isLoading, error, refetch } = trpc.credits.getBalance.useQuery();

  return {
    balance: data?.balance ?? 0,
    totalEarned: data?.totalEarned ?? 0,
    totalSpent: data?.totalSpent ?? 0,
    isLoading,
    error,
    refetch,
  };
}
```

### Pre-Generation Check

```typescript
// apps/web/components/wizard/step-generate.tsx

const { balance, refetch } = useCredits();
const creditCost = qualityMode === 'hq' ? 10 : 5;

const handleGenerate = async () => {
  if (balance < creditCost) {
    setShowCreditModal(true);
    return;
  }

  // Proceed with generation...
  await generateBaseImagesAndWait(input, onStatusChange);
  refetch(); // Update displayed balance
};
```

---

## UI States

| State | Condition | Component |
|-------|-----------|-----------|
| Normal | balance > 10 | Green badge in header |
| Low | balance ≤ 10 | Orange badge + `LowBalanceWarning` banner |
| Zero | balance < creditCost | Red badge + `ZeroCreditsModal` |
| Loading | isLoading | Skeleton/spinner |

---

## API Endpoints

### `credits.getBalance`

Returns current credit balance and lifetime stats.

```typescript
// Response
{
  balance: 45,
  totalEarned: 100,
  totalSpent: 55,
}
```

### `credits.getTransactions`

Returns paginated credit history.

```typescript
// Input
{ limit?: 20, offset?: 0, type?: 'generation' | 'refund' | ... }

// Response
{
  transactions: [
    { id, type: 'generation', amount: -5, balanceAfter: 45, createdAt, ... },
    ...
  ],
  total: 15,
}
```

### `credits.refundFailedJob`

Refunds credits for a failed generation job.

```typescript
// Input
{ jobId: 'uuid' }

// Response
{ success: true, newBalance: 50 }
```

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `credits_viewed` | Hook mounts | `balance`, `plan` |
| `credits_consumed` | Generation completes | `amount`, `action`, `balance_after` |
| `credits_low_warning` | balance ≤ 10 | `balance` |
| `credits_exhausted` | balance < cost | `balance`, `cost_needed` |
| `credits_refunded` | Refund processed | `amount`, `job_id` |

---

## Testing

### Unit Tests

```typescript
// Test credit deduction
it('should deduct credits on generation', async () => {
  // Setup user with 50 credits
  // Call generation.create
  // Expect balance = 45 (for draft) or 40 (for HQ)
});

// Test insufficient credits
it('should reject generation with insufficient credits', async () => {
  // Setup user with 2 credits
  // Call generation.create with 5-credit cost
  // Expect FORBIDDEN error
});

// Test refund
it('should refund credits for failed jobs', async () => {
  // Setup user, create failed job
  // Call credits.refundFailedJob
  // Expect credits restored
});
```

---

---

## Monthly Credit Refresh (Cron Job)

### Overview

A daily cron job checks for subscriptions whose billing period has ended and refreshes their credits.

### Implementation

| File | Purpose |
|------|---------|
| `apps/api/src/modules/cron/services/credit-refresh.service.ts` | Core refresh logic |
| `apps/api/src/modules/cron/cron.controller.ts` | API endpoint for cron trigger |
| `apps/api/src/modules/cron/cron.module.ts` | NestJS module |
| `.github/workflows/cron-credit-refresh.yml` | GitHub Actions scheduled workflow |

### How It Works

1. **GitHub Actions** triggers daily at midnight UTC
2. Calls `POST /cron/credits/refresh` with `Authorization: Bearer <CRON_SECRET>`
3. Service queries subscriptions where `currentPeriodEnd <= now()`
4. For each due subscription:
   - Resets balance to plan limit (no rollover)
   - Logs transaction
   - Updates `currentPeriodEnd` to next month
5. Returns summary: processed, success, error counts

### API Endpoint

```bash
# Trigger credit refresh
curl -X POST https://end.ryla.ai/cron/credits/refresh \
  -H "Authorization: Bearer $CRON_SECRET"

# Response
{
  "success": true,
  "processedCount": 42,
  "successCount": 42,
  "errorCount": 0,
  "errors": [],
  "timestamp": "2024-01-15T00:00:00.000Z"
}

# Manual refresh for specific user
curl -X POST https://end.ryla.ai/cron/credits/refresh/{userId} \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Environment Variables

```bash
# Required in apps/api/.env
CRON_SECRET=<random-32-byte-hex>  # openssl rand -hex 32

# Required in GitHub Secrets
CRON_SECRET=<same-value>
API_BASE_URL=https://end.ryla.ai
```

### Credit Refresh Logic

```typescript
// Credits are RESET, not added (use it or lose it policy)
balance = PLAN_CREDIT_LIMITS[tier];  // 100 for starter, 300 for pro

// Free tier is skipped (one-time credits on signup)
// Unlimited tier is skipped (no credit tracking)
```

### Monitoring

- GitHub Actions shows run history and logs
- API logs detailed success/error info
- Failed refreshes are logged with userId for debugging

---

## References

- Epic: `docs/requirements/epics/mvp/EP-009-credits.md`
- Subscription: `docs/requirements/epics/mvp/EP-010-subscription.md`
- Schema: `libs/data/src/schema/credits.schema.ts`
- Cron Workflow: `.github/workflows/cron-credit-refresh.yml`

