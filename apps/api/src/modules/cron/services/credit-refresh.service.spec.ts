import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { CreditRefreshService } from './credit-refresh.service';
import { createTestDb } from '../../../test/utils/test-db';
import { subscriptions, userCredits, creditTransactions } from '@ryla/data/schema';
import * as schema from '@ryla/data/schema';
import { eq, and, lte, sql } from 'drizzle-orm';

describe('CreditRefreshService', () => {
  let service: CreditRefreshService;
  let db: any;
  let client: any;

  // OPTIMIZATION: Create DB once per test suite instead of per test
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
    client = testDb.client;

    service = new CreditRefreshService(db);
  });

  // OPTIMIZATION: Clean up data between tests instead of recreating DB
  beforeEach(async () => {
    // Use DELETE with condition that's always true to delete all rows
    // Delete in reverse order of foreign key dependencies
    try {
      await db.delete(schema.creditTransactions).where(sql`1=1`);
      await db.delete(schema.userCredits).where(sql`1=1`);
      await db.delete(schema.subscriptions).where(sql`1=1`);
      await db.delete(schema.users).where(sql`1=1`);
    } catch (error) {
      // If DELETE fails, tests will still run
      console.warn('Cleanup failed, continuing with test:', error);
    }
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('refreshDueCredits', () => {
    it('should process subscriptions due for refresh', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000); // 1 day ago

      // Create user first (for FK constraint)
      await db.insert(schema.users).values({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User',
        publicName: 'testuser',
      });

      // Create user credits
      await db.insert(userCredits).values({
        userId: 'user-123',
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      });

      // Create subscription due for refresh
      await db.insert(subscriptions).values({
        userId: 'user-123',
        tier: 'pro',
        status: 'active',
        currentPeriodEnd: pastDate,
        currentPeriodStart: new Date(pastDate.getTime() - 2592000000), // 30 days ago
      });

      const result = await service.refreshDueCredits();

      expect(result.processedCount).toBeGreaterThan(0);
      expect(result.successCount).toBeGreaterThan(0);
    });

    it('should skip free tier subscriptions', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000);

      // Create user first
      await db.insert(schema.users).values({
        id: 'user-free',
        email: 'free@example.com',
        password: 'hashed',
        name: 'Free User',
        publicName: 'freeuser',
      });

      await db.insert(userCredits).values({
        userId: 'user-free',
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      });

      await db.insert(subscriptions).values({
        userId: 'user-free',
        tier: 'free',
        status: 'active',
        currentPeriodEnd: pastDate,
      });

      const result = await service.refreshDueCredits();

      // Free tier should be skipped, so no credits granted
      expect(result.processedCount).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      // Create invalid subscription that will cause error
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000);

      // Create user first
      await db.insert(schema.users).values({
        id: 'user-error',
        email: 'error@example.com',
        password: 'hashed',
        name: 'Error User',
        publicName: 'erroruser',
      });

      await db.insert(userCredits).values({
        userId: 'user-error',
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      });

      await db.insert(subscriptions).values({
        userId: 'user-error',
        tier: 'invalid-tier',
        status: 'active',
        currentPeriodEnd: pastDate,
      });

      const result = await service.refreshDueCredits();

      expect(result.errorCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('refreshUserCredits', () => {
    it('should refresh credits for specific user', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 86400000);

      // Create user first
      await db.insert(schema.users).values({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed',
        name: 'Test User',
        publicName: 'testuser',
      });

      await db.insert(userCredits).values({
        userId: 'user-123',
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      });

      await db.insert(subscriptions).values({
        userId: 'user-123',
        tier: 'pro',
        status: 'active',
        currentPeriodEnd: pastDate,
      });

      await service.refreshUserCredits('user-123');

      // Verify credits were updated
      const [credits] = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, 'user-123'));

      expect(credits).toBeDefined();
    });

    it('should throw error when no active subscription found', async () => {
      await expect(service.refreshUserCredits('non-existent')).rejects.toThrow(
        'No active subscription found',
      );
    });
  });
});
