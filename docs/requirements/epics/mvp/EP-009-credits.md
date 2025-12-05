# [EPIC] EP-009: Generation Credits & Limits

## Overview

Credit system to manage and limit AI image generations. Controls usage for free and paid tiers, displays remaining credits, and handles limit enforcement.

---

## Business Impact

**Target Metric**: D - Conversion

**Hypothesis**: When users see their credit usage and limits, they understand the value of paid plans and convert at higher rates.

**Success Criteria**:
- Credit display visibility: **100%** of users see their credits
- Limit enforcement: **0** generations over limit
- Upgrade prompt clicks: **>10%** when credits low

---

## Features

### F1: Credit System

- Each user has a credit balance
- Generations consume credits based on quality mode
- Credits displayed in dashboard header
- Real-time credit updates after generation

**Credit Costs:**
| Action | Credits |
|--------|---------|
| Draft quality image | 1 credit |
| High quality image | 3 credits |
| Image pack (5 draft) | 5 credits |
| Image pack (5 HQ) | 15 credits |

### F2: Plan Limits

| Plan | Monthly Credits | Rollover |
|------|-----------------|----------|
| Free (trial) | 10 credits | No |
| Starter ($29/mo) | 100 credits | No |
| Pro ($49/mo) | 300 credits | No |
| Unlimited ($99/mo) | Unlimited | N/A |

> **Note**: Plan definitions may be adjusted based on business needs.

### F3: Credit Display

- Credits shown in dashboard header: "🎨 45 credits"
- Credits shown before generation confirmation
- Low credit warning (< 10 credits)
- Zero credit block with upgrade CTA

### F4: Limit Enforcement

- Check credits before generation
- Block generation if insufficient credits
- Show "Upgrade to continue" modal
- Log all limit hits for analytics

### F5: Credit Refresh

- Monthly credit refresh for paid plans
- Refresh on billing date
- No rollover (use it or lose it for MVP)
- Email notification when credits refresh (via EP-007)

### F6: Usage History

- View credit usage history
- "Used X credits on Y" log
- Filter by date range
- Export usage data (P1)

---

## Acceptance Criteria

### AC-1: Credit Display

- [ ] Credits shown in dashboard header
- [ ] Credits update after each generation
- [ ] Low credit warning appears at <10 credits
- [ ] Zero credits shows upgrade prompt

### AC-2: Generation Blocking

- [ ] Cannot generate if insufficient credits
- [ ] Clear message explains why blocked
- [ ] Upgrade CTA is prominent
- [ ] No partial generations (all or nothing)

### AC-3: Credit Consumption

- [ ] Draft mode consumes 1 credit per image
- [ ] HQ mode consumes 3 credits per image
- [ ] Credits deducted after successful generation
- [ ] Failed generations don't consume credits

### AC-4: Plan Limits

- [ ] Free users get 10 credits
- [ ] Paid users get plan-appropriate credits
- [ ] Credits refresh monthly on billing date
- [ ] Unlimited plan has no limits

### AC-5: Usage Tracking

- [ ] All credit usage is logged
- [ ] User can view usage history
- [ ] Usage shows date, amount, action

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `credits_viewed` | Dashboard loaded | `credits_remaining`, `plan` |
| `credits_consumed` | Generation completed | `amount`, `action`, `remaining` |
| `credits_low_warning` | Credits < 10 | `remaining` |
| `credits_exhausted` | Credits = 0 | `plan` |
| `generation_blocked` | Insufficient credits | `needed`, `available` |
| `upgrade_prompt_shown` | Limit reached | `source` |
| `upgrade_prompt_clicked` | User clicks upgrade | `source` |

---

## User Stories

### ST-030: See My Credits

**As a** user  
**I want to** see how many credits I have  
**So that** I know how many images I can generate

**AC**: AC-1

### ST-031: Understand Credit Costs

**As a** user planning generations  
**I want to** know how many credits each action costs  
**So that** I can budget my usage

**AC**: AC-3

### ST-032: Get Warned About Low Credits

**As a** user with few credits  
**I want to** be warned before running out  
**So that** I can upgrade or use credits wisely

**AC**: AC-1

### ST-033: Upgrade When Blocked

**As a** user who ran out of credits  
**I want to** easily upgrade my plan  
**So that** I can continue generating

**AC**: AC-2

---

## UI Wireframes

### Credit Display (Header)

```
┌─────────────────────────────────────────────────────┐
│  RYLA Dashboard          🎨 45 credits   [Settings] │
├─────────────────────────────────────────────────────┤
```

### Low Credit Warning

```
┌─────────────────────────────────────────────────────┐
│  ⚠️ You're running low on credits!                  │
│                                                      │
│  You have 8 credits remaining.                       │
│  Upgrade to Pro for 300 monthly credits.            │
│                                                      │
│  [Upgrade Now]  [Dismiss]                           │
└─────────────────────────────────────────────────────┘
```

### Generation Blocked Modal

```
┌─────────────────────────────────────────────────────┐
│  😔 Out of Credits                                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  You need 5 credits but only have 2.                │
│                                                      │
│  Upgrade your plan to continue creating             │
│  amazing AI influencer content.                     │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │  Pro Plan - $49/mo                         │     │
│  │  300 credits/month                         │     │
│  │  [Upgrade to Pro]                          │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  [View All Plans]                                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technical Notes

### Database Schema

```sql
-- User credits
ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN credits_refreshed_at TIMESTAMPTZ;

-- Credit transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL, -- negative for consumption, positive for refresh
  balance_after INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'generation', 'refresh', 'upgrade', 'bonus'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
```

### Credit Check Flow

```typescript
async function checkCredits(userId: string, needed: number): Promise<boolean> {
  const user = await getUser(userId);
  
  // Unlimited plan bypass
  if (user.plan === 'unlimited') return true;
  
  return user.credits >= needed;
}

async function consumeCredits(userId: string, amount: number, action: string) {
  const user = await getUser(userId);
  
  if (user.plan === 'unlimited') return; // No deduction
  
  await db.transaction(async (tx) => {
    // Deduct credits
    await tx.users.update(userId, { 
      credits: user.credits - amount 
    });
    
    // Log transaction
    await tx.credit_transactions.create({
      user_id: userId,
      amount: -amount,
      balance_after: user.credits - amount,
      action,
    });
  });
}
```

---

## Non-Goals (Phase 2+)

- Credit rollover
- Credit gifting
- Bonus credits for referrals
- Pay-per-credit (only subscription)
- Credit transfers between users

---

## Dependencies

- User authentication (EP-002)
- Subscription management (EP-010)
- Image generation (EP-005)
- Payment system (EP-003)

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

