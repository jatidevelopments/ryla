import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios before importing the service
vi.mock('@/lib/axios', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();
  return {
    default: {
      post: mockPost,
      get: mockGet,
    },
    __mocks: {
      post: mockPost,
      get: mockGet,
    },
  };
});

import { shift4Service } from './shift4-service';
import axios from '@/lib/axios';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('shift4Service', () => {
  describe('payment', () => {
    it('should process payment', async () => {
      const mockResponse = {
        success: true,
        transactionId: 'tx-123',
      };

      (axios.post as any).mockResolvedValue({
        data: mockResponse,
      });

      const result = await shift4Service.payment({
        amount: 99.99,
        currency: 'USD',
      } as any);

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('/shift4/charge', {
        amount: 99.99,
        currency: 'USD',
      });
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status', async () => {
      const mockResponse = {
        status: 'completed',
        subscriptionId: 'sub-123',
      };

      (axios.get as any).mockResolvedValue({
        data: mockResponse,
      });

      const result = await shift4Service.getPaymentStatus('sub-123');
      expect(result).toEqual(mockResponse);
      expect(axios.get).toHaveBeenCalledWith('/shift4/payment-status/sub-123');
    });
  });
});
