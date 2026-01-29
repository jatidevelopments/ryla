import { describe, it, expect } from 'vitest';
import { getImageFallback } from './getImageFallback';

describe('getImageFallback', () => {
  it('should return first letters of each word', () => {
    expect(getImageFallback('Hello World')).toBe('HW');
  });

  it('should handle single word', () => {
    expect(getImageFallback('Hello')).toBe('H');
  });

  it('should handle multiple words', () => {
    expect(getImageFallback('This Is A Test')).toBe('TIAT');
  });

  it('should handle empty string', () => {
    expect(getImageFallback('')).toBe('');
  });

  it('should handle single character', () => {
    expect(getImageFallback('A')).toBe('A');
  });

  it('should handle words with special characters', () => {
    expect(getImageFallback('Hello-World Test')).toBe('HT');
  });

  it('should handle multiple spaces', () => {
    expect(getImageFallback('Hello   World')).toBe('HW');
  });
});
