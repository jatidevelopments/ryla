import { eq, and, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import * as schema from '../schema';
import { cards, subscriptions } from '../schema';
import type { Card, NewCard, Subscription, NewSubscription } from '../schema';

type DbType = NodePgDatabase<typeof schema>;
type TxType = PgTransaction<any, any, any>;

/**
 * Payment repository for managing payments, subscriptions, and cards
 * Follows MDC's repository pattern
 */
export class PaymentRepository {
  constructor(private readonly db: DbType | TxType) {}

  // ===========================================================================
  // Cards
  // ===========================================================================

  /**
   * Save a card to the database
   */
  async saveCard(card: NewCard): Promise<Card> {
    const [saved] = await this.db.insert(cards).values(card).returning();
    return saved;
  }

  /**
   * Get all cards for a user
   */
  async getUserCards(userId: string): Promise<Card[]> {
    return await this.db
      .select()
      .from(cards)
      .where(eq(cards.userId, userId))
      .orderBy(desc(cards.isDefault), desc(cards.createdAt));
  }

  /**
   * Get default card for a user
   */
  async getDefaultCard(userId: string): Promise<Card | null> {
    const [card] = await this.db
      .select()
      .from(cards)
      .where(and(eq(cards.userId, userId), eq(cards.isDefault, true)))
      .limit(1);
    return card || null;
  }

  /**
   * Get card by ID
   */
  async getCardById(cardId: string): Promise<Card | null> {
    const [card] = await this.db
      .select()
      .from(cards)
      .where(eq(cards.id, cardId))
      .limit(1);
    return card || null;
  }

  /**
   * Update card
   */
  async updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
    const [updated] = await this.db
      .update(cards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cards.id, cardId))
      .returning();
    return updated;
  }

  /**
   * Set default card (unset others)
   */
  async setDefaultCard(userId: string, cardId: string): Promise<void> {
    // Unset all default flags for user
    await this.db
      .update(cards)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(cards.userId, userId));

    // Set this card as default
    await this.db
      .update(cards)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(cards.id, cardId));
  }

  /**
   * Delete card
   */
  async deleteCard(cardId: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, cardId));
  }

  /**
   * Find card by hash (to avoid duplicates)
   */
  async findCardByHash(userId: string, cardHash: string): Promise<Card | null> {
    const [card] = await this.db
      .select()
      .from(cards)
      .where(and(eq(cards.userId, userId), eq(cards.cardHash, cardHash)))
      .limit(1);
    return card || null;
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  /**
   * Create a new subscription
   */
  async createSubscription(sub: NewSubscription): Promise<Subscription> {
    const [created] = await this.db
      .insert(subscriptions)
      .values(sub)
      .returning();
    return created;
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);
    return sub || null;
  }

  /**
   * Get current active subscription for user
   */
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return sub || null;
  }

  /**
   * Get subscription by Finby subscription ID
   */
  async getSubscriptionByFinbyId(
    finbySubscriptionId: string
  ): Promise<Subscription | null> {
    const [sub] = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.finbySubscriptionId, finbySubscriptionId))
      .limit(1);
    return sub || null;
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const [updated] = await this.db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();
    return updated;
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }
}

