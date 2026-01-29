import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withCdn, getCdnStatus } from './cdn';

describe('cdn', () => {
  const originalEnv = process.env.NEXT_PUBLIC_CDN_URL;
  const originalDebug = process.env.NEXT_PUBLIC_DEBUG_CDN;

  beforeEach(() => {
    vi.resetModules();
    delete (global as any).window;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CDN_URL = originalEnv;
    process.env.NEXT_PUBLIC_DEBUG_CDN = originalDebug;
  });

  describe('withCdn', () => {
    beforeEach(() => {
      // Reset module to get fresh env vars
      vi.resetModules();
    });

    it('should return empty string for null path', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn(null as any)).toBe('');
    });

    it('should return empty string for undefined path', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn(undefined as any)).toBe('');
    });

    it('should return original path when CDN_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_CDN_URL;
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn('/images/test.jpg')).toBe('/images/test.jpg');
    });

    it('should return original path for absolute URLs', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(withCdnFn('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
      expect(withCdnFn('data:image/png;base64,...')).toBe('data:image/png;base64,...');
    });

    it('should prepend CDN URL to relative paths', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn('/images/test.jpg')).toBe('https://cdn.example.com/images/test.jpg');
    });

    it('should add leading slash if path does not start with slash', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn('images/test.jpg')).toBe('https://cdn.example.com/images/test.jpg');
    });

    it('should remove trailing slash from CDN URL', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com/';
      const { withCdn: withCdnFn } = await import('./cdn');
      expect(withCdnFn('/images/test.jpg')).toBe('https://cdn.example.com/images/test.jpg');
    });
  });

  describe('getCdnStatus', () => {
    it('should return status with CDN enabled', async () => {
      process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example.com';
      const { getCdnStatus: getCdnStatusFn } = await import('./cdn');
      const status = getCdnStatusFn();
      expect(status.enabled).toBe(true);
      expect(status.url).toBe('https://cdn.example.com');
    });

    it('should return status with CDN disabled', async () => {
      delete process.env.NEXT_PUBLIC_CDN_URL;
      const { getCdnStatus: getCdnStatusFn } = await import('./cdn');
      const status = getCdnStatusFn();
      expect(status.enabled).toBe(false);
      expect(status.url).toBe('Not configured');
    });
  });
});
