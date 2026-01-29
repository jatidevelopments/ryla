import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the axios import that finby-service uses internally (must be before import)
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('@/lib/axios', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  return {
    default: {
      post: mockPost,
      get: mockGet,
    },
    mockPost,
    mockGet,
  };
});

import { finbyService } from './finby-service';
import axios from '@/lib/axios';

// Get the mocked functions
const getMockPost = () => (axios as any).post;
const getMockGet = () => (axios as any).get;

beforeEach(() => {
  vi.clearAllMocks();
  getMockPost().mockClear();
  getMockGet().mockClear();
});

describe('finbyService', () => {
  describe('setupPayment', () => {
    it('should setup payment via Next.js API route', async () => {
      const mockResponse = {
        paymentUrl: 'https://finby.com/checkout/test',
        reference: 'test-ref-123',
      };

      getMockPost().mockResolvedValue({
        data: mockResponse,
      });

      const result = await finbyService.setupPayment({
        productId: 'prod-123',
        email: 'test@example.com',
      } as any);

      expect(result).toEqual(mockResponse);
      expect(getMockPost()).toHaveBeenCalledWith('/payments/finby/setup-payment', {
        productId: 'prod-123',
        email: 'test@example.com',
      });
    });

    it('should throw error when response is not ok', async () => {
      getMockPost().mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Payment failed' },
        },
      });

      await expect(
        finbyService.setupPayment({
          productId: 'prod-123',
          email: 'test@example.com',
        } as any)
      ).rejects.toThrow();
    });

    it('should throw error when response missing paymentUrl', async () => {
      getMockPost().mockResolvedValue({
        data: { reference: 'test-ref' } as any, // Missing paymentUrl
      });

      await expect(
        finbyService.setupPayment({
          productId: 'prod-123',
          email: 'test@example.com',
        } as any)
      ).rejects.toThrow('Invalid payment response');
    });

    it('should throw error when response missing reference', async () => {
      getMockPost().mockResolvedValue({
        data: { paymentUrl: 'https://finby.com/checkout/test' } as any, // Missing reference
      });

      await expect(
        finbyService.setupPayment({
          productId: 'prod-123',
          email: 'test@example.com',
        } as any)
      ).rejects.toThrow('Invalid payment response');
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status', async () => {
      const mockResponse = {
        status: 'completed',
        reference: 'test-ref-123',
      };

      getMockGet().mockResolvedValue({
        data: mockResponse,
      });

      const result = await finbyService.getPaymentStatus('test-ref-123');
      expect(result).toEqual(mockResponse);
      expect(getMockGet()).toHaveBeenCalledWith('/payments/finby/payment-status/test-ref-123');
    });

    it('should throw error when response is not ok', async () => {
      const axiosError = new Error('Not found');
      (axiosError as any).response = {
        status: 404,
        data: { error: 'Not found' },
      };
      getMockGet().mockRejectedValue(axiosError);

      await expect(finbyService.getPaymentStatus('test-ref-123')).rejects.toThrow();
    });
  });

  describe('processRefund', () => {
    it('should process refund', async () => {
      const mockResponse = {
        success: true,
        refundId: 'refund-123',
      };

      getMockPost().mockResolvedValue({
        data: mockResponse,
      });

      const result = await finbyService.processRefund({
        reference: 'test-ref-123',
      } as any);

      expect(result).toEqual(mockResponse);
      expect(getMockPost()).toHaveBeenCalledWith('/payments/finby/refund', {
        reference: 'test-ref-123',
      });
    });

    it('should throw error when refund fails', async () => {
      const axiosError = new Error('Refund failed');
      (axiosError as any).response = {
        status: 400,
        data: { error: 'Refund failed' },
      };
      getMockPost().mockRejectedValue(axiosError);

      await expect(
        finbyService.processRefund({
          reference: 'test-ref-123',
        } as any)
      ).rejects.toThrow();
    });
  });
});
