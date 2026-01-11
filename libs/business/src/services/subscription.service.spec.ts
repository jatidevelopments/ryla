/**
 * Subscription Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubscriptionService } from './subscription.service';
import { PaymentRepository } from '@ryla/data';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';

// Mock repository
const mockPaymentRepo = {
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  getSubscriptionById: vi.fn(),
  getCurrentSubscription: vi.fn(),
  getUserSubscriptions: vi.fn(),
} as unknown as PaymentRepository;

// Mock database
const mockDb = {} as NodePgDatabase<typeof schema>;

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    service = new SubscriptionService(mockDb, mockPaymentRepo as PaymentRepository);
    vi.clearAllMocks();
  });

  describe('createSubscription', () => {
    it('should create a subscription with correct period dates', async () => {
      const input = {
        userId: 'user-1',
        finbySubscriptionId: 'finby-123',
        tier: 'pro',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
      };

      const mockSubscription = {
        id: 'sub-1',
        ...input,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockPaymentRepo.createSubscription).mockResolvedValue(mockSubscription as any);

      const result = await service.createSubscription(input);

      expect(result).toEqual(mockSubscription);
      expect(mockPaymentRepo.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: input.userId,
          finbySubscriptionId: input.finbySubscriptionId,
          tier: input.tier,
          status: 'active',
        })
      );
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription immediately', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 'user-1',
        currentPeriodEnd: new Date('2024-02-01'),
      };

      vi.mocked(mockPaymentRepo.getSubscriptionById).mockResolvedValue(subscription as any);
      vi.mocked(mockPaymentRepo.updateSubscription).mockResolvedValue({
        ...subscription,
        status: 'cancelled',
        cancelledAt: new Date(),
        expiredAt: new Date(),
      } as any);

      const result = await service.cancelSubscription('sub-1', true);

      expect(result.status).toBe('cancelled');
      expect(result.cancelledAt).toBeDefined();
      expect(result.expiredAt).toBeDefined();
    });

    it('should cancel subscription at period end', async () => {
      const subscription = {
        id: 'sub-1',
        userId: 'user-1',
        currentPeriodEnd: new Date('2024-02-01'),
      };

      vi.mocked(mockPaymentRepo.getSubscriptionById).mockResolvedValue(subscription as any);
      vi.mocked(mockPaymentRepo.updateSubscription).mockResolvedValue({
        ...subscription,
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        expiredAt: subscription.currentPeriodEnd,
      } as any);

      const result = await service.cancelSubscription('sub-1', false);

      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(result.expiredAt).toEqual(subscription.currentPeriodEnd);
    });
  });
});

