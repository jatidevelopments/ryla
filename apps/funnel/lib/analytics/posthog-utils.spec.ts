import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as posthogUtils from './posthog-utils';

describe('posthog-utils', () => {
  const originalWindow = global.window;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    delete (global as any).window;
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env.NODE_ENV = originalEnv;
  });

  describe('isPostHogAvailable', () => {
    it('should return false when window is undefined', () => {
      delete (global as any).window;
      expect(posthogUtils.isPostHogAvailable()).toBe(false);
    });

    it('should return false when posthog is not available', () => {
      const originalWindow = global.window;
      const originalPosthog = (global.window as any)?.posthog;
      
      // Remove posthog from window
      delete (global.window as any).posthog;
      
      // The function should check window.posthog, so it should return false
      expect(posthogUtils.isPostHogAvailable()).toBe(false);
      
      // Restore
      if (originalPosthog) {
        (global.window as any).posthog = originalPosthog;
      } else {
        global.window = originalWindow;
      }
    });

    it('should return false when posthog.capture is not a function', () => {
      global.window = { posthog: {} } as any;
      expect(posthogUtils.isPostHogAvailable()).toBe(false);
    });

    it('should return true when posthog is available with capture', () => {
      global.window = {
        posthog: {
          capture: vi.fn(),
        },
      } as any;
      expect(posthogUtils.isPostHogAvailable()).toBe(true);
    });
  });

  describe('safePostHogCapture', () => {
    it('should call posthog.capture when available', () => {
      const mockCapture = vi.fn();
      global.window = {
        posthog: { capture: mockCapture },
      } as any;

      posthogUtils.safePostHogCapture('test-event', { key: 'value' });
      expect(mockCapture).toHaveBeenCalledWith('test-event', { key: 'value' });
    });

    it('should handle errors gracefully', () => {
      const mockCapture = vi.fn(() => {
        throw new Error('PostHog error');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.window = {
        posthog: { capture: mockCapture },
      } as any;

      safePostHogCapture('test-event');
      expect(consoleSpy).toHaveBeenCalledWith('PostHog capture failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should log to console in development when posthog unavailable', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      global.window = {} as any;

      posthogUtils.safePostHogCapture('test-event', { key: 'value' });
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] test-event:', { key: 'value' });
      consoleSpy.mockRestore();
    });
  });

  describe('safePostHogIdentify', () => {
    it('should call posthog.identify when available', () => {
      const mockIdentify = vi.fn();
      global.window = {
        posthog: { identify: mockIdentify, capture: vi.fn() },
      } as any;

      posthogUtils.safePostHogIdentify('user-123', { email: 'test@example.com' });
      expect(mockIdentify).toHaveBeenCalledWith('user-123', { email: 'test@example.com' });
    });

    it('should handle errors gracefully', () => {
      const mockIdentify = vi.fn(() => {
        throw new Error('PostHog error');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.window = {
        posthog: { identify: mockIdentify, capture: vi.fn() },
      } as any;

      posthogUtils.safePostHogIdentify('user-123');
      expect(consoleSpy).toHaveBeenCalledWith('PostHog identify failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('safePostHogSetProperties', () => {
    it('should call posthog.setPersonProperties when available', () => {
      const mockSetProperties = vi.fn();
      global.window = {
        posthog: { setPersonProperties: mockSetProperties, capture: vi.fn() },
      } as any;

      posthogUtils.safePostHogSetProperties({ key: 'value' });
      expect(mockSetProperties).toHaveBeenCalledWith({ key: 'value' });
    });

    it('should handle errors gracefully', () => {
      const mockSetProperties = vi.fn(() => {
        throw new Error('PostHog error');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.window = {
        posthog: { setPersonProperties: mockSetProperties, capture: vi.fn() },
      } as any;

      posthogUtils.safePostHogSetProperties({ key: 'value' });
      expect(consoleSpy).toHaveBeenCalledWith('PostHog set properties failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('safePostHogReset', () => {
    it('should call posthog.reset when available', () => {
      const mockReset = vi.fn();
      const mockCapture = vi.fn();
      global.window = {
        posthog: { reset: mockReset, capture: mockCapture },
      } as any;

      posthogUtils.safePostHogReset();
      expect(mockReset).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      const mockReset = vi.fn(() => {
        throw new Error('PostHog error');
      });
      const mockCapture = vi.fn();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.window = {
        posthog: { reset: mockReset, capture: mockCapture },
      } as any;

      posthogUtils.safePostHogReset();
      expect(consoleSpy).toHaveBeenCalledWith('PostHog reset failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
