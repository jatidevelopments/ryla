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

export interface GenerateProfilePictureSetInput {
  baseImageUrl: string;
  characterId?: string;
  setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  nsfwEnabled: boolean;
}

export interface RegenerateProfilePictureInput {
  baseImageUrl: string;
  positionId: string;
  prompt?: string;
  nsfwEnabled: boolean;
  setId?: 'classic-influencer' | 'professional-model' | 'natural-beauty';
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
  allJobIds?: string[]; // For batch jobs (e.g., 3 base images)
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
 * If allJobIds are provided, polls all jobs and returns combined results
 */
export async function getBaseImageResults(
  jobId: string,
  allJobIds?: string[]
): Promise<JobResult> {
  // If we have all job IDs, use batch endpoint
  const url = allJobIds && allJobIds.length > 1
    ? `${API_BASE_URL}/characters/base-images/${jobId}?allJobIds=${allJobIds.join(',')}`
    : `${API_BASE_URL}/characters/base-images/${jobId}`;

  const response = await authFetch(url);

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
 * Handles both single jobs and batch jobs (returns when all are complete or partial results available)
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

    // For batch jobs, "partial" means some jobs are done - continue polling
    // "completed" means all jobs are done
    if (result.status === 'completed' || result.status === 'partial') {
      // If we have images, return them (even if partial)
      if (result.images && result.images.length > 0) {
        // If partial but we have enough images (e.g., 3), return them
        if (result.status === 'partial' && result.images.length >= 3) {
          return { ...result, status: 'completed' };
        }
        // If completed, return immediately
        if (result.status === 'completed') {
          return result;
        }
      }
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
 * Returns array of GeneratedImage objects with URLs (should be 3 images)
 */
export async function generateBaseImagesAndWait(
  input: GenerateBaseImagesInput,
  onProgress?: (status: JobStatus) => void
): Promise<GeneratedImage[]> {
  const { jobId, allJobIds } = await generateBaseImages(input);
  
  // Use batch polling if we have all job IDs
  const result = await pollForJobCompletion(
    jobId,
    (id: string) => getBaseImageResults(id, allJobIds),
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No images generated');
  }

  // Should have 3 images, but return whatever we got
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

/**
 * Start profile picture set generation from selected base image
 */
export async function generateProfilePictureSet(
  input: GenerateProfilePictureSetInput
): Promise<GenerationResponse & { imageCount: number }> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/generate-profile-picture-set`,
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
    throw new Error(error.message || 'Failed to start profile picture set generation');
  }

  return response.json();
}

/**
 * Get profile picture set generation results
 */
export async function getProfilePictureSetResults(
  jobId: string
): Promise<JobResult> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/profile-picture-set/${jobId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get profile picture set results');
  }

  return response.json();
}

/**
 * Regenerate a single profile picture
 */
export async function regenerateProfilePicture(
  input: RegenerateProfilePictureInput
): Promise<GenerationResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/characters/regenerate-profile-picture`,
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
    throw new Error(error.message || 'Failed to regenerate profile picture');
  }

  return response.json();
}

/**
 * Generate profile picture set and wait for completion
 * Returns array of GeneratedImage objects with URLs
 */
export async function generateProfilePictureSetAndWait(
  input: GenerateProfilePictureSetInput,
  onProgress?: (status: JobStatus) => void
): Promise<GeneratedImage[]> {
  const { jobId } = await generateProfilePictureSet(input);
  
  const result = await pollForJobCompletion(
    jobId,
    getProfilePictureSetResults,
    onProgress
  );

  if (!result.images || result.images.length === 0) {
    throw new Error('No profile picture images generated');
  }

  return result.images;
}

