import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getImageCdnUrl } from './getImageCdnUrl';

describe('getImageCdnUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = originalEnv;
  });

  it('should prepend CDN URL to image path', async () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'https://cdn.example.com';
    vi.resetModules();
    const { getImageCdnUrl } = await import('./getImageCdnUrl');
    const result = getImageCdnUrl('images/test.jpg');
    expect(result).toBe('https://cdn.example.com/images/test.jpg');
  });

  it('should handle empty CDN URL', async () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = '';
    vi.resetModules();
    const { getImageCdnUrl } = await import('./getImageCdnUrl');
    const result = getImageCdnUrl('images/test.jpg');
    expect(result).toBe('/images/test.jpg');
  });

  it('should handle undefined CDN URL', async () => {
    delete process.env.NEXT_PUBLIC_IMAGE_CDN_URL;
    vi.resetModules();
    const { getImageCdnUrl } = await import('./getImageCdnUrl');
    const result = getImageCdnUrl('images/test.jpg');
    expect(result).toBe('/images/test.jpg');
  });

  it('should handle CDN URL with trailing slash', async () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'https://cdn.example.com/';
    vi.resetModules();
    const { getImageCdnUrl } = await import('./getImageCdnUrl');
    const result = getImageCdnUrl('images/test.jpg');
    expect(result).toBe('https://cdn.example.com//images/test.jpg');
  });

  it('should handle image path starting with slash', async () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'https://cdn.example.com';
    vi.resetModules();
    const { getImageCdnUrl } = await import('./getImageCdnUrl');
    const result = getImageCdnUrl('/images/test.jpg');
    expect(result).toBe('https://cdn.example.com//images/test.jpg');
  });
});
