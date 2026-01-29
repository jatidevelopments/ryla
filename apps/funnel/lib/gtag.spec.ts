import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportPurchase, reportSignUp, reportEmailVerified } from './gtag';

describe('gtag', () => {
  let mockGtag: ReturnType<typeof vi.fn>;
  let mockWindow: Window & typeof globalThis;

  beforeEach(() => {
    vi.resetModules();
    mockGtag = vi.fn();
    mockWindow = {
      ...global.window,
      gtag: mockGtag,
      location: { ...global.window.location, href: '' },
    } as any;
    global.window = mockWindow;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('reportPurchase', () => {
    it('should call gtag with purchase event', () => {
      reportPurchase('tx-123');
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'conversion',
        expect.objectContaining({
          send_to: 'AW-16515055993/VknOCJqP-ZIbEPmC_8I9',
          transaction_id: 'tx-123',
        })
      );
    });

    it('should include value and currency', () => {
      reportPurchase('tx-123', { value: 99.99, currency: 'USD' });
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'conversion',
        expect.objectContaining({
          value: 99.99,
          currency: 'USD',
        })
      );
    });

    it('should redirect to url in callback', () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      reportPurchase('tx-123', { url: 'https://example.com' });
      const callArgs = mockGtag.mock.calls[0][2];
      if (callArgs.event_callback) {
        callArgs.event_callback();
        expect(mockLocation.href).toBe('https://example.com');
      }
    });

    it('should deduplicate events with same eventId', async () => {
      // Reset module to clear sentEventIds
      vi.resetModules();
      mockGtag.mockClear();
      // Re-import the module to get a fresh instance
      const gtagModule = await import('./gtag');
      // Re-setup window mock after module reset
      global.window = { ...mockWindow, gtag: mockGtag } as any;
      gtagModule.reportPurchase('tx-123', { eventId: 'event-1' });
      gtagModule.reportPurchase('tx-123', { eventId: 'event-1' });
      expect(mockGtag).toHaveBeenCalledTimes(1);
    });

    it('should allow different events with different eventIds', async () => {
      // Reset module to clear sentEventIds
      vi.resetModules();
      mockGtag.mockClear();
      // Re-import the module to get a fresh instance
      const gtagModule = await import('./gtag');
      // Re-setup window mock after module reset
      global.window = { ...mockWindow, gtag: mockGtag } as any;
      gtagModule.reportPurchase('tx-123', { eventId: 'event-1' });
      gtagModule.reportPurchase('tx-123', { eventId: 'event-2' });
      // Both should be called since they have different eventIds
      expect(mockGtag).toHaveBeenCalledTimes(2);
    });
  });

  describe('reportSignUp', () => {
    it('should call gtag with signup event', () => {
      reportSignUp();
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'conversion',
        expect.objectContaining({
          send_to: 'AW-16515055993/ztJvCKrt-ZIbEPmC_8I9',
        })
      );
    });

    it('should redirect to url in callback', () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      reportSignUp('https://example.com');
      const callArgs = mockGtag.mock.calls[0][2];
      if (callArgs.event_callback) {
        callArgs.event_callback();
        expect(mockLocation.href).toBe('https://example.com');
      }
    });

    it('should deduplicate events with same eventId', async () => {
      // Reset module to clear sentEventIds
      vi.resetModules();
      mockGtag.mockClear();
      // Re-import the module to get a fresh instance
      const gtagModule = await import('./gtag');
      // Re-setup window mock after module reset
      global.window = { ...mockWindow, gtag: mockGtag } as any;
      gtagModule.reportSignUp(undefined, 'event-1');
      gtagModule.reportSignUp(undefined, 'event-1');
      expect(mockGtag).toHaveBeenCalledTimes(1);
    });
  });

  describe('reportEmailVerified', () => {
    it('should call gtag with email verified event', () => {
      reportEmailVerified();
      expect(mockGtag).toHaveBeenCalledWith(
        'event',
        'conversion',
        expect.objectContaining({
          send_to: 'AW-16515055993/ZG5eCPiy-pIbEPmC_8I9',
        })
      );
    });

    it('should redirect to url in callback', () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      reportEmailVerified('https://example.com');
      const callArgs = mockGtag.mock.calls[0][2];
      if (callArgs.event_callback) {
        callArgs.event_callback();
        expect(mockLocation.href).toBe('https://example.com');
      }
    });

    it('should deduplicate events with same eventId', async () => {
      // Reset module to clear sentEventIds
      vi.resetModules();
      mockGtag.mockClear();
      // Re-import the module to get a fresh instance
      const gtagModule = await import('./gtag');
      // Re-setup window mock after module reset
      global.window = { ...mockWindow, gtag: mockGtag } as any;
      gtagModule.reportEmailVerified(undefined, 'event-1');
      gtagModule.reportEmailVerified(undefined, 'event-1');
      expect(mockGtag).toHaveBeenCalledTimes(1);
    });
  });
});
