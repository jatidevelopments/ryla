# EP-017: Notification Implementation Checklist

**Status**: ✅ Core infrastructure complete (DB + API + UI)  
**Next**: Add notification creation at all trigger points below

---

## ✅ Already Implemented

1. **Generation Job Completion/Failure** (`apps/api/src/modules/image/services/comfyui-results.service.ts`)
   - ✅ `generation.completed` - when Studio/inpaint job completes
   - ✅ `generation.failed` - when job fails

---

## 🔴 High Priority (User-Facing Events)

### 1. Generation Jobs - Other Completion Points

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `apps/api/src/modules/image/services/base-image-generation.service.ts` | `generation.completed` | `generation.completed` | When base image generation completes (wizard step) | `getJobResults()` method - check if status transitions to 'completed' |
| `apps/api/src/modules/image/services/character-sheet.service.ts` | `generation.completed` | `generation.completed` | When character sheet (7-10 images) completes | `getJobResults()` method - check if status transitions to 'completed' |
| `apps/api/src/modules/image/services/inpaint-edit.service.ts` | `generation.completed` | `generation.completed` | When inpaint edit completes | Currently no completion handler - needs to be added |
| `libs/business/src/services/image-generation.service.ts` | `generation.completed` / `generation.failed` | `generation.completed` / `generation.failed` | When `syncJobStatus()` detects completion/failure | Check if status transitions from non-completed to completed/failed |

**Implementation Pattern:**
```typescript
// Check if status just transitioned to completed/failed
if (previousStatus !== 'completed' && newStatus === 'completed') {
  await notificationsRepo.create({
    userId,
    type: 'generation.completed',
    title: 'Generation complete',
    body: `Your ${jobType} is ready!`,
    href: job.characterId ? `/influencer/${job.characterId}/studio` : '/activity',
    metadata: { generationJobId: job.id, characterId: job.characterId },
  });
}
```

### 2. Credits - Low Balance Warning

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/trpc/src/routers/credits.router.ts` | `credits.low_balance` | `credits.low_balance` | When balance drops to ≤ 10 credits | In `getBalance` query - check if `isLowBalance` is true AND `lowBalanceWarningShown` is null |
| `libs/trpc/src/routers/generation.router.ts` | `credits.low_balance` | `credits.low_balance` | After credit deduction, if balance ≤ 10 | After deducting credits in `create` mutation |

**Implementation Pattern:**
```typescript
const newBalance = currentBalance - cost;
if (newBalance > 0 && newBalance <= 10 && !credits.lowBalanceWarningShown) {
  await notificationsRepo.create({
    userId: ctx.user.id,
    type: 'credits.low_balance',
    title: 'Low credits warning',
    body: `You have ${newBalance} credits remaining. Consider purchasing more.`,
    href: '/buy-credits',
    metadata: { balance: newBalance },
  });
}
```

### 3. Credits - Refund for Failed Job

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/trpc/src/routers/credits.router.ts` | `credits.refunded` | `credits.refunded` | When credits are refunded for failed job | In `refundFailedJob` mutation - after refund succeeds |

**Implementation Pattern:**
```typescript
// After refund transaction is created
await notificationsRepo.create({
  userId: ctx.user.id,
  type: 'credits.refunded',
  title: 'Credits refunded',
  body: `${creditsToRefund} credits refunded for failed generation`,
  href: '/activity',
  metadata: { jobId: input.jobId, refunded: creditsToRefund },
});
```

### 4. Character Creation

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/trpc/src/routers/character.router.ts` | `character.created` | `character.created` | When character is successfully created | In `create` mutation - after character row is inserted |

**Implementation Pattern:**
```typescript
// After character is created
await notificationsRepo.create({
  userId: ctx.user.id,
  type: 'character.created',
  title: 'Character created!',
  body: `${input.name} is ready. Start generating images!`,
  href: `/influencer/${character.id}`,
  metadata: { characterId: character.id, characterName: input.name },
});
```

---

## 🟡 Medium Priority (Important but Less Frequent)

### 5. Credits - Monthly Subscription Grant

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `apps/api/src/modules/cron/services/credit-refresh.service.ts` | `credits.subscription_granted` | `credits.subscription_granted` | When monthly credits are refreshed | In `refreshSubscriptionCredits()` - after credits are granted |

**Implementation Pattern:**
```typescript
// After credit refresh transaction
await notificationsRepo.create({
  userId,
  type: 'credits.subscription_granted',
  title: 'Monthly credits refreshed',
  body: `You received ${creditsToGrant} credits for your ${tier} subscription`,
  href: '/activity',
  metadata: { subscriptionId: subscription.id, creditsGranted: creditsToGrant, tier },
});
```

### 6. Credits - Purchase

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/trpc/src/routers/subscription.router.ts` | `credits.purchased` | `credits.purchased` | When user purchases credit package | In `buyCredits` mutation - after purchase succeeds |

**Implementation Pattern:**
```typescript
// After credit purchase transaction
await notificationsRepo.create({
  userId: ctx.user.id,
  type: 'credits.purchased',
  title: 'Credits purchased',
  body: `You purchased ${creditsToAdd} credits`,
  href: '/activity',
  metadata: { packageId: input.packageId, creditsPurchased: creditsToAdd },
});
```

