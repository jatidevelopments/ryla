import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { paymentService } from './payment.service';
import * as authModule from '../auth';

// Mock auth module
vi.mock('../auth', () => ({
  getAccessToken: vi.fn(),
  getCurrentUser: vi.fn(),
}));

describe('paymentService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    publicName: 'Test User',
    role: null,
    isEmailVerified: true,
    banned: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authModule.getAccessToken).mockReturnValue(mockToken);
    vi.mocked(authModule.getCurrentUser).mockResolvedValue(mockUser);

    // Mock window.open
    global.window = {
      ...global.window,
      open: vi.fn(() => ({
        focus: vi.fn(),
      })) as any,
    };

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPaymentSession', () => {
    it('should create subscription payment session successfully', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
        paymentRequestId: 'req-123',
        reference: 'sub_user-123_plan-456',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      const result = await paymentService.createPaymentSession({
        type: 'subscription',
        planId: 'plan-456',
        isYearly: false,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/payments/session'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
      expect(window.open).toHaveBeenCalledWith(mockResponse.paymentUrl, '_blank');
    });

    it('should create credit payment session successfully', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
        paymentRequestId: 'req-123',
        reference: 'cred_user-123_package-456',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      const result = await paymentService.createPaymentSession({
        type: 'credit',
        packageId: 'package-456',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should use provided userId and email if provided', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      await paymentService.createPaymentSession({
        type: 'subscription',
        planId: 'plan-456',
        userId: 'custom-user-id',
        email: 'custom@example.com',
      });

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.userId).toBe('custom-user-id');
      expect(body.email).toBe('custom@example.com');
    });

    it('should throw error if no access token', async () => {
      vi.mocked(authModule.getAccessToken).mockReturnValue(null);

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('Authentication required');
    });

    it('should throw error if getCurrentUser fails', async () => {
      vi.mocked(authModule.getCurrentUser).mockResolvedValue(null);

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('Unable to get user information');
    });

    it('should handle error response with JSON', async () => {
      const mockError = {
        message: 'Payment failed',
        code: 'INSUFFICIENT_FUNDS',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockError,
      } as Response);

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('Payment failed');
    });

    it('should handle error response with HTML', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        headers: {
          get: () => 'text/html',
        },
        text: async () => '<html><body>Error occurred</body></html>',
      } as Response);

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('Payment service error. Please try again later.');
    });

    it('should handle invalid response format', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'text/html',
        },
        json: async () => ({}),
      } as Response);

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('Invalid response format');
    });

    it('should handle missing paymentUrl in response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({}),
      } as Response);

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('No payment URL received');
    });

    it('should handle popup blocked gracefully', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      vi.mocked(window.open).mockReturnValue(null);

      const result = await paymentService.createPaymentSession({
        type: 'subscription',
        planId: 'plan-456',
      });

      expect(result.paymentUrl).toBe(mockResponse.paymentUrl);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(global.fetch).mockRejectedValue('String error');

      await expect(
        paymentService.createPaymentSession({
          type: 'subscription',
          planId: 'plan-456',
        })
      ).rejects.toThrow('Failed to create payment session');
    });
  });

  describe('createSubscriptionSession', () => {
    it('should create subscription session', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      const result = await paymentService.createSubscriptionSession('plan-456', true);

      expect(result).toEqual(mockResponse);
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.type).toBe('subscription');
      expect(body.planId).toBe('plan-456');
      expect(body.isYearly).toBe(true);
    });

    it('should default isYearly to false', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      await paymentService.createSubscriptionSession('plan-456');

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.isYearly).toBe(false);
    });
  });

  describe('createCreditSession', () => {
    it('should create credit session', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/pay/123',
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: async () => mockResponse,
      } as Response);

      const result = await paymentService.createCreditSession('package-456');

      expect(result).toEqual(mockResponse);
      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.type).toBe('credit');
      expect(body.packageId).toBe('package-456');
    });
  });
});
