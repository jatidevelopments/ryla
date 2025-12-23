/**
 * Credit Grant Service
 *
 * Handles granting credits to users based on subscription events.
 * Used by webhook handlers to add credits on subscription creation/renewal.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

// Import schema directly - payments lib depends on data lib
import {
  userCredits,
  creditTransactions,
  type UserCredits,
} from '@ryla/data';

// Plan to credits mapping
export const PLAN_CREDITS: Record<string, number> = {
  // Plan names (case-insensitive matching)
  free: 10,
  starter: 100,
  pro: 300,
  unlimited: 0, // Unlimited plan doesn't use credits

  // Price IDs (for direct lookup)
  // Add your actual Finby/Stripe price IDs here
  price_starter_monthly: 100,
  price_starter_yearly: 100,
  price_pro_monthly: 300,
  price_pro_yearly: 300,
};

export interface CreditGrantParams {
  userId: string;
  amount: number;
  type: 'subscription_grant' | 'purchase' | 'bonus' | 'admin_adjustment';
  description?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface CreditGrantResult {
  success: boolean;
  previousBalance: number;
  newBalance: number;
  amountAdded: number;
  error?: string;
}

/**
 * Get credits amount for a plan/price ID
 */
export function getCreditsForPlan(planOrPriceId: string): number {
  const key = planOrPriceId.toLowerCase();

  // Direct lookup
  if (PLAN_CREDITS[key] !== undefined) {
    return PLAN_CREDITS[key];
  }

  // Try matching by prefix
  if (key.includes('starter')) return 100;
  if (key.includes('pro')) return 300;
  if (key.includes('unlimited')) return 0;
  if (key.includes('free')) return 10;

  // Default to starter credits
  return 100;
}

/**
 * Grant credits to a user
 */
export async function grantCredits(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: NodePgDatabase<any>,
  params: CreditGrantParams
): Promise<CreditGrantResult> {
  try {
    // Get current balance
    let credits: UserCredits | undefined = await db.query.userCredits?.findFirst({
      where: eq(userCredits.userId, params.userId),
    });

    const previousBalance = credits?.balance ?? 0;

    // Create credits record if it doesn't exist
    if (!credits) {
      const [newCredits] = await db
        .insert(userCredits)
        .values({
          userId: params.userId,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
        })
        .returning();
      credits = newCredits;
    }

    const newBalance = (credits?.balance ?? 0) + params.amount;
    const newTotalEarned = (credits?.totalEarned ?? 0) + params.amount;

    // Update balance
    await db
      .update(userCredits)
      .set({
        balance: newBalance,
        totalEarned: newTotalEarned,
        // Reset low balance warning when credits are added
        lowBalanceWarningShown: null,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, params.userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId: params.userId,
      type: params.type,
      amount: params.amount,
      balanceAfter: newBalance,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      description:
        params.description ||
        `${params.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
    });

    return {
      success: true,
      previousBalance,
      newBalance,
      amountAdded: params.amount,
    };
  } catch (error) {
    return {
      success: false,
      previousBalance: 0,
      newBalance: 0,
      amountAdded: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Grant subscription credits to a user
 * Convenience wrapper for subscription events
 */
export async function grantSubscriptionCredits(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: NodePgDatabase<any>,
  userId: string,
  planOrPriceId: string,
  subscriptionId?: string
): Promise<CreditGrantResult> {
  const amount = getCreditsForPlan(planOrPriceId);

  // Skip if unlimited plan (no credits needed)
  if (amount === 0) {
    return {
      success: true,
      previousBalance: 0,
      newBalance: 0,
      amountAdded: 0,
    };
  }

  return grantCredits(db, {
    userId,
    amount,
    type: 'subscription_grant',
    description: `Monthly subscription credits (${planOrPriceId})`,
    referenceType: 'subscription',
    referenceId: subscriptionId,
  });
}

