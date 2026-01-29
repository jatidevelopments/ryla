import { describe, it, expect } from 'vitest';
import { FUNNEL_URL } from './constants';

describe('constants', () => {
  describe('FUNNEL_URL', () => {
    it('should be defined', () => {
      expect(FUNNEL_URL).toBeDefined();
    });

    it('should be a valid URL string', () => {
      expect(typeof FUNNEL_URL).toBe('string');
      expect(FUNNEL_URL).toBe('https://goviral.ryla.ai/');
    });

    it('should be a valid URL format', () => {
      expect(() => new URL(FUNNEL_URL)).not.toThrow();
    });
  });
});
