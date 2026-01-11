/**
 * Payment Repository Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentRepository } from './payment.repository';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';

// Mock database
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  query: {
    users: {
      findFirst: vi.fn(),
    },
  },
} as unknown as NodePgDatabase<typeof schema>;

describe('PaymentRepository', () => {
  let repository: PaymentRepository;

  beforeEach(() => {
    repository = new PaymentRepository(mockDb);
    vi.clearAllMocks();
  });

  describe('saveCard', () => {
    it('should save a card to the database', async () => {
      const newCard = {
        userId: 'user-1',
        cardHash: 'hash-123',
        last4: '1234',
        cardType: 'Visa',
        expiryDate: '12/25',
        isDefault: true,
      };

      const mockReturn = [{ ...newCard, id: 'card-1', createdAt: new Date(), updatedAt: new Date() }];
      (mockDb.insert as any).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockReturn),
      });

      const result = await repository.saveCard(newCard);

      expect(result).toEqual(mockReturn[0]);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('getUserCards', () => {
    it('should retrieve all cards for a user', async () => {
      const mockCards = [
        { id: 'card-1', userId: 'user-1', cardHash: 'hash-1', isDefault: true },
        { id: 'card-2', userId: 'user-1', cardHash: 'hash-2', isDefault: false },
      ];

      (mockDb.select as any).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCards),
      });

      const result = await repository.getUserCards('user-1');

      expect(result).toEqual(mockCards);
    });
  });

  describe('createSubscription', () => {
    it('should create a new subscription', async () => {
      const newSub = {
        userId: 'user-1',
        finbySubscriptionId: 'finby-123',
        tier: 'pro' as any,
        status: 'active' as any,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      };

      const mockReturn = [{ ...newSub, id: 'sub-1', createdAt: new Date(), updatedAt: new Date() }];
      (mockDb.insert as any).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue(mockReturn),
      });

      const result = await repository.createSubscription(newSub);

      expect(result).toEqual(mockReturn[0]);
    });
  });
});

