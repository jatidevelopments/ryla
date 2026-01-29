import { describe, it, expect } from 'vitest';
import { passwordRegex } from './password-regex';

describe('passwordRegex', () => {
  it('should match valid password with letters and numbers', () => {
    expect(passwordRegex.test('Password123')).toBe(true);
    expect(passwordRegex.test('abc12345')).toBe(true); // 8+ chars required
    expect(passwordRegex.test('123ABC45')).toBe(true); // 8+ chars required
  });

  it('should match password with exactly 8 characters', () => {
    expect(passwordRegex.test('Pass1234')).toBe(true);
  });

  it('should match password with more than 8 characters', () => {
    expect(passwordRegex.test('Password123456')).toBe(true);
  });

  it('should not match password without letters', () => {
    expect(passwordRegex.test('12345678')).toBe(false);
  });

  it('should not match password without numbers', () => {
    expect(passwordRegex.test('Password')).toBe(false);
  });

  it('should not match password shorter than 8 characters', () => {
    expect(passwordRegex.test('Pass123')).toBe(false);
    expect(passwordRegex.test('Ab1')).toBe(false);
  });

  it('should match password with special characters', () => {
    expect(passwordRegex.test('Pass123!@#')).toBe(true);
  });

  it('should match password with mixed case', () => {
    expect(passwordRegex.test('PaSs1234')).toBe(true);
  });
});
