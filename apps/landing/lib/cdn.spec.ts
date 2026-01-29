import { describe, it, expect, vi } from 'vitest';
import { withCdn, getCdnStatus, isCdnEnabled } from './cdn';

// Mock @ryla/shared
vi.mock('@ryla/shared', () => ({
  withCdn: vi.fn((url: string) => `https://cdn.ryla.ai/${url}`),
  getCdnStatus: vi.fn(() => ({ enabled: true, baseUrl: 'https://cdn.ryla.ai' })),
  isCdnEnabled: vi.fn(() => true),
}));

describe('cdn', () => {
  describe('withCdn', () => {
    it('should re-export withCdn from @ryla/shared', () => {
      expect(typeof withCdn).toBe('function');
      expect(withCdn('test.jpg')).toBe('https://cdn.ryla.ai/test.jpg');
    });
  });

  describe('getCdnStatus', () => {
    it('should re-export getCdnStatus from @ryla/shared', () => {
      expect(typeof getCdnStatus).toBe('function');
      const status = getCdnStatus();
      expect(status).toEqual({ enabled: true, baseUrl: 'https://cdn.ryla.ai' });
    });
  });

  describe('isCdnEnabled', () => {
    it('should re-export isCdnEnabled from @ryla/shared', () => {
      expect(typeof isCdnEnabled).toBe('function');
      expect(isCdnEnabled()).toBe(true);
    });
  });
});
