/**
 * EP-044: Image Decoder Tests
 *
 * Unit tests for image decoding and validation utilities.
 *
 * @module scripts/tests/serverless/__tests__/image-decoder.spec
 */

import { describe, it, expect } from 'vitest';
import {
  decodeBase64Image,
  extractFormatFromDataUri,
  detectImageFormat,
  getImageDimensions,
  validateBase64Image,
  processRunPodImages,
} from '../utils/image-decoder';

// Test data: minimal valid PNGs
const VALID_1x1_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// 512x512 PNG (mock)
const VALID_512x512_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xNkRpr/UAAAFhSURBVHja7cExAQAAAMKg9U/tbQahAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYGoBPAABsU9/GQAAAABJRU5ErkJggg==';

describe('image-decoder', () => {
  describe('decodeBase64Image', () => {
    it('should decode base64 with data URI prefix', () => {
      const buffer = decodeBase64Image(VALID_1x1_PNG);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should decode base64 without data URI prefix', () => {
      const base64 = VALID_1x1_PNG.split(',')[1];
      const buffer = decodeBase64Image(base64);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle invalid base64 gracefully', () => {
      // Node's Buffer.from doesn't throw on invalid base64, it produces garbage
      // The validation step will catch this later
      const buffer = decodeBase64Image('not-valid-base64!!!');
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('extractFormatFromDataUri', () => {
    it('should extract png format', () => {
      expect(extractFormatFromDataUri('data:image/png;base64,abc')).toBe('png');
    });

    it('should extract jpeg format', () => {
      expect(extractFormatFromDataUri('data:image/jpeg;base64,abc')).toBe(
        'jpeg'
      );
    });

    it('should extract webp format', () => {
      expect(extractFormatFromDataUri('data:image/webp;base64,abc')).toBe(
        'webp'
      );
    });

    it('should return null for non-data URI', () => {
      expect(extractFormatFromDataUri('abc123')).toBeNull();
    });

    it('should return null for malformed data URI', () => {
      expect(extractFormatFromDataUri('data:text/plain;base64,abc')).toBeNull();
    });
  });

  describe('detectImageFormat', () => {
    it('should detect PNG format', () => {
      const buffer = decodeBase64Image(VALID_1x1_PNG);
      expect(detectImageFormat(buffer)).toBe('png');
    });

    it('should return null for unknown format', () => {
      const buffer = Buffer.from('random data that is not an image');
      expect(detectImageFormat(buffer)).toBeNull();
    });

    it('should return null for empty buffer', () => {
      const buffer = Buffer.from([]);
      expect(detectImageFormat(buffer)).toBeNull();
    });
  });

  describe('getImageDimensions', () => {
    it('should get dimensions from 1x1 PNG', () => {
      const buffer = decodeBase64Image(VALID_1x1_PNG);
      const dimensions = getImageDimensions(buffer, 'png');
      expect(dimensions).toEqual({ width: 1, height: 1 });
    });

    it('should get dimensions from 512x512 PNG', () => {
      const buffer = decodeBase64Image(VALID_512x512_PNG);
      const dimensions = getImageDimensions(buffer, 'png');
      expect(dimensions).toEqual({ width: 512, height: 512 });
    });

    it('should return null for unknown format', () => {
      const buffer = Buffer.from('not an image');
      expect(getImageDimensions(buffer)).toBeNull();
    });
  });

  describe('validateBase64Image', () => {
    it('should validate valid PNG', () => {
      const result = validateBase64Image(VALID_1x1_PNG);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('png');
      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
    });

    it('should validate 512x512 PNG', () => {
      const result = validateBase64Image(VALID_512x512_PNG);
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('png');
      expect(result.width).toBe(512);
      expect(result.height).toBe(512);
    });

    it('should fail validation for empty string', () => {
      const result = validateBase64Image('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image data is empty');
    });

    it('should fail validation for whitespace only', () => {
      const result = validateBase64Image('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image data is empty');
    });

    it('should include size in result', () => {
      const result = validateBase64Image(VALID_1x1_PNG);
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('processRunPodImages', () => {
    it('should process single image', () => {
      const images = [
        {
          filename: 'test.png',
          type: 'base64' as const,
          data: VALID_1x1_PNG,
        },
      ];
      const results = processRunPodImages(images);
      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(true);
      expect(results[0].filename).toBe('test.png');
    });

    it('should process multiple images', () => {
      const images = [
        { filename: 'img1.png', type: 'base64' as const, data: VALID_1x1_PNG },
        { filename: 'img2.png', type: 'base64' as const, data: VALID_512x512_PNG },
      ];
      const results = processRunPodImages(images);
      expect(results).toHaveLength(2);
      expect(results[0].width).toBe(1);
      expect(results[1].width).toBe(512);
    });

    it('should handle empty array', () => {
      const results = processRunPodImages([]);
      expect(results).toHaveLength(0);
    });

    it('should generate filename if not provided', () => {
      const images = [{ data: VALID_1x1_PNG }];
      const results = processRunPodImages(images);
      expect(results[0].filename).toMatch(/image_0\.png/);
    });
  });
});
