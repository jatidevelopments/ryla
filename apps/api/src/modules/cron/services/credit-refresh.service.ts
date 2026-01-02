import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, lte, sql } from 'drizzle-orm';
import {
  subscriptions,
  userCredits,
  creditTransactions,
  PLAN_CREDIT_LIMITS,
  NotificationsRepository,
} from '@ryla/data';
import type { NotificationType } from '@ryla/data/schema';

// Map subscription tiers to plan credit limits
const TIER_TO_PLAN: Record<string, keyof typeof PLAN_CREDIT_LIMITS> = {
  free: 'free',
  creator: 'starter', // creator tier maps to starter credits
  pro: 'pro',
};

export interface CreditRefreshResult {
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ userId: string; error: string }>;
}

@Injectable()
export class CreditRefreshService {
  private readonly logger = new Logger(CreditRefreshService.name);

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>
  ) {}

  /**
   * Refresh credits for all subscriptions whose billing period has ended.
   * This should be called daily by a cron job.
   */
  async refreshDueCredits(): Promise<CreditRefreshResult> {
    const now = new Date();
    const result: CreditRefreshResult = {
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    };

    this.logger.log('Starting credit refresh job...');

    try {
      // Find all active subscriptions where currentPeriodEnd has passed
      const dueSubscriptions = await this.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.status, 'active'),
            lte(subscriptions.currentPeriodEnd, now)
          )
        );

      this.logger.log(`Found ${dueSubscriptions.length} subscriptions due for credit refresh`);
      result.processedCount = dueSubscriptions.length;

      for (const subscription of dueSubscriptions) {
        try {
          await this.refreshSubscriptionCredits(subscription);
          result.successCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            userId: subscription.userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          this.logger.error(
            `Failed to refresh credits for user ${subscription.userId}: ${error}`
          );
        }
      }

      this.logger.log(
        `Credit refresh completed: ${result.successCount} success, ${result.errorCount} errors`
      );
    } catch (error) {
      this.logger.error(`Credit refresh job failed: ${error}`);
      throw error;
    }

    return result;
  }

  /**
   * Refresh credits for a single subscription
   */
  private async refreshSubscriptionCredits(subscription: typeof subscriptions.$inferSelect): Promise<void> {
    const { userId, tier } = subscription;
    
    // Skip free tier (they only get one-time credits on signup)
    if (tier === 'free') {
      this.logger.debug(`Skipping free tier user ${userId}`);
      return;
    }

    // Get the plan credits based on tier
    const planKey = TIER_TO_PLAN[tier ?? 'free'] ?? 'free';
    const creditsToGrant = PLAN_CREDIT_LIMITS[planKey];

    // Skip unlimited plans (no credit tracking needed)
    if (creditsToGrant === Infinity) {
      this.logger.debug(`Skipping unlimited user ${userId}`);
      return;
    }

    this.logger.log(`Refreshing ${creditsToGrant} credits for user ${userId} (${tier} tier)`);

    await this.db.transaction(async (tx) => {
      // Reset credits to plan limit (not additive - "use it or lose it")
      const [updatedCredits] = await tx
        .insert(userCredits)
        .values({
          userId,
          balance: creditsToGrant,
          totalEarned: creditsToGrant,
        })
        .onConflictDoUpdate({
          target: userCredits.userId,
          set: {
            balance: creditsToGrant, // Reset to plan limit
            totalEarned: sql`${userCredits.totalEarned} + ${creditsToGrant}`,
            lowBalanceWarningShown: null, // Reset warning
            updatedAt: new Date(),
          },
        })
        .returning();

      // Log the transaction
      await tx.insert(creditTransactions).values({
        userId,
        type: 'subscription_grant',
        amount: creditsToGrant,
        balanceAfter: updatedCredits.balance,
        referenceType: 'subscription',
        referenceId: subscription.id,
        description: `Monthly credit refresh for ${tier} plan`,
      });

      // Update subscription period to next month
      const nextPeriodStart = subscription.currentPeriodEnd ?? new Date();
      const nextPeriodEnd = new Date(nextPeriodStart);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      await tx
        .update(subscriptions)
        .set({
          currentPeriodStart: nextPeriodStart,
          currentPeriodEnd: nextPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id));
    });

    // Create notification (after transaction commits)
    const notificationsRepo = new NotificationsRepository(this.db);
    await notificationsRepo.create({
      userId,
      type: 'credits.subscription_granted' as NotificationType,
      title: 'Monthly credits refreshed',
      body: `You received ${creditsToGrant} credits for your ${tier} subscription`,
      href: '/activity',
      metadata: { subscriptionId: subscription.id, creditsGranted: creditsToGrant, tier },
    });

    this.logger.log(`Successfully refreshed credits for user ${userId}`);
  }

  /**
   * Manually refresh credits for a specific user (for admin use or testing)
   */
  async refreshUserCredits(userId: string): Promise<void> {
    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      );

    if (!subscription) {
      throw new Error(`No active subscription found for user ${userId}`);
    }

    await this.refreshSubscriptionCredits(subscription);
  }
}

