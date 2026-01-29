/**
 * Influencer Test Fixtures for Web App
 * 
 * Test data factories for creating influencers/characters in tests.
 */

import { v4 as uuidv4 } from 'uuid';

export interface TestInfluencer {
  id: string;
  userId: string;
  name: string;
  handle: string;
  status: 'draft' | 'generating' | 'ready' | 'failed' | 'training' | 'hd_ready';
  config?: Record<string, any>;
  dna?: Record<string, any>;
}

/**
 * Create a test influencer with optional overrides
 */
export function createTestInfluencer(
  userId: string,
  overrides?: Partial<TestInfluencer>
): TestInfluencer {
  const id = overrides?.id || uuidv4();
  const handle = overrides?.handle || `test-influencer-${id.slice(0, 8)}`;
  
  return {
    id,
    userId,
    name: overrides?.name || 'Test Influencer',
    handle,
    status: overrides?.status || 'ready',
    config: overrides?.config || {},
    dna: overrides?.dna || {},
  };
}

/**
 * Create a test influencer in draft status
 */
export function createTestDraftInfluencer(
  userId: string,
  overrides?: Partial<TestInfluencer>
): TestInfluencer {
  return createTestInfluencer(userId, {
    status: 'draft',
    ...overrides,
  });
}

/**
 * Create a test influencer in generating status
 */
export function createTestGeneratingInfluencer(
  userId: string,
  overrides?: Partial<TestInfluencer>
): TestInfluencer {
  return createTestInfluencer(userId, {
    status: 'generating',
    ...overrides,
  });
}

/**
 * Create multiple test influencers
 */
export function createTestInfluencers(
  userId: string,
  count: number,
  overrides?: Partial<TestInfluencer>
): TestInfluencer[] {
  return Array.from({ length: count }, (_, i) =>
    createTestInfluencer(userId, {
      handle: `influencer-${i}-${Date.now()}`,
      ...overrides,
    })
  );
}
