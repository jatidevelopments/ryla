import { describe, it, expect } from 'vitest';
import {
  getInfluencerImage,
  getSkinFeatureImage,
  getBodyTypeImage,
  getBreastSizeImage,
  getAssSizeImage,
  getBreastTypeImage,
  getTattooImage,
  getPiercingImage,
  getSkinColorImage,
  getEthnicityImage,
  getArchetypeImage,
} from './get-influencer-image';

describe('get-influencer-image', () => {
  describe('getInfluencerImage', () => {
    it('should return null for missing ethnicity', () => {
      expect(getInfluencerImage('skin-colors', null, 'light')).toBeNull();
      expect(getInfluencerImage('skin-colors', '', 'light')).toBeNull();
    });

    it('should return null for missing optionValue', () => {
      expect(getInfluencerImage('skin-colors', 'caucasian', '')).toBeNull();
      expect(getInfluencerImage('skin-colors', 'caucasian', null as any)).toBeNull();
    });

    it('should return null for whitespace-only optionValue (fixed)', () => {
      // ✅ FIXED: Now returns null for whitespace-only strings
      const result = getInfluencerImage('skin-colors', 'caucasian', '   ');
      expect(result).toBeNull();
    });

    it('should return null for whitespace-only ethnicity (fixed)', () => {
      // ✅ FIXED: Now returns null for whitespace-only strings
      const result = getInfluencerImage('skin-colors', '   ', 'light');
      expect(result).toBeNull();
    });

    it('should normalize ethnicity arab to arabian', () => {
      const result = getInfluencerImage('skin-colors', 'arab', 'light');
      expect(result).toContain('arabian');
      // The result should not contain the original 'arab' (it's normalized to 'arabian')
      expect(result).toBe('/images/wizard/skin/arabian/colors/light-arabian.webp');
    });

    it('should normalize ethnicity indian to mixed', () => {
      const result = getInfluencerImage('skin-colors', 'indian', 'light');
      expect(result).toContain('mixed');
    });

    it('should generate correct path for skin-colors', () => {
      const result = getInfluencerImage('skin-colors', 'caucasian', 'light');
      expect(result).toBe('/images/wizard/skin/caucasian/colors/light-caucasian.webp');
    });

    it('should generate correct path for eye-colors', () => {
      const result = getInfluencerImage('eye-colors', 'caucasian', 'blue');
      expect(result).toBe('/images/wizard/eyes/caucasian/colors/blue-caucasian.webp');
    });

    it('should generate correct path for hair-colors', () => {
      const result = getInfluencerImage('hair-colors', 'caucasian', 'blonde');
      expect(result).toBe('/images/wizard/hair/caucasian/colors/blonde-caucasian.webp');
    });

    it('should generate correct path for hair-styles', () => {
      const result = getInfluencerImage('hair-styles', 'caucasian', 'bun');
      expect(result).toBe('/images/wizard/hair/caucasian/styles/bun-caucasian.webp');
    });

    it('should generate correct path for face-shapes', () => {
      const result = getInfluencerImage('face-shapes', 'caucasian', 'oval');
      expect(result).toBe('/images/wizard/appearance/caucasian/face-shapes/oval-caucasian.webp');
    });

    it('should generate correct path for age-ranges', () => {
      const result = getInfluencerImage('age-ranges', 'caucasian', 'young');
      expect(result).toBe('/images/wizard/appearance/caucasian/age-ranges/young-caucasian.webp');
    });

    it('should handle underscores in optionValue', () => {
      const result = getInfluencerImage('skin-colors', 'caucasian', 'light_medium');
      expect(result).toBe('/images/wizard/skin/caucasian/colors/light-medium-caucasian.webp');
    });

    it('should return null for invalid category', () => {
      expect(getInfluencerImage('invalid' as any, 'caucasian', 'light')).toBeNull();
    });
  });

  describe('getSkinFeatureImage', () => {
    it('should return null for missing value', () => {
      expect(getSkinFeatureImage('freckles', '', 'caucasian')).toBeNull();
    });

    it('should return null for missing ethnicity', () => {
      expect(getSkinFeatureImage('freckles', 'light', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getSkinFeatureImage('freckles', 'light', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path for freckles', () => {
      const result = getSkinFeatureImage('freckles', 'light', 'caucasian');
      expect(result).toBe('/images/wizard/skin/caucasian/features/freckles/freckles-light-caucasian.webp');
    });

    it('should generate correct path for scars', () => {
      const result = getSkinFeatureImage('scars', 'minimal', 'caucasian');
      expect(result).toBe('/images/wizard/skin/caucasian/features/scars/scars-minimal-caucasian.webp');
    });

    it('should handle underscores in value', () => {
      const result = getSkinFeatureImage('freckles', 'light_medium', 'caucasian');
      expect(result).toBe('/images/wizard/skin/caucasian/features/freckles/freckles-light-medium-caucasian.webp');
    });
  });

  describe('getBodyTypeImage', () => {
    it('should return null for missing parameters', () => {
      expect(getBodyTypeImage('', 'female', 'caucasian')).toBeNull();
      expect(getBodyTypeImage('athletic', '', 'caucasian')).toBeNull();
      expect(getBodyTypeImage('athletic', 'female', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getBodyTypeImage('athletic', 'female', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path for female', () => {
      const result = getBodyTypeImage('athletic', 'female', 'caucasian');
      expect(result).toBe('/images/wizard/body/caucasian/body-types/body-athletic-female-caucasian.webp');
    });

    it('should generate correct path for male', () => {
      const result = getBodyTypeImage('athletic', 'male', 'caucasian');
      expect(result).toBe('/images/wizard/body/caucasian/body-types/body-athletic-male-caucasian.webp');
    });
  });

  describe('getBreastSizeImage', () => {
    it('should return null for missing parameters', () => {
      expect(getBreastSizeImage('', 'caucasian')).toBeNull();
      expect(getBreastSizeImage('large', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getBreastSizeImage('large', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getBreastSizeImage('large', 'caucasian');
      expect(result).toBe('/images/wizard/body/caucasian/breast-sizes/breast-large-caucasian.webp');
    });
  });

  describe('getAssSizeImage', () => {
    it('should return null for missing parameters', () => {
      expect(getAssSizeImage('', 'caucasian')).toBeNull();
      expect(getAssSizeImage('large', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getAssSizeImage('large', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getAssSizeImage('large', 'caucasian');
      expect(result).toBe('/images/wizard/body/caucasian/ass-sizes/ass-large-caucasian.webp');
    });
  });

  describe('getBreastTypeImage', () => {
    it('should return null for missing parameters', () => {
      expect(getBreastTypeImage('', 'caucasian')).toBeNull();
      expect(getBreastTypeImage('natural', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getBreastTypeImage('natural', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getBreastTypeImage('natural', 'caucasian');
      expect(result).toBe('/images/wizard/body/caucasian/breast-types/breast-type-natural-caucasian.webp');
    });
  });

  describe('getTattooImage', () => {
    it('should return null for missing parameters', () => {
      expect(getTattooImage('', 'caucasian')).toBeNull();
      expect(getTattooImage('tribal', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getTattooImage('tribal', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getTattooImage('tribal', 'caucasian');
      expect(result).toBe('/images/wizard/modifications/caucasian/tattoos/tribal-caucasian.webp');
    });

    it('should handle underscores in value', () => {
      const result = getTattooImage('tribal_arm', 'caucasian');
      expect(result).toBe('/images/wizard/modifications/caucasian/tattoos/tribal-arm-caucasian.webp');
    });
  });

  describe('getPiercingImage', () => {
    it('should return null for missing parameters', () => {
      expect(getPiercingImage('', 'caucasian')).toBeNull();
      expect(getPiercingImage('nose', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getPiercingImage('nose', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getPiercingImage('nose', 'caucasian');
      expect(result).toBe('/images/wizard/modifications/caucasian/piercings/nose-caucasian.webp');
    });

    it('should handle underscores in value', () => {
      const result = getPiercingImage('nose_ring', 'caucasian');
      expect(result).toBe('/images/wizard/modifications/caucasian/piercings/nose-ring-caucasian.webp');
    });
  });

  describe('getSkinColorImage', () => {
    it('should return null for missing parameters', () => {
      expect(getSkinColorImage('', 'caucasian')).toBeNull();
      expect(getSkinColorImage('light', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getSkinColorImage('light', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getSkinColorImage('light', 'caucasian');
      expect(result).toBe('/images/wizard/skin/caucasian/colors/light-caucasian.webp');
    });

    it('should handle underscores in color', () => {
      const result = getSkinColorImage('light_medium', 'caucasian');
      expect(result).toBe('/images/wizard/skin/caucasian/colors/light-medium-caucasian.webp');
    });
  });

  describe('getEthnicityImage', () => {
    it('should return null for missing parameters', () => {
      expect(getEthnicityImage(null, 'female', 'portrait')).toBeNull();
      expect(getEthnicityImage('caucasian', null, 'portrait')).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getEthnicityImage('arab', 'female', 'portrait');
      expect(result).toContain('arabian');
    });

    it('should keep indian as is', () => {
      const result = getEthnicityImage('indian', 'female', 'portrait');
      expect(result).toContain('indian');
    });

    it('should generate correct path for portrait', () => {
      const result = getEthnicityImage('caucasian', 'female', 'portrait');
      expect(result).toBe('/images/wizard/appearance/caucasian/ethnicity/female-portrait.webp');
    });

    it('should generate correct path for full-body', () => {
      const result = getEthnicityImage('caucasian', 'male', 'full-body');
      expect(result).toBe('/images/wizard/appearance/caucasian/ethnicity/male-full-body.webp');
    });
  });

  describe('getArchetypeImage', () => {
    it('should return null for missing parameters', () => {
      expect(getArchetypeImage('', 'caucasian')).toBeNull();
      expect(getArchetypeImage('girl-next-door', null)).toBeNull();
    });

    it('should normalize arab to arabian', () => {
      const result = getArchetypeImage('girl-next-door', 'arab');
      expect(result).toContain('arabian');
    });

    it('should generate correct path', () => {
      const result = getArchetypeImage('girl-next-door', 'caucasian');
      expect(result).toBe('/images/wizard/personality/caucasian/archetypes/archetype-girl-next-door-caucasian.webp');
    });
  });
});
