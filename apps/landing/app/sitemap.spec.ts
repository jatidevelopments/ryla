import { describe, it, expect } from 'vitest';
import { default as sitemap } from './sitemap';

describe('sitemap', () => {
  it('should generate sitemap', async () => {
    const result = await sitemap();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should include main pages', async () => {
    const result = await sitemap();
    const urls = result.map((item: any) => item.url);
    expect(urls.some((url: string) => url.includes('/'))).toBe(true);
  });
});