### 7. Subscription - Created

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/trpc/src/routers/subscription.router.ts` | `subscription.created` | `subscription.created` | When user subscribes to a plan | In `subscribe` mutation - after subscription is created |

**Implementation Pattern:**
```typescript
// After subscription is created
await notificationsRepo.create({
  userId: ctx.user.id,
  type: 'subscription.created',
  title: 'Subscription activated',
  body: `Welcome to ${tier}! Your monthly credits will refresh automatically.`,
  href: '/settings',
  metadata: { subscriptionId: subscription.id, tier, planId: input.planId },
});
```

### 8. Subscription - Cancelled

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/trpc/src/routers/subscription.router.ts` | `subscription.cancelled` | `subscription.cancelled` | When user cancels subscription | In `cancel` mutation - after cancellation |

**Implementation Pattern:**
```typescript
// After subscription is cancelled
await notificationsRepo.create({
  userId: ctx.user.id,
  type: 'subscription.cancelled',
  title: 'Subscription cancelled',
  body: `Your subscription will end on ${endDate}. You'll keep access until then.`,
  href: '/settings',
  metadata: { subscriptionId: subscription.id, endDate },
});
```

---

## 🟢 Low Priority (Nice-to-Have)

### 9. Account - Welcome

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `apps/api/src/modules/auth/services/auth.service.ts` | `account.welcome` | `account.welcome` | When user signs up | In `registerUserByEmail()` - after user + credits are created |

**Implementation Pattern:**
```typescript
// After user registration completes
await notificationsRepo.create({
  userId: user.id,
  type: 'account.welcome',
  title: 'Welcome to RYLA!',
  body: `You received ${freeCredits} free credits to get started.`,
  href: '/wizard/step-0',
  metadata: { freeCredits },
});
```

### 10. Payment Webhooks (External)

| Location | Event | Type | When | Notes |
|----------|-------|------|------|-------|
| `libs/payments/src/webhooks/finby-v3.webhook.ts` | `payment.success` / `payment.failed` | `payment.success` / `payment.failed` | When payment webhook is received | After webhook is processed successfully |

**Note**: Payment webhooks are in `apps/funnel` - may need to coordinate with funnel app or create notifications via API call.

---

## Implementation Order (Recommended)

1. **Phase 1 (Critical)**: Generation job completions in all services
   - `base-image-generation.service.ts`
   - `character-sheet.service.ts`
   - `inpaint-edit.service.ts` (needs completion handler first)
   - `image-generation.service.ts` (syncJobStatus)

2. **Phase 2 (High Value)**: Credit warnings + refunds
   - Low balance warning
   - Refund notifications

3. **Phase 3 (Engagement)**: Character creation + subscription events
   - Character created
   - Subscription created/cancelled
   - Monthly credit refresh

4. **Phase 4 (Polish)**: Welcome + purchase confirmations
   - Welcome notification
   - Credit purchase confirmation

---

## Common Implementation Pattern

All notification creation should follow this pattern:

```typescript
import { NotificationsRepository } from '@ryla/data';

// In constructor or service setup
private readonly notificationsRepo: NotificationsRepository;

constructor(
  @Inject('DRIZZLE_DB')
  private readonly db: NodePgDatabase<typeof schema>,
  // ... other deps
) {
  this.notificationsRepo = new NotificationsRepository(this.db);
}

// When creating notification
await this.notificationsRepo.create({
  userId: string, // Required
  type: string, // e.g., 'generation.completed', 'credits.low_balance'
  title: string, // Required - short title
  body: string | null, // Optional - longer description
  href: string | null, // Optional - deep link (e.g., '/influencer/123/studio')
  metadata: Record<string, unknown> | null, // Optional - context data
});
```

---

## Notification Types Reference

| Type | Title Example | Body Example | href Example |
|------|---------------|--------------|--------------|
| `generation.completed` | "Generation complete" | "Your image pack is ready!" | `/influencer/{id}/studio` |
| `generation.failed` | "Generation failed" | "Your generation failed. Please try again." | `/activity` |
| `credits.low_balance` | "Low credits warning" | "You have 5 credits remaining." | `/buy-credits` |
| `credits.refunded` | "Credits refunded" | "3 credits refunded for failed generation" | `/activity` |
| `credits.subscription_granted` | "Monthly credits refreshed" | "You received 100 credits for your Pro subscription" | `/activity` |
| `credits.purchased` | "Credits purchased" | "You purchased 50 credits" | `/activity` |
| `character.created` | "Character created!" | "{name} is ready. Start generating images!" | `/influencer/{id}` |
| `subscription.created` | "Subscription activated" | "Welcome to Pro! Your monthly credits will refresh automatically." | `/settings` |
| `subscription.cancelled` | "Subscription cancelled" | "Your subscription will end on {date}." | `/settings` |
| `account.welcome` | "Welcome to RYLA!" | "You received 10 free credits to get started." | `/wizard/step-0` |

---

## Testing Checklist

For each notification type:
- [ ] Notification is created in DB when event occurs
- [ ] Notification appears in navbar menu
- [ ] Unread count updates correctly
- [ ] Clicking notification navigates to correct href (if provided)
- [ ] Mark read / mark all read works
- [ ] Analytics events fire (if applicable)

---

**Last Updated**: 2025-01-01  
**Epic**: EP-017  
**Status**: Implementation checklist - ready for Phase 1

