import { Test, TestingModule } from '@nestjs/testing';
import { CreditManagementService } from './credit-management.service';
import { createTestDb } from '../../../test/utils/test-db';
import * as schema from '@ryla/data/schema';
import { userCredits, creditTransactions } from '@ryla/data';
import { eq } from 'drizzle-orm';
import { ForbiddenException } from '@nestjs/common';

describe('CreditManagementService Integration', () => {
    let service: CreditManagementService;
    let db: any;
    let client: any;
    const userId = '00000000-0000-0000-0000-000000000001';

    beforeEach(async () => {
        const testDb = await createTestDb();
        db = testDb.db;
        client = testDb.client;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreditManagementService,
                { provide: 'DRIZZLE_DB', useValue: db },
            ],
        }).compile();

        service = module.get<CreditManagementService>(CreditManagementService);

        // Setup user first (for FK constraint)
        await db.insert(schema.users).values({
            id: userId,
            email: 'credits@example.com',
            password: 'hashedpassword',
            name: 'Credits User',
            publicName: 'creditsuser',
        });

        // Setup user credits
        await db.insert(userCredits).values({
            userId,
            balance: 100,
            totalEarned: 100,
            totalSpent: 0,
        });
    });

    afterEach(async () => {
        if (client) await client.close();
    });

    it('should return correct balance', async () => {
        const balance = await service.getBalance(userId);
        expect(balance).toBe(100);
    });

    describe('checkCredits', () => {
        it('should return true if enough credits', async () => {
            // studio_fast costs 15 credits per image
            const result = await service.checkCredits(userId, 'studio_fast', 1);
            expect(result.hasEnough).toBe(true);
            expect(result.required).toBe(15);
        });

        it('should return false if not enough credits', async () => {
            // 10 images at 15 credits each = 150 credits (user only has 100)
            const result = await service.checkCredits(userId, 'studio_fast', 10);
            expect(result.hasEnough).toBe(false);
            expect(result.required).toBe(150);
        });
    });

    describe('requireCredits', () => {
        it('should return balance if enough credits', async () => {
            const result = await service.requireCredits(userId, 'studio_fast', 1);
            expect(result.balance).toBe(100);
        });

        it('should throw ForbiddenException if not enough credits', async () => {
            await expect(
                service.requireCredits(userId, 'studio_fast', 10)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deductCredits', () => {
        it('should deduct credits and record transaction', async () => {
            // studio_fast costs 15 credits per image
            const result = await service.deductCredits(userId, 'studio_fast', 1);

            expect(result.success).toBe(true);
            expect(result.creditsDeducted).toBe(15);
            expect(result.balanceAfter).toBe(85);

            // Verify in DB
            const dbCredits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
            expect(dbCredits[0].balance).toBe(85);

            const transactions = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));
            expect(transactions.length).toBe(1);
            expect(transactions[0].amount).toBe(-15);
        });

        it('should throw ForbiddenException if insufficient credits', async () => {
            await expect(
                service.deductCredits(userId, 'studio_fast', 1000)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deductCreditsRaw', () => {
        it('should deduct raw amount and record transaction', async () => {
            const validUuid = '00000000-0000-0000-0000-000000000002';
            const result = await service.deductCreditsRaw(userId, 25, validUuid, 'Addon');

            expect(result.success).toBe(true);
            expect(result.creditsDeducted).toBe(25);
            expect(result.balanceAfter).toBe(75);

            const dbCredits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
            expect(dbCredits[0].balance).toBe(75);
        });

        it('should throw ForbiddenException if insufficient for raw amount', async () => {
            await expect(
                service.deductCreditsRaw(userId, 200)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('refundCredits', () => {
        it('should refund credits and record transaction', async () => {
            await service.refundCredits(userId, 50, 'Test refund');

            const balance = await service.getBalance(userId);
            expect(balance).toBe(150);

            const transactions = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));
            expect(transactions.length).toBe(1);
            expect(transactions[0].type).toBe('refund');
            expect(transactions[0].amount).toBe(50);
        });
    });
});
