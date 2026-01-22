# [EPIC] EP-052: Credits & Billing Operations

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 1 (MVP)  
**Priority**: P0  
**Status**: Completed

---

## Overview

Enable admin team to perform billing operations including viewing credit balances, adding credits, issuing refunds, and managing subscription information. All operations must be audited.

---

## Business Impact

**Target Metric**: D-Conversion, E-CAC

**Hypothesis**: When billing issues can be resolved quickly without database access, we reduce customer churn, increase satisfaction, and reduce operational costs.

**Success Criteria**:

- Time to issue credit refund: < 1 minute
- All credit operations audited: 100%
- No direct database access needed for billing operations

---

## Features

### F1: Credit Balance Overview

- View user's current credit balance
- Total credits earned (lifetime)
- Total credits spent (lifetime)
- Low balance warning threshold status
- Quick action buttons (add credits, refund)

### F2: Credit Transaction History

- Full transaction history table
- Filterable by type (subscription_grant, purchase, generation, refund, bonus, admin_adjustment)
- Filterable by date range
- Sortable columns
- Export to CSV

**Transaction Table Columns**:
| Column | Description |
|--------|-------------|
| Date | Transaction timestamp |
| Type | Transaction type badge |
| Amount | Credits (+/-) |
| Balance After | Balance after transaction |
| Quality Mode | draft/hq (for generation) |
| Reference | Link to related entity |
| Description | Human-readable description |

### F3: Add Credits

- Add credits to user account
- Required reason field
- Amount validation (positive, max 10,000)
- Creates `admin_adjustment` transaction
- Audit log entry with admin ID
- Confirmation dialog

**Use Cases**:
- Promotional credits
- Compensation for issues
- Partner/influencer credits
- Testing accounts

### F4: Refund Credits

- Refund credits for failed/poor generations
- Link to specific generation job (optional)
- Required reason field
- Creates `refund` transaction
- Audit log entry
- Confirmation dialog

**Refund Types**:
- Failed generation (job never completed)
- Poor quality output
- System error
- Customer goodwill

### F5: Credit Adjustment

- Generic credit adjustment (add or subtract)
- Requires detailed reason
- Super admin only for negative adjustments
- Creates `admin_adjustment` transaction
- Full audit trail

### F6: Subscription Overview

- Current subscription tier and status
- Finby subscription ID
- Current period dates
- Cancel at period end status
- Next renewal date
- Subscription creation date

### F7: Subscription History

- All subscription changes
- Tier upgrades/downgrades
- Cancellations
- Renewals
- Status changes

### F8: Billing Analytics (Dashboard Widget)

- Total credits issued today/week/month
- Total refunds issued
- Average credits per user
- Credits burned (generation)
- Subscription distribution chart

---

## Acceptance Criteria

### AC-1: Credit Balance View

- [ ] Shows current balance accurately
- [ ] Shows lifetime stats
- [ ] Low balance threshold visible
- [ ] Quick action buttons work
- [ ] Data refreshes on action completion

### AC-2: Transaction History

- [ ] All transactions displayed
- [ ] Pagination works correctly
- [ ] Filters work correctly
- [ ] Type badges color-coded
- [ ] Export to CSV works
- [ ] Reference links navigate correctly

### AC-3: Add Credits

- [ ] Can add credits to any user
- [ ] Amount must be positive
- [ ] Reason is required
- [ ] Transaction created correctly
- [ ] Balance updates immediately
- [ ] Audit log entry created
- [ ] Confirmation dialog shown

### AC-4: Refund Credits

- [ ] Can issue refund
- [ ] Can link to generation job
- [ ] Reason is required
- [ ] Transaction type is 'refund'
- [ ] Balance updates correctly
- [ ] Audit log entry created
- [ ] Cannot refund more than spent

### AC-5: Credit Adjustment

- [ ] Can add or subtract credits
- [ ] Negative adjustments super_admin only
- [ ] Detailed reason required
- [ ] Transaction created correctly
- [ ] Full audit trail maintained

### AC-6: Subscription View

- [ ] Current subscription accurate
- [ ] All fields displayed correctly
- [ ] Finby ID links work (if applicable)
- [ ] Status badges accurate
- [ ] Period dates formatted correctly

### AC-7: Subscription History

- [ ] All changes shown
- [ ] Chronological order
- [ ] Status changes visible
- [ ] Tier changes visible
- [ ] Dates formatted correctly

### AC-8: Billing Analytics

