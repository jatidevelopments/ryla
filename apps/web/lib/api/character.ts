/**
 * Character API client
 * Handles character creation and image generation with the backend
 */

import { authFetch } from '../auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================================================
// Types
// ============================================================================

export interface AppearanceInput {
  gender: 'female' | 'male';
  style: 'realistic' | 'anime';
  ethnicity: string;
  age: number;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  breastSize?: string;
}

export interface IdentityInput {
  defaultOutfit: string;
  archetype: string;
  personalityTraits: string[];
  bio?: string;
}

export interface GenerateBaseImagesInput {
  appearance: AppearanceInput;
  identity: IdentityInput;
  nsfwEnabled: boolean;
}

export interface GenerateCharacterSheetInput {
  baseImageUrl: string;
  characterId: string;
  nsfwEnabled: boolean;
}

export type JobStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  s3Key?: string;
  variation?: string;
}

export interface JobResult {
  status: JobStatus;
  images?: GeneratedImage[];
  error?: string;
  warning?: string;
}

export interface GenerationResponse {
  jobId: string;
  userId: string;
  status: string;
  message: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Start base image generation from wizard config
 */
export async function generateBaseImages(
  input: GenerateBaseImagesInput
): Promise<GenerationResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/generate-base-images`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to start image generation');
  }

  return response.json();
}

/**
 * Get base image generation results
 */
export async function getBaseImageResults(jobId: string): Promise<JobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/base-images/${jobId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get job results');
  }

  return response.json();
}

/**
 * Start character sheet generation from selected base image
 */
export async function generateCharacterSheet(
  input: GenerateCharacterSheetInput
): Promise<GenerationResponse & { variations: number }> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/generate-character-sheet`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to start character sheet generation');
  }

  return response.json();
}

/**
 * Get character sheet generation results
 */
export async function getCharacterSheetResults(
  jobId: string
): Promise<JobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/character-sheet/${jobId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get character sheet results');
  }

  return response.json();
}

// ============================================================================
// Polling Helpers
// ============================================================================

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Poll for job completion
 */
export async function pollForJobCompletion(
  jobId: string,
  getResults: (jobId: string) => Promise<JobResult>,
  onProgress?: (status: JobStatus) => void
): Promise<JobResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    const result = await getResults(jobId);
    
    if (onProgress) {
      onProgress(result.status);
    }

    if (result.status === 'completed') {
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Job failed');
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  throw new Error('Job timed out');
}

/**
 * Generate base images and wait for completion
 * Returns array of GeneratedImage objects with URLs
 */
export async function generateBaseImagesAndWait(
  input: GenerateBaseImagesInput,
  onProgress?: (status: JobStatus) => void
): Promise<GeneratedImage[]> {
  const { jobId } = await generateBaseImages(input);
  
  const result = await pollForJobCompletion(
    jobId,
    getBaseImageResults,
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No images generated');
  }

  return result.images;
}

/**
 * Generate character sheet and wait for completion
 * Returns array of GeneratedImage objects with URLs
 */
export async function generateCharacterSheetAndWait(
  input: GenerateCharacterSheetInput,
  onProgress?: (status: JobStatus) => void
): Promise<GeneratedImage[]> {
  const { jobId } = await generateCharacterSheet(input);
  
  const result = await pollForJobCompletion(
    jobId,
    getCharacterSheetResults,
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No character sheet images generated');
  }

  return result.images;
}

