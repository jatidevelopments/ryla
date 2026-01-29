/**
 * Image Test Fixtures for Web App
 * 
 * Test data factories for creating images in tests.
 */

import { v4 as uuidv4 } from 'uuid';

export interface TestImage {
  id: string;
  userId: string;
  influencerId?: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a test image with optional overrides
 */
export function createTestImage(
  userId: string,
  overrides?: Partial<TestImage>
): TestImage {
  const id = overrides?.id || uuidv4();
  
  return {
    id,
    userId,
    influencerId: overrides?.influencerId,
    url: overrides?.url || `https://example.com/images/${id}.jpg`,
    status: overrides?.status || 'completed',
    prompt: overrides?.prompt || 'A test image prompt',
    metadata: overrides?.metadata || {},
  };
}

/**
 * Create a test image in pending status
 */
export function createTestPendingImage(
  userId: string,
  overrides?: Partial<TestImage>
): TestImage {
  return createTestImage(userId, {
    status: 'pending',
    ...overrides,
  });
}

/**
 * Create a test image in processing status
 */
export function createTestProcessingImage(
  userId: string,
  overrides?: Partial<TestImage>
): TestImage {
  return createTestImage(userId, {
    status: 'processing',
    ...overrides,
  });
}

/**
 * Create a test failed image
 */
export function createTestFailedImage(
  userId: string,
  overrides?: Partial<TestImage>
): TestImage {
  return createTestImage(userId, {
    status: 'failed',
    ...overrides,
  });
}

/**
 * Create multiple test images
 */
export function createTestImages(
  userId: string,
  count: number,
  overrides?: Partial<TestImage>
): TestImage[] {
  return Array.from({ length: count }, (_, i) =>
    createTestImage(userId, {
      url: `https://example.com/images/image-${i}-${Date.now()}.jpg`,
      ...overrides,
    })
  );
}