- [ ] Dashboard widget loads
- [ ] Stats are accurate
- [ ] Time period selector works
- [ ] Chart renders correctly

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_credits_added` | Credits added | `user_id`, `amount`, `reason_category` |
| `admin_credits_refunded` | Refund issued | `user_id`, `amount`, `job_id` |
| `admin_credits_adjusted` | Adjustment made | `user_id`, `amount`, `is_negative` |
| `admin_transactions_exported` | CSV export | `user_id`, `row_count` |
| `admin_subscription_viewed` | Sub details opened | `user_id`, `tier` |

---

## User Stories

### ST-220: Add Credits to User

**As a** billing admin  
**I want to** add credits to a user account  
**So that** I can provide compensation or promotional credits

**AC**: AC-3

### ST-221: Issue Credit Refund

**As a** billing admin  
**I want to** refund credits for a failed generation  
**So that** the user is not charged for something that didn't work

**AC**: AC-4

### ST-222: View Credit History

**As a** billing admin  
**I want to** see all credit transactions for a user  
**So that** I can understand their billing history

**AC**: AC-2

### ST-223: View Subscription Details

**As a** billing admin  
**I want to** see a user's subscription information  
**So that** I can answer billing questions

**AC**: AC-6, AC-7

### ST-224: Export Transactions

**As a** billing admin  
**I want to** export credit transactions to CSV  
**So that** I can analyze billing data externally

**AC**: AC-2

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router - Billing
admin.billing.getUserCredits({ userId })
admin.billing.getTransactions({ userId, filters, limit, offset })
admin.billing.addCredits({ userId, amount, reason, category })
admin.billing.refundCredits({ userId, amount, reason, jobId? })
admin.billing.adjustCredits({ userId, amount, reason })
admin.billing.getUserSubscription({ userId })
admin.billing.getSubscriptionHistory({ userId })
admin.billing.getStats({ period: 'day' | 'week' | 'month' })
admin.billing.exportTransactions({ userId?, filters, format: 'csv' })
```

### Credit Operation Flow

```typescript
// libs/business/src/services/admin-billing.service.ts
export class AdminBillingService {
  async addCredits(
    adminUserId: string,
    userId: string,
    amount: number,
    reason: string,
    category: string
  ) {
    return this.db.transaction(async (tx) => {
      // 1. Get current balance
      const userCredits = await tx.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId),
      });
      
      const newBalance = (userCredits?.balance || 0) + amount;
      
      // 2. Update balance
      await tx.update(userCredits)
        .set({ 
          balance: newBalance,
          totalEarned: sql`total_earned + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));
      
      // 3. Create transaction record
      await tx.insert(creditTransactions).values({
        userId,
        type: 'admin_adjustment',
        amount,
        balanceAfter: newBalance,
        description: `Admin credit: ${reason}`,
      });
      
      // 4. Create audit log
      await tx.insert(auditLogs).values({
        adminUserId,
        action: 'create',
        resourceType: 'credit',
        resourceId: userId,
        newValue: { amount, reason, category },
        metadata: { operation: 'add_credits' },
      });
      
      return { newBalance, transactionId: /* ... */ };
    });
  }
  
  async refundCredits(
    adminUserId: string,
    userId: string,
    amount: number,
    reason: string,
    jobId?: string
  ) {
    return this.db.transaction(async (tx) => {
      // Similar pattern with type: 'refund'
    });
  }
}
```

### UI Components

```
apps/admin/app/billing/
├── page.tsx                    # Billing dashboard
├── credits/
│   └── [userId]/
│       └── page.tsx           # User credits page
├── components/
│   ├── CreditBalanceCard.tsx
│   ├── TransactionTable.tsx
│   ├── TransactionFilters.tsx
│   ├── AddCreditsDialog.tsx
│   ├── RefundCreditsDialog.tsx
│   ├── AdjustCreditsDialog.tsx
│   ├── SubscriptionCard.tsx
│   ├── SubscriptionHistory.tsx
│   └── BillingStatsWidget.tsx
└── hooks/
    ├── useUserCredits.ts
    ├── useTransactions.ts
    └── useBillingStats.ts
```

### Reason Categories

```typescript
export const CREDIT_ADD_REASONS = [
  { value: 'promotional', label: 'Promotional Credits' },
  { value: 'compensation', label: 'Compensation for Issue' },
  { value: 'partner', label: 'Partner/Influencer Credits' },
  { value: 'testing', label: 'Testing Account' },
  { value: 'other', label: 'Other (specify)' },
] as const;

export const REFUND_REASONS = [
  { value: 'failed_generation', label: 'Failed Generation' },
  { value: 'poor_quality', label: 'Poor Quality Output' },
  { value: 'system_error', label: 'System Error' },
  { value: 'goodwill', label: 'Customer Goodwill' },
  { value: 'duplicate_charge', label: 'Duplicate Charge' },
  { value: 'other', label: 'Other (specify)' },
] as const;
```

---

## Non-Goals (Phase 2+)

- Direct Finby subscription management (cancel, upgrade)
- Payment method management
- Invoice generation
- Bulk credit operations
- Automated refund rules

---

## Dependencies

- EP-050: Admin Authentication
- EP-051: User Management (user context)
- Existing credit schema and repository
- Existing subscription schema

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
