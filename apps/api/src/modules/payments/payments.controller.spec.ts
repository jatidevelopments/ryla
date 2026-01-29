import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentsController } from './payments.controller';
import { FinbyService } from './services/finby.service';
import { Request } from 'express';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockFinbyService: FinbyService;
  let mockUser: { userId: string; email: string };

  beforeEach(() => {
    mockUser = {
      userId: 'user-123',
      email: 'test@example.com',
    };

    mockFinbyService = {
      createPaymentSession: vi.fn(),
      handlePaymentWebhook: vi.fn(),
      handleRecurringWebhook: vi.fn(),
    } as unknown as FinbyService;

    controller = new PaymentsController(mockFinbyService);
  });

  describe('createPaymentSession', () => {
    it('should create payment session', async () => {
      const dto = {
        type: 'subscription' as const,
        planId: 'pro',
      };
      const mockResponse = {
        paymentUrl: 'https://finby.com/checkout',
        paymentRequestId: 'req-123',
        reference: 'ref-123',
      };
      vi.mocked(mockFinbyService.createPaymentSession).mockResolvedValue(mockResponse as any);

      const result = await controller.createPaymentSession(mockUser, dto);

      expect(result).toEqual(mockResponse);
      expect(mockFinbyService.createPaymentSession).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-123',
        email: 'test@example.com',
      });
    });

    it('should use provided email if given', async () => {
      const dto = {
        type: 'credit' as const,
        packageId: 'package-1',
        email: 'custom@example.com',
      };
      vi.mocked(mockFinbyService.createPaymentSession).mockResolvedValue({} as any);

      await controller.createPaymentSession(mockUser, dto);

      expect(mockFinbyService.createPaymentSession).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-123',
        email: 'custom@example.com',
      });
    });

    it('should throw error when userId mismatch', async () => {
      const dto = {
        type: 'subscription' as const,
        planId: 'pro',
        userId: 'other-user',
      };

      await expect(controller.createPaymentSession(mockUser, dto)).rejects.toThrow(
        'User ID mismatch',
      );
    });

    it('should throw error when FinbyService is not available', async () => {
      const controllerWithoutService = new PaymentsController(null as any);
      const dto = { type: 'subscription' as const, planId: 'pro' };

      await expect(
        controllerWithoutService.createPaymentSession(mockUser, dto),
      ).rejects.toThrow('Payment service is not available');
    });
  });

  describe('handlePaymentWebhook', () => {
    it('should handle payment webhook', async () => {
      const body = { event: 'payment.completed', paymentId: 'pay-123' };
      vi.mocked(mockFinbyService.handlePaymentWebhook).mockResolvedValue(undefined);

      const result = await controller.handlePaymentWebhook(body, {} as Request);

      expect(result).toEqual({ success: true });
      expect(mockFinbyService.handlePaymentWebhook).toHaveBeenCalledWith(body);
    });

    it('should throw error when FinbyService is not available', async () => {
      const controllerWithoutService = new PaymentsController(null as any);
      const body = { event: 'payment.completed' };

      await expect(
        controllerWithoutService.handlePaymentWebhook(body, {} as Request),
      ).rejects.toThrow('Payment service is not available');
    });
  });

  describe('handleRecurringWebhook', () => {
    it('should handle recurring webhook', async () => {
      const body = { event: 'subscription.renewed', subscriptionId: 'sub-123' };
      vi.mocked(mockFinbyService.handleRecurringWebhook).mockResolvedValue(undefined);

      const result = await controller.handleRecurringWebhook(body, {} as Request);

      expect(result).toEqual({ success: true });
      expect(mockFinbyService.handleRecurringWebhook).toHaveBeenCalledWith(body);
    });

    it('should throw error when FinbyService is not available', async () => {
      const controllerWithoutService = new PaymentsController(null as any);
      const body = { event: 'subscription.renewed' };

      await expect(
        controllerWithoutService.handleRecurringWebhook(body, {} as Request),
      ).rejects.toThrow('Payment service is not available');
    });
  });
});
