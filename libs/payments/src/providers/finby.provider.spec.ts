/**
 * Finby Provider Tests
 * 
 * Tests for recurring payment handling per feedback:
 * - Subscriptions: Recurring: true (NOT RegisterCard)
 * - Subsequent recurring: Recurring: true + OriginalPaymentRequestId
 * - Credits: RegisterCard: true
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FinbyProvider } from './finby.provider';
import type { FinbyConfig, CheckoutSessionParams } from '../types';

describe('FinbyProvider', () => {
  let provider: FinbyProvider;
  const config: FinbyConfig = {
    projectId: 'test-project',
    secretKey: 'test-secret',
    baseUrl: 'https://aapi.finby.eu',
    apiVersion: 'v1',
  };

  beforeEach(() => {
    provider = new FinbyProvider(config);
    vi.clearAllMocks();
  });

  describe('createCheckoutSession - Subscriptions', () => {
    it('should use Recurring: true for initial subscription (NOT RegisterCard)', async () => {
      const params: CheckoutSessionParams = {
        priceId: 'plan-1',
        userId: 'user-1',
        email: 'test@example.com',
        amount: 2900, // $29.00 in cents
        currency: 'EUR',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        mode: 'subscription',
        metadata: {
          isSubscription: 'true',
          planId: 'starter',
        },
      };

      // Mock fetch for OAuth token
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token-123', expires_in: 3600 }),
      } as Response);

      // Mock fetch for payment initiation
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          PaymentRequestId: 'req-123',
          CheckoutUrl: 'https://finby.eu/checkout',
        }),
      } as Response);

      const session = await provider.createCheckoutSession(params);

      expect(session).toBeDefined();
      expect(session.url).toBe('https://finby.eu/checkout');
      
      // Verify the request body includes Recurring: true and NOT RegisterCard
      const fetchCalls = (global.fetch as any).mock.calls;
      const paymentCall = fetchCalls.find((call: any[]) => 
        call[0].includes('/api/Payments/InitiatePayment')
      );
      
      if (paymentCall) {
        const requestBody = JSON.parse(paymentCall[1].body);
        expect(requestBody.Subscription?.Recurring).toBe(true);
        expect(requestBody.CardTransaction?.RegisterCard).toBeUndefined();
      }
    });
  });

  describe('createCheckoutSession - Credits', () => {
    it('should use RegisterCard: true for credit purchases', async () => {
      const params: CheckoutSessionParams = {
        priceId: 'package-1',
        userId: 'user-1',
        email: 'test@example.com',
        amount: 1000, // $10.00 in cents
        currency: 'EUR',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        mode: 'payment',
        metadata: {
          isSubscription: 'false',
          packageId: 'small',
        },
      };

      // Mock fetch for OAuth token
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token-123', expires_in: 3600 }),
      } as Response);

      // Mock fetch for payment initiation
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          PaymentRequestId: 'req-123',
          CheckoutUrl: 'https://finby.eu/checkout',
        }),
      } as Response);

      const session = await provider.createCheckoutSession(params);

      expect(session).toBeDefined();
      
      // Verify the request body includes RegisterCard: true
      const fetchCalls = (global.fetch as any).mock.calls;
      const paymentCall = fetchCalls.find((call: any[]) => 
        call[0].includes('/api/Payments/InitiatePayment')
      );
      
      if (paymentCall) {
        const requestBody = JSON.parse(paymentCall[1].body);
        expect(requestBody.CardTransaction?.RegisterCard).toBe(true);
        expect(requestBody.CardTransaction?.Recurring).toBe(false);
      }
    });
  });

  describe('createRecurringPayment', () => {
    it('should use Recurring: true + OriginalPaymentRequestId for subsequent charges', async () => {
      // Mock fetch for OAuth token
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token-123', expires_in: 3600 }),
      } as Response);

      // Mock fetch for recurring payment
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          PaymentRequestId: 'req-456',
          CheckoutUrl: 'https://finby.eu/checkout',
        }),
      } as Response);

      const session = await (provider as any).createRecurringPayment({
        amount: 2900,
        currency: 'EUR',
        userId: 'user-1',
        email: 'test@example.com',
        originalPaymentRequestId: 'req-123',
        cardHash: 'card-hash-123',
      });

      expect(session).toBeDefined();
      
      // Verify the request body includes OriginalPaymentRequestId and Recurring: true
      const fetchCalls = (global.fetch as any).mock.calls;
      const paymentCall = fetchCalls.find((call: any[]) => 
        call[0].includes('/api/Payments/InitiatePayment')
      );
      
      if (paymentCall) {
        const requestBody = JSON.parse(paymentCall[1].body);
        expect(requestBody.References?.OriginalPaymentRequestId).toBe('req-123');
        expect(requestBody.CardTransaction?.Recurring).toBe(true);
      }
    });
  });
});

