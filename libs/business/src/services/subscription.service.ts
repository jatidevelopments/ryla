/**
 * Subscription Service
 * 
 * Business logic for subscription management
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { PaymentRepository } from '@ryla/data';
import type { Subscription, NewSubscription } from '@ryla/data/schema';

export interface CreateSubscriptionInput {
  userId: string;
  finbySubscriptionId: string;
  tier: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface UpdateSubscriptionInput {
  status?: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  expiredAt?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionService {
  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly paymentRepo: PaymentRepository
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    const newSub: NewSubscription = {
      userId: input.userId,
      finbySubscriptionId: input.finbySubscriptionId,
      tier: input.tier as any,
      status: 'active',
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    };

    return await this.paymentRepo.createSubscription(newSub);
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    input: UpdateSubscriptionInput
  ): Promise<Subscription> {
    return await this.paymentRepo.updateSubscription(subscriptionId, {
      ...input,
      updatedAt: new Date(),
    });
  }

  /**
   * Cancel subscription
   * Sets cancelledAt and expiredAt (equals currentPeriodEnd)
   */
  async cancelSubscription(
    subscriptionId: string,
    immediately = false
  ): Promise<Subscription> {
    const subscription = await this.paymentRepo.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    if (immediately) {
      // Cancel immediately - set expiredAt to now
      return await this.paymentRepo.updateSubscription(subscriptionId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        expiredAt: new Date(),
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      });
    } else {
      // Cancel at period end - set expiredAt to currentPeriodEnd
      return await this.paymentRepo.updateSubscription(subscriptionId, {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        expiredAt: subscription.currentPeriodEnd || new Date(),
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Get current active subscription for user
   */
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    return await this.paymentRepo.getCurrentSubscription(userId);
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    return await this.paymentRepo.getSubscriptionById(subscriptionId);
  }

  /**
   * Get all subscriptions for user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await this.paymentRepo.getUserSubscriptions(userId);
  }

  /**
   * Renew subscription (update period dates)
   */
  async renewSubscription(
    subscriptionId: string,
    newPeriodEnd: Date
  ): Promise<Subscription> {
    const subscription = await this.paymentRepo.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const currentPeriodStart = subscription.currentPeriodEnd || new Date();

    return await this.paymentRepo.updateSubscription(subscriptionId, {
      currentPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      status: 'active',
      updatedAt: new Date(),
    });
  }
}

