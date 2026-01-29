import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyticsService } from './analytics-service';
import * as analyticsLib from '@ryla/analytics';

vi.mock('@ryla/analytics', () => ({
  trackTikTokEvent: vi.fn(),
  trackTikTokPurchase: vi.fn(),
  trackTikTokCompleteRegistration: vi.fn(),
  trackTikTokStartTrial: vi.fn(),
  identifyTikTok: vi.fn(),
  hashSHA256: vi.fn((str: string) => Promise.resolve(`hashed-${str}`)),
  trackTwitterMappedEvent: vi.fn(),
  trackTwitterPurchase: vi.fn(),
  trackTwitterCompleteRegistration: vi.fn(),
  trackTwitterStartTrial: vi.fn(),
}));

describe('analyticsService', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalEnableDev = process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS = 'false';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS = originalEnableDev;
  });

  describe('trackSignUpEvent', () => {
    it('should track signup event to TikTok and Twitter', async () => {
      await analyticsService.trackSignUpEvent('user_signed_up', {
        distinct_id: 'user-123',
        email: 'test@example.com',
        amount: 99.99,
        currency: 'USD',
      } as any);

      expect(analyticsLib.trackTikTokCompleteRegistration).toHaveBeenCalledWith({
        value: 99.99,
        currency: 'USD',
      });
      expect(analyticsLib.identifyTikTok).toHaveBeenCalledWith({
        email: 'hashed-test@example.com',
      });
      expect(analyticsLib.trackTwitterCompleteRegistration).toHaveBeenCalledWith({
        value: 99.99,
        currency: 'USD',
      });
    });

    it('should not track in development unless enabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_DEV_ANALYTICS = 'false';

      await analyticsService.trackSignUpEvent('user_signed_up', {
        distinct_id: 'user-123',
      } as any);

      expect(analyticsLib.trackTikTokCompleteRegistration).not.toHaveBeenCalled();
    });
  });

  describe('trackPaymentEvent', () => {
    it('should track purchase event', async () => {
      await analyticsService.trackPaymentEvent('payment_completed', {
        value: 99.99,
        currency: 'USD',
        product_id: 'prod-123',
        product_name: 'Subscription',
      } as any);

      expect(analyticsLib.trackTikTokPurchase).toHaveBeenCalledWith({
        value: 99.99,
        currency: 'USD',
        content_id: 'prod-123',
        content_name: 'Subscription',
      });
      expect(analyticsLib.trackTwitterPurchase).toHaveBeenCalledWith({
        value: 99.99,
        currency: 'USD',
        content_id: 'prod-123',
        content_name: 'Subscription',
      });
    });

    it('should track trial event', async () => {
      await analyticsService.trackPaymentEvent('trial_started', {
        value: 0,
        currency: 'USD',
      } as any);

      expect(analyticsLib.trackTikTokStartTrial).toHaveBeenCalledWith({
        value: 0,
        currency: 'USD',
      });
      expect(analyticsLib.trackTwitterStartTrial).toHaveBeenCalledWith({
        value: 0,
        currency: 'USD',
      });
    });
  });

  describe('identify', () => {
    it('should identify user in TikTok', async () => {
      await analyticsService.identify('user-123');

      expect(analyticsLib.identifyTikTok).toHaveBeenCalledWith({
        external_id: 'hashed-user-123',
      });
    });
  });

  describe('track', () => {
    it('should track event to TikTok and Twitter', () => {
      analyticsService.track('custom_event', { key: 'value' });

      expect(analyticsLib.trackTikTokEvent).toHaveBeenCalledWith('custom_event', {
        funnel_name: expect.any(String),
        funnel_type: expect.any(String),
        key: 'value',
      });
      expect(analyticsLib.trackTwitterMappedEvent).toHaveBeenCalledWith('custom_event', {
        funnel_name: expect.any(String),
        funnel_type: expect.any(String),
        key: 'value',
      });
    });
  });
});
