import { describe, it, expect } from 'vitest';
import { getBlurredCharacterImage } from './getBlurredCharacterImage';

describe('getBlurredCharacterImage', () => {
  it('should return image path for valid ethnicity and hair color', () => {
    expect(getBlurredCharacterImage('black', 'black')).toBe('/images/blurred-characters/black-black.webp');
    expect(getBlurredCharacterImage('caucasian', 'blonde')).toBe('/images/blurred-characters/white-blonde.webp');
    expect(getBlurredCharacterImage('latina', 'brunette')).toBe('/images/blurred-characters/black-brunette.webp');
  });

  it('should map latina to black ethnicity', () => {
    expect(getBlurredCharacterImage('latina', 'black')).toBe('/images/blurred-characters/black-black.webp');
  });

  it('should map arab to white ethnicity', () => {
    expect(getBlurredCharacterImage('arab', 'blonde')).toBe('/images/blurred-characters/white-blonde.webp');
  });

  it('should map asian to white ethnicity', () => {
    expect(getBlurredCharacterImage('asian', 'brunette')).toBe('/images/blurred-characters/white-brunette.webp');
  });

  it('should return null for invalid ethnicity', () => {
    expect(getBlurredCharacterImage('invalid', 'black')).toBeNull();
  });

  it('should return null for invalid hair color', () => {
    expect(getBlurredCharacterImage('black', 'invalid')).toBeNull();
  });

  it('should return null for empty ethnicity', () => {
    expect(getBlurredCharacterImage('', 'black')).toBeNull();
  });

  it('should return null for empty hair color', () => {
    expect(getBlurredCharacterImage('black', '')).toBeNull();
  });

  it('should handle all valid hair colors', () => {
    expect(getBlurredCharacterImage('black', 'black')).toBe('/images/blurred-characters/black-black.webp');
    expect(getBlurredCharacterImage('black', 'blonde')).toBe('/images/blurred-characters/black-blonde.webp');
    expect(getBlurredCharacterImage('black', 'brunette')).toBe('/images/blurred-characters/black-brunette.webp');
    expect(getBlurredCharacterImage('black', 'ginger')).toBe('/images/blurred-characters/black-ginger.webp');
  });
});
