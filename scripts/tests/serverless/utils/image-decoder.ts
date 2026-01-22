/**
 * EP-044: Image Decoder Utility
 *
 * Utilities for decoding and validating base64 image data.
 *
 * @module scripts/tests/serverless/utils/image-decoder
 */

import type { ImageResult, RunPodImage } from '../types';

/**
 * Image format signatures (magic bytes)
 */
const IMAGE_SIGNATURES: Record<string, { signature: number[]; format: string }> = {
  png: { signature: [0x89, 0x50, 0x4e, 0x47], format: 'png' },
  jpeg: { signature: [0xff, 0xd8, 0xff], format: 'jpeg' },
  gif: { signature: [0x47, 0x49, 0x46], format: 'gif' },
  webp: { signature: [0x52, 0x49, 0x46, 0x46], format: 'webp' }, // RIFF header
};

/**
 * Decode a base64 image to a buffer
 */
export function decodeBase64Image(base64Data: string): Buffer {
  // Remove data URI prefix if present
  const base64 = base64Data.includes(',')
    ? base64Data.split(',')[1]
    : base64Data;

  return Buffer.from(base64, 'base64');
}

/**
 * Extract format from data URI
 */
export function extractFormatFromDataUri(dataUri: string): string | null {
  const match = dataUri.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
  return match ? match[1] : null;
}

/**
 * Detect image format from binary data
 */
export function detectImageFormat(buffer: Buffer): string | null {
  for (const [, { signature, format }] of Object.entries(IMAGE_SIGNATURES)) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return format;
    }
  }
  return null;
}

/**
 * Parse PNG dimensions from binary data
 */
function parsePNGDimensions(buffer: Buffer): { width: number; height: number } | null {
  // PNG header: 8 bytes
  // IHDR chunk: 4 bytes length + 4 bytes type + 4 bytes width + 4 bytes height + ...
  if (buffer.length < 24) {
    return null;
  }

  // Check for IHDR chunk at offset 8
  const ihdrType = buffer.toString('ascii', 12, 16);
  if (ihdrType !== 'IHDR') {
    return null;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

/**
 * Parse JPEG dimensions from binary data
 */
function parseJPEGDimensions(buffer: Buffer): { width: number; height: number } | null {
  let offset = 2; // Skip SOI marker

  while (offset < buffer.length) {
    // Look for marker
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];

    // SOF markers (Start of Frame) contain dimensions
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3
    ) {
      // SOF segment: 2 bytes marker + 2 bytes length + 1 byte precision + 2 bytes height + 2 bytes width
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    // Skip this marker
    if (marker === 0xd8 || marker === 0xd9) {
      // SOI or EOI - no length
      offset += 2;
    } else {
      // Read segment length
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  return null;
}

/**
 * Get image dimensions from binary data
 */
export function getImageDimensions(
  buffer: Buffer,
  format?: string
): { width: number; height: number } | null {
  const detectedFormat = format ?? detectImageFormat(buffer);

  switch (detectedFormat) {
    case 'png':
      return parsePNGDimensions(buffer);
    case 'jpeg':
      return parseJPEGDimensions(buffer);
    default:
      return null;
  }
}

/**
 * Validate a base64 image
 */
export function validateBase64Image(base64Data: string): ImageResult {
  const errors: string[] = [];

  try {
    // Check if data is empty
    if (!base64Data || base64Data.trim() === '') {
      return {
        isValid: false,
        errors: ['Image data is empty'],
      };
    }

    // Extract format from data URI if present
    let format = extractFormatFromDataUri(base64Data);

    // Decode the image
    const buffer = decodeBase64Image(base64Data);

    // Check size
    if (buffer.length === 0) {
      return {
        isValid: false,
        errors: ['Decoded image buffer is empty'],
      };
    }

    // Detect format from binary data
    const detectedFormat = detectImageFormat(buffer);

    if (!detectedFormat) {
      errors.push('Could not detect image format from binary data');
    } else if (format && format !== detectedFormat) {
      errors.push(
        `Format mismatch: data URI says ${format}, but binary data is ${detectedFormat}`
      );
    }

    format = format ?? detectedFormat ?? undefined;

    // Get dimensions
    const dimensions = getImageDimensions(buffer, format ?? undefined);

    // Validate minimum dimensions
    if (dimensions) {
      if (dimensions.width < 1 || dimensions.height < 1) {
        errors.push(`Invalid dimensions: ${dimensions.width}x${dimensions.height}`);
      }
    }

    return {
      format: format ?? undefined,
      width: dimensions?.width,
      height: dimensions?.height,
      size: buffer.length,
      isValid: errors.length === 0,
      data: base64Data,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Failed to validate image: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Process RunPod image outputs to ImageResults
 */
export function processRunPodImages(images: RunPodImage[]): ImageResult[] {
  return images.map((image, index) => {
    const result = validateBase64Image(image.data);
    return {
      ...result,
      filename: image.filename ?? `image_${index}.${result.format ?? 'png'}`,
    };
  });
}

/**
 * Save a base64 image to a file
 */
export async function saveBase64Image(
  base64Data: string,
  filePath: string
): Promise<void> {
  const fs = await import('fs/promises');
  const buffer = decodeBase64Image(base64Data);
  await fs.writeFile(filePath, buffer);
}

/**
 * Calculate image hash for comparison
 */
export function calculateImageHash(buffer: Buffer): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
