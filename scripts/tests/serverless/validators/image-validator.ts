/**
 * EP-044: Image Validator
 *
 * Validates generated images from workflow execution.
 *
 * @module scripts/tests/serverless/validators/image-validator
 */

import type { ImageResult, RunPodImage, TestExpectation } from '../types';
import {
  validateBase64Image,
  processRunPodImages,
  decodeBase64Image,
  detectImageFormat,
} from '../utils/image-decoder';

/**
 * Image validation options
 */
export interface ImageValidationOptions {
  /** Minimum width in pixels */
  minWidth?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
  /** Minimum file size in bytes */
  minSize?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed image formats */
  allowedFormats?: string[];
  /** Require specific dimensions (exact match) */
  exactDimensions?: { width: number; height: number };
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
  /** Whether all validations passed */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of validation warnings */
  warnings: string[];
  /** Image details */
  details: ImageResult;
}

/**
 * Image Validator
 *
 * Validates generated images meet requirements.
 */
export class ImageValidator {
  private readonly defaultOptions: ImageValidationOptions;

  constructor(defaultOptions: ImageValidationOptions = {}) {
    this.defaultOptions = {
      minWidth: 64,
      minHeight: 64,
      maxWidth: 8192,
      maxHeight: 8192,
      minSize: 100, // 100 bytes minimum
      maxSize: 50 * 1024 * 1024, // 50MB maximum
      allowedFormats: ['png', 'jpeg', 'webp'],
      ...defaultOptions,
    };
  }

  /**
   * Validate a single image
   */
  validateImage(
    image: RunPodImage,
    options?: ImageValidationOptions
  ): ImageValidationResult {
    const opts = { ...this.defaultOptions, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    // First, validate the base64 data
    const imageResult = validateBase64Image(image.data);

    if (!imageResult.isValid) {
      return {
        valid: false,
        errors: imageResult.errors ?? ['Invalid image data'],
        warnings: [],
        details: imageResult,
      };
    }

    // Validate format
    if (opts.allowedFormats && imageResult.format) {
      if (!opts.allowedFormats.includes(imageResult.format)) {
        errors.push(
          `Format '${imageResult.format}' not in allowed formats: ${opts.allowedFormats.join(', ')}`
        );
      }
    }

    // Validate dimensions
    if (imageResult.width !== undefined && imageResult.height !== undefined) {
      // Exact dimensions check
      if (opts.exactDimensions) {
        if (
          imageResult.width !== opts.exactDimensions.width ||
          imageResult.height !== opts.exactDimensions.height
        ) {
          errors.push(
            `Expected ${opts.exactDimensions.width}x${opts.exactDimensions.height}, got ${imageResult.width}x${imageResult.height}`
          );
        }
      } else {
        // Min/max checks
        if (opts.minWidth && imageResult.width < opts.minWidth) {
          errors.push(`Width ${imageResult.width} is less than minimum ${opts.minWidth}`);
        }
        if (opts.maxWidth && imageResult.width > opts.maxWidth) {
          errors.push(`Width ${imageResult.width} exceeds maximum ${opts.maxWidth}`);
        }
        if (opts.minHeight && imageResult.height < opts.minHeight) {
          errors.push(`Height ${imageResult.height} is less than minimum ${opts.minHeight}`);
        }
        if (opts.maxHeight && imageResult.height > opts.maxHeight) {
          errors.push(`Height ${imageResult.height} exceeds maximum ${opts.maxHeight}`);
        }
      }
    } else {
      warnings.push('Could not determine image dimensions');
    }

    // Validate size
    if (imageResult.size !== undefined) {
      if (opts.minSize && imageResult.size < opts.minSize) {
        errors.push(`Size ${imageResult.size} bytes is less than minimum ${opts.minSize}`);
      }
      if (opts.maxSize && imageResult.size > opts.maxSize) {
        errors.push(`Size ${imageResult.size} bytes exceeds maximum ${opts.maxSize}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      details: {
        ...imageResult,
        filename: image.filename,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  }

  /**
   * Validate multiple images
   */
  validateImages(
    images: RunPodImage[],
    options?: ImageValidationOptions
  ): ImageValidationResult[] {
    return images.map((image) => this.validateImage(image, options));
  }

  /**
   * Validate images against test expectations
   */
  validateAgainstExpectation(
    images: RunPodImage[],
    expectation: TestExpectation
  ): {
    valid: boolean;
    errors: string[];
    imageResults: ImageValidationResult[];
  } {
    const errors: string[] = [];
    const options: ImageValidationOptions = {};

    // Set validation options from expectation
    if (expectation.minWidth) {
      options.minWidth = expectation.minWidth;
    }
    if (expectation.minHeight) {
      options.minHeight = expectation.minHeight;
    }

    // Validate image count
    if (expectation.imageCount !== undefined) {
      if (images.length !== expectation.imageCount) {
        errors.push(
          `Expected ${expectation.imageCount} images, got ${images.length}`
        );
      }
    }

    // Validate each image
    const imageResults = this.validateImages(images, options);

    // Collect image validation errors
    for (const result of imageResults) {
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      imageResults,
    };
  }

  /**
   * Check if an image is mostly black or empty
   */
  isImageEmpty(imageData: string, threshold = 0.95): boolean {
    try {
      const buffer = decodeBase64Image(imageData);

      // Simple check: if image is very small, it might be empty
      if (buffer.length < 1000) {
        return true;
      }

      // More sophisticated check would require image processing
      // For now, we just check if it's above a minimum size
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Compare two images for similarity (basic check)
   */
  areImagesSimilar(image1: string, image2: string): boolean {
    try {
      const buffer1 = decodeBase64Image(image1);
      const buffer2 = decodeBase64Image(image2);

      // Simple size comparison
      if (Math.abs(buffer1.length - buffer2.length) > 1000) {
        return false;
      }

      // Compare first and last bytes (very basic)
      if (buffer1[0] !== buffer2[0] || buffer1[buffer1.length - 1] !== buffer2[buffer2.length - 1]) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a summary of image validation results
 */
export function summarizeImageValidation(
  results: ImageValidationResult[]
): {
  total: number;
  valid: number;
  invalid: number;
  allValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const valid = results.filter((r) => r.valid).length;
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);

  return {
    total: results.length,
    valid,
    invalid: results.length - valid,
    allValid: valid === results.length,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Default image validator instance
 */
export const defaultImageValidator = new ImageValidator();
