/**
 * Card Service
 * 
 * Business logic for payment card management
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { PaymentRepository } from '@ryla/data';
import type { Card, NewCard } from '@ryla/data/schema';

export interface SaveCardInput {
  userId: string;
  cardHash: string;
  last4?: string;
  cardType?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

export class CardService {
  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly paymentRepo: PaymentRepository
  ) {}

  /**
   * Save a card to the database
   */
  async saveCard(input: SaveCardInput): Promise<Card> {
    // Check if card already exists
    const existingCard = await this.paymentRepo.findCardByHash(input.userId, input.cardHash);
    if (existingCard) {
      return existingCard;
    }

    // If this is the first card, set as default
    const userCards = await this.paymentRepo.getUserCards(input.userId);
    const isDefault = userCards.length === 0 || input.isDefault === true;

    // If setting as default, unset other default cards
    if (isDefault) {
      const currentDefault = await this.paymentRepo.getDefaultCard(input.userId);
      if (currentDefault) {
        await this.paymentRepo.updateCard(currentDefault.id, { isDefault: false });
      }
    }

    const newCard: NewCard = {
      userId: input.userId,
      cardHash: input.cardHash,
      last4: input.last4,
      cardType: input.cardType,
      expiryDate: input.expiryDate,
      isDefault,
    };

    return await this.paymentRepo.saveCard(newCard);
  }

  /**
   * Get all cards for a user
   */
  async getUserCards(userId: string): Promise<Card[]> {
    return await this.paymentRepo.getUserCards(userId);
  }

  /**
   * Get default card for a user
   */
  async getDefaultCard(userId: string): Promise<Card | null> {
    return await this.paymentRepo.getDefaultCard(userId);
  }

  /**
   * Get card by ID
   */
  async getCardById(cardId: string): Promise<Card | null> {
    return await this.paymentRepo.getCardById(cardId);
  }

  /**
   * Set default card
   */
  async setDefaultCard(userId: string, cardId: string): Promise<void> {
    await this.paymentRepo.setDefaultCard(userId, cardId);
  }

  /**
   * Delete card
   */
  async deleteCard(cardId: string): Promise<void> {
    await this.paymentRepo.deleteCard(cardId);
  }

  /**
   * Update card
   */
  async updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
    return await this.paymentRepo.updateCard(cardId, updates);
  }
}

