import { describe, it, expect } from 'vitest';
import { generateFinbyReference, isFunnelReference } from './finbyReference';

describe('finbyReference', () => {
  describe('generateFinbyReference', () => {
    it('should generate reference with RYLAFL prefix', () => {
      const ref = generateFinbyReference();
      expect(ref).toMatch(/^RYLAFL-REF-/);
    });

    it('should include timestamp in reference', () => {
      const before = Date.now();
      const ref = generateFinbyReference();
      const after = Date.now();
      const timestamp = parseInt(ref.split('-')[2]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should include random part in reference', () => {
      const ref = generateFinbyReference();
      const parts = ref.split('-');
      expect(parts.length).toBeGreaterThan(3);
      expect(parts[3]).toBeTruthy();
    });

    it('should generate unique references', () => {
      const ref1 = generateFinbyReference();
      const ref2 = generateFinbyReference();
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('isFunnelReference', () => {
    it('should return true for valid funnel reference', () => {
      expect(isFunnelReference('RYLAFL-REF-1234567890-abc123')).toBe(true);
    });

    it('should return false for non-funnel reference', () => {
      expect(isFunnelReference('OTHER-REF-1234567890-abc123')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isFunnelReference('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isFunnelReference(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isFunnelReference(undefined as any)).toBe(false);
    });

    it('should return true for reference with additional parts', () => {
      expect(isFunnelReference('RYLAFL-REF-1234567890-abc123-extra')).toBe(true);
    });
  });
});
