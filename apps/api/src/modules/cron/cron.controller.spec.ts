import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CronController } from './cron.controller';
import { CreditRefreshService } from './services/credit-refresh.service';
import { TemplateTrendingService } from './services/template-trending.service';
import { UnauthorizedException } from '@nestjs/common';

describe('CronController', () => {
  let controller: CronController;
  let mockCreditRefreshService: CreditRefreshService;
  let mockTemplateTrendingService: TemplateTrendingService;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test-secret';

    mockCreditRefreshService = {
      refreshDueCredits: vi.fn(),
      refreshUserCredits: vi.fn(),
    } as unknown as CreditRefreshService;

    mockTemplateTrendingService = {
      refreshTrendingView: vi.fn(),
      getTrendingStats: vi.fn(),
    } as unknown as TemplateTrendingService;

    controller = new CronController(mockCreditRefreshService, mockTemplateTrendingService);
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.CRON_SECRET = originalEnv;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  describe('verifyCronSecret', () => {
    it('should throw UnauthorizedException when CRON_SECRET not set', () => {
      delete process.env.CRON_SECRET;

      expect(() => {
        (controller as any).verifyCronSecret('Bearer test-secret');
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when secret does not match', () => {
      expect(() => {
        (controller as any).verifyCronSecret('Bearer wrong-secret');
      }).toThrow(UnauthorizedException);
    });

    it('should accept Bearer token format', () => {
      expect(() => {
        (controller as any).verifyCronSecret('Bearer test-secret');
      }).not.toThrow();
    });

    it('should accept plain secret format', () => {
      expect(() => {
        (controller as any).verifyCronSecret('test-secret');
      }).not.toThrow();
    });
  });

  describe('refreshCredits', () => {
    it('should refresh credits with valid secret', async () => {
      const mockResult = {
        processedCount: 5,
        successCount: 5,
        errorCount: 0,
        errors: [],
      };
      vi.mocked(mockCreditRefreshService.refreshDueCredits).mockResolvedValue(mockResult);

      const result = await controller.refreshCredits('Bearer test-secret');

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(5);
      expect(result).toHaveProperty('timestamp');
    });

    it('should throw UnauthorizedException with invalid secret', async () => {
      await expect(controller.refreshCredits('Bearer wrong-secret')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshUserCredits', () => {
    it('should refresh user credits with valid secret', async () => {
      vi.mocked(mockCreditRefreshService.refreshUserCredits).mockResolvedValue(undefined);

      const result = await controller.refreshUserCredits('Bearer test-secret', 'user-123');

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-123');
      expect(result).toHaveProperty('timestamp');
      expect(mockCreditRefreshService.refreshUserCredits).toHaveBeenCalledWith('user-123');
    });

    it('should throw UnauthorizedException with invalid secret', async () => {
      await expect(
        controller.refreshUserCredits('Bearer wrong-secret', 'user-123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTrending', () => {
    it('should refresh trending with valid secret', async () => {
      const mockResult = {
        success: true,
        durationMs: 100,
        rowsUpdated: 50,
      };
      vi.mocked(mockTemplateTrendingService.refreshTrendingView).mockResolvedValue(mockResult);

      const result = await controller.refreshTrending('Bearer test-secret');

      expect(result.success).toBe(true);
      expect(result.durationMs).toBe(100);
      expect(result).toHaveProperty('timestamp');
    });

    it('should throw UnauthorizedException with invalid secret', async () => {
      await expect(controller.refreshTrending('Bearer wrong-secret')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getTrendingStats', () => {
    it('should return trending stats with valid secret', async () => {
      const mockStats = {
        totalTemplates: 100,
        topTemplates: [{ id: '1', trendingScore: 10, usageRate: 0.5 }],
      };
      vi.mocked(mockTemplateTrendingService.getTrendingStats).mockResolvedValue(mockStats);

      const result = await controller.getTrendingStats('Bearer test-secret');

      expect(result.totalTemplates).toBe(100);
      expect(result.topTemplates).toHaveLength(1);
      expect(result).toHaveProperty('timestamp');
    });

    it('should throw UnauthorizedException with invalid secret', async () => {
      await expect(controller.getTrendingStats('Bearer wrong-secret')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await controller.healthCheck();

      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
