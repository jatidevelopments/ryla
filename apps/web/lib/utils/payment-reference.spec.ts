import { describe, it, expect } from 'vitest';
import {
  generateSubscriptionReference,
  generateCreditReference,
  parseSubscriptionReference,
  parseCreditReference,
  parsePaymentReference,
} from './payment-reference';

describe('payment-reference', () => {
  describe('generateSubscriptionReference', () => {
    it('should generate subscription reference with userId and planId', () => {
      const result = generateSubscriptionReference('user123', 'plan456');
      expect(result).toBe('sub_user123_plan456');
    });

    it('should handle planId with underscores', () => {
      const result = generateSubscriptionReference('user123', 'plan_456_premium');
      expect(result).toBe('sub_user123_plan_456_premium');
    });
  });

  describe('generateCreditReference', () => {
    it('should generate credit reference with userId and packageId', () => {
      const result = generateCreditReference('user123', 'package456');
      expect(result).toBe('cred_user123_package456');
    });

    it('should handle packageId with underscores', () => {
      const result = generateCreditReference('user123', 'package_456_large');
      expect(result).toBe('cred_user123_package_456_large');
    });
  });

  describe('parseSubscriptionReference', () => {
    it('should parse valid subscription reference', () => {
      const result = parseSubscriptionReference('sub_user123_plan456');
      expect(result).toEqual({
        userId: 'user123',
        planId: 'plan456',
      });
    });

    it('should parse subscription reference with underscores in planId', () => {
      const result = parseSubscriptionReference('sub_user123_plan_456_premium');
      expect(result).toEqual({
        userId: 'user123',
        planId: 'plan_456_premium',
      });
    });

    it('should return null for invalid format', () => {
      expect(parseSubscriptionReference('invalid')).toBeNull();
      expect(parseSubscriptionReference('cred_user123_plan456')).toBeNull();
      expect(parseSubscriptionReference('sub_user123')).toBeNull();
    });

    it('should return null for empty userId (fixed)', () => {
      // ✅ FIXED: Now returns null for empty userId
      const result = parseSubscriptionReference('sub__plan456');
      expect(result).toBeNull();
    });

    it('should return null for empty planId (fixed)', () => {
      // ✅ FIXED: Now returns null for empty planId
      const result = parseSubscriptionReference('sub_user123_');
      expect(result).toBeNull();
    });
  });

  describe('parseCreditReference', () => {
    it('should parse valid credit reference', () => {
      const result = parseCreditReference('cred_user123_package456');
      expect(result).toEqual({
        userId: 'user123',
        packageId: 'package456',
      });
    });

    it('should parse credit reference with underscores in packageId', () => {
      const result = parseCreditReference('cred_user123_package_456_large');
      expect(result).toEqual({
        userId: 'user123',
        packageId: 'package_456_large',
      });
    });

    it('should return null for invalid format', () => {
      expect(parseCreditReference('invalid')).toBeNull();
      expect(parseCreditReference('sub_user123_package456')).toBeNull();
      expect(parseCreditReference('cred_user123')).toBeNull();
    });

    it('should return null for empty userId (fixed)', () => {
      // ✅ FIXED: Now returns null for empty userId
      const result = parseCreditReference('cred__package456');
      expect(result).toBeNull();
    });

    it('should return null for empty packageId (fixed)', () => {
      // ✅ FIXED: Now returns null for empty packageId
      const result = parseCreditReference('cred_user123_');
      expect(result).toBeNull();
    });
  });

  describe('parsePaymentReference', () => {
    it('should parse subscription reference', () => {
      const result = parsePaymentReference('sub_user123_plan456');
      expect(result).toEqual({
        type: 'subscription',
        userId: 'user123',
        planId: 'plan456',
      });
    });

    it('should parse credit reference', () => {
      const result = parsePaymentReference('cred_user123_package456');
      expect(result).toEqual({
        type: 'credit',
        userId: 'user123',
        packageId: 'package456',
      });
    });

    it('should return null for invalid reference', () => {
      expect(parsePaymentReference('invalid')).toBeNull();
      expect(parsePaymentReference('unknown_user123_plan456')).toBeNull();
    });

    it('should return null for malformed subscription reference', () => {
      expect(parsePaymentReference('sub_user123')).toBeNull();
    });

    it('should return null for malformed credit reference', () => {
      expect(parsePaymentReference('cred_user123')).toBeNull();
    });
  });
});
