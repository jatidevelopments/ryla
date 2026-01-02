/**
 * Credit Management Service
 *
 * Handles credit checks, deductions, and refunds for feature usage.
 * Uses the shared credit pricing configuration.
 */

import {
  Injectable,
  Inject,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import { userCredits, creditTransactions } from '@ryla/data';
import {
  FeatureId,
  getFeatureCost,
  hasEnoughCredits,
  getFeatureDefinition,
} from '@ryla/shared';

export interface CreditDeductionResult {
  success: boolean;
  creditsDeducted: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionId: string;
}

export interface CreditRefundResult {
  success: boolean;
  creditsRefunded: number;
  balanceAfter: number;
}

@Injectable()
export class CreditManagementService {
  private readonly logger = new Logger(CreditManagementService.name);

  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>
  ) {}

  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<number> {
    const credits = await this.db
      .select({ balance: userCredits.balance })
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    return credits[0]?.balance ?? 0;
  }

  /**
   * Check if user has enough credits for a feature
   */
  async checkCredits(
    userId: string,
    featureId: FeatureId,
    count: number = 1
  ): Promise<{ hasEnough: boolean; balance: number; required: number }> {
    const balance = await this.getBalance(userId);
    const required = getFeatureCost(featureId, count);

    return {
      hasEnough: hasEnoughCredits(balance, featureId, count),
      balance,
      required,
    };
  }

  /**
   * Check credits and throw if insufficient
   */
  async requireCredits(
    userId: string,
    featureId: FeatureId,
    count: number = 1
  ): Promise<{ balance: number; required: number }> {
    const { hasEnough, balance, required } = await this.checkCredits(
      userId,
      featureId,
      count
    );

    if (!hasEnough) {
      const feature = getFeatureDefinition(featureId);
      throw new ForbiddenException(
        `Insufficient credits. ${feature?.name ?? featureId} requires ${required} credits, you have ${balance}.`
      );
    }

    return { balance, required };
  }

  /**
   * Deduct credits for feature usage
   * Returns the transaction ID for potential refunds
   */
  async deductCredits(
    userId: string,
    featureId: FeatureId,
    count: number = 1,
    referenceId?: string,
    description?: string
  ): Promise<CreditDeductionResult> {
    const { balance: balanceBefore, required } = await this.requireCredits(
      userId,
      featureId,
      count
    );

    const balanceAfter = balanceBefore - required;
    const feature = getFeatureDefinition(featureId);

    // Atomic update with transaction
    const result = await this.db.transaction(async (tx) => {
      // Deduct credits
      await tx
        .update(userCredits)
        .set({
          balance: balanceAfter,
          totalSpent: sql`${userCredits.totalSpent} + ${required}`,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      // Record transaction
      const [transaction] = await tx
        .insert(creditTransactions)
        .values({
          userId,
          type: 'generation',
          amount: -required,
          balanceAfter,
          referenceType: 'feature',
          referenceId,
          description:
            description ??
            `${feature?.name ?? featureId} (x${count})`,
          qualityMode: featureId, // Store feature ID for analytics
        })
        .returning({ id: creditTransactions.id });

      return transaction;
    });

    this.logger.log(
      `Deducted ${required} credits from user ${userId} for ${featureId} (x${count}). Balance: ${balanceBefore} → ${balanceAfter}`
    );

    return {
      success: true,
      creditsDeducted: required,
      balanceBefore,
      balanceAfter,
      transactionId: result.id,
    };
  }

  /**
   * Deduct a raw amount of credits (for addons like NSFW)
   * Throws if insufficient credits
   */
  async deductCreditsRaw(
    userId: string,
    amount: number,
    referenceId?: string,
    description?: string
  ): Promise<CreditDeductionResult> {
    const balanceBefore = await this.getBalance(userId);

    if (balanceBefore < amount) {
      throw new ForbiddenException(
        `Insufficient credits. Need ${amount}, have ${balanceBefore}.`
      );
    }

    const balanceAfter = balanceBefore - amount;

    const result = await this.db.transaction(async (tx) => {
      await tx
        .update(userCredits)
        .set({
          balance: balanceAfter,
          totalSpent: sql`${userCredits.totalSpent} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      const [transaction] = await tx
        .insert(creditTransactions)
        .values({
          userId,
          type: 'generation',
          amount: -amount,
          balanceAfter,
          referenceType: 'addon',
          referenceId,
          description: description ?? `Credit deduction`,
        })
        .returning({ id: creditTransactions.id });

      return transaction;
    });

    this.logger.log(
      `Deducted ${amount} credits from user ${userId}. Balance: ${balanceBefore} → ${balanceAfter}. Reason: ${description}`
    );

    return {
      success: true,
      creditsDeducted: amount,
      balanceBefore,
      balanceAfter,
      transactionId: result.id,
    };
  }

  /**
   * Refund credits for a failed operation
   */
  async refundCredits(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string
  ): Promise<CreditRefundResult> {
    const balanceBefore = await this.getBalance(userId);
    const balanceAfter = balanceBefore + amount;

    await this.db.transaction(async (tx) => {
      // Add credits back
      await tx
        .update(userCredits)
        .set({
          balance: balanceAfter,
          totalSpent: sql`GREATEST(0, ${userCredits.totalSpent} - ${amount})`,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      // Record refund transaction
      await tx.insert(creditTransactions).values({
        userId,
        type: 'refund',
        amount,
        balanceAfter,
        referenceType: 'refund',
        referenceId,
        description: reason,
      });
    });

    this.logger.log(
      `Refunded ${amount} credits to user ${userId}. Balance: ${balanceBefore} → ${balanceAfter}. Reason: ${reason}`
    );

    return {
      success: true,
      creditsRefunded: amount,
      balanceAfter,
    };
  }
}

